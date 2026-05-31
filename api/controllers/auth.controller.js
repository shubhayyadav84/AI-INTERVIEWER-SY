import genToken from "../config/token.js"
import User from "../models/usermodel.js"
import bcrypt from "bcryptjs"

const cookieOptions = {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: process.env.VERCEL ? "lax" : process.env.NODE_ENV === "production" ? "none" : "lax",
    maxAge: 7 * 24 * 60 * 60 * 1000,
}

const userPayload = (user) => ({
    _id: user._id,
    name: user.name,
    email: user.email,
    credits: user.credits,
})

export const register = async (req, res) => {
    try {
        const { name, email, password } = req.body

        if (!name || !email || !password) {
            return res.status(400).json({ message: "All fields are required" })
        }

        if (password.length < 6) {
            return res.status(400).json({ message: "Password must be at least 6 characters" })
        }

        const existingUser = await User.findOne({ email }).select("+password")
        if (existingUser) {
            if (!existingUser.password) {
                const salt = await bcrypt.genSalt(10)
                existingUser.password = await bcrypt.hash(password, salt)
                existingUser.name = name
                await existingUser.save()

                const token = await genToken(existingUser._id)
                res.cookie("token", token, cookieOptions)
                return res.status(200).json(userPayload(existingUser))
            }

            return res.status(400).json({ message: "An account with this email already exists" })
        }

        const salt = await bcrypt.genSalt(10)
        const hashedPassword = await bcrypt.hash(password, salt)

        const user = await User.create({ name, email, password: hashedPassword })
        const token = await genToken(user._id)

        res.cookie("token", token, cookieOptions)
        return res.status(201).json(userPayload(user))
    } catch (error) {
        console.error("Register error:", error)
        return res.status(500).json({ message: `Registration error: ${error.message}` })
    }
}

export const login = async (req, res) => {
    try {
        const { email, password } = req.body

        if (!email || !password) {
            return res.status(400).json({ message: "Email and password are required" })
        }

        const user = await User.findOne({ email }).select("+password")
        if (!user || !user.password) {
            return res.status(400).json({ message: "Invalid email or password" })
        }

        const isMatch = await bcrypt.compare(password, user.password)
        if (!isMatch) {
            return res.status(400).json({ message: "Invalid email or password" })
        }

        const token = await genToken(user._id)
        res.cookie("token", token, cookieOptions)

        return res.status(200).json(userPayload(user))
    } catch (error) {
        console.error("Login error:", error)
        return res.status(500).json({ message: `Login error: ${error.message}` })
    }
}

export const logOut = async (req, res) => {
    try {
        res.clearCookie("token", {
            httpOnly: cookieOptions.httpOnly,
            secure: cookieOptions.secure,
            sameSite: cookieOptions.sameSite,
        })
        return res.status(200).json({ message: "Logged out successfully" })
    } catch (error) {
        return res.status(500).json({ message: `Logout error: ${error.message}` })
    }
}
