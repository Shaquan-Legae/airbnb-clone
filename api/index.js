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
const Reservation = require("./models/reservations");

const app = express();
const port = process.env.PORT || 4000;
const jwtSecret = process.env.JWT_SECRET || "dev-secret";

const uploadsDir = path.join(__dirname, "uploads");
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
  console.log("Created uploads directory at:", uploadsDir);
}

const allowedRoles = ["guest", "host"];

function normalizeRole(role) {
  return allowedRoles.includes(role) ? role : "guest";
}

const corsOptions = {
  origin: [
    "http://localhost:5173",
    "http://127.0.0.1:5173",
    "https://airbnb-clone-frontend-t3ml.onrender.com",
  ],
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
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

async function authMiddleware(req, res, next) {
  const token = req.cookies?.token;
  if (!token) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  try {
    const decoded = jwt.verify(token, jwtSecret);
    const user = await UserModel.findById(decoded.id).select("role");

    if (!user) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    req.user = {
      ...decoded,
      role: normalizeRole(user.role),
    };
    next();
  } catch (error) {
    return res.status(401).json({ error: "Unauthorized" });
  }
}

function requireHost(req, res, next) {
  if (req.user?.role !== "host") {
    return res.status(403).json({ error: "Host access required." });
  }

  next();
}

function getUserResponse(user) {
  const userRole = normalizeRole(user.role);

  return {
    id: user._id,
    name: user.name,
    firstName: user.firstName,
    lastName: user.lastName,
    email: user.email,
    phone: user.phone,
    country: user.country,
    city: user.city,
    bio: user.bio,
    profilePhoto: user.profilePhoto,
    role: userRole,
    hostProfile: user.hostProfile,
  };
}

function getHostProfileFields(body) {
  const {
    fullName,
    phone,
    country,
    city,
    governmentId,
    bio,
    experience,
    emergencyContact,
  } = body || {};

  return {
    fullName: String(fullName || "").trim(),
    phone: String(phone || "").trim(),
    country: String(country || "").trim(),
    city: String(city || "").trim(),
    governmentId: String(governmentId || "").trim(),
    bio: String(bio || "").trim(),
    experience:
      experience === undefined || experience === null || experience === ""
        ? undefined
        : Number(experience),
    emergencyContact: String(emergencyContact || "").trim(),
  };
}

function validateHostProfile(profile, acceptTerms) {
  const errors = {};
  const phonePattern = /^[+\d][\d\s().-]{6,}$/;

  if (!profile.fullName) errors.fullName = "Full name is required.";
  if (!profile.phone) {
    errors.phone = "Phone number is required.";
  } else if (!phonePattern.test(profile.phone)) {
    errors.phone = "Enter a valid phone number.";
  }
  if (!profile.country) errors.country = "Country is required.";
  if (!profile.city) errors.city = "City is required.";
  if (!profile.governmentId) {
    errors.governmentId = "Government ID number is required.";
  }
  if (!profile.bio) {
    errors.bio = "Short host bio is required.";
  } else if (profile.bio.length < 40) {
    errors.bio = "Bio must be at least 40 characters.";
  }
  if (profile.experience === undefined || Number.isNaN(profile.experience)) {
    errors.experience = "Years hosting experience is required.";
  } else if (profile.experience < 0) {
    errors.experience = "Experience cannot be negative.";
  }
  if (!profile.emergencyContact) {
    errors.emergencyContact = "Emergency contact is required.";
  }
  if (acceptTerms !== true) {
    errors.acceptTerms = "You must accept the host terms.";
  }

  return errors;
}

function startOfToday() {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return today;
}

function toDateOnly(value) {
  if (!value) return null;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return null;
  date.setHours(0, 0, 0, 0);
  return date;
}

function calculateNights(checkIn, checkOut) {
  return Math.round((checkOut - checkIn) / (1000 * 60 * 60 * 24));
}

function calculateReservationPricing(place, checkIn, checkOut) {
  const nightlyPrice = Number(place.price || 0);
  const nights = calculateNights(checkIn, checkOut);
  const subtotal = Math.round(nightlyPrice * nights);
  const weeklyDiscount = nights >= 7 ? Math.round(subtotal * 0.1) : 0;
  const cleaningFee = Math.round(nightlyPrice * 0.15);
  const taxableBase = subtotal - weeklyDiscount + cleaningFee;
  const serviceFee = Math.round(taxableBase * 0.14);
  const taxes = Math.round((taxableBase + serviceFee) * 0.08);

  return {
    nightlyPrice,
    nights,
    subtotal,
    weeklyDiscount,
    cleaningFee,
    serviceFee,
    taxes,
    total: taxableBase + serviceFee + taxes,
  };
}

function getReservationFields(body) {
  const checkIn = toDateOnly(body?.checkIn);
  const checkOut = toDateOnly(body?.checkOut);
  const guests = Number(body?.guests || 0);

  return { checkIn, checkOut, guests };
}

function validateReservationFields({ checkIn, checkOut, guests }, place) {
  const errors = {};

  if (!checkIn) errors.checkIn = "Check-in date is required.";
  if (!checkOut) errors.checkOut = "Check-out date is required.";
  if (checkIn && checkIn < startOfToday()) {
    errors.checkIn = "Check-in cannot be in the past.";
  }
  if (checkIn && checkOut && checkOut <= checkIn) {
    errors.checkOut = "Check-out must be after check-in.";
  }
  if (!guests || Number.isNaN(guests) || guests < 1) {
    errors.guests = "Guest count is required.";
  } else if (place?.maxGuests && guests > Number(place.maxGuests)) {
    errors.guests = `This place allows up to ${place.maxGuests} guests.`;
  }

  return errors;
}

async function hasOverlappingReservation(placeId, checkIn, checkOut, excludeId) {
  const query = {
    place: placeId,
    status: { $nin: ["cancelled", "rejected"] },
    checkIn: { $lt: checkOut },
    checkOut: { $gt: checkIn },
  };

  if (excludeId) {
    query._id = { $ne: excludeId };
  }

  return Boolean(await Reservation.exists(query));
}

function populateReservation(query) {
  return query
    .populate("place")
    .populate("guest", "name firstName lastName email profilePhoto")
    .populate("host", "name firstName lastName email profilePhoto hostProfile");
}

function getProfileFields(body) {
  const firstName = String(body?.firstName || "").trim();
  const lastName = String(body?.lastName || "").trim();

  return {
    firstName,
    lastName,
    name: `${firstName} ${lastName}`.trim(),
    email: String(body?.email || "").trim().toLowerCase(),
    phone: String(body?.phone || "").trim(),
    country: String(body?.country || "").trim(),
    city: String(body?.city || "").trim(),
    bio: String(body?.bio || "").trim(),
    profilePhoto: String(body?.profilePhoto || "").trim(),
  };
}

function validateProfile(profile) {
  const errors = {};
  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const phonePattern = /^[+\d][\d\s().-]{6,}$/;

  if (!profile.firstName) errors.firstName = "First name is required.";
  if (!profile.lastName) errors.lastName = "Last name is required.";
  if (!profile.email) {
    errors.email = "Email is required.";
  } else if (!emailPattern.test(profile.email)) {
    errors.email = "Enter a valid email address.";
  }
  if (profile.phone && !phonePattern.test(profile.phone)) {
    errors.phone = "Enter a valid phone number.";
  }

  return errors;
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
    const nameParts = String(name).trim().split(/\s+/);

    const newUser = await UserModel.create({
      name,
      firstName: nameParts[0] || "",
      lastName: nameParts.slice(1).join(" "),
      email,
      password: hashedPassword,
      role: "guest",
    });

    const token = jwt.sign(
      {
        id: newUser._id,
        email: newUser.email,
        role: "guest",
      },
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
        ...getUserResponse(newUser),
      },
    });
  } catch (error) {
    console.error("Register error:", error);
    return res.status(500).json({ error: "Internal server error." });
  }
});

