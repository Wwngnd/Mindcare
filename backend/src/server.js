import express from "express";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import cors from "cors";
import db from "./config/Database.js";
import router from "./routes/index.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 9000;
const HOST = process.env.HOST || "localhost";

app.use(cors({ credentials: true, origin: process.env.ALLOWED_ORIGINS }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

try {
    await db.authenticate();
    console.log("Database connected");
} catch (error) {
    console.error("Unable to connect to the database:", error);
}

app.use("/api", router);

app.listen(PORT, () => {
    console.log(`Server is running on http://${HOST}:${PORT}`);
});