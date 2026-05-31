import { getSql } from "../config/db.js"

export const formatUser = (row, { includePassword = false } = {}) => {
    if (!row) return null
    const user = {
        _id: String(row.id),
        name: row.name,
        email: row.email,
        credits: row.credits,
        createdAt: row.created_at,
        updatedAt: row.updated_at,
    }
    if (includePassword) {
        user.password = row.password
    }
    return user
}

export async function findUserByEmail(email, { includePassword = false } = {}) {
    const sql = getSql()
    const rows = await sql`
        SELECT id, name, email, password, credits, created_at, updated_at
        FROM users
        WHERE email = ${email}
        LIMIT 1
    `
    return formatUser(rows[0], { includePassword })
}

export async function findUserById(id) {
    const sql = getSql()
    const rows = await sql`
        SELECT id, name, email, credits, created_at, updated_at
        FROM users
        WHERE id = ${Number(id)}
        LIMIT 1
    `
    return formatUser(rows[0])
}

export async function createUser({ name, email, password }) {
    const sql = getSql()
    const rows = await sql`
        INSERT INTO users (name, email, password)
        VALUES (${name}, ${email}, ${password})
        RETURNING id, name, email, credits, created_at, updated_at
    `
    return formatUser(rows[0])
}

export async function updateUser(id, { name, password }) {
    const sql = getSql()
    const rows = await sql`
        UPDATE users
        SET
            name = COALESCE(${name ?? null}, name),
            password = COALESCE(${password ?? null}, password),
            updated_at = NOW()
        WHERE id = ${Number(id)}
        RETURNING id, name, email, credits, created_at, updated_at
    `
    return formatUser(rows[0])
}

export async function addUserCredits(id, amount) {
    const sql = getSql()
    const rows = await sql`
        UPDATE users
        SET credits = credits + ${amount}, updated_at = NOW()
        WHERE id = ${Number(id)}
        RETURNING id, name, email, credits, created_at, updated_at
    `
    return formatUser(rows[0])
}
