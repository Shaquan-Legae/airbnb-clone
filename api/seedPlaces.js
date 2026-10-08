const mongoose = require("mongoose");
const path = require("path");
require("dotenv").config({ path: path.join(__dirname, ".env") });

const User = require("./models/Users");
const Place = require("./models/places");

const placesData = [
  {
    title: "Luxury Oceanfront Villa with Infinity Pool",
    name: "Camps Bay Sunset Villa",
    address: "14 Victoria Road, Camps Bay, Cape Town, 8005",
    photos: [
      "53d562c20d00fa1ffddbd26447612173.jpeg",
      "f779d24e7c77eac52bc7e4e285c0a773.jpeg",
      "7315195af03a9be9d00dd90d50e23ae0.jpeg",
      "2e887300abbe9a05de6842dd09f6eac5.jpeg",
      "9cb641c348e62a209c093091e6746aa8.jpeg",
    ],
    description:
      "Experience world-class Atlantic Ocean sunsets from this architectural masterpiece in Camps Bay. Boasting panoramic sea views, an infinity pool, expansive floor-to-ceiling glass windows, and designer finishes throughout. Just minutes from trendy restaurants and the white sands of Camps Bay beach.",
    perks: [
      "wifi",
      "pool",
      "free_parking",
      "air_conditioning",
      "kitchen",
      "tv",
      "hot_tub",
    ],
    extraInfo:
      "Daily housekeeping available on request. High-speed uncapped Wi-Fi suitable for remote work. Secure garage parking for 2 vehicles. Solar inverter ensures 24/7 uninterrupted power.",
    checkIn: "14:00",
    checkOut: "10:00",
    maxGuests: 6,
    beds: 3,
    price: 4200,
  },
  {
    title: "Modern Designer Penthouse with Panoramic Views",
    name: "Clifton Heights Penthouse",
    address: "88 Kloof Road, Clifton, Cape Town, 8005",
    photos: [
      "1783030296072.jpg",
      "1783030308161.jpg",
      "1783030316966.jpg",
      "1783030326627.jpg",
      "1783030334488.jpg",
    ],
    description:
      "Perched high above the world-famous Clifton beaches, this sleek penthouse offers contemporary minimalist luxury. Features open-plan living, private sun deck, state-of-the-art kitchen, and sweeping views of Lion's Head and the Atlantic coastline.",
    perks: [
      "wifi",
      "air_conditioning",
      "private_entrance",
      "kitchen",
      "tv",
      "free_parking",
      "gym",
    ],
    extraInfo:
      "Access via private elevator. Premium Nespresso machine and complimentary welcome wine. 24-hour concierge and biometric security access.",
    checkIn: "15:00",
    checkOut: "11:00",
    maxGuests: 4,
    beds: 2,
    price: 3600,
  },
  {
    title: "Serene Mountain View Vineyard Cottage",
    name: "Franschhoek Valley Haven",
    address: "24 Cabriere Street, Franschhoek, 7690",
    photos: [
      "1783029621705.jpg",
      "1783029642135.jpg",
      "1783029694917.jpg",
      "1783029710916.jpg",
    ],
    description:
      "Escape to the peaceful Cape Winelands in this charming private cottage nestled between lush olive groves and vineyards. Relax by the wood-burning fireplace, stroll to award-winning bistros, and savor local estate wines on the sunlit patio.",
    perks: [
      "wifi",
      "heating",
      "free_parking",
      "kitchen",
      "private_entrance",
      "pets",
    ],
    extraInfo:
      "Firewood and braai facilities provided. Within walking distance of the Franschhoek Wine Tram and world-renowned fine dining restaurants.",
    checkIn: "14:00",
    checkOut: "10:30",
    maxGuests: 2,
    beds: 1,
    price: 1850,
  },
  {
    title: "Chic Urban Loft in Historic De Waterkant",
    name: "De Waterkant Design Loft",
    address: "42 Loader Street, De Waterkant, Cape Town, 8001",
    photos: [
      "1783029846253.jpg",
      "1783029866302.jpg",
      "1783029875465.jpg",
      "1783029878975.jpg",
      "1783029904946.jpg",
      "1783029965230.jpg",
    ],
    description:
      "A vibrant, art-filled loft in the heart of fashionable De Waterkant. Surrounded by cobbled streets, boutique cafes, and art galleries. Features double-volume ceilings, mezzanine bedroom, modern work desk, and a private rooftop terrace.",
    perks: [
      "wifi",
      "air_conditioning",
      "kitchen",
      "tv",
      "private_entrance",
    ],
    extraInfo:
      "High-speed fiber internet (100 Mbps) with dedicated ergonomic workspace. Safe neighborhood with cafes and supermarkets within 200m.",
    checkIn: "14:00",
    checkOut: "11:00",
    maxGuests: 2,
    beds: 1,
    price: 1450,
  },
  {
    title: "Seaside Sunset Bungalow with Direct Coastal Access",
    name: "Bakoven Beachside Bungalow",
    address: "7 Beta Close, Bakoven, Cape Town, 8005",
    photos: [
      "1783013592149.jpg",
      "1783013659507.jpg",
      "1783013668761.jpg",
      "1783013677731.jpg",
      "1783016200997.jpg",
      "1783374071278.jpg",
      "1783374082356.jpg",
    ],
    description:
      "Idyllic beach bungalow tucked away in exclusive Bakoven. Step straight from your wooden deck onto the rocks to watch dolphins playing in the surf. Peaceful, private, and filled with natural coastal light.",
    perks: [
      "wifi",
      "kitchen",
      "free_parking",
      "private_entrance",
      "pets",
      "heating",
      "tv",
    ],
    extraInfo:
      "Quiet residential cul-de-sac. Weber braai on the ocean deck. Linen, beach towels, and umbrellas included.",
    checkIn: "14:00",
    checkOut: "10:00",
    maxGuests: 4,
    beds: 2,
    price: 2900,
  },
];