console.log("About to register GET /places");

app.get("/listings", async (req, res) => {
  try {
    const { location, guests } = req.query;
    const filters = {};

    if (location) {
      const locationRegex = new RegExp(String(location).trim(), "i");
      filters.$or = [
        { address: locationRegex },
        { title: locationRegex },
        { description: locationRegex },
      ];
    }

    if (guests && !Number.isNaN(Number(guests))) {
      filters.maxGuests = { $gte: Number(guests) };
    }

    const places = await Place.find(filters)
      .populate("owner", "name firstName lastName email profilePhoto hostProfile")
      .sort({ createdAt: -1, _id: -1 });

    return res.json(places);
  } catch (error) {
    console.error("Fetch public listings error:", error);
    return res.status(500).json({ error: "Failed to fetch listings." });
  }
});

app.get("/listings/:id", async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ error: "Invalid listing id." });
    }

    const placeDoc = await Place.findById(req.params.id).populate(
      "owner",
      "name firstName lastName email profilePhoto hostProfile",
    );

    if (!placeDoc) {
      return res.status(404).json({ error: "Listing not found." });
    }

    return res.json(placeDoc);
  } catch (error) {
    console.error("Fetch public listing error:", error);
    return res.status(500).json({ error: "Failed to fetch listing." });
  }
});

