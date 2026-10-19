import { Inject, Injectable, Logger } from '@nestjs/common';
import { StationDTO } from './dto/station.dto';
import { CurrentStationInfoDTO } from './dto/current-station.dto';
import {
  distinctUntilChanged,
  filter,
  map,
  merge,
  Observable,
  Subject,
  switchMap,
  tap,
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
import { CacheService } from 'src/cache/cache.service';
import { CommandResult, CommandResultMapper } from 'src/features/shared';
import { CurrentStationModel } from './models/current-station.model';
import { MpdClient } from '../mpd/mpd.client';

const CACHED_STATION_ID = 'CACHED_STATION_ID';

const stationNotDefined = 'Station not defined';
const stationNotDefinedResult: CommandResult = {
  error: stationNotDefined,
  type: 'notFound',
};
const noCurrentStation = 'No station is currently playing';
const noCurrentStationResult: CommandResult = {
  error: noCurrentStation,
  type: 'notFound',
};

@Injectable()
export class StationsService {
  private readonly logger = new Logger(StationsService.name);

  private readonly stationsUpdated$ = new Subject<void>();
  private readonly currentStationUpdate$: Observable<CurrentStationInfoDTO>;

  constructor(
    @Inject(STATIONS_REPOSITORY)
    private readonly stationsRepository: IStationsRepository,
    private readonly mpdClient: MpdClient,
    private readonly configService: ConfigService,
    private readonly appEventsService: AppEventsService,
    private readonly cacheService: CacheService,
  ) {
    this.currentStationUpdate$ = this.currentStationUpdate$ = merge(
      this.mpdClient.url$,
      this.stationsUpdated$,
    ).pipe(
      switchMap(async () => await this.getCurrentStationInfo()),
      map((current) => CommandResultMapper.getResult(current)),
      filter((current) => current !== null),
      distinctUntilChanged(areCurrentStationInfoEqual),
      tap(({ station }) => {
        if (station?.id)
          void this.cacheService.set(CACHED_STATION_ID, station?.id);
      }),
    );

    this.currentStationUpdate$.subscribe((data) => {
      this.appEventsService.emit({ type: 'stations.current-update', data });
    });

    this.stationsUpdated$.subscribe(() =>
      this.appEventsService.emit({
        type: 'stations.stations-update',
        data: 'stations-update',
      }),
    );

    void this.initStations();
  }

  @OnEvent('station.*')
  private handleStationsEvent() {
    this.stationsUpdated$.next();
  }

  public async playStationById(id: string): Promise<CommandResult> {
    const station = await this.stationsRepository.getStationById(id);
    if (!station) return stationNotDefinedResult;

    return this.mpdClient.playStream(station.url);
  }

  public async playNextStation(): Promise<CommandResult> {
    const currentResult = await this.getCurrentStation();
    if (typeof currentResult === 'boolean' || 'error' in currentResult) {
      return currentResult;
    }

    const station = currentResult.result;

    if (station === null) return noCurrentStationResult;
    if (station.id === null) return stationNotDefinedResult;

    const next = await this.stationsRepository.getNext(station.idx);
    return next === null
      ? {
          error: 'No next station',
          type: 'forbidden',
        }
      : this.mpdClient.playStream(next.url);
  }

  public async playPrevStation(): Promise<CommandResult> {
    const currentResult = await this.getCurrentStation();
    if (typeof currentResult === 'boolean' || 'error' in currentResult) {
      return currentResult;
    }

    const station = currentResult.result;

    if (station === null) return noCurrentStationResult;
    if (station.id === null) return stationNotDefinedResult;

    const prev = await this.stationsRepository.getPrev(station.idx);
    return prev === null
      ? {
          error: 'No prev station',
          type: 'forbidden',
        }
      : this.mpdClient.playStream(prev.url);
  }

  public async getCurrentStationInfo(): Promise<
    CommandResult<CurrentStationInfoDTO>
  > {
    const currentResult = await this.getCurrentStation();
    if (typeof currentResult === 'boolean' || 'error' in currentResult) {
      return currentResult;
    }
    const station = currentResult.result;

    if (station === null || station.id === null) {
      return {
        result: {
          station,
          hasPrev: false,
          hasNext: false,
        },
      };
    }

    const { idx } = station;

    return {
      result: {
        station: stationModelToDTO(station),
        hasPrev: !!(await this.stationsRepository.getPrev(idx)),
        hasNext: !!(await this.stationsRepository.getNext(idx)),
      },
    };
  }

  public async getStations(): Promise<CommandResult<StationDTO[]>> {
    const stations = await this.stationsRepository.getStations();
    return { result: stations.map(stationModelToDTO) };
  }

  public async createStation(
    station: CreateStationDTO,
  ): Promise<CommandResult<StationDTO>> {
    const unique = await this.validateUniqueness(station);
    if (unique !== true) {
      return unique as CommandResult<StationDTO>;
    }

    const idx = await this.stationsRepository.getMaxIdx();
    const createModel: CreateStationModel = {
      ...station,
      idx: idx + 1,
    };
    try {
      return {
        result: stationModelToDTO(
          await this.stationsRepository.createStation(createModel),
        ),
      };
    } catch (ex) {
      const msg = 'Error during creating new station';
      this.logger.error(`[createStation] ${msg}`, ex);
      return { error: msg };
    }
  }

  public async updateStation(
    id: string,
    station: UpdateStationDTO,
  ): Promise<CommandResult<StationDTO>> {
    const existing = await this.stationsRepository.getStationById(id);

    if (!existing) {
      const msg = `Station with id "${id}" not found`;
      this.logger.error(`[updateStation] ${msg}`);
      return { error: msg, type: 'notFound' };
    }

    const unique = await this.validateUniqueness(station, existing);
    if (unique !== true) {
      return unique as CommandResult<StationDTO>;
    }

    try {
      const updateModel: UpdateStationModel = { ...station };
      const updated = await this.stationsRepository.updateStation(
        id,
        updateModel,
      );

      if (!updated) {
        const msg = `Station with id "${id}" not found`;
        this.logger.error(`[updateStation] ${msg}`);
        return { error: msg, type: 'notFound' };
      }

      return { result: stationModelToDTO(updated) };
    } catch (ex) {
      const msg = `Error during editing station with id ${id}`;
      this.logger.error(`[updateStation] ${msg}`, ex);
      return { error: msg };
    }
  }

  public async deleteStation(id: string): Promise<CommandResult> {
    const deleted = await this.stationsRepository.deleteStation(id);

    if (!deleted) {
      const msg = `Station with id "${id}" not found`;
      this.logger.error(`[deleteStation] ${msg}`);
      return { error: msg, type: 'notFound' };
    }

    return true;
  }

  private async getCurrentStation(): Promise<
    CommandResult<CurrentStationModel>
  > {
    const url = this.mpdClient.url;
    let station: StationModel | null = null;

    if (url !== null) {
      station = await this.stationsRepository.getStationByUrl(url);
    } else {
      const cachedStationId =
        await this.cacheService.get<string>(CACHED_STATION_ID);

      if (cachedStationId === null) return { result: null };

      station = await this.stationsRepository.getStationById(cachedStationId);
    }

    if (station === null) return { result: { id: null } };

    return {
      result: station,
    };
  }

  private async validateUniqueness(
    { name, url }: UpdateStationDTO,
    existing?: StationModel,
  ): Promise<CommandResult> {
    if (name && (!existing || name !== existing.name)) {
      const stationWithSameName =
        await this.stationsRepository.getStationByName(name);

      if (stationWithSameName) {
        return {
          error: `Station with name "${name}" already exists`,
          type: 'conflict',
        };
      }
    }

    if (url && (!existing || url !== existing.url)) {
      const stationWithSameUrl =
        await this.stationsRepository.getStationByUrl(url);

      if (stationWithSameUrl) {
        return {
          error: `Station with url "${url}" already exists`,
          type: 'conflict',
        };
      }
    }

    return true;
  }

  private async initStations(): Promise<void> {
    const stationsJson = this.configService.get<string>(`FAV_STATIONS_JSON`);
    if (!stationsJson) return;
    let added = 0;
    let edited = 0;
    try {
      const stations = StationsSchema.parse(JSON.parse(stationsJson));
      for (const station of stations) {
        const existing = await this.stationsRepository.getStationByUrl(
          station.url,
        );
        if (existing !== null) {
          const { id, ...rest } = existing;
          await this.stationsRepository.updateStation(id, {
            ...rest,
            ...station,
          });
          edited++;
        } else {
          const idx = await this.stationsRepository.getMaxIdx();
          await this.stationsRepository.createStation({
            ...station,
            idx,
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
