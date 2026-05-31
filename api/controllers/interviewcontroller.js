import fs from "fs"
import * as pdfjsLib from "pdfjs-dist/legacy/build/pdf.mjs"
import { askAi } from "../services/openrouterservice.js"
import * as Interview from "../db/interviewRepository.js"

export const analyzeResume = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ message: "Resume required" })
        }

        const filepath = req.file.path
        const fileBuffer = await fs.promises.readFile(filepath)
        const uint8Array = new Uint8Array(fileBuffer)

        const pdf = await pdfjsLib.getDocument({ data: uint8Array }).promise
        let resumeText = ""

        for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
            const page = await pdf.getPage(pageNum)
            const content = await page.getTextContent()
            resumeText += content.items.map((item) => item.str).join(" ")
        }

        const messages = [
            {
                role: "system",
                content: `
Extract structured data from resume.

Return strictly JSON:

{
  "role": "string",
  "experience": "string",
  "projects": ["project1", "project2"],
  "skills": ["skill1", "skill2"]
}
        `,
            },
            { role: "user", content: resumeText },
        ]

        const response = await askAi(messages)
        let cleanResponse = response.trim()
        if (cleanResponse.startsWith("```")) {
            cleanResponse = cleanResponse
                .replace(/^```[a-zA-Z]*\s*/, "")
                .replace(/\s*```$/, "")
                .trim()
        }

        const parsed = JSON.parse(cleanResponse)
        fs.unlinkSync(filepath)

        res.json({
            role: parsed.role,
            experience: parsed.experience,
            projects: parsed.projects,
            skills: parsed.skills,
            resumeText,
        })
    } catch (error) {
        console.error(error)
        if (req.file && fs.existsSync(req.file.path)) {
            fs.unlinkSync(req.file.path)
        }
        res.status(500).json({ message: error.message })
    }
}

export const startInterview = async (req, res) => {
    try {
        const { role, experience, mode, skills, projects } = req.body

        const messages = [
            {
                role: "system",
                content: `
Generate exactly 5 interview questions for a candidate.
Job Role: ${role}
Experience: ${experience}
Mode: ${mode}
Skills: ${skills ? skills.join(", ") : "None"}
Projects: ${projects ? projects.join(", ") : "None"}

Return strictly a JSON array of strings:
[
  "Question 1 text",
  "Question 2 text",
  "Question 3 text",
  "Question 4 text",
  "Question 5 text"
]
        `,
            },
        ]

        const response = await askAi(messages)
        let cleanResponse = response.trim()
        if (cleanResponse.startsWith("```")) {
            cleanResponse = cleanResponse
                .replace(/^```[a-zA-Z]*\s*/, "")
                .replace(/\s*```$/, "")
                .trim()
        }

        const questionTexts = JSON.parse(cleanResponse)

        const interview = await Interview.createInterview(
            req.userId,
            { role, experience, mode, skills, projects },
            questionTexts
        )

        res.status(200).json(interview)
    } catch (error) {
        console.error(error)
        res.status(500).json({ message: `Failed to start interview: ${error.message}` })
    }
}

export const submitAnswer = async (req, res) => {
    try {
        const { interviewId, answer } = req.body

        const interview = await Interview.findInterviewById(interviewId)
        if (!interview) {
            return res.status(404).json({ message: "Interview not found" })
        }

        if (String(interview.userId) !== String(req.userId)) {
            return res.status(403).json({ message: "Unauthorized access to this session" })
        }

        const currentIndex = interview.currentQuestionIndex
        const currentQuestion = interview.questions[currentIndex]

        const evaluationMessages = [
            {
                role: "system",
                content: `
Evaluate this interview answer.
Question: ${currentQuestion.questionText}
User Answer: ${answer}

Return strictly JSON:
{
  "score": 7,
  "feedback": "Your answer is correct but you should explain..."
}
        `,
            },
        ]

        const evalResponse = await askAi(evaluationMessages)
        let cleanEval = evalResponse.trim()
        if (cleanEval.startsWith("```")) {
            cleanEval = cleanEval.replace(/^```[a-zA-Z]*\s*/, "").replace(/\s*```$/, "").trim()
        }
        const parsedEval = JSON.parse(cleanEval)

        const isLast = currentIndex === interview.questions.length - 1
        let overallData = null

        if (isLast) {
            const overallMessages = [
                {
                    role: "system",
                    content: `
Based on the candidate's answers and evaluations, calculate overall score, individual metrics (confidence, communication, correctness), performance summary headlines, and detailed professional advice.
Details:
${interview.questions
    .map(
        (q, i) =>
            `Q${i + 1}: ${q.questionText}\nAnswer: ${i === currentIndex ? answer : q.userAnswer}\nScore: ${i === currentIndex ? parsedEval.score : q.score}/10\nFeedback: ${i === currentIndex ? parsedEval.feedback : q.feedback}`
    )
    .join("\n\n")}

Return strictly JSON:
{
  "overallScore": 7,
  "confidence": 6.4,
  "communication": 7.0,
  "correctness": 7.6,
  "feedbackHeadline": "Needs minor improvement before interviews.",
  "overallFeedback": "Good foundation, refine articulation.",
  "professionalAdvice": "Good foundation shown. Improve clarity and structure."
}
          `,
                },
            ]

            const overallResponse = await askAi(overallMessages)
            let cleanOverall = overallResponse.trim()
            if (cleanOverall.startsWith("```")) {
                cleanOverall = cleanOverall
                    .replace(/^```[a-zA-Z]*\s*/, "")
                    .replace(/\s*```$/, "")
                    .trim()
            }
            overallData = JSON.parse(cleanOverall)
        }

        const updated = await Interview.updateQuestionAndInterview(
            interviewId,
            currentIndex,
            answer,
            parsedEval,
            isLast,
            overallData
        )

        res.status(200).json(updated)
    } catch (error) {
        console.error(error)
        res.status(500).json({ message: `Failed to submit answer: ${error.message}` })
    }
}

export const getHistory = async (req, res) => {
    try {
        const interviews = await Interview.findInterviewsByUserId(req.userId)
        res.status(200).json(interviews)
    } catch (error) {
        console.error("Get history error:", error)
        res.status(500).json({ message: `Failed to retrieve interview history: ${error.message}` })
    }
}

export const getInterview = async (req, res) => {
    try {
        const interview = await Interview.findInterviewById(req.params.id)
        if (!interview) {
            return res.status(404).json({ message: "Interview not found" })
        }
        if (String(interview.userId) !== String(req.userId)) {
            return res.status(403).json({ message: "Unauthorized access to this session" })
        }
        res.status(200).json(interview)
    } catch (error) {
        console.error("Get interview error:", error)
        res.status(500).json({ message: `Failed to retrieve interview details: ${error.message}` })
    }
}
