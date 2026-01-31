const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const userModel = require("../models/user.model");

// --- helpers ---
function sanitizeUser(user) {
  if (!user) return null;
  const { password_hash, ...safe } = user;
  return safe;
}

function signToken(user) {
  const secret = process.env.JWT_SECRET;
  const expiresIn = process.env.JWT_EXPIRES_IN || "7d";

  if (!secret) {
    throw new Error("JWT_SECRET is not set in .env");
  }

  // payload minimal
  return jwt.sign(
    { sub: user.id, role: user.role },
    secret,
    { expiresIn }
  );
}

// --- main functions ---
async function register({ name, email, password }) {
  // 1) basic validation
  if (!name || !email || !password) {
    const err = new Error("name, email, password are required");
    err.status = 400;
    throw err;
  }

  // 2) check if email exists
  const existing = await userModel.findByEmail(email);
  if (existing) {
    const err = new Error("Email already in use");
    err.status = 409;
    throw err;
  }

  // 3) hash password
  const saltRounds = 10;
  const password_hash = await bcrypt.hash(password, saltRounds);

  // 4) create user (default role student)
  const created = await userModel.create({
    name,
    email,
    password_hash,
    role: "student",
    is_active: 1,
  });

  // 5) sign token + return safe user
  const token = signToken(created);
  return { token, user: sanitizeUser(created) };
}

async function login({ email, password }) {
  // 1) validation
  if (!email || !password) {
    const err = new Error("email and password are required");
    err.status = 400;
    throw err;
  }

  // 2) find user by email
  const user = await userModel.findByEmail(email);
  if (!user) {
    const err = new Error("Invalid credentials");
    err.status = 401;
    throw err;
  }

  // 3) check active
  if (user.is_active === 0) {
    const err = new Error("Account is deactivated");
    err.status = 403;
    throw err;
  }

  // 4) compare password
  const ok = await bcrypt.compare(password, user.password_hash);
  if (!ok) {
    const err = new Error("Invalid credentials");
    err.status = 401;
    throw err;
  }

  // 5) sign token + return safe user
  const token = signToken(user);
  return { token, user: sanitizeUser(user) };
}

module.exports = {
  register,
  login,
};

