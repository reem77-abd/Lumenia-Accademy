import dotenv from "dotenv";
dotenv.config();

function requireEnv(name, fallback = undefined) {
  const v = process.env[name] ?? fallback;
  if (v === undefined || v === "") {
    const err = new Error(`Missing required env var: ${name}`);
    err.status = 500;
    err.code = "ENV_MISSING";
    throw err;
  }
  return v;
}

//abc

export const env = {
  NODE_ENV: process.env.NODE_ENV || "development",
  PORT: Number(process.env.PORT || 4000),
  JWT_SECRET: requireEnv("JWT_SECRET"),
  // add DB path if needed:
  // DB_PATH: process.env.DB_PATH || "./database/database.sqlite",
};

// basic validation
if (Number.isNaN(env.PORT) || env.PORT <= 0) {
  const err = new Error("PORT must be a valid number");
  err.status = 500;
  err.code = "ENV_INVALID";
  throw err;
}
