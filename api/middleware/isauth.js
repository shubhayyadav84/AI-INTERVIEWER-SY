import jwt from "jsonwebtoken"

const isAuth = async (req, res, next) => {
    try {
        const token = req.cookies?.token

        if (!token) {
            return res.status(401).json({ message: "Not authenticated" })
        }

        if (!process.env.JWT_SECRET) {
            return res.status(503).json({ message: "JWT_SECRET is not configured on the server" })
        }

        const verifyToken = jwt.verify(token, process.env.JWT_SECRET)
        req.userId = verifyToken.userId
        next()
    } catch (error) {
        return res.status(401).json({ message: "Invalid or expired session" })
    }
}

export default isAuth
