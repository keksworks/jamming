# Jamming.me

A PWA for jamming together in sync: start a jam, let people nearby join by scanning a QR code or entering a short code,
pick a chord progression (or a song with lyrics) and everyone sees the same chords, highlighted in time with a shared beat.
Members can suggest the next song, progression or key and vote on suggestions.

* Jams are ephemeral and stored only in server memory, so they are lost when the server restarts; no login needed to start or join
* Real-time sync via Server-Sent Events, beat is synchronized using server clock offset
* Built-in library of common chord progressions, transposable to any key
* Lyrics search via [LRCLIB](https://lrclib.net), ChordPro or "chords over lyrics" text can be pasted from any chord site

Built with Kotlin/[Klite](https://github.com/keksworks/klite) and Svelte/TailwindCSS,
following [The Pure Code Manifesto](https://github.com/keksworks/manifesto) principles.

## Prerequisites

* JDK 25+
* Node 24+
* Docker

## Building

See [Dockerfile](Dockerfile) for more information

### Build server

`./gradlew jar`

### Build UI

Inside of `ui` directory:

Install the dependencies using: `npm install` and

Build UI using: `npm run build`

## Development

Start API by running the [Launcher](src/Launcher.kt).
`./gradlew run` will auto-restart it after each compilation.

It will automatically try to start the database using `docker compose up -d db`
To access DB via IDE use credentials from [.env](.env) file.

Start UI using: `cd ui && npm start`

## Running tests

Server tests:
`./gradlew test`

Repository tests are integration tests, connecting to the real database, which runs in Docker.
The test database name ends with `_test`.

UI tests:
`cd ui && npm test`

## Deployment instructions

The easiest way to deploy is via Docker compose:

`docker compose up -d`

This will pull/build and start the application and the database.

# TODO ideas
* Add a projector mode for displaying lyrics and chords on a big screen
* Make searching for songs easier
* Start/Stop doesn't always make sense as chords not always passed linearly
* Let nearby people join (local network/bluetooth?)

Maybe:
* Add Karaoke support with inline YouTube video
* Offline mode for basement bars?
