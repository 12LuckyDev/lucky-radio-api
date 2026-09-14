export type LibrespotEventType =
  | 'active'
  | 'inactive'
  | 'metadata'
  | 'will_play'
  | 'playing'
  | 'not_playing'
  | 'paused'
  | 'stopped'
  | 'seek'
  | 'volume'
  | 'shuffle_context'
  | 'repeat_context'
  | 'repeat_track';

export interface LibrespotEvent<T = unknown> {
  type: LibrespotEventType;
  data: T;
}

export interface LibrespotTrack {
  uri: string;
  name: string;
  artist_names: string[];
  album_name: string;
  album_cover_url: string | null;
  position: number;
  duration: number;
  release_date: string;
  track_number: number;
  disc_number: number;
  format: string;
  codec: 'vorbis' | 'flac' | 'mp3' | 'aac' | 'unknown' | '';
  bitrate: number | null;
  sample_rate: number | null;
  bit_depth: number | null;
}

export interface LibrespotStatus {
  username: string;
  device_id: string;
  device_type: string;
  device_name: string;
  play_origin: string | null;
  play_origin_device_id: string | null;
  context_uri: string | null;
  context_name: string | null;
  stopped: boolean;
  paused: boolean;
  buffering: boolean;
  volume: number;
  volume_steps: number;
  repeat_context: boolean;
  repeat_track: boolean;
  shuffle_context: boolean;
  track: LibrespotTrack | null;
}

export interface LibrespotRoot {
  playback_ready: boolean;
}

export interface PlayRequest {
  uri: string;
  skip_to_uri?: string;
  paused?: boolean;
  position?: number;
}

export interface NextRequest {
  uri?: string;
}

export interface SeekRequest {
  position: number;
  relative?: boolean;
}

export interface VolumeRequest {
  volume: number;
  relative?: boolean;
}

export interface RepeatContextRequest {
  repeat_context: boolean;
}

export interface RepeatTrackRequest {
  repeat_track: boolean;
}

export interface ShuffleContextRequest {
  shuffle_context: boolean;
}

export interface OutputRequest {
  device?: string;
}

export interface MetadataEvent {
  context_uri: string | null;
  uri: string;
  name: string;
  artist_names: string[];
  album_name: string;
  album_cover_url: string | null;
  position: number;
  duration: number;
  format: string;
  codec: string;
  bitrate: number | null;
  sample_rate: number | null;
  bit_depth: number | null;
}

export interface PlayingEvent {
  context_uri: string | null;
  uri: string;
  resume: boolean;
  play_origin: string | null;
}

export interface PausedEvent {
  context_uri: string | null;
  uri: string;
  play_origin: string | null;
}

export interface SeekEvent {
  context_uri: string | null;
  uri: string;
  position: number;
  duration: number;
  play_origin: string | null;
}

export interface VolumeEvent {
  value: number;
  max: number;
}

export interface BooleanEvent {
  value: boolean;
}
