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


## GitHub Pages (mobile-friendly deploy)

This app is configured to work from a project subpath (for example `https://<user>.github.io/Cruise/`) using relative PWA paths.

- Enable Pages in repository settings (deploy from branch root).
- Open `https://<user>.github.io/<repo>/index.html` once online to prime the cache.
- Then install from mobile browser (`Add to Home Screen`).


## GitHub Actions CI

This repository now includes:

- `.github/workflows/pwa-ci.yml` for validation on push/PR (manifest JSON, JS syntax, static PWA wiring checks, and local smoke tests).
- `.github/workflows/pages.yml` for GitHub Pages deployment from the `main` branch.

If your default branch is not `main`, update `pages.yml` accordingly.
