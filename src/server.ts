import dotenv from "dotenv";
dotenv.config();
import app from "./app";
import { connect } from "./db/mongo";
const PORT = process.env.PORT || 3000;

(async () => {
  await connect();

  app.listen(PORT, () => console.log(`Api listening on ${PORT}`));
})();
