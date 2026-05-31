import mongoose from "mongoose";

const interviewSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    role: {
      type: String,
      required: true,
    },
    experience: {
      type: String,
    },
    mode: {
      type: String,
      default: "Technical",
    },
    skills: [
      {
        type: String,
      },
    ],
    projects: [
      {
        type: String,
      },
    ],
    questions: [
      {
        questionText: {
          type: String,
          required: true,
        },
        userAnswer: {
          type: String,
          default: "",
        },
        score: {
          type: Number,
          default: 0,
        },
        feedback: {
          type: String,
          default: "",
        },
      },
    ],
    currentQuestionIndex: {
      type: Number,
      default: 0,
    },
    overallScore: {
      type: Number,
      default: 0,
    },
    overallFeedback: {
      type: String,
      default: "",
    },
    confidence: {
      type: Number,
      default: 0,
    },
    communication: {
      type: Number,
      default: 0,
    },
    correctness: {
      type: Number,
      default: 0,
    },
    feedbackHeadline: {
      type: String,
      default: "",
    },
    professionalAdvice: {
      type: String,
      default: "",
    },
    status: {
      type: String,
      enum: ["ongoing", "completed"],
      default: "ongoing",
    },
  },
  { timestamps: true }
);

const Interview = mongoose.model("Interview", interviewSchema);

export default Interview;
