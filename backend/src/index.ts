import express from "express";
import cors from "cors";
import dotenv from "dotenv";
// import nftRoutes from "./routes/nftRoutes";
import WebSocket, { WebSocketServer } from "ws";
import http from "http";

dotenv.config();
const app = express();
const Port = process.env.PORT || 3000;

const server = http.createServer(app);

const wss = new WebSocketServer({ server });
wss.on("connection", (ws: WebSocket) => {
    ws.on("close", () => {
    });
    setInterval(() => {
        const time = new Date().toLocaleTimeString();
        ws.send(`Current time: ${time}`);
    }, 10);

});

app.use(cors());
app.use(express.json());

// app.use("/api/nft", nftRoutes);

server.listen(Port, () => {
    console.log(`Server running on port ${Port}`);
});
