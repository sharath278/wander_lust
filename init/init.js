require("dotenv").config({ path: "../.env" }); // Load environment variables from the parent directory .env file if running from the init folder
const mongoose = require("mongoose");
const initData = require("./data.js");
const Listing = require("../models/listing.js");

// Fallback to local MongoDB if MONGO_URI is not provided in .env
const MONGO_URL = process.env.MONGO_URI || "mongodb://127.0.0.1:27017/wanderlust";

main()
  .then(() => {
    console.log("Starting database initialization...");
  })
  .catch((err) => {
    console.log(err);
  });

async function main() {
  // Connect to the DB
  await mongoose.connect(MONGO_URL);
  console.log(`Connected to DB: ${mongoose.connection.host}`);
}

const initDB = async () => {
  try {
    // 1. Delete Existing Listings
    await Listing.deleteMany({});
    console.log("All existing listings were deleted.");

    // (Optional step derived from your original data logic)
    // Here we ensure every listing object gets an "owner" property to satisfy the DB schema.
    const mappedData = initData.data.map((obj) => ({
      ...obj,
      owner: "68deada785a40cae72d62e89", // Feel free to update this owner ID as needed
    }));

    // 2. Insert The Sample Listings
    await Listing.insertMany(mappedData);
    console.log(`${mappedData.length} sample listings successfully inserted!`);

  } catch (err) {
    console.error("Failed to initialize database:", err);
  } finally {
    // 3. Close the DB Connection
    await mongoose.connection.close();
    console.log("Database connection closed cleanly.");
    process.exit(0);
  }
};

// Execute initialization
initDB();
