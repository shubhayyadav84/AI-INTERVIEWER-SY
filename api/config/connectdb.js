import mongoose from "mongoose"

const mongoUri =
    process.env.MONGODB_URL ||
    process.env.MONGODB_URI ||
    process.env.MONGO_URL

let cached = global.mongoose

if (!cached) {
    cached = global.mongoose = { conn: null, promise: null }
}

const connectDb = async () => {
    if (!mongoUri) {
        console.error("MONGODB_URL is not set")
        return null
    }

    if (cached.conn && mongoose.connection.readyState === 1) {
        return cached.conn
    }

    if (!cached.promise) {
        cached.promise = mongoose
            .connect(mongoUri, {
                serverSelectionTimeoutMS: 10000,
                maxPoolSize: 10,
            })
            .then((instance) => {
                console.log("DataBase Connected")
                return instance
            })
            .catch((error) => {
                cached.promise = null
                cached.conn = null
                console.error("DataBase Error:", error.message)
                throw error
            })
    }

    try {
        cached.conn = await cached.promise
        return cached.conn
    } catch {
        cached.promise = null
        cached.conn = null
        return null
    }
}

export default connectDb
