// Website settings. These must match the Minecraft plugin's config.yml (web-sync section).
//
// `npm run dev` (local testing) automatically uses a separate TEST channel and localhost, so tests
// never show up on the real site. The published site (`npm run build`) uses the real settings.
// Any value can still be overridden with a VITE_* variable in a .env.local file.

const env = import.meta.env;
const DEV = !!env.DEV;

/** Test channel used by `npm run dev`. Set the same ntfy-topic in your test server's config.yml. */
export const TEST_NTFY_TOPIC = 'willymoneysmp_test_a106025c';

/** Minecraft server address shown to players and used for the live player count. */
export const MC_SERVER_HOST: string = env.VITE_MC_SERVER_HOST || (DEV ? 'localhost' : 'willymoneysmp.minefort.com');

/** Whether to look up the server's online status via mcstatus.io. */
export const MC_PING_ENABLED: boolean = env.VITE_MC_PING ? env.VITE_MC_PING !== 'false' : !DEV;

/** ntfy relay the plugin posts to. */
export const NTFY_SERVER: string = env.VITE_NTFY_SERVER || 'https://ntfy.sh';
export const NTFY_TOPIC: string = env.VITE_NTFY_TOPIC || (DEV ? TEST_NTFY_TOPIC : 'willymoneysmp_leaderboard_live');

/**
 * Public half of the plugin's signing key (plugins/WillyMoneySMP/web-signing-key.properties).
 * The site ignores any update that isn't signed by the matching private key, so nobody can
 * post fake standings to the public ntfy topic. In game, `/smp webkey` shows the server's key.
 */
export const SIGNING_PUBLIC_KEY: string =
  env.VITE_SIGNING_PUBLIC_KEY ||
  'MFkwEwYHKoZIzj0CAQYIKoZIzj0DAQcDQgAE5o45oKAbuBsDCsrIwrFnG5YnMmx2DvmhW7V3hEHzLRMi7TQnLuk9f4/RJF/BGjZQ018u4FrMn4C8ULS9VmCatg==';

/**
 * Admin password for the "Join Server" panel. Only a salted PBKDF2-SHA256 hash is stored here.
 * To change the password, regenerate the hash (ask Claude, or see src/lib/admin.ts).
 */
export const ADMIN_PASSWORD_SALT = 'wmsmp-admin-v1';
export const ADMIN_PASSWORD_ITERATIONS = 310_000;
export const ADMIN_PASSWORD_HASH = 'b8c00a9c6f0112f42e27015b6c9ea5c0554168043b2167ee0889cfbecb8fef8a';

/** An update older than this (the plugin sends one at least every minute) means the feed is stale. */
export const STALE_AFTER_MS = 150_000;
