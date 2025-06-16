import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import nftRoutes from "./routes/nftRoutes";
// import startAuction from "./controller/startAuction";
import connectDB from "./utils/db";



dotenv.config();
const app = express();
const Port = process.env.PORT || 3000;



app.use(cors());
app.use(express.json());

app.use("/api/nft", nftRoutes);
// app.use("/api/contract", startAuction);

connectDB();


app.listen(Port, () => {
    console.log(`Server running on port ${Port}`);
});
