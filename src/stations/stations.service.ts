import {
  ConflictException,
  HttpException,
  Inject,
  Injectable,
  InternalServerErrorException,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { MpdService } from 'src/mpd/mpd.service';
import { StationDTO } from './dto/station.dto';
import { CurrentStationInfoDTO } from './dto/current-station.dto';
import {
  distinctUntilChanged,
  merge,
  mergeMap,
  Observable,
  Subject,
} from 'rxjs';
import type { IStationsRepository } from './repositories/stations.repository.interface';
import { STATIONS_REPOSITORY } from './repositories/stations.repository.interface';
import {
  CreateStationModel,
  StationModel,
  StationsSchema,
  UpdateStationModel,
} from './models/station.model';
import { ConfigService } from '@nestjs/config';
import { CreateStationDTO, UpdateStationDTO } from './dto/station-schemas.dto';
import { stationModelToDTO } from './mappers/station-model-to-dto';
import { OnEvent } from '@nestjs/event-emitter';
import { areCurrentStationInfoEqual } from './utils/const are-current-station-info-equal';
import { AppEventsService } from 'src/app-events/app-events.service';

@Injectable()
export class StationsService {
  private readonly logger = new Logger(StationsService.name);

  private readonly stationsUpdated$ = new Subject<void>();
  private readonly currentStationUpdate$: Observable<CurrentStationInfoDTO>;

  constructor(
    @Inject(STATIONS_REPOSITORY)
    private readonly stationsRepository: IStationsRepository,
    private readonly mpdService: MpdService,
    private readonly configService: ConfigService,
    private readonly appEventsService: AppEventsService,
  ) {
    this.currentStationUpdate$ = this.currentStationUpdate$ = merge(
      this.mpdService.url$,
      this.stationsUpdated$,
    ).pipe(
      mergeMap(async () => await this.getCurrentStationInfo()),
      distinctUntilChanged(areCurrentStationInfoEqual),
    );

    this.currentStationUpdate$.subscribe((data) =>
      this.appEventsService.emit({ type: 'stations.current-update', data }),
    );

    this.stationsUpdated$.subscribe(() =>
      this.appEventsService.emit({
        type: 'stations.stations-update',
        data: 'stations-update',
      }),
    );

    void this.initStations();
  }

  @OnEvent('station.*')
  public handleStationsEvent() {
    this.stationsUpdated$.next();
  }

  public async playStationById(id: string): Promise<void> {
    const station = await this.stationsRepository.getStationById(id);
    if (!station) throw new NotFoundException('Station not defined');

    const result = await this.mpdService.playStream(station.url);
    if (result !== true) throw new InternalServerErrorException(result.error);
  }

  public async playStationByIndex(index: number): Promise<void> {
    const station = await this.stationsRepository.getStationByIdx(index);
    if (!station) throw new NotFoundException('Station not defined');

    const result = await this.mpdService.playStream(station.url);
    if (result !== true) throw new InternalServerErrorException(result.error);
  }

  public async playNextStation(id: string): Promise<void> {
    const current = await this.stationsRepository.getStationById(id);
    if (current === null) throw new NotFoundException('Station not defined');

    const next = await this.stationsRepository.getNext(current.idx);
    if (next !== null) await this.mpdService.playStream(next.url);
  }

  public async playPrevStation(id: string): Promise<void> {
    const current = await this.stationsRepository.getStationById(id);
    if (current === null) throw new NotFoundException('Station not defined');

    const prev = await this.stationsRepository.getPrev(current.idx);
    if (prev !== null) await this.mpdService.playStream(prev.url);
  }

  public async getCurrentStationInfo(): Promise<CurrentStationInfoDTO> {
    const url = this.mpdService.url;

    if (url === null) return { station: null, hasPrev: false, hasNext: false };

    const station = await this.stationsRepository.getStationByUrl(url);

    if (station === null) {
      return { station: { id: null }, hasPrev: false, hasNext: false };
    }

    const { idx } = station;
    return {
      station: stationModelToDTO(station),
      hasPrev: !!(await this.stationsRepository.getPrev(idx)),
      hasNext: !!(await this.stationsRepository.getNext(idx)),
    };
  }

  public async getStations(): Promise<StationDTO[]> {
    const stations = await this.stationsRepository.getStations();
    return stations.map(({ id, name, url }) => ({ id, name, url }));
  }

  async createStation(station: CreateStationDTO): Promise<StationDTO> {
    await this.validateUniqueness(station);

    const idx = await this.stationsRepository.getMaxIdx();
    const createModel: CreateStationModel = {
      ...station,
      idx: idx + 1,
    };
    try {
      return stationModelToDTO(
        await this.stationsRepository.createStation(createModel),
      );
    } catch (ex) {
      const msg = 'Error during creating new station';
      this.logger.error(`[createStation] ${msg}`, ex);
      throw new InternalServerErrorException(msg);
    }
  }

  async updateStation(
    id: string,
    station: UpdateStationDTO,
  ): Promise<StationDTO> {
    const existing = await this.stationsRepository.getStationById(id);

    if (!existing) {
      throw new NotFoundException(`Station with id "${id}" not found`);
    }

    await this.validateUniqueness(station, existing);

    try {
      const updateModel: UpdateStationModel = { ...station };
      const updated = await this.stationsRepository.updateStation(
        id,
        updateModel,
      );

      if (!updated) {
        const msg = `Station with id "${id}" not found`;
        this.logger.error(`[updateStation] ${msg}`);
        throw new NotFoundException(msg);
      }

      return stationModelToDTO(updated);
    } catch (ex) {
      if (ex instanceof HttpException) throw ex;

      const msg = `Error during editing station with id ${id}`;
      this.logger.error(`[updateStation] ${msg}`, ex);
      throw new InternalServerErrorException(msg);
    }
  }

  async deleteStation(id: string): Promise<void> {
    const deleted = await this.stationsRepository.deleteStation(id);

    if (!deleted) {
      throw new NotFoundException(`Station with id "${id}" not found`);
    }
  }

  private async validateUniqueness(
    { name, url }: UpdateStationDTO,
    existing?: StationModel,
  ): Promise<void> {
    if (name && (!existing || name !== existing.name)) {
      const stationWithSameName =
        await this.stationsRepository.getStationByName(name);

      if (stationWithSameName) {
        throw new ConflictException(
          `Station with name "${name}" already exists`,
        );
      }
    }

    if (url && (!existing || url !== existing.url)) {
      const stationWithSameUrl =
        await this.stationsRepository.getStationByUrl(url);

      if (stationWithSameUrl) {
        throw new ConflictException(`Station with url "${url}" already exists`);
      }
    }
  }

  private async initStations(): Promise<void> {
    const stationsJson = this.configService.get<string>(`FAV_STATIONS_JSON`);
    if (!stationsJson) return;
    let added = 0;
    let edited = 0;
    try {
      const stations = StationsSchema.parse(JSON.parse(stationsJson));
      for (const [index, station] of stations.entries()) {
        const existing = await this.stationsRepository.getStationByIdx(index);
        if (existing !== null) {
          const { id, ...rest } = existing;
          await this.stationsRepository.updateStation(id, {
            ...rest,
            ...station,
          });
          edited++;
        } else {
          await this.stationsRepository.createStation({
            ...station,
            idx: index,
          });
          added++;
        }
      }
      this.logger.log(
        `[initStations] Added: ${added}, Edited: ${edited} from FAV_STATIONS_JSON`,
      );
    } catch (e: unknown) {
      this.logger.error(
        `[initStations] Error during adding stations from FAV_STATIONS_JSON`,
        e,
      );
    }
  }
}