app.get("/reservations/unavailable/:placeId", async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.placeId)) {
      return res.status(400).json({ error: "Invalid listing id." });
    }

    const reservations = await Reservation.find({
      place: req.params.placeId,
      status: { $nin: ["cancelled", "rejected"] },
    }).select("checkIn checkOut status");

    return res.json(reservations);
  } catch (error) {
    console.error("Fetch unavailable dates error:", error);
    return res.status(500).json({ error: "Failed to fetch availability." });
  }
});

app.post("/reservations", authMiddleware, async (req, res) => {
  try {
    const { placeId } = req.body || {};

    if (!mongoose.Types.ObjectId.isValid(placeId)) {
      return res.status(400).json({ error: "Invalid listing id." });
    }

    const place = await Place.findById(placeId);

    if (!place) {
      return res.status(404).json({ error: "Listing not found." });
    }

    if (String(place.owner) === String(req.user.id)) {
      return res.status(400).json({ error: "You cannot reserve your own place." });
    }

    const reservationFields = getReservationFields(req.body);
    const errors = validateReservationFields(reservationFields, place);

    if (Object.keys(errors).length > 0) {
      return res.status(400).json({
        error: "Please correct the highlighted fields.",
        errors,
      });
    }

    const isUnavailable = await hasOverlappingReservation(
      place._id,
      reservationFields.checkIn,
      reservationFields.checkOut,
    );

    if (isUnavailable) {
      return res.status(409).json({
        error: "Those dates are no longer available.",
        errors: {
          checkIn: "Choose dates that do not overlap an existing booking.",
        },
      });
    }

    const reservation = await Reservation.create({
      place: place._id,
      guest: req.user.id,
      host: place.owner,
      ...reservationFields,
      pricing: calculateReservationPricing(place, reservationFields.checkIn, reservationFields.checkOut),
    });

    const populatedReservation = await populateReservation(
      Reservation.findById(reservation._id),
    );

    return res.status(201).json(populatedReservation);
  } catch (error) {
    console.error("Create reservation error:", error);
    return res.status(500).json({ error: "Failed to create reservation." });
  }
});

app.get("/reservations/my", authMiddleware, async (req, res) => {
  try {
    const reservations = await populateReservation(
      Reservation.find({ guest: req.user.id }).sort({ checkIn: 1, createdAt: -1 }),
    );

    return res.json(reservations);
  } catch (error) {
    console.error("Fetch guest reservations error:", error);
    return res.status(500).json({ error: "Failed to fetch reservations." });
  }
});

app.get("/reservations/host", authMiddleware, requireHost, async (req, res) => {
  try {
    const reservations = await populateReservation(
      Reservation.find({ host: req.user.id }).sort({ checkIn: 1, createdAt: -1 }),
    );

    return res.json(reservations);
  } catch (error) {
    console.error("Fetch host reservations error:", error);
    return res.status(500).json({ error: "Failed to fetch property bookings." });
  }
});

app.put("/reservations/:id", authMiddleware, async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ error: "Invalid reservation id." });
    }

    const reservation = await Reservation.findById(req.params.id).populate("place");

    if (!reservation) {
      return res.status(404).json({ error: "Reservation not found." });
    }

    if (String(reservation.guest) !== String(req.user.id)) {
      return res.status(403).json({ error: "You can only edit your own reservation." });
    }

    if (["cancelled", "completed", "rejected"].includes(reservation.status)) {
      return res.status(400).json({ error: "This reservation can no longer be edited." });
    }

    const reservationFields = getReservationFields(req.body);
    const errors = validateReservationFields(reservationFields, reservation.place);

    if (Object.keys(errors).length > 0) {
      return res.status(400).json({
        error: "Please correct the highlighted fields.",
        errors,
      });
    }

    const isUnavailable = await hasOverlappingReservation(
      reservation.place._id,
      reservationFields.checkIn,
      reservationFields.checkOut,
      reservation._id,
    );

    if (isUnavailable) {
      return res.status(409).json({
        error: "Those dates are no longer available.",
        errors: {
          checkIn: "Choose dates that do not overlap an existing booking.",
        },
      });
    }

    reservation.checkIn = reservationFields.checkIn;
    reservation.checkOut = reservationFields.checkOut;
    reservation.guests = reservationFields.guests;
    reservation.pricing = calculateReservationPricing(
      reservation.place,
      reservationFields.checkIn,
      reservationFields.checkOut,
    );

    await reservation.save();

    const populatedReservation = await populateReservation(
      Reservation.findById(reservation._id),
    );

    return res.json(populatedReservation);
  } catch (error) {
    console.error("Update reservation error:", error);
    return res.status(500).json({ error: "Failed to update reservation." });
  }
});

app.patch("/reservations/:id/status", authMiddleware, async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ error: "Invalid reservation id." });
    }

    const { action } = req.body || {};
    const reservation = await Reservation.findById(req.params.id);

    if (!reservation) {
      return res.status(404).json({ error: "Reservation not found." });
    }

    const isHostOwner = String(reservation.host) === String(req.user.id);
    const isGuestOwner = String(reservation.guest) === String(req.user.id);

    if (!isHostOwner && !isGuestOwner) {
      return res.status(403).json({ error: "You cannot manage this reservation." });
    }

    const hostActions = {
      confirm: "confirmed",
      reject: "rejected",
      cancel: "cancelled",
      complete: "completed",
    };

    if (isHostOwner && hostActions[action]) {
      reservation.status = hostActions[action];
    } else if (isGuestOwner && action === "cancel") {
      if (reservation.status === "completed") {
        return res.status(400).json({ error: "Completed reservations cannot be cancelled." });
      }

      reservation.status = "cancelled";
    } else {
      return res.status(400).json({ error: "Invalid reservation action." });
    }

    await reservation.save();

    const populatedReservation = await populateReservation(
      Reservation.findById(reservation._id),
    );

    return res.json(populatedReservation);
  } catch (error) {
    console.error("Reservation status update error:", error);
    return res.status(500).json({ error: "Failed to update reservation status." });
  }
});

app.delete("/reservations/:id", authMiddleware, async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ error: "Invalid reservation id." });
    }

    const reservation = await Reservation.findById(req.params.id);

    if (!reservation) {
      return res.status(404).json({ error: "Reservation not found." });
    }

    if (String(reservation.guest) !== String(req.user.id)) {
      return res.status(403).json({ error: "You can only delete your own reservation." });
    }

    if (reservation.status === "completed") {
      return res.status(400).json({ error: "Completed reservations cannot be deleted." });
    }

    await Reservation.findByIdAndDelete(reservation._id);

    return res.json({ success: true });
  } catch (error) {
    console.error("Delete reservation error:", error);
    return res.status(500).json({ error: "Failed to delete reservation." });
  }
});

app.post("/places", authMiddleware, requireHost, async (req, res) => {
  try {
    const placeDoc = await Place.create({
      owner: req.user.id,
      ...getPlaceFields(req.body),
    });

    return res.status(201).json(placeDoc);
  } catch (error) {
    console.error("Create place error:", error);
    return res.status(500).json({ error: "Failed to create place." });
  }
});

