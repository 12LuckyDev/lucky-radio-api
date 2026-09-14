import {
  Injectable,
  Logger,
  OnModuleDestroy,
  OnModuleInit,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import WebSocket from 'ws';
import { EventEmitter2, OnEvent } from '@nestjs/event-emitter';

import { LibrespotEvent, LibrespotStatus } from './models';
import { GoLibrespotClient } from './go-librespot.client';

const PLAYER_TYPE = 'SPOTIFY';

@Injectable()
export class GoLibrespotWatcher implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(GoLibrespotWatcher.name);

  private readonly wsUrl: string;

  private ws?: WebSocket;

  private reconnectTimer?: NodeJS.Timeout;
  private heartbeatTimer?: NodeJS.Timeout;

  private running = false;

  private reconnectDelay = 1000;
  private readonly maxReconnectDelay = 30_000;

  private lastStatus: LibrespotStatus | null = null;

  constructor(
    private readonly config: ConfigService,
    private readonly librespot: GoLibrespotClient, //TODO move to other place
    private readonly eventEmitter: EventEmitter2,
  ) {
    const urlConfig = this.config.get<string>('LIBRESPOT_WS_URL');
    if (urlConfig === undefined) {
      const message = 'No LIBRESPOT_WS_URL provided';
      this.logger.fatal(message);
      throw new Error(message);
    }

    this.wsUrl = urlConfig;
  }

  @OnEvent('global-player.playing')
  public async handleStationsEvent(type: string): Promise<void> {
    if (type !== PLAYER_TYPE) {
      this.logger.log(`Player paused because "${type}" player start playing`);
      await this.librespot.pause();
    }
  }

  async onModuleInit(): Promise<void> {
    this.running = true;

    await this.refreshStatus();

    this.connect();
  }

  async onModuleDestroy(): Promise<void> {
    await Promise.resolve();
    this.running = false;

    this.clearReconnectTimer();
    this.clearHeartbeat();

    if (this.ws) {
      this.ws.removeAllListeners();

      this.ws.close();

      this.ws = undefined;
    }
  }

  getStatus(): LibrespotStatus | null {
    return this.lastStatus;
  }

  private async refreshStatus(): Promise<void> {
    try {
      this.lastStatus = await this.librespot.getStatus();

      if (this.lastStatus) {
        this.logger.log(
          `Initial player state: ${
            this.lastStatus.track?.name ?? 'nothing playing'
          }`,
        );
      }
    } catch (error) {
      this.logger.warn(
        `Cannot get initial go-librespot status: ${this.errorMessage(error)}`,
      );
    }
  }

  private connect(): void {
    if (!this.running) {
      return;
    }

    if (
      this.ws &&
      (this.ws.readyState === WebSocket.OPEN ||
        this.ws.readyState === WebSocket.CONNECTING)
    ) {
      return;
    }

    this.logger.log(`Connecting to ${this.wsUrl}`);

    const ws = new WebSocket(this.wsUrl, {
      handshakeTimeout: 10_000,
    });

    this.ws = ws;

    const connectedAt = Date.now();

    ws.on('open', () => {
      this.logger.log('Connected to go-librespot WebSocket');

      this.reconnectDelay = 1000;

      this.startHeartbeat();
    });

    ws.on('message', (data) => {
      // eslint-disable-next-line @typescript-eslint/no-base-to-string
      this.handleMessage(data.toString());
    });

    ws.on('error', (error) => {
      this.logger.warn(`go-librespot WebSocket error: ${error.message}`);
    });

    ws.on('close', (code, reason) => {
      this.clearHeartbeat();

      this.ws = undefined;

      this.logger.warn(
        `go-librespot WebSocket closed: ${code} ${reason.toString() || ''}`,
      );

      if (!this.running) {
        return;
      }

      const connectionLifetime = Date.now() - connectedAt;

      if (connectionLifetime > 10_000) {
        this.reconnectDelay = 1000;
      } else {
        this.reconnectDelay = Math.min(
          this.reconnectDelay * 2,
          this.maxReconnectDelay,
        );
      }

      this.scheduleReconnect();
    });
  }

  private handleMessage(raw: string): void {
    let event: LibrespotEvent;

    try {
      event = JSON.parse(raw) as LibrespotEvent;
    } catch {
      this.logger.warn(`Invalid JSON received from go-librespot: ${raw}`);

      return;
    }

    if (!event || typeof event.type !== 'string') {
      this.logger.warn(`Invalid go-librespot event: ${raw}`);

      return;
    }

    this.logger.debug(`go-librespot event: ${event.type}`);

    this.updateStatusFromEvent(event);
    this.handleStatusEvent(event);
    this.eventEmitter.emit(`go-librespot.${event.type}`, event.data);
  }

  private handleStatusEvent(event: LibrespotEvent): void {
    switch (event.type) {
      case 'playing':
        this.eventEmitter.emit(`global-player.playing`, PLAYER_TYPE);
        break;
    }
  }

  // TODO remove or refactor
  private updateStatusFromEvent(event: LibrespotEvent): void {
    if (!this.lastStatus) {
      return;
    }

    switch (event.type) {
      case 'active':
        this.lastStatus.stopped = false;
        break;

      case 'inactive':
      case 'stopped':
        this.lastStatus.stopped = true;
        this.lastStatus.paused = false;
        break;

      case 'playing':
        this.lastStatus.paused = false;
        this.lastStatus.stopped = false;
        break;

      case 'paused':
        this.lastStatus.paused = true;
        break;

      case 'volume': {
        const data = event.data as {
          value: number;
          max: number;
        };

        this.lastStatus.volume = data.value;
        this.lastStatus.volume_steps = data.max;

        break;
      }

      case 'shuffle_context': {
        const data = event.data as {
          value: boolean;
        };

        this.lastStatus.shuffle_context = data.value;

        break;
      }

      case 'repeat_context': {
        const data = event.data as {
          value: boolean;
        };

        this.lastStatus.repeat_context = data.value;

        break;
      }

      case 'repeat_track': {
        const data = event.data as {
          value: boolean;
        };

        this.lastStatus.repeat_track = data.value;

        break;
      }

      case 'metadata': {
        this.lastStatus.track = event.data as LibrespotStatus['track'];

        break;
      }
    }
  }

  private scheduleReconnect(): void {
    if (!this.running || this.reconnectTimer) {
      return;
    }

    this.logger.log(`Reconnecting to go-librespot in ${this.reconnectDelay}ms`);

    this.reconnectTimer = setTimeout(() => {
      this.reconnectTimer = undefined;

      this.connect();
    }, this.reconnectDelay);
  }

  private startHeartbeat(): void {
    this.clearHeartbeat();

    this.heartbeatTimer = setInterval(() => {
      if (this.ws && this.ws.readyState === WebSocket.OPEN) {
        this.ws.ping();
      }
    }, 30_000);
  }

  private clearHeartbeat(): void {
    if (this.heartbeatTimer) {
      clearInterval(this.heartbeatTimer);
      this.heartbeatTimer = undefined;
    }
  }

  private clearReconnectTimer(): void {
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
      this.reconnectTimer = undefined;
    }
  }

  private errorMessage(error: unknown): string {
    if (error instanceof Error) {
      return error.message;
    }

    return String(error);
  }
}
