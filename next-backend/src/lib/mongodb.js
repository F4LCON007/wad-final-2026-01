import { MongoClient } from "mongodb";
import mongoose from "mongoose";

const options = {};
let globalClientPromise;

export function getClientPromise() {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    throw new Error("Please add your Mongo URI to .env");
  }
  if (process.env.NODE_ENV === "development") {
    if (!globalClientPromise) {
      const client = new MongoClient(uri, options);
      globalClientPromise = client.connect();
    }
    return globalClientPromise;
  } else {
    const client = new MongoClient(uri, options);
    return client.connect();
  }
}

const connectMongoDB = async () => {
  try {
    if (mongoose.connection.readyState === 1) {
      return;
    }
    // Set a 5-second timeout so requests don't stay pending forever
    await mongoose.connect(process.env.MONGODB_URI, {
      serverSelectionTimeoutMS: 5000,
    });
    console.log("Connected to MongoDB via Mongoose");
  } catch (error) {
    console.log("Error connecting to MongoDB: ", error);
  }
};

export default connectMongoDB;
