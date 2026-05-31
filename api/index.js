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

const allowedOrigins = process.env.FRONTEND_URL
    ? process.env.FRONTEND_URL.split(",").map((o) => o.trim()).filter(Boolean)
    : []

const isApiPath = (p) =>
    p.startsWith("/api") ||
    p.startsWith("/auth") ||
    p.startsWith("/user") ||
    p.startsWith("/interview") ||
    p.startsWith("/payment")

app.use(
    cors({
        origin: (origin, callback) => {
            if (!origin) return callback(null, true)
            const isLocalhost =
                origin.startsWith("http://localhost:") ||
                origin.startsWith("http://127.0.0.1:")
            let hostname = ""
            try {
                hostname = new URL(origin).hostname
            } catch {
                hostname = ""
            }
            const isVercel = hostname.endsWith(".vercel.app")
            const isAllowedHost = allowedOrigins.some((url) => {
                try {
                    return new URL(url).hostname === hostname
                } catch {
                    return url === origin
                }
            })
            if (isLocalhost || isVercel || isAllowedHost || allowedOrigins.includes(origin)) {
                callback(null, true)
            } else {
                callback(new Error("Not allowed by CORS"))
            }
        },
        credentials: true,
    })
)

app.use(express.json())
app.use(cookieParser())

app.use(async (req, res, next) => {
    if (!isApiPath(req.path) || req.path.includes("health")) {
        return next()
    }

    const db = await connectDb()
    if (!db) {
        return res.status(503).json({
            message: "Database is not connected. Set DATABASE_URL in Vercel (Neon PostgreSQL).",
        })
    }
    next()
})

const mountApi = (segment, router) => {
    app.use(`/api${segment}`, router)
    app.use(segment, router)
}

mountApi("/auth", authRouter)
mountApi("/user", userRouter)
mountApi("/interview", interviewRouter)
mountApi("/payment", paymentRouter)

const healthHandler = async (_req, res) => {
    const db = await connectDb()
    res.status(db ? 200 : 503).json({
        ok: !!db,
        db: !!db,
        hasJwt: !!process.env.JWT_SECRET,
        hasDb: !!process.env.DATABASE_URL,
    })
}

app.get("/api/health", healthHandler)
app.get("/health", healthHandler)

app.use((err, _req, res, next) => {
    if (err?.message === "Not allowed by CORS") {
        return res.status(403).json({ message: err.message })
    }
    console.error("Unhandled error:", err)
    if (!res.headersSent) {
        res.status(500).json({ message: err?.message || "Internal server error" })
    }
    next(err)
})

connectDb()

const PORT = process.env.PORT || 5000

if (!process.env.VERCEL) {
    app.listen(PORT, () => {
        console.log(`Server running on port ${PORT}`)
    })
}

export default app