async function seed() {
  const mongoUrl = process.env.MONGO_URL || process.env.MONGODB_URI;
  if (!mongoUrl) {
    console.error("MONGO_URL not found in environment.");
    process.exit(1);
  }

  console.log("Connecting to MongoDB...");
  await mongoose.connect(mongoUrl);
  console.log("Connected successfully!");

  let hostUser = await User.findOne();
  if (!hostUser) {
    console.log("Creating default host user...");
    hostUser = await User.create({
      name: "Quan Legae",
      firstName: "Quan",
      lastName: "Legae",
      email: "host@example.com",
      role: "host",
      city: "Cape Town",
      country: "South Africa",
      bio: "Superhost passionate about hospitality and curated travel experiences across South Africa.",
      hostProfile: {
        fullName: "Quan Legae",
        phone: "+27 82 123 4567",
        country: "South Africa",
        city: "Cape Town",
        experience: 5,
        bio: "Dedicated superhost managing premium seaside and wine estate properties.",
        becameHostAt: new Date(),
      },
    });
  } else if (hostUser.role !== "host") {
    console.log(`Upgrading user ${hostUser.email} to host...`);
    hostUser.role = "host";
    if (!hostUser.hostProfile) {
      hostUser.hostProfile = {
        fullName: hostUser.name || "Quan Legae",
        phone: "+27 82 123 4567",
        country: "South Africa",
        city: "Cape Town",
        experience: 5,
        bio: "Dedicated superhost managing premium holiday homes.",
        becameHostAt: new Date(),
      };
    }
    await hostUser.save();
  }

  console.log(`Assigning listings to host: ${hostUser.name} (${hostUser._id})`);

  let added = 0;
  for (const place of placesData) {
    const existing = await Place.findOne({ title: place.title });
    if (!existing) {
      await Place.create({
        ...place,
        owner: hostUser._id,
      });
      console.log(`Created listing: "${place.title}" (${place.photos.length} photos)`);
      added++;
    } else {
      console.log(`Listing already exists: "${place.title}"`);
    }
  }

  const totalPlaces = await Place.countDocuments();
  console.log(`\nSeeding completed! Added ${added} new listings. Total in database: ${totalPlaces}`);
  process.exit(0);
}

seed().catch((err) => {
  console.error("Seeding error:", err);
  process.exit(1);
});
