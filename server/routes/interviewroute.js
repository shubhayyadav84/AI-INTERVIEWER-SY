import express from "express";
import isAuth from "../middleware/isauth.js";
import { upload } from "../middleware/multer.js";
import { analyzeResume, startInterview, submitAnswer, getHistory, getInterview } from "../controllers/interviewcontroller.js";

const interviewRouter = express.Router();

interviewRouter.post(
  "/resume",
  isAuth,
  upload.single("resume"),
  analyzeResume
);

interviewRouter.post("/start", isAuth, startInterview);
interviewRouter.post("/submit", isAuth, submitAnswer);
interviewRouter.get("/history", isAuth, getHistory);
interviewRouter.get("/:id", isAuth, getInterview);

export default interviewRouter;