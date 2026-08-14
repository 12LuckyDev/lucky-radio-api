import { Injectable, OnModuleDestroy } from '@nestjs/common';
import { drizzle } from 'drizzle-orm/libsql';
import { Client, createClient } from '@libsql/client';

@Injectable()
export class DatabaseService implements OnModuleDestroy {
  private readonly client: Client;

  public readonly db: ReturnType<typeof drizzle>;

  constructor() {
    this.client = createClient({
      url: process.env.DATABASE_URL!,
    });

    this.db = drizzle(this.client);
  }

  public onModuleDestroy(): void {
    this.client.close();
  }
}
