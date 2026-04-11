# StadiumIQ

Smart stadium experience demo: landing page plus an **incident reporting API** with an in-memory store (no database required for demos).

**Repository:** [github.com/deepjainlearnscoding/StadiumIQ](https://github.com/deepjainlearnscoding/StadiumIQ)

**Live demo:** [stadiumiq.onrender.com](https://stadiumiq.onrender.com) (Render — may spin up after idle)

## What others get

- **Clone and run locally** — full UI and API in a few commands (below).
- **Deploy one public URL** — the server serves both the static site and `/api/*` so the demo works for anyone with the link.
- **API-only consumers** — HTTP JSON API documented in [`server/README.md`](server/README.md).

## Run locally

```bash
git clone https://github.com/deepjainlearnscoding/StadiumIQ.git
cd StadiumIQ
cd server && npm install && npm start
```

Open **http://localhost:3001** — same port for the website and the API.

Development with auto-restart: `npm run dev` (from `server/`).

## Publish a public link (free tier example: Render)

1. Push this repo to GitHub (already set up if you use the link above).
2. In [Render](https://render.com), create a **New Web Service** from the repo, or use **New → Blueprint** and select the repo (uses [`render.yaml`](render.yaml)).
3. After deploy, share your Render URL. This project is deployed at **https://stadiumiq.onrender.com** — the UI and `/api/*` share the same origin, so no extra configuration is needed.

Other hosts (Railway, Fly.io, a VPS, etc.) work the same way: run `node server/index.js` from the repo root with `npm install` run inside `server/` first. Set the platform’s `PORT` if required; the app reads `process.env.PORT`.

## UI hosted separately (optional)

If the HTML is on static hosting (for example GitHub Pages) and the API is elsewhere, set the API origin in `index.html`:

```html
<meta name="stadiumiq-api-base" content="https://your-api-host.example.com" />
```

## License

MIT — see [LICENSE](LICENSE).
