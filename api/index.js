const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const UserModel = require("./models/Users");
require("dotenv").config();

const app = express();
const port = 4000;
const jwtSecret = process.env.JWT_SECRET || "dev-secret";

app.use(
  cors({
    origin: ["http://localhost:5173", "http://127.0.0.1:5173"],
    credentials: true,
    methods: ["GET", "POST", "OPTIONS"],
    allowedHeaders: ["Content-Type"],
  }),
);

app.use(express.json());
app.use(cookieParser());

console.log("MongoDB connection string:", process.env.MONGO_URL);

mongoose
  .connect(process.env.MONGO_URL)
  .then(() => {
    console.log("MongoDB connected successfully");
  })
  .catch((err) => {
    console.error("MongoDB connection error:", err);
  });

app.get("/test", (req, res) => {
  res.json({ message: "test Ok!" });
});

app.post("/register", async (req, res) => {
  try {
    console.log("BODY:", req.body);

    const { name, email, password } = req.body || {};
    console.log("Register request received:", { name, email });

    if (!name || !email || !password) {
      return res.status(400).json({
        error: "Name, email, and password are required.",
      });
    }

    const existingUser = await UserModel.findOne({ email });
    if (existingUser) {
      return res.status(409).json({ error: "User already exists." });
    }

    const hashedPassword = bcrypt.hashSync(password, 10);

    const newUser = await UserModel.create({
      name,
      email,
      password: hashedPassword,
    });

    const token = jwt.sign(
      { id: newUser._id, email: newUser.email },
      jwtSecret,
      { expiresIn: "7d" },
    );

    res.cookie("token", token, {
      httpOnly: true,
      sameSite: "lax",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    return res.status(201).json({
      message: "Registration successful",
      user: {
        id: newUser._id,
        name: newUser.name,
        email: newUser.email,
      },
    });
  } catch (error) {
    console.error("Register error:", error);
    return res.status(500).json({ error: "Internal server error." });
  }
});

app.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body || {};
    console.log("Login request received:", { email });

    if (!email || !password) {
      return res
        .status(400)
        .json({ error: "Email and password are required." });
    }

    const user = await UserModel.findOne({ email });
    if (!user) {
      return res.status(401).json({ error: "Invalid email or password" });
    }

    const passwordMatches = bcrypt.compareSync(password, user.password);
    if (!passwordMatches) {
      return res.status(401).json({ error: "Invalid email or password" });
    }

    const token = jwt.sign({ id: user._id, email: user.email }, jwtSecret, {
      expiresIn: "7d",
    });

    res.cookie("token", token, {
      httpOnly: true,
      sameSite: "lax",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    return res.status(200).json({
      message: "Login successful",
      user: { id: user._id, name: user.name, email: user.email },
    });
  } catch (error) {
    console.error("Login error:", error);
    return res.status(500).json({ error: "Internal server error." });
  }
});

function authMiddleware(req, res, next) {
  const token = req.cookies?.token;
  if (!token) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  try {
    const decoded = jwt.verify(token, jwtSecret);
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(401).json({ error: "Unauthorized" });
  }
}

app.get("/profile", authMiddleware, (req, res) => {
  res.json({ user: req.user });
});

app.post("/logout", (req, res) => {
  res.cookie("token", "", {
    httpOnly: true,
    sameSite: "lax",
    expires: new Date(0),
  });

  return res.json(true);
});

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
