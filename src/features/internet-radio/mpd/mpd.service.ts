import { Injectable, Logger } from '@nestjs/common';
import mpd, { MPD } from 'mpd2';
import { MpdStatusModel } from './models/mpd-status.model';
import { MpdConfigModel } from './models/mpd-config.model';
import { BehaviorSubject } from 'rxjs';
import { ConfigService } from '@nestjs/config';

const noMpdConnected = 'No MPD connected';
const mpdError = 'MPD error';

@Injectable()
export class MpdService {
  private readonly logger = new Logger(MpdService.name);

  private connectingInProgress: boolean = false;
  private lastAttempt: Date = new Date();
  private client: MPD.Client | null = null;

  private readonly connectedSubject = new BehaviorSubject<boolean>(false);
  private readonly stateSubject = new BehaviorSubject<
    'play' | 'stop' | 'pause'
  >('stop');
  private readonly volumeSubject = new BehaviorSubject<number>(0);
  private readonly urlSubject = new BehaviorSubject<string | null>(null);

  public readonly connected$ = this.connectedSubject.asObservable();
  public readonly state$ = this.stateSubject.asObservable();
  public readonly volume$ = this.volumeSubject.asObservable();
  public readonly url$ = this.urlSubject.asObservable();

  private readonly config: MpdConfigModel;

  constructor(private readonly configService: ConfigService) {
    this.config = {
      host: this.configService.get<string>('MPD_HOST') ?? 'localhost',
      port: this.configService.get<number>('MPD_PORT') ?? 6600,
    };

    void this.connectMpd();
  }

  public get connected(): boolean {
    return this.connectedSubject.value;
  }

  public get lastConnectingAttempt(): Date {
    return this.lastAttempt;
  }

  public get url(): string | null {
    return this.urlSubject.value;
  }

  public async getStatus(): Promise<MpdStatusModel | null> {
    if (this.client === null) {
      return null;
    }
    const status = await this.client.sendCommand('status');
    const parsed = mpd.parseObject(status);

    if (
      'volume' in parsed &&
      typeof parsed.volume === 'number' &&
      'state' in parsed &&
      (parsed.state === 'play' ||
        parsed.state === 'stop' ||
        parsed.state === 'pause')
    ) {
      return {
        volume: parsed.volume,
        state: parsed.state,
      };
    }

    return null;
  }

  public async playStream(url: string): Promise<true | { error: string }> {
    if (this.client === null) {
      this.logger.warn(`[playStream] ${noMpdConnected}`);
      return { error: noMpdConnected };
    }

    try {
      const current = await this.getCurrentUrl();

      // check if new url
      if (current === url) return true;

      await this.client.sendCommand('clear');
      await this.client.sendCommand(`add "${url}"`);
      await this.client.sendCommand('play');
    } catch (ex: unknown) {
      const error = ex as MPD.MPDError;
      this.logger.error(`[playStream] ${mpdError}`, error);
      return { error: mpdError };
    }

    return true;
  }

  public async stopStream(): Promise<true | { error: string }> {
    if (this.client === null) {
      this.logger.warn(`[stopStream] ${noMpdConnected}`);
      return { error: noMpdConnected };
    }

    try {
      await this.client.sendCommand('clear');
      await this.client.sendCommand('stop');
    } catch (ex: unknown) {
      const error = ex as MPD.MPDError;
      this.logger.error(`[stopStream] ${mpdError}`, error);
      return { error: mpdError };
    }

    return true;
  }

  public async setVolume(volume: number): Promise<true | { error: string }> {
    if (this.client === null) {
      this.logger.warn(`[setVolume] ${noMpdConnected}`);
      return { error: noMpdConnected };
    }

    try {
      await this.client.sendCommand(`setvol ${volume}`);
    } catch (ex: unknown) {
      const error = ex as MPD.MPDError;
      this.logger.error(`[setVolume] ${mpdError}`, error);
      return { error: mpdError };
    }

    return true;
  }

  private async connectMpd(): Promise<void> {
    if (this.connectingInProgress) return;
    this.connectingInProgress = true;

    while (this.client === null) {
      try {
        this.lastAttempt = new Date();
        this.client = await mpd.connect(this.config);
        this.logger.log('[connectMpd] Connected to MPD');
      } catch (ex) {
        this.logger.error(
          '[connectMpd] Failed to connect to MPD; retrying in 10 seconds',
          ex,
        );
        await new Promise((resolve) => setTimeout(resolve, 10000));
      }
    }
    this.connectingInProgress = false;
    await this.initClientListeners();
  }

  private async initClientListeners(): Promise<void> {
    if (this.client === null) return;

    await this.updateStateSubjects();

    this.client.on('close', () => {
      void this.handleClientClose();
    });

    this.client.on('system', (name) => {
      if (name === 'mixer') void this.updateStateSubjects();
    });

    this.client.on('system-player', () => {
      void this.updateStateSubjects();
    });
  }

  private async handleClientClose(): Promise<void> {
    this.logger.log('[handleClientClose] MPD client connection closed');
    this.client = null;
    await this.updateStateSubjects();
    await this.connectMpd();
  }

  private async getCurrentUrl(): Promise<string | null> {
    try {
      if (this.client === null) return null;

      const current = await this.client.sendCommand('currentsong');
      const parsed = mpd.parseObject(current);

      if (!!parsed && 'file' in parsed && typeof parsed.file === 'string') {
        return parsed.file;
      }

      return null;
    } catch (ex: unknown) {
      this.logger.error(
        '[getCurrentUrl] [on close] error on trying to send command currentsong',
        ex,
      );
      return null;
    }
  }

  private async updateStateSubjects(): Promise<void> {
    const status = await this.getStatus();
    if (status === null) {
      if (this.connectedSubject.value !== false)
        this.connectedSubject.next(false);
    } else {
      if (this.connectedSubject.value !== true)
        this.connectedSubject.next(true);
    }

    const { state, volume } = status ?? { state: 'stop', volume: 0 };
    if (this.stateSubject.value !== state) this.stateSubject.next(state);
    if (this.volumeSubject.value !== volume) this.volumeSubject.next(volume);

    const url = await this.getCurrentUrl();
    if (this.urlSubject.value !== url) this.urlSubject.next(url);
  }
}
