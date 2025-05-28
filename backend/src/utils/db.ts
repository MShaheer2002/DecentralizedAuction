import mongoose from "mongoose";
import dotenv from 'dotenv';
dotenv.config();


const DB_URL = `mongodb+srv://${process.env.MONGOOSE_USERNAME}:${process.env.MONGOOSE_PASSWORD}@auction.jdwo84h.mongodb.net/?retryWrites=true&w=majority&appName=auction`

const connectDB = async () => {

    try {
        await mongoose.connect(DB_URL);
        console.log("Connected to MongoDB");
    } catch (error) {
        console.error("MongoDB connection error:", error);
        process.exit(1);
    }
};

export default connectDB;