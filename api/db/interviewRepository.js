import { getSql } from "../config/db.js"

export const formatInterview = (row, questions = []) => ({
    _id: String(row.id),
    userId: String(row.user_id),
    role: row.role,
    experience: row.experience,
    mode: row.mode,
    skills: row.skills ?? [],
    projects: row.projects ?? [],
    questions: questions.map((q) => ({
        questionText: q.question_text,
        userAnswer: q.user_answer ?? "",
        score: Number(q.score ?? 0),
        feedback: q.feedback ?? "",
    })),
    currentQuestionIndex: row.current_question_index,
    overallScore: Number(row.overall_score ?? 0),
    overallFeedback: row.overall_feedback ?? "",
    confidence: Number(row.confidence ?? 0),
    communication: Number(row.communication ?? 0),
    correctness: Number(row.correctness ?? 0),
    feedbackHeadline: row.feedback_headline ?? "",
    professionalAdvice: row.professional_advice ?? "",
    status: row.status,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
})

async function getQuestionsForInterview(interviewId) {
    const sql = getSql()
    return sql`
        SELECT question_text, user_answer, score, feedback, question_index
        FROM interview_questions
        WHERE interview_id = ${Number(interviewId)}
        ORDER BY question_index ASC
    `
}

export async function createInterview(userId, data, questionTexts) {
    const sql = getSql()
    const skills = JSON.stringify(data.skills ?? [])
    const projects = JSON.stringify(data.projects ?? [])

    const interviewRows = await sql`
        INSERT INTO interviews (user_id, role, experience, mode, skills, projects, status)
        VALUES (
            ${Number(userId)},
            ${data.role},
            ${data.experience ?? null},
            ${data.mode ?? "Technical"},
            ${skills}::jsonb,
            ${projects}::jsonb,
            'ongoing'
        )
        RETURNING *
    `

    const interview = interviewRows[0]
    const questions = []

    for (let i = 0; i < questionTexts.length; i++) {
        const qRows = await sql`
            INSERT INTO interview_questions (interview_id, question_index, question_text)
            VALUES (${interview.id}, ${i}, ${questionTexts[i]})
            RETURNING question_text, user_answer, score, feedback, question_index
        `
        questions.push(qRows[0])
    }

    return formatInterview(interview, questions)
}

export async function findInterviewById(id) {
    const sql = getSql()
    const rows = await sql`
        SELECT * FROM interviews WHERE id = ${Number(id)} LIMIT 1
    `
    if (!rows[0]) return null
    const questions = await getQuestionsForInterview(id)
    return formatInterview(rows[0], questions)
}

export async function findInterviewsByUserId(userId) {
    const sql = getSql()
    const rows = await sql`
        SELECT * FROM interviews
        WHERE user_id = ${Number(userId)}
        ORDER BY created_at DESC
    `

    const results = []
    for (const row of rows) {
        const questions = await getQuestionsForInterview(row.id)
        results.push(formatInterview(row, questions))
    }
    return results
}

export async function updateQuestionAndInterview(interviewId, questionIndex, answer, evalData, isLast, overallData) {
    const sql = getSql()

    await sql`
        UPDATE interview_questions
        SET user_answer = ${answer},
            score = ${evalData.score},
            feedback = ${evalData.feedback}
        WHERE interview_id = ${Number(interviewId)} AND question_index = ${questionIndex}
    `

    if (isLast) {
        await sql`
            UPDATE interviews
            SET status = 'completed',
                overall_score = ${overallData.overallScore},
                overall_feedback = ${overallData.overallFeedback},
                confidence = ${overallData.confidence},
                communication = ${overallData.communication},
                correctness = ${overallData.correctness},
                feedback_headline = ${overallData.feedbackHeadline},
                professional_advice = ${overallData.professionalAdvice},
                updated_at = NOW()
            WHERE id = ${Number(interviewId)}
        `
    } else {
        await sql`
            UPDATE interviews
            SET current_question_index = ${questionIndex + 1},
                updated_at = NOW()
            WHERE id = ${Number(interviewId)}
        `
    }

    return findInterviewById(interviewId)
}
