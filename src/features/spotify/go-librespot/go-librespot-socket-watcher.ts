import {
  Injectable,
  Logger,
  OnModuleDestroy,
  OnModuleInit,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { LibrespotEvent, LibrespotStatus } from './models';
import { GoLibrespotApiClient } from './go-librespot-api-client';
import { BehaviorSubject, distinctUntilChanged, map } from 'rxjs';
import { WebSocketClient } from './web-socket-client';

@Injectable()
export class GoLibrespotSocketWatcher implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(GoLibrespotSocketWatcher.name);

  private readonly connectedSubject = new BehaviorSubject<boolean>(false);
  public readonly connected$ = this.connectedSubject.asObservable();

  private readonly statusSubject = new BehaviorSubject<LibrespotStatus | null>(
    null,
  );
  public readonly status$ = this.statusSubject.asObservable();

  public readonly volume$ = this.status$.pipe(
    map((s) => (s === null ? { volume: 0 } : s)),
    map((s) => s.volume),
    distinctUntilChanged(),
  );

  private readonly lastConnectingAttemptSubject = new BehaviorSubject<Date>(
    new Date(),
  );
  public readonly lastConnectingAttempt$ =
    this.lastConnectingAttemptSubject.asObservable();

  private readonly wsClient: WebSocketClient;

  constructor(
    private readonly config: ConfigService,
    private readonly librespot: GoLibrespotApiClient,
  ) {
    const urlConfig = this.config.get<string>('LIBRESPOT_WS_URL');
    if (urlConfig === undefined) {
      const message = 'No LIBRESPOT_WS_URL provided';
      this.logger.fatal(message);
      throw new Error(message);
    }

    this.wsClient = new WebSocketClient(
      urlConfig,
      {
        onTryConnect: () => this.lastConnectingAttemptSubject.next(new Date()),
        onOpen: () => this.connectedSubject.next(true),
        onMessage: (data) => this.handleMessage(data as LibrespotEvent),
        onClose: () => this.connectedSubject.next(false),
      },
      { name: 'Go-librespot' },
    );
  }

  async onModuleInit(): Promise<void> {
    try {
      this.statusSubject.next(await this.librespot.getStatus());
    } catch (ex) {
      this.logger.error('Cannot get initial go-librespot status', ex);
    }

    this.wsClient.connect();
  }

  onModuleDestroy(): void {
    this.wsClient.close();
  }

  private handleMessage(event: LibrespotEvent): void {
    if (!event || typeof event.type !== 'string') {
      this.logger.warn(`Invalid go-librespot event: ${JSON.stringify(event)}`);
      return;
    }

    this.updateStatusFromEvent(event);
  }

  private updateStatusFromEvent(event: LibrespotEvent): void {
    switch (event.type) {
      case 'active':
        this.updateStatus({ stopped: false });
        break;
      case 'inactive':
      case 'stopped':
        this.updateStatus({ stopped: true, paused: false });
        break;
      case 'playing':
        this.updateStatus({ stopped: false, paused: false });
        break;
      case 'paused':
        this.updateStatus({ paused: true });
        break;
      case 'volume': {
        const { value, max } = event.data as {
          value: number;
          max: number;
        };
        this.updateStatus({ volume: value, volume_steps: max });
        break;
      }
      case 'shuffle_context': {
        const { value } = event.data as {
          value: boolean;
        };
        this.updateStatus({ shuffle_context: value });
        break;
      }
      case 'repeat_context': {
        const { value } = event.data as {
          value: boolean;
        };
        this.updateStatus({ repeat_context: value });
        break;
      }
      case 'repeat_track': {
        const { value } = event.data as {
          value: boolean;
        };
        this.updateStatus({ repeat_track: value });
        break;
      }
      case 'metadata': {
        const track = event.data as LibrespotStatus['track'];
        this.updateStatus({ track });
        break;
      }
    }
  }

  private updateStatus(status: Partial<LibrespotStatus>): void {
    const { value } = this.statusSubject;
    if (value) {
      this.statusSubject.next({ ...value, ...status });
    }
  }
}
