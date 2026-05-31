import mongoose from "mongoose"
import genToken from "../config/token.js"
import User from "../models/usermodel.js"
import bcrypt from "bcryptjs"
import connectDb from "../config/connectdb.js"

const cookieOptions = {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: process.env.VERCEL ? "lax" : process.env.NODE_ENV === "production" ? "none" : "lax",
    maxAge: 7 * 24 * 60 * 60 * 1000,
}

export const register = async (req, res) => {
    try {
        await connectDb()
        if (mongoose.connection.readyState !== 1) {
            return res.status(503).json({
                message: "Database is not connected. Check MONGODB_URL on the server.",
            })
        }

        const { name, email, password } = req.body

        if (!name || !email || !password) {
            return res.status(400).json({
                message: "All fields are required"
            })
        }

        if (password.length < 6) {
            return res.status(400).json({
                message: "Password must be at least 6 characters"
            })
        }

        const existingUser = await User.findOne({ email })
        if (existingUser) {
            // If old user from Google OAuth exists without a password, update them
            if (!existingUser.password) {
                const salt = await bcrypt.genSalt(10)
                const hashedPassword = await bcrypt.hash(password, salt)
                existingUser.password = hashedPassword
                existingUser.name = name
                await existingUser.save()

                const token = await genToken(existingUser._id)
                res.cookie("token", token, cookieOptions)

                return res.status(200).json({
                    _id: existingUser._id,
                    name: existingUser.name,
                    email: existingUser.email,
                    credits: existingUser.credits
                })
            }

            return res.status(400).json({
                message: "An account with this email already exists"
            })
        }

        const salt = await bcrypt.genSalt(10)
        const hashedPassword = await bcrypt.hash(password, salt)

        const user = await User.create({
            name,
            email,
            password: hashedPassword
        })

        const token = await genToken(user._id)

        res.cookie("token", token, cookieOptions)

        return res.status(201).json({
            _id: user._id,
            name: user.name,
            email: user.email,
            credits: user.credits
        })

    } catch (error) {
        return res.status(500).json({
            message: `Registration error: ${error.message}`
        })
    }
}

export const login = async (req, res) => {
    try {
        await connectDb()
        if (mongoose.connection.readyState !== 1) {
            return res.status(503).json({
                message: "Database is not connected. Check MONGODB_URL on the server.",
            })
        }

        const { email, password } = req.body

        if (!email || !password) {
            return res.status(400).json({
                message: "Email and password are required"
            })
        }

        const user = await User.findOne({ email })
        if (!user) {
            return res.status(400).json({
                message: "Invalid email or password"
            })
        }

        const isMatch = await bcrypt.compare(password, user.password)
        if (!isMatch) {
            return res.status(400).json({
                message: "Invalid email or password"
            })
        }

        const token = await genToken(user._id)

        res.cookie("token", token, cookieOptions)

        return res.status(200).json({
            _id: user._id,
            name: user.name,
            email: user.email,
            credits: user.credits
        })

    } catch (error) {
        return res.status(500).json({
            message: `Login error: ${error.message}`
        })
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
        return res.status(500).json({
            message: `Logout error ${error}`
        })
    }
}
