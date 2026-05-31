import Razorpay from "razorpay"
import crypto from "crypto"
import * as User from "../db/userRepository.js"

const getRazorpayInstance = () => {
    return new Razorpay({
        key_id: process.env.RAZORPAY_KEY_ID,
        key_secret: process.env.RAZORPAY_KEY_SECRET,
    })
}

export const createOrder = async (req, res) => {
    try {
        const { planType } = req.body

        let amount = 0
        if (planType === "starter") {
            amount = 100 * 100
        } else if (planType === "pro") {
            amount = 500 * 100
        } else {
            return res.status(400).json({ message: "Invalid plan type specified" })
        }

        const razorpay = getRazorpayInstance()
        const order = await razorpay.orders.create({
            amount,
            currency: "INR",
            receipt: `receipt_order_${Date.now()}`,
        })
        res.status(200).json(order)
    } catch (error) {
        console.error("Razorpay create order error:", error)
        res.status(500).json({ message: `Failed to create payment order: ${error.message}` })
    }
}

export const verifyPayment = async (req, res) => {
    try {
        const { razorpay_order_id, razorpay_payment_id, razorpay_signature, planType } = req.body

        if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature || !planType) {
            return res.status(400).json({ message: "Missing payment credentials for verification" })
        }

        const secret = process.env.RAZORPAY_KEY_SECRET
        const hmac = crypto.createHmac("sha256", secret)
        hmac.update(`${razorpay_order_id}|${razorpay_payment_id}`)
        const generatedSignature = hmac.digest("hex")

        if (generatedSignature !== razorpay_signature) {
            return res.status(400).json({ message: "Payment signature verification failed. Transaction invalid." })
        }

        let creditIncrement = 0
        if (planType === "starter") {
            creditIncrement = 150
        } else if (planType === "pro") {
            creditIncrement = 650
        } else {
            return res.status(400).json({ message: "Invalid plan type" })
        }

        const user = await User.addUserCredits(req.userId, creditIncrement)
        if (!user) {
            return res.status(404).json({ message: "User not found" })
        }

        res.status(200).json({
            message: "Payment verified successfully. Credits added.",
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                credits: user.credits,
            },
        })
    } catch (error) {
        console.error("Razorpay signature verification error:", error)
        res.status(500).json({ message: `Failed to verify payment: ${error.message}` })
    }
}
