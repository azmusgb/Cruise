# Cruise Companion

Cruise planning dashboard for the Rahe Family Caribbean trip.

## PWA support

This project now includes a basic Progressive Web App setup:

- Web app manifest (`manifest.json`)
- Service worker (`sw.js`) with offline-friendly caching
- Offline fallback page (`offline.html`)
- App icons in `/icons`

## Local run

You can run this as static files from the repo root, for example:

```bash
python3 -m http.server 8080
```
