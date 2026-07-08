const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const pool = require("../config/db");

const createToken = (user) => {
  return jwt.sign(
    { id: user.id, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || "1d" }
  );
};

const register = async (req, res) => {
  try {
    const { full_name, email, phone, password, role = "customer" } = req.body;
    const allowedRoles = ["admin", "customer", "driver", "manager"];

    // Validate required fields
    if (!full_name || !email || !password) {
      return res.status(400).json({ message: "Full name, email, and password are required" });
    }

    // Validate role
    if (!allowedRoles.includes(role)) {
      return res.status(400).json({ message: "Invalid user role" });
    }

    // Check if email already exists
    let existingUsers = [];
    try {
      const [rows] = await pool.query("SELECT id FROM users WHERE email = ?", [email]);
      existingUsers = rows;
    } catch (dbError) {
      console.error("Database error checking email:", dbError);
      return res.status(500).json({ message: "Database connection error", error: dbError.message });
    }

    if (existingUsers.length) {
      return res.status(409).json({ message: "Email is already registered" });
    }

    // Hash password before storing
    let hashedPassword;
    try {
      hashedPassword = await bcrypt.hash(password, 10);
    } catch (hashError) {
      console.error("Error hashing password:", hashError);
      return res.status(500).json({ message: "Failed to process password" });
    }

    // Insert user into database
    let result;
    try {
      [result] = await pool.query(
        "INSERT INTO users (full_name, email, phone, password, role) VALUES (?, ?, ?, ?, ?)",
        [full_name, email, phone || null, hashedPassword, role]
      );
    } catch (insertError) {
      console.error("Error inserting user:", insertError);
      if (insertError.code === "ER_DUP_ENTRY") {
        return res.status(409).json({ message: "Email is already registered" });
      }
      return res.status(500).json({ message: "Failed to create user account", error: insertError.message });
    }

    // Fetch the created user from database to ensure data consistency
    let [users] = [];
    try {
      [users] = await pool.query(
        "SELECT id, full_name, email, phone, role, status FROM users WHERE id = ?",
        [result.insertId]
      );
    } catch (fetchError) {
      console.error("Error fetching created user:", fetchError);
      return res.status(500).json({ message: "User created but failed to retrieve account details" });
    }

    if (!users.length) {
      return res.status(500).json({ message: "User created but not found in database" });
    }

    const user = users[0];
    res.status(201).json({ user, token: createToken(user) });
  } catch (error) {
    console.error("Registration error:", error);
    res.status(500).json({ message: "Registration failed", error: error.message });
  }
};

const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: "Email and password are required" });
    }

    const [users] = await pool.query("SELECT * FROM users WHERE email = ?", [email]);
    const user = users[0];

    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    if (user.status !== "active") {
      return res.status(403).json({ message: "This account is not active" });
    }

    delete user.password;
    res.json({ user, token: createToken(user) });
  } catch (error) {
    res.status(500).json({ message: "Login failed", error: error.message });
  }
};

const me = (req, res) => {
  res.json({ user: req.user });
};

module.exports = { register, login, me };
