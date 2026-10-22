import { Injectable } from '@nestjs/common';
import { PlayerState } from '../shared';
import { distinctUntilChanged, Subject } from 'rxjs';
import { GoLibrespotSocketWatcher } from './go-librespot/go-librespot-socket-watcher';
import { compareCurrentSong, GoLibrespotStatusMapper } from './utils';
import { AppEventsService } from 'src/app-events/app-events.service';
import { CurrentSongInfoDTO } from './dto/current-song-info.dto';
import { DeviceInfoDTO } from './dto/device-info.dto';
import { compareDeviceInfo } from './utils/compare-device-info';

@Injectable()
export class SpotifyStateHandler {
  private readonly volumeSubject = new Subject<number>();
  private readonly stateSubject = new Subject<PlayerState>();
  private readonly currentSongSubject = new Subject<CurrentSongInfoDTO>();
  private readonly deviceInfoSubject = new Subject<DeviceInfoDTO>();

  public readonly volume$ = this.volumeSubject.asObservable();
  public readonly state$ = this.stateSubject.asObservable();

  constructor(
    private readonly goLibrespotWatcher: GoLibrespotSocketWatcher,
    private readonly appEventsService: AppEventsService,
  ) {
    this.initWatcherObservable();
  }

  private initWatcherObservable(): void {
    this.goLibrespotWatcher.status$.subscribe((state) => {
      this.volumeSubject.next(GoLibrespotStatusMapper.toVolume(state));
      this.stateSubject.next(GoLibrespotStatusMapper.toPlayerState(state));
      this.currentSongSubject.next(
        GoLibrespotStatusMapper.toCurrentSong(state),
      );
      this.deviceInfoSubject.next(GoLibrespotStatusMapper.toDeviceInfo(state));
    });

    this.currentSongSubject
      .pipe(distinctUntilChanged(compareCurrentSong))
      .subscribe((data) =>
        this.appEventsService.emit({ type: 'spotify.current-update', data }),
      );

    this.deviceInfoSubject
      .pipe(distinctUntilChanged(compareDeviceInfo))
      .subscribe((data) =>
        this.appEventsService.emit({ type: 'spotify.device-update', data }),
      );
  }
}
