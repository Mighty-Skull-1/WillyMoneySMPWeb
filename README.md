# WillyMoneySMPWeb

Live standings and draft board for the Willy Money SMP Minecraft tournament.
Deployed to GitHub Pages automatically on every push to `main` (see `.github/workflows/deploy.yml`).

## How live data works

The WillyMoneySMP plugin posts signed updates to the ntfy.sh topic in `src/config.ts`.
The site only shows updates whose signature matches `SIGNING_PUBLIC_KEY`, so the public
topic can't be used to post fake standings. Teams, tiers and the draft are managed in game only.

- Change the server address, topic or key in `src/config.ts`.
- In game: `/smp webkey` shows the server's public key, `/smp sync` pushes an update now.

## Develop

```
npm install
npm run dev
```
