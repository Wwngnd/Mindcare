import express from "express";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import cors from "cors";
import db from "./config/Database.js";
import router from "./routes/index.js";
import response from "./utils/response.js";
import errorHandler from "./exceptions/errorHandler.js";
import swaggerUi from "swagger-ui-express";
import swaggerSpec from "./config/swagger.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 9000;
const HOST = process.env.HOST || "localhost";

const parseAllowedOrigins = () => {
    const configuredOrigins = process.env.ALLOWED_ORIGINS || process.env.FRONTEND_URL || "";
    const vercelOrigin = process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "";

    return [
        configuredOrigins,
        vercelOrigin,
        "https://mindcare-amber.vercel.app",
    ].join(",")
        .split(",")
        .map((origin) => origin.trim().replace(/\/+$/, ""))
        .filter(Boolean);
};

async function init() {
    const allowedOrigins = parseAllowedOrigins();
    const allowedOriginPatterns = [
        /^https:\/\/.*\.netlify\.app$/,
        /^https:\/\/capstone-project-mindcare[\w-]*\.vercel\.app$/,
        /^http:\/\/localhost:\d+$/,
        /^http:\/\/127\.0\.0\.1:\d+$/,
    ];

    app.use(cors({
        credentials: true,
        origin: function (origin, callback) {
            const normalizedOrigin = origin?.replace(/\/+$/, "");
            const isAllowedOrigin = !normalizedOrigin ||
                allowedOrigins.includes(normalizedOrigin) ||
                allowedOriginPatterns.some((pattern) => pattern.test(normalizedOrigin));

            if (isAllowedOrigin) {
                callback(null, true);
            } else {
                const corsError = new Error("Origin tidak diizinkan oleh CORS.");
                corsError.statusCode = 403;
                callback(corsError);
            }
        }
    }));
    app.use(express.json());
    app.use(express.urlencoded({ extended: true }));
    app.use(cookieParser());
    app.use("/uploads", express.static("uploads"));

    try {
        await db.authenticate();
        console.log("Database connected ");
        app.get("/", (req, res) => {
            res.status(200).json({
                message: "Server is running",
                data: null,
            });
        });
        app.get("/", (req, res) => {
            response.success(res, 200, "Server siap.");
        })
        app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));
        app.use("/api", router);
        app.use(errorHandler);

        app.listen(PORT, () => {
            console.log(`Server is running on http://${HOST}:${PORT}`);
        });
    } catch (error) {
        console.error(error);
    }
}
init();
