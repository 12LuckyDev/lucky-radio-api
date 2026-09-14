import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  LibrespotRoot,
  LibrespotStatus,
  NextRequest,
  OutputRequest,
  PlayRequest,
  RepeatContextRequest,
  RepeatTrackRequest,
  SeekRequest,
  ShuffleContextRequest,
  VolumeRequest,
} from './models';

@Injectable()
export class GoLibrespotClient {
  private readonly logger = new Logger(GoLibrespotClient.name);

  private readonly baseUrl: string;

  constructor(private readonly config: ConfigService) {
    const urlConfig = this.config.get<string>('LIBRESPOT_URL');
    if (urlConfig === undefined) {
      const message = 'No LIBRESPOT_URL provided';
      this.logger.fatal(message);
      throw new Error(message);
    }
    this.baseUrl = urlConfig.replace(/\/+$/, '');
  }

  private async request<T>(
    path: string,
    options: RequestInit = {},
  ): Promise<T | null> {
    const response = await fetch(`${this.baseUrl}${path}`, {
      ...options,
      headers: {
        Accept: 'application/json',
        ...(options.body
          ? {
              'Content-Type': 'application/json',
            }
          : {}),
        ...(options.headers ?? {}),
      },
    });

    if (response.status === 204) {
      return null;
    }

    if (!response.ok) {
      const body = await response.text();

      throw new Error(
        `go-librespot HTTP ${response.status} ${response.statusText}: ${body}`,
      );
    }

    const contentType = response.headers.get('content-type');

    if (contentType?.includes('application/json')) {
      return (await response.json()) as T;
    }

    return null;
  }

  private async post<T>(path: string, body?: unknown): Promise<T | null> {
    return this.request<T>(path, {
      method: 'POST',
      ...(body !== undefined
        ? {
            body: JSON.stringify(body),
          }
        : {}),
    });
  }

  async getRoot(): Promise<LibrespotRoot> {
    return (await this.request<LibrespotRoot>('/'))!;
  }

  async getStatus(): Promise<LibrespotStatus | null> {
    return this.request<LibrespotStatus>('/status');
  }

  async play(request: PlayRequest): Promise<void> {
    await this.post('/player/play', request);
  }

  async resume(): Promise<void> {
    await this.post('/player/resume');
  }

  async pause(): Promise<void> {
    await this.post('/player/pause');
  }

  async playPause(): Promise<void> {
    await this.post('/player/playpause');
  }

  async stop(): Promise<void> {
    await this.post('/player/stop');
  }

  async next(request?: NextRequest): Promise<void> {
    await this.post('/player/next', request);
  }

  async previous(): Promise<void> {
    await this.post('/player/prev');
  }

  async seek(request: SeekRequest): Promise<void> {
    await this.post('/player/seek', request);
  }

  async getVolume(): Promise<{
    value: number;
    max: number;
  }> {
    return (await this.request<{
      value: number;
      max: number;
    }>('/player/volume'))!;
  }

  async setVolume(request: VolumeRequest): Promise<void> {
    await this.post('/player/volume', request);
  }

  async repeatContext(request: RepeatContextRequest): Promise<void> {
    await this.post('/player/repeat_context', request);
  }

  async repeatTrack(request: RepeatTrackRequest): Promise<void> {
    await this.post('/player/repeat_track', request);
  }

  async shuffleContext(request: ShuffleContextRequest): Promise<void> {
    await this.post('/player/shuffle_context', request);
  }

  async setOutput(request: OutputRequest): Promise<void> {
    await this.post('/player/output', request);
  }
}
