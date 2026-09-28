# YT-DLP 🎬

> **A feature-rich command-line audio/video downloader.**

## Overview

Fork of the popular yt-dlp project — a command-line program to download videos from YouTube and 1,000+ other sites. Written in Python.

## Features

- **Video Downloading** — Download videos in any resolution
- **Audio Extraction** — Extract audio from videos
- **Playlist Support** — Download entire playlists
- **Fast & Lightweight** — Command-line tool with minimal dependencies

## Usage

```bash
# Download a video
yt-dlp https://youtube.com/watch?v=VIDEO_ID

# Download audio only
yt-dlp -x --audio-format mp3 https://youtube.com/watch?v=VIDEO_ID

# Download playlist
yt-dlp --yes-playlist https://youtube.com/playlist?list=PLAYLIST_ID
```

## Installation

```bash
pip install yt-dlp
```

## License

GPLv3 License
