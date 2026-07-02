const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const fs = require("fs");
const path = require("path");
const UserModel = require("./models/Users");
require("dotenv").config();
const imageDownloader = require("image-downloader");
const multer = require("multer");
const Place = require("./models/places");

const app = express();
const port = 4000;
const jwtSecret = process.env.JWT_SECRET || "dev-secret";

const uploadsDir = path.join(__dirname, "uploads");
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
  console.log("Created uploads directory at:", uploadsDir);
}

const corsOptions = {
  origin: ["http://localhost:5173", "http://127.0.0.1:5173"],
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
};

app.use(cors(corsOptions));
app.options(/.*/, cors(corsOptions));

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
  console.log("TEST ROUTE HIT");

  res.json({
    message: "THIS IS THE NEW TEST",
    file: __filename,
    cwd: process.cwd(),
    time: new Date().toISOString(),
  });
});

app.post("/upload-by-link", async (req, res) => {
  try {
    const { link } = req.body;

    if (!link) {
      return res.status(400).json({ error: "Link parameter is required" });
    }

    const newName = Date.now() + ".jpg";
    const uploadPath = path.join(uploadsDir, newName);

    console.log("Starting image download from:", link);
    console.log("Destination:", uploadPath);

    await imageDownloader.image({
      url: link,
      dest: uploadPath,
    });

    console.log("Image downloaded successfully:", uploadPath);
    res.json(newName);
  } catch (error) {
    console.error("Image download error:", error);
    res.status(500).json({
      error: "Failed to download image",
      details: error.message,
    });
  }
});

app.use("/uploads", express.static(path.join(__dirname, "uploads")));
const photosMiddleware = multer({ dest: uploadsDir });

app.post("/upload", photosMiddleware.array("photos", 100), (req, res) => {
  const uploadedFiles = [];

  for (let i = 0; i < req.files.length; i++) {
    const { path: tempPath, originalname } = req.files[i];

    const ext = originalname.split(".").pop();
    const newPath = tempPath + "." + ext;

    fs.renameSync(tempPath, newPath);

    uploadedFiles.push(path.basename(newPath));
  }

  res.json(uploadedFiles);
});

function getDecodedToken(req) {
  const token = req.cookies?.token;

  if (!token) {
    return null;
  }

  return jwt.verify(token, jwtSecret);
}

function getPlaceFields(body) {
  const {
    title,
    address,
    photos,
    description,
    perks,
    extraInfo,
    checkIn,
    checkOut,
    maxGuests,
    price,
  } = body;

  return {
    title,
    address,
    photos: Array.isArray(photos) ? photos : [],
    description,
    perks: Array.isArray(perks) ? perks : [],
    extraInfo: extraInfo || "",
    checkIn: checkIn || "",
    checkOut: checkOut || "",
    maxGuests: maxGuests === undefined ? 0 : Number(maxGuests),
    price:
      price === undefined || price === null || price === ""
        ? undefined
        : Number(price),
  };
}

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

console.log("About to register GET /places");

app.post("/places", async (req, res) => {
  let decoded;

  try {
    decoded = getDecodedToken(req);
  } catch (error) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  if (!decoded) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  try {
    const placeDoc = await Place.create({
      owner: decoded.id,
      ...getPlaceFields(req.body),
    });

    return res.status(201).json(placeDoc);
  } catch (error) {
    console.error("Create place error:", error);
    return res.status(500).json({ error: "Failed to create place." });
  }
});

app.get("/places", async (req, res) => {
  console.log("===== GET /places =====");

  try {
    console.log("Cookies:", req.cookies);

    const token = req.cookies?.token;

    if (!token) {
      console.log("No token");
      return res.status(401).json({ error: "Unauthorized" });
    }

    console.log("Token exists");

    const decoded = jwt.verify(token, jwtSecret);
    console.log("Decoded token:", decoded);

    const places = await Place.find({ owner: decoded.id });

    console.log("Places found:", places.length);

    return res.json(places);
  } catch (err) {
    console.error("GET /places ERROR:");
    console.error(err);

    return res.status(500).json({
      error: err.message,
      stack: err.stack,
    });
  }
});

app.get("/user-places", async (req, res) => {
  let decoded;

  try {
    decoded = getDecodedToken(req);
  } catch (error) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  if (!decoded) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  try {
    const places = await Place.find({ owner: decoded.id });
    return res.json(places);
  } catch (error) {
    console.error("Fetch user places error:", error);
    return res.status(500).json({ error: "Failed to fetch places." });
  }
});

app.get("/places/:id", async (req, res) => {
  let decoded;

  try {
    decoded = getDecodedToken(req);
  } catch (error) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  if (!decoded) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  try {
    const placeDoc = await Place.findOne({
      _id: req.params.id,
      owner: decoded.id,
    });

    if (!placeDoc) {
      return res.status(404).json({ error: "Place not found." });
    }

    return res.json(placeDoc);
  } catch (error) {
    console.error("Fetch place error:", error);
    return res.status(500).json({ error: "Failed to fetch place." });
  }
});

app.put("/places/:id", async (req, res) => {
  let decoded;

  try {
    decoded = getDecodedToken(req);
  } catch (error) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  if (!decoded) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  try {
    const placeDoc = await Place.findOneAndUpdate(
      {
        _id: req.params.id,
        owner: decoded.id,
      },
      getPlaceFields(req.body),
      {
        new: true,
        runValidators: true,
      },
    );

    if (!placeDoc) {
      return res.status(404).json({ error: "Place not found." });
    }

    return res.json(placeDoc);
  } catch (error) {
    console.error("Update place error:", error);
    return res.status(500).json({ error: "Failed to update place." });
  }
});

app.delete("/places/:id", async (req, res) => {
  let decoded;

  try {
    decoded = getDecodedToken(req);
  } catch (error) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  if (!decoded) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  try {
    const deletedPlace = await Place.findOneAndDelete({
      _id: req.params.id,
      owner: decoded.id,
    });

    if (!deletedPlace) {
      return res.status(404).json({
        error: "Place not found.",
      });
    }

    return res.json({
      success: true,
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      error: "Failed to delete place.",
    });
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

app.get("/profile", authMiddleware, async (req, res) => {
  try {
    const user = await UserModel.findById(req.user.id).select("-password");

    if (!user) {
      return res.status(404).json({ error: "User not found." });
    }

    return res.json({
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
      },
    });
  } catch (error) {
    console.error("Profile fetch error:", error);
    return res.status(500).json({ error: "Internal server error." });
  }
});

app.post("/logout", (req, res) => {
  res.cookie("token", "", {
    httpOnly: true,
    sameSite: "lax",
    expires: new Date(0),
  });

  return res.json(true);
});

// Global error handling middleware
app.use((err, req, res, next) => {
  console.error("Unhandled error:", err);
  res.status(500).json({ error: "Internal server error" });
});

console.log("Registered /places endpoint");
app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
