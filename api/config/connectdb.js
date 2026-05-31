import mongoose from "mongoose";
import dns from "dns";

const mongoUri =
    process.env.MONGODB_URL ||
    process.env.MONGODB_URI ||
    process.env.MONGO_URL;

let cached = global.mongoose;

if (!cached) {
    cached = global.mongoose = { conn: null, promise: null };
}

const connectDb = async () => {
    if (!mongoUri) {
        console.error("DataBase Error: MONGODB_URL (or MONGODB_URI) is not set");
        return null;
    }

    if (cached.conn) {
        return cached.conn;
    }

    if (!cached.promise) {
        try {
            dns.setServers(["8.8.8.8", "1.1.1.1"]);
        } catch {
            // ignore
        }

        cached.promise = mongoose
            .connect(mongoUri, {
                bufferCommands: false,
                maxPoolSize: 10,
            })
            .then((mongooseInstance) => {
                console.log("DataBase Connected");
                return mongooseInstance;
            })
            .catch((error) => {
                cached.promise = null;
                console.error(`DataBase Error ${error.message}`);
                throw error;
            });
    }

    try {
        cached.conn = await cached.promise;
        return cached.conn;
    } catch {
        return null;
    }
};

export default connectDb;
