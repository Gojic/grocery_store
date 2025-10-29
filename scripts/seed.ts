import dotenv from "dotenv";
dotenv.config();
import { connect } from "../src/db/mongo";
import { seed } from "./seedData";

(async () => {
  try {
    await connect();
    console.error("Seed starting ...");
    await seed();
    console.error("Seed successful!");
    process.exit(0);
  } catch (e) {
    console.error("Seed failed:", e);
    process.exit(1);
  }
})();
