import express, { Request, Response } from "express";
import routes from "./routes";
import dotenv from "dotenv";
import cors from "cors";
import path from "path";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

app.use(cors());

app.use("/api", routes);

const publicDir = path.join(process.cwd(), "public");

app.use("/public", express.static(publicDir));

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});