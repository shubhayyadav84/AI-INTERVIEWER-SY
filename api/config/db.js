import { neon } from "@neondatabase/serverless"

let sql = null
let schemaReady = false

function getDatabaseUrl() {
    const url =
        process.env.DATABASE_URL ||
        process.env.POSTGRES_URL ||
        process.env.NEON_DATABASE_URL
    if (!url) return null
    if (!url.startsWith("postgres")) {
        console.error("DATABASE_URL must be a PostgreSQL connection string (Neon)")
        return null
    }
    // channel_binding can break some serverless runtimes
    return url
        .replace(/([?&])channel_binding=[^&]*&?/g, "$1")
        .replace(/[?&]$/, "")
}

export function getSql() {
    const url = getDatabaseUrl()
    if (!url) {
        throw new Error("DATABASE_URL is not set")
    }
    if (!sql) {
        sql = neon(url)
    }
    return sql
}

async function initSchema() {
    const sql = getSql()

    await sql`
        CREATE TABLE IF NOT EXISTS users (
            id SERIAL PRIMARY KEY,
            name VARCHAR(255) NOT NULL,
            email VARCHAR(255) UNIQUE NOT NULL,
            password VARCHAR(255),
            credits INTEGER NOT NULL DEFAULT 100,
            created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
            updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
        )
    `

    await sql`
        CREATE TABLE IF NOT EXISTS interviews (
            id SERIAL PRIMARY KEY,
            user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
            role VARCHAR(255) NOT NULL,
            experience VARCHAR(255),
            mode VARCHAR(100) DEFAULT 'Technical',
            skills JSONB NOT NULL DEFAULT '[]',
            projects JSONB NOT NULL DEFAULT '[]',
            current_question_index INTEGER NOT NULL DEFAULT 0,
            overall_score NUMERIC NOT NULL DEFAULT 0,
            overall_feedback TEXT NOT NULL DEFAULT '',
            confidence NUMERIC NOT NULL DEFAULT 0,
            communication NUMERIC NOT NULL DEFAULT 0,
            correctness NUMERIC NOT NULL DEFAULT 0,
            feedback_headline TEXT NOT NULL DEFAULT '',
            professional_advice TEXT NOT NULL DEFAULT '',
            status VARCHAR(20) NOT NULL DEFAULT 'ongoing',
            created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
            updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
        )
    `

    await sql`
        CREATE TABLE IF NOT EXISTS interview_questions (
            id SERIAL PRIMARY KEY,
            interview_id INTEGER NOT NULL REFERENCES interviews(id) ON DELETE CASCADE,
            question_index INTEGER NOT NULL,
            question_text TEXT NOT NULL,
            user_answer TEXT NOT NULL DEFAULT '',
            score NUMERIC NOT NULL DEFAULT 0,
            feedback TEXT NOT NULL DEFAULT '',
            UNIQUE (interview_id, question_index)
        )
    `
}

export async function connectDb() {
    if (!getDatabaseUrl()) {
        console.error("DATABASE_URL is not set")
        return null
    }

    try {
        if (!schemaReady) {
            await initSchema()
            schemaReady = true
        }
        return true
    } catch (error) {
        console.error("Database Error:", error.message)
        schemaReady = false
        return null
    }
}
