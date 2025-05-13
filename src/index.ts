import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import nftRoutes from "../src/routes/nftRoutes";
import connectDB from "./utils/db";


dotenv.config();
const app = express();

const Port = process.env.PORT || 3000;


app.use(cors());
app.use(express.json());

app.use("/api/nft", nftRoutes);

connectDB();

app.listen(Port, () => {
    console.log(`backend is running at port ${Port}`);
})
