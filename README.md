# lucky-radio-api

A REST API that integrates with MPD (Music Player Daemon) to manage and play music radio stations.

## The API allows you to:

- Play and stop music
- Switch between radio stations
- Add new radio stations
- Edit existing stations
- Delete stations
- Get a list of available stations

Radio stations are stored in a SQLite database, while MPD handles the actual playback of audio streams.

## MPD Integration

The API works seamlessly with the [lucky-mpd](https://github.com/12LuckyDev/lucky-mpd) Docker container, which provides an MPD server configured for audio playback on Raspberry Pi. The container uses ALSA for audio output and exposes the MPD service on port 6600.

## Docker Image Configuration

The Docker image works well with Docker Compose and can be easily configured using the provided example configuration.

See the [compose.example.yaml](compose.example.yaml) file for an example Docker Compose setup.

## Development

```sh
npm start
```

Starts the api in dev environment.

### Build

```sh
npm run build
```

Builds the application for production.

## Image Build

The image is intended to run on a Raspberry Pi using `linux/arm64`.

On Windows, make sure Docker Desktop is running and build the image with:

```bash
docker buildx build --platform linux/arm64 -t lucky-radio-api:latest --load .
```

Or use:

```text
build.bat
```

The script builds the ARM64 image and exports it as:

```text
lucky-radio-api.tar
```

## Deploy to Raspberry Pi

Copy the image to the Raspberry Pi:

```bash
scp lucky-radio-api.tar pi@raspberry:/tmp/
```

Load the image:

```bash
docker load -i /tmp/lucky-radio-api.tar
```

Then start the container:

```bash
docker compose up -d
```
