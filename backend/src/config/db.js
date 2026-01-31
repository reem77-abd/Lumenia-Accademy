import sqlite3 from "sqlite3";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const dbPath = path.join(__dirname, "../../database/lumenia.sqlite");

// Configurable via env (defaults are safe for dev)
const BUSY_TIMEOUT = Number(process.env.DB_BUSY_TIMEOUT ?? 5000);
const WAL_RETRY_ATTEMPTS = Number(process.env.DB_WAL_RETRY_ATTEMPTS ?? 3);
const WAL_RETRY_BASE_DELAY = Number(process.env.DB_WAL_RETRY_BASE_DELAY ?? 50);

const sqlite = sqlite3.verbose();
const db = new sqlite.Database(dbPath, (err) => {
  if (err) {
    console.error("❌ Failed to connect to SQLite DB", err.message);
    return;
  }

  // Best-effort runtime configuration to reduce SQLITE_BUSY in dev
  db.serialize(() => {
    // Try to enable WAL with a small retry/backoff — external tools (DB Browser) may hold a transient lock
    (async function tryEnableWAL(attempts = WAL_RETRY_ATTEMPTS) {
      for (let i = 0; i < attempts; i++) {
        await new Promise((r) => {
          db.run("PRAGMA journal_mode = WAL", (err, mode) => {
            if (err) return r({ ok: false, err });
            return r({ ok: true, mode });
          });
        }).then((res) => {
          if (res && res.ok) {
            console.log("SQLite: journal_mode=", res.mode);
          } else if (res && res.err && res.err.code === "SQLITE_BUSY") {
            const delay = WAL_RETRY_BASE_DELAY * Math.pow(2, i);
            console.warn(`SQLite: journal_mode=WAL attempt ${i + 1} failed (BUSY). Retrying in ${delay}ms...`);
            Atomics.wait(new Int32Array(new SharedArrayBuffer(4)), 0, 0, delay);
          } else if (res && res.err) {
            console.warn("SQLite: failed to set journal_mode=WAL", res.err.message);
          }
        });
      }

      // Report final state (best-effort read)
      db.get("PRAGMA journal_mode", [], (prErr, row) => {
        if (prErr) return console.warn("SQLite: could not read journal_mode", prErr.message);
        console.log("SQLite: effective journal_mode=", row && row.journal_mode);
      });
    })();

    // busy_timeout (configurable)
    db.run(`PRAGMA busy_timeout = ${BUSY_TIMEOUT}`, (err) => {
      if (err) console.warn("SQLite: failed to set busy_timeout", err.message);
      else console.log(`SQLite: busy_timeout=${BUSY_TIMEOUT}ms`);
    });

    // Quick health check: attempt to acquire a write lock briefly
    db.run("BEGIN IMMEDIATE", (beginErr) => {
      if (beginErr) {
        console.warn("SQLite startup check: unable to obtain write lock (DB may be locked by another process) -", beginErr.code || beginErr.message);
        console.warn("→ If you're using DB Browser, close it or open the DB in read-only mode.");
      } else {
        // Immediately rollback so we don't leave a transaction open
        db.run("ROLLBACK", (rbErr) => {
          if (rbErr) console.warn("SQLite startup check: rollback failed", rbErr.message);
          else console.log("SQLite startup check: write lock acquired and released OK");
        });
      }
    });
  });

  console.log("✅ Connected to SQLite DB");
});

// Exported helper: retry db.run when SQLITE_BUSY occurs (exponential backoff)
// Adds a wall-clock cap (DB_RUN_MAX_WAIT_MS) so callers receive a fast 503
export async function runWithRetry(
  sql,
  params = [],
  attempts = 6,
  baseDelay = 20,
  // Lower default in dev so clients receive a faster 503 instead of long hangs
  maxTotalMs = Number(process.env.DB_RUN_MAX_WAIT_MS ?? 3000)
) {
  const start = Date.now();

  for (let i = 0; i < attempts; i++) {
    // fail-fast if we've already exceeded the configured total wait
    if (Date.now() - start > maxTotalMs) {
      const e = new Error("DATABASE_BUSY");
      e.status = 503;
      throw e;
    }

    try {
      const res = await new Promise((resolve, reject) => {
        db.run(sql, params, function (err) {
          if (err) return reject(err);
          resolve({ changes: this.changes, lastInsertRowid: this.lastID });
        });
      });
      return res;
    } catch (err) {
      // developer-friendly debug (only in non-production)
      if (process.env.NODE_ENV !== 'production' && err && err.code === 'SQLITE_BUSY') {
        console.debug(`SQLite BUSY (attempt=${i + 1}) elapsed=${Date.now()-start}ms sql=${String(sql).slice(0,80)}`);
      }

      // if sqlite says BUSY and we have room to retry, back off and try again
      if (err && err.code === "SQLITE_BUSY" && i < attempts - 1) {
        const elapsed = Date.now() - start;
        const remaining = Math.max(0, maxTotalMs - elapsed);
        const backoff = Math.min(baseDelay * Math.pow(2, i), Math.max(50, Math.floor(remaining / 2)));
        await new Promise((r) => setTimeout(r, backoff));
        continue;
      }

      // map persistent SQLITE_BUSY to a friendly DATABASE_BUSY (503)
      if (err && err.code === "SQLITE_BUSY") {
        const e = new Error("DATABASE_BUSY");
        e.status = 503;
        throw e;
      }

      throw err;
    }
  }

  const e = new Error("DATABASE_BUSY");
  e.status = 503;
  throw e;
}

export default db; 
