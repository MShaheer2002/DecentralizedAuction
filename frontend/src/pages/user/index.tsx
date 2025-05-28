import React, { useEffect, useState, useRef } from "react";
import { useAlert } from "@/components/ui/alert";
export const User = () => {
    const [status, setStatus] = useState("Connecting...");
    const [time, setTime] = useState("");
    const ws = useRef(null);
    const { showAlert } = useAlert();

    useEffect(() => {
        ws.current = new WebSocket("ws://localhost:3000");

        ws.current.onopen = () => {
            setStatus("Connected");
            showAlert("Connected to WebSocket", "success");

        };

        ws.current.onmessage = (event) => {
            setTime(event.data);
        };

        ws.current.onclose = () => {
            setStatus("Disconnected");
            showAlert("Disconnected from WebSocket", "error");
        };

        return () => {
            if (ws.current) ws.current.close();
        };
    }, []);

    return (
        <div>
            <h2>WebSocket Status: {status} {status === "Connected" ? "🟢" : "🔴"}</h2>
            <p>{time}</p>
        </div>
    );
}

