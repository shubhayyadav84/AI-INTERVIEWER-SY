import express from "express"

import isAuth from "../middleware/isauth.js"
import { getCurrentUser } from "../controllers/user.controller.js"

const userRouter = express.Router()

userRouter.get("/me", isAuth, getCurrentUser)
export default userRouter