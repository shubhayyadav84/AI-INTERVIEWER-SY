import * as User from "../db/userRepository.js"

export const getCurrentUser = async (req, res) => {
    try {
        const user = await User.findUserById(req.userId)

        if (!user) {
            return res.status(404).json({ message: "User not found" })
        }

        return res.status(200).json({
            _id: user._id,
            name: user.name,
            email: user.email,
            credits: user.credits,
        })
    } catch (error) {
        console.error("getCurrentUser error:", error)
        return res.status(500).json({ message: `Failed to get user: ${error.message}` })
    }
}
