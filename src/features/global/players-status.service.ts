import { Injectable } from '@nestjs/common';
import { AppEventsService } from 'src/app-events/app-events.service';

interface PlayersStatus {
  connectedPlayers: Set<string>;
  playingPlayer: string | null;
  playerStates: Map<string, 'play' | 'stop' | 'pause'>;
}

@Injectable()
export class PlayersStatusService {
  public readonly status: PlayersStatus = {
    connectedPlayers: new Set<string>(),
    playingPlayer: null,
    playerStates: new Map<string, 'play' | 'stop' | 'pause'>(),
  };

  constructor(private readonly appEventsService: AppEventsService) {}

  public updateConnection(name: string, connected: boolean): void {
    const { connectedPlayers, playingPlayer } = this.status;

    if (connected) {
      if (connectedPlayers.has(name)) return;
      connectedPlayers.add(name);
    } else {
      if (!connectedPlayers.has(name)) return;
      connectedPlayers.delete(name);
    }

    if (!connected) {
      this.status.playerStates.delete(name);
      if (name === playingPlayer) {
        this.status.playingPlayer = null;
      }
    }

    this.updateStatus();
  }

  public updatePlayerState(
    name: string,
    state: 'play' | 'stop' | 'pause',
  ): void {
    const { playerStates } = this.status;
    let updated = false;

    if (state === 'play') {
      this.status.playingPlayer = name;
      updated = true;
    } else if (name === this.status.playingPlayer) {
      this.status.playingPlayer = null;
      updated = true;
    }

    if (playerStates.get(name) !== state) {
      playerStates.set(name, state);
      updated = true;
    }

    if (updated) {
      this.updateStatus();
    }
  }

  private updateStatus(): void {
    console.log(this.status);
    //TODO send status by appEventsService
  }
}