app.get("/places", authMiddleware, requireHost, async (req, res) => {
  console.log("===== GET /places =====");

  try {
    const places = await Place.find({ owner: req.user.id });

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

app.get("/user-places", authMiddleware, requireHost, async (req, res) => {
  try {
    const places = await Place.find({ owner: req.user.id });
    return res.json(places);
  } catch (error) {
    console.error("Fetch user places error:", error);
    return res.status(500).json({ error: "Failed to fetch places." });
  }
});

app.get("/places/:id", authMiddleware, requireHost, async (req, res) => {
  try {
    const placeDoc = await Place.findOne({
      _id: req.params.id,
      owner: req.user.id,
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

app.put("/places/:id", authMiddleware, requireHost, async (req, res) => {
  try {
    const placeDoc = await Place.findOneAndUpdate(
      {
        _id: req.params.id,
        owner: req.user.id,
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

app.delete("/places/:id", authMiddleware, requireHost, async (req, res) => {
  try {
    const deletedPlace = await Place.findOneAndDelete({
      _id: req.params.id,
      owner: req.user.id,
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

    const userRole = normalizeRole(user.role);
    const token = jwt.sign(
      { id: user._id, email: user.email, role: userRole },
      jwtSecret,
      {
        expiresIn: "7d",
      },
    );

    res.cookie("token", token, {
      httpOnly: true,
      sameSite: "lax",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    return res.status(200).json({
      message: "Login successful",
      user: getUserResponse(user),
    });
  } catch (error) {
    console.error("Login error:", error);
    return res.status(500).json({ error: "Internal server error." });
  }
});

app.get("/profile", authMiddleware, async (req, res) => {
  try {
    const user = await UserModel.findById(req.user.id).select("-password");

    if (!user) {
      return res.status(404).json({ error: "User not found." });
    }

    return res.json({
      user: getUserResponse(user),
    });
  } catch (error) {
    console.error("Profile fetch error:", error);
    return res.status(500).json({ error: "Internal server error." });
  }
});

app.put("/profile", authMiddleware, async (req, res) => {
  try {
    const profile = getProfileFields(req.body);
    const errors = validateProfile(profile);

    if (Object.keys(errors).length > 0) {
      return res.status(400).json({
        error: "Please correct the highlighted fields.",
        errors,
      });
    }

    const existingUser = await UserModel.findOne({
      email: profile.email,
      _id: { $ne: req.user.id },
    });

    if (existingUser) {
      return res.status(409).json({
        error: "Email is already in use.",
        errors: {
          email: "Email is already in use.",
        },
      });
    }

    const updatedUser = await UserModel.findByIdAndUpdate(
      req.user.id,
      profile,
      { new: true, runValidators: true },
    ).select("-password");

    if (!updatedUser) {
      return res.status(404).json({ error: "User not found." });
    }

    const token = jwt.sign(
      {
        id: updatedUser._id,
        email: updatedUser.email,
        role: normalizeRole(updatedUser.role),
      },
      jwtSecret,
      { expiresIn: "7d" },
    );

    res.cookie("token", token, {
      httpOnly: true,
      sameSite: "lax",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    return res.json({
      message: "Profile updated successfully.",
      user: getUserResponse(updatedUser),
    });
  } catch (error) {
    console.error("Profile update error:", error);
    return res.status(500).json({ error: "Failed to update profile." });
  }
});

app.post("/become-host", authMiddleware, async (req, res) => {
  try {
    if (req.user.role === "host") {
      return res.status(409).json({ error: "User is already a host." });
    }

    const hostProfile = getHostProfileFields(req.body);
    const errors = validateHostProfile(hostProfile, req.body?.acceptTerms);

    if (Object.keys(errors).length > 0) {
      return res.status(400).json({
        error: "Please correct the highlighted fields.",
        errors,
      });
    }

    const updatedUser = await UserModel.findByIdAndUpdate(
      req.user.id,
      {
        role: "host",
        hostProfile: {
          ...hostProfile,
          becameHostAt: new Date(),
        },
      },
      { new: true, runValidators: true },
    ).select("-password");

    if (!updatedUser) {
      return res.status(404).json({ error: "User not found." });
    }

    const token = jwt.sign(
      {
        id: updatedUser._id,
        email: updatedUser.email,
        role: "host",
      },
      jwtSecret,
      { expiresIn: "7d" },
    );

    res.cookie("token", token, {
      httpOnly: true,
      sameSite: "lax",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    return res.json({
      message: "Welcome! Your account is now a Host account.",
      user: getUserResponse(updatedUser),
    });
  } catch (error) {
    console.error("Become host error:", error);
    return res.status(500).json({ error: "Failed to become a host." });
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
