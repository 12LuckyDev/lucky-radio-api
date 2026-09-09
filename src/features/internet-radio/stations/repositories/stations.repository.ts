import { Injectable } from '@nestjs/common';
import { asc, desc, eq, gt, lt } from 'drizzle-orm';
import { DatabaseService } from '../../../../database/database.service';
import { stationsTable } from '../../../../database/schema/stations.schema';
import {
  CreateStationModel,
  StationModel,
  UpdateStationModel,
} from '../models/station.model';
import { IStationsRepository } from './stations.repository.interface';
import { EventEmitter2 } from '@nestjs/event-emitter';

@Injectable()
export class StationsRepository implements IStationsRepository {
  constructor(
    private readonly database: DatabaseService,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  getStations(): Promise<StationModel[]> {
    return this.database.db
      .select()
      .from(stationsTable)
      .orderBy(asc(stationsTable.idx));
  }

  async getStationById(id: string): Promise<StationModel | null> {
    const [station] = await this.database.db
      .select()
      .from(stationsTable)
      .where(eq(stationsTable.id, id))
      .limit(1);

    return station ?? null;
  }

  async getStationByIdx(index: number): Promise<StationModel | null> {
    const [station] = await this.database.db
      .select()
      .from(stationsTable)
      .where(eq(stationsTable.idx, index))
      .limit(1);

    return station ?? null;
  }

  async getMaxIdx(): Promise<number> {
    const [last] = await this.database.db
      .select({ idx: stationsTable.idx })
      .from(stationsTable)
      .orderBy(desc(stationsTable.idx))
      .limit(1);

    return last?.idx ?? 0;
  }

  async getNext(idx: number): Promise<StationModel | null> {
    const [nextStation] = await this.database.db
      .select()
      .from(stationsTable)
      .where(gt(stationsTable.idx, idx))
      .orderBy(asc(stationsTable.idx))
      .limit(1);

    return nextStation ?? null;
  }

  async getPrev(idx: number): Promise<StationModel | null> {
    const [prevStation] = await this.database.db
      .select()
      .from(stationsTable)
      .where(lt(stationsTable.idx, idx))
      .orderBy(desc(stationsTable.idx))
      .limit(1);

    return prevStation ?? null;
  }

  async getStationByName(name: string): Promise<StationModel | null> {
    const [station] = await this.database.db
      .select()
      .from(stationsTable)
      .where(eq(stationsTable.name, name))
      .limit(1);

    return station ?? null;
  }

  async getStationByUrl(url: string): Promise<StationModel | null> {
    const [station] = await this.database.db
      .select()
      .from(stationsTable)
      .where(eq(stationsTable.url, url))
      .limit(1);

    return station ?? null;
  }

  async createStation(station: CreateStationModel): Promise<StationModel> {
    const newStation: StationModel = {
      id: crypto.randomUUID(),
      idx: station.idx ?? null,
      name: station.name,
      url: station.url,
    };

    await this.database.db.insert(stationsTable).values(newStation);

    this.eventEmitter.emit('station.created');

    return newStation;
  }

  async updateStation(
    id: string,
    station: UpdateStationModel,
  ): Promise<StationModel | null> {
    const existing = await this.getStationById(id);

    if (!existing) return null;

    const updated: StationModel = {
      ...existing,
      ...station,
    };

    await this.database.db
      .update(stationsTable)
      .set({
        idx: updated.idx,
        name: updated.name,
        url: updated.url,
      })
      .where(eq(stationsTable.id, id));

    this.eventEmitter.emit('station.updated');

    return updated;
  }

  async deleteStation(id: string): Promise<boolean> {
    const result = await this.database.db
      .delete(stationsTable)
      .where(eq(stationsTable.id, id));

    const deleted = result.rowsAffected > 0;

    if (deleted) this.eventEmitter.emit('station.deleted');

    return deleted;
  }
}
