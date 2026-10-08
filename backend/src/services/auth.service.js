const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { db } = require("../config/firebase");
const env = require("../config/env");
const { AppError } = require("../middleware/error.middleware");

const USERS_COLLECTION = "users";

/**
 * Register a new user
 */
const register = async ({ name, email, password }) => {
  if (!name || !email || !password) {
    throw new AppError("Name, email, and password are required", 400);
  }

  const normalizedEmail = email.toLowerCase().trim();

  // Check if user already exists
  const existingSnapshot = await db
    .collection(USERS_COLLECTION)
    .where("email", "==", normalizedEmail)
    .limit(1)
    .get();

  if (!existingSnapshot.empty) {
    throw new AppError("User with this email already exists", 409);
  }

  // Hash password
  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(password, salt);

  const now = new Date().toISOString();
  const userData = {
    name: name.trim(),
    email: normalizedEmail,
    password: hashedPassword,
    createdAt: now,
    updatedAt: now,
  };

  const docRef = await db.collection(USERS_COLLECTION).add(userData);

  // Generate JWT token
  const token = jwt.sign(
    { id: docRef.id, email: normalizedEmail, name: userData.name },
    env.JWT_SECRET,
    { expiresIn: env.JWT_EXPIRES_IN }
  );

  return {
    user: {
      id: docRef.id,
      name: userData.name,
      email: userData.email,
      createdAt: userData.createdAt,
    },
    token,
  };
};

/**
 * Login user with email and password
 */
const login = async ({ email, password }) => {
  if (!email || !password) {
    throw new AppError("Email and password are required", 400);
  }

  const normalizedEmail = email.toLowerCase().trim();

  const snapshot = await db
    .collection(USERS_COLLECTION)
    .where("email", "==", normalizedEmail)
    .limit(1)
    .get();

  if (snapshot.empty) {
    throw new AppError("Invalid email or password", 401);
  }

  const doc = snapshot.docs[0];
  const userData = doc.data();

  const isMatch = await bcrypt.compare(password, userData.password);
  if (!isMatch) {
    throw new AppError("Invalid email or password", 401);
  }

  const token = jwt.sign(
    { id: doc.id, email: userData.email, name: userData.name },
    env.JWT_SECRET,
    { expiresIn: env.JWT_EXPIRES_IN }
  );

  return {
    user: {
      id: doc.id,
      name: userData.name,
      email: userData.email,
      createdAt: userData.createdAt,
    },
    token,
  };
};

/**
 * Get current user profile by userId
 */
const getUserById = async (userId) => {
  const doc = await db.collection(USERS_COLLECTION).doc(userId).get();

  if (!doc.exists) {
    throw new AppError("User not found", 404);
  }

  const data = doc.data();
  return {
    id: doc.id,
    name: data.name,
    email: data.email,
    createdAt: data.createdAt,
  };
};

module.exports = {
  register,
  login,
  getUserById,
};
