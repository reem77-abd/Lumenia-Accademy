#!/usr/bin/env node
/*
  seed-dev-passwords.js
  - Replaces placeholder password_hash values like `HASH_TEACHER` with bcrypt hashes
    derived from their suffix (e.g. `TEACHER`).
  - Safe to run repeatedly; only updates rows where password_hash LIKE 'HASH_%'.
  - Usage: node scripts/seed-dev-passwords.js
*/
import db from "../src/config/db.js";
import { hashPassword } from "../src/utils/hash.js";

async function all(sql, params = []) {
  return new Promise((resolve, reject) => {
    db.all(sql, params, (err, rows) => {
      if (err) return reject(err);
      resolve(rows);
    });
  });
}

async function run(sql, params = []) {
  return new Promise((resolve, reject) => {
    db.run(sql, params, function (err) {
      if (err) return reject(err);
      resolve({ changes: this.changes, lastInsertRowid: this.lastID });
    });
  });
}

(async function main() {
  const users = await all("SELECT id, email, password_hash FROM users WHERE password_hash LIKE 'HASH_%'");
  if (!users.length) {
    console.log("No placeholder password_hash values found. Nothing to do.");
    process.exit(0);
  }

  console.log(`Found ${users.length} user(s) with placeholder passwords:`);
  for (const u of users) {
    const suffix = u.password_hash.slice(5); // after 'HASH_'
    const plain = suffix; // developer-friendly: use the suffix as plaintext
    const hashed = await hashPassword(plain);

    await run("UPDATE users SET password_hash = ? WHERE id = ?", [hashed, u.id]);
    console.log(` - ${u.email}  -> password set to '${plain}' (hashed)`);
  }

  console.log(`\nDone. You can now login with the shown plaintext passwords.`);
  process.exit(0);
})().catch((err) => {
  console.error(err);
  process.exit(1);
});