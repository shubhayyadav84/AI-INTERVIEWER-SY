import express from "express"
import dotenv from "dotenv"
import connectDb from "./config/connectdb.js"
import cookieParser from "cookie-parser"
import cors from "cors"
import authRouter from "./routes/auth.route.js"
import userRouter from "./routes/userroute.js"
import interviewRouter from "./routes/interviewroute.js"
import paymentRouter from "./routes/paymentroute.js"

import path from "path"
import { fileURLToPath } from "url"

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

dotenv.config({ path: path.join(__dirname, ".env") })

const app = express()

const allowedOrigins = process.env.FRONTEND_URL ? process.env.FRONTEND_URL.split(",") : []

app.use(cors({
    origin: (origin, callback) => {
        if (!origin) return callback(null, true);
        const isLocalhost = origin.startsWith("http://localhost:") || origin.startsWith("http://127.0.0.1:");
        let hostname = "";
        try {
            hostname = new URL(origin).hostname;
        } catch {
            hostname = "";
        }
        const isVercel = hostname.endsWith(".vercel.app");
        const isAllowedHost =
            allowedOrigins.some((url) => {
                try {
                    return new URL(url).hostname === hostname;
                } catch {
                    return url === origin;
                }
            });
        if (isLocalhost || isVercel || isAllowedHost || allowedOrigins.includes(origin)) {
            callback(null, true);
        } else {
            callback(new Error("Not allowed by CORS"));
        }
    },
    credentials: true
}))

app.use(express.json())
app.use(cookieParser())

// Vercel strips /api before the handler; local dev uses full /api paths
const mountApi = (path, router) => {
    app.use(`/api${path}`, router)
    app.use(path, router)
}

mountApi("/auth", authRouter)
mountApi("/user", userRouter)
mountApi("/interview", interviewRouter)
mountApi("/payment", paymentRouter)

app.get("/api/health", async (_req, res) => {
    const db = await connectDb()
    res.status(db ? 200 : 503).json({
        ok: !!db,
        db: !!db,
        hasJwt: !!process.env.JWT_SECRET,
        hasMongo: !!(process.env.MONGODB_URL || process.env.MONGODB_URI),
    })
})
app.get("/health", async (_req, res) => {
    const db = await connectDb()
    res.status(db ? 200 : 503).json({
        ok: !!db,
        db: !!db,
        hasJwt: !!process.env.JWT_SECRET,
        hasMongo: !!(process.env.MONGODB_URL || process.env.MONGODB_URI),
    })
})

app.use((err, _req, res, next) => {
    if (err?.message === "Not allowed by CORS") {
        return res.status(403).json({ message: err.message })
    }
    next(err)
})

connectDb()

const PORT = process.env.PORT || process.env.port || 8000

// Only run app.listen during local development, Vercel handles the serverless execution
if (!process.env.VERCEL) {
    app.listen(PORT, () => {
        console.log(`Server running locally on port ${PORT}`)
    })
}

export default app