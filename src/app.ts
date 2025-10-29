import express from "express";
import helmet from "helmet";
import cors from "cors";
import authRoutes from "./routes/authRoute";
import employeeRoutes from "./routes/empoyeesRoutes";
import managerRoutes from "./routes/managersRoutes";
import { errorHandler } from "../src/middlewere/errorHandler";
const app = express();
app.use(helmet());
app.use(cors());
app.use(express.json());

app.get("/health", (req, res) => res.json({ ok: true }));
app.use("/auth", authRoutes);
app.use("/employees", employeeRoutes);
app.use("/managers", managerRoutes);

app.use((_req, res) =>
  res.status(404).json({ error: { message: "Not found" } })
);
app.use(errorHandler);
export default app;
