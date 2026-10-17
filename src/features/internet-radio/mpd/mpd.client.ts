import mpd, { MPD } from 'mpd2';
import { MpdStatusModel } from './models/mpd-status.model';
import { MpdConfigModel } from './models/mpd-config.model';
import { BehaviorSubject } from 'rxjs';
import { CommandResult } from 'src/features/shared';
import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { MpdParser } from './utils/mpd-parser';

const noMpdConnected = 'No MPD connected';
const noMpdConnectedResult: CommandResult = {
  error: noMpdConnected,
  type: 'forbidden',
};
const mpdError = 'MPD error';
const mpdErrorResult: CommandResult = {
  error: mpdError,
  type: 'forbidden',
};

@Injectable()
export class MpdClient {
  private readonly logger: Logger = new Logger(MpdClient.name);

  private connectingInProgress: boolean = false;
  private client: MPD.Client | null = null;

  private readonly mdpStatusSubject =
    new BehaviorSubject<MpdStatusModel | null>(null);
  public readonly mdpStatus$ = this.mdpStatusSubject.asObservable();

  private readonly urlSubject = new BehaviorSubject<string | null>(null);
  public readonly url$ = this.urlSubject.asObservable();

  private readonly config: MpdConfigModel;

  constructor(private readonly configService: ConfigService) {
    this.config = {
      host: this.configService.get<string>('MPD_HOST') ?? 'localhost',
      port: this.configService.get<number>('MPD_PORT') ?? 6600,
    };

    void this.connectMpd();
  }

  public get url(): string | null {
    return this.urlSubject.value;
  }

  public async playStream(url: string): Promise<CommandResult> {
    if (this.client === null) {
      this.logger.warn(`[playStream] ${noMpdConnected}`);
      return noMpdConnectedResult;
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
      return mpdErrorResult;
    }

    return true;
  }

  public async stopStream(): Promise<CommandResult> {
    if (this.client === null) {
      this.logger.warn(`[stopStream] ${noMpdConnected}`);
      return noMpdConnectedResult;
    }

    try {
      await this.client.sendCommand('clear');
      await this.client.sendCommand('stop');
    } catch (ex: unknown) {
      const error = ex as MPD.MPDError;
      this.logger.error(`[stopStream] ${mpdError}`, error);
      return mpdErrorResult;
    }

    return true;
  }

  public async setVolume(volume: number): Promise<CommandResult> {
    if (this.client === null) {
      this.logger.warn(`[setVolume] ${noMpdConnected}`);
      return noMpdConnectedResult;
    }

    try {
      await this.client.sendCommand(`setvol ${volume}`);
    } catch (ex: unknown) {
      const error = ex as MPD.MPDError;
      this.logger.error(`[setVolume] ${mpdError}`, error);
      return mpdErrorResult;
    }

    return true;
  }

  private async connectMpd(): Promise<void> {
    if (this.connectingInProgress) return;
    this.connectingInProgress = true;

    while (this.client === null) {
      try {
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

  // TODO CommandResult
  private async getCurrentUrl(): Promise<string | null> {
    try {
      if (this.client === null) return null;

      const current = await this.client.sendCommand('currentsong');
      return MpdParser.toMpdCurrentFile(current);
    } catch (ex: unknown) {
      this.logger.error(
        '[getCurrentUrl] error on trying to send command currentsong',
        ex,
      );
      return null;
    }
  }

  // TODO CommandResult
  public async getMpdStatus(): Promise<MpdStatusModel | null> {
    try {
      if (this.client === null) return null;

      const status = await this.client.sendCommand('status');
      return MpdParser.toMpdStatusModel(status);
    } catch (ex: unknown) {
      this.logger.error(
        '[getMpdStatus] error on trying to send command status',
        ex,
      );
      return null;
    }
  }

  private async updateStateSubjects(): Promise<void> {
    const status = await this.getMpdStatus();
    this.mdpStatusSubject.next(status);

    const url = await this.getCurrentUrl();
    if (this.urlSubject.value !== url) this.urlSubject.next(url);
  }
}
