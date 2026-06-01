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

async function init() {
    app.use(cors({
        credentials: true,
        origin: function (origin, callback) {
            const allowed = [
                /^https:\/\/capstone-project-mindcare[\w-]*\.vercel\.app$/,
                /^http:\/\/localhost:\d+$/,
            ];
            if (!origin || allowed.some(pattern => pattern.test(origin))) {
                callback(null, true);
            } else {
                callback(new Error('Not allowed by CORS'));
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
