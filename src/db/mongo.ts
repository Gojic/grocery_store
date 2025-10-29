import mongoose from "mongoose";

export async function connect() {
  const uri = process.env.MONGO_URI!;
  await mongoose.connect(uri, { dbName: "grocery_store_db" });
  console.log("Mongo connected");
}
