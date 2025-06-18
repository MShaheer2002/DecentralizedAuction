// src/components/AdminRoute.tsx
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { connectWallet } from "./meta_mask";
import { setLoading } from '../../../redux/slices/loadingSlice';
import { useDispatch } from "react-redux"
const AdminRoute = ({ children }: { children: JSX.Element }) => {
    const [isLoading, setIsLoading] = useState(true);
    const navigate = useNavigate();
    const dispatch = useDispatch();

    useEffect(() => {
        const checkAdmin = async () => {
            try {
                dispatch(setLoading(true));
                const metaMask = await connectWallet();
                const res = await axios.post("http://localhost:3000/api/nft/check-admin", {
                    metamaskAddress: metaMask.address
                });
                console.log("Admin check response:", res.data);
                if (res.data.status === 403) {
                    alert("❌ Unauthorized access. Redirecting...");
                    navigate("/");
                }
            } catch (err) {
                console.error("Admin check failed:", err);
                navigate("/");
            } finally {
                dispatch(setLoading(false));
            }
        };

        checkAdmin();
    }, [navigate]);

    if (isLoading) return <div className="p-4">Checking admin access...</div>;

    return children;
};

export default AdminRoute;
