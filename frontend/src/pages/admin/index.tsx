"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Upload, ImageIcon, Calendar, Sparkles, Zap, Shield, Clock } from "lucide-react"
import { setLoading } from '../../../redux/slices/loadingSlice';
import { useDispatch, useSelector } from 'react-redux';
import { Label } from "@radix-ui/react-label";
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { ethers, } from "ethers"
import { Spin } from "antd";
import { LoadingOutlined } from '@ant-design/icons';
import { useNavigate } from "react-router-dom";
import DoNotDisturbAltIcon from '@mui/icons-material/DoNotDisturbAlt';
import axios from "axios";
export const AdminPage = () => {
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const loading = useSelector((state: boolean) => state.loading.value);
    const [selectedFile, setSelectedFile] = useState<File | null>(null)
    const [previewUrl, setPreviewUrl] = useState<string>("")
    const [walletConnected, setWalletConnected] = useState(false)
    const [walletAddress, setWalletAddress] = useState<string>("")
    const [formData, setFormData] = useState({
        userName: "",
        startTime: "",
        description: "",
        basePrice: "",
    })
    const [time, setTime] = useState<string>("")
    const [mintData, setMintData] = useState<any>(null)
    const [mintedNFT, setMintedNFT] = useState<boolean>(false)
    const connectWallet = async () => {
        dispatch(setLoading(true));
        try {
            if (!window.ethereum) {
                alert("MetaMask not found. Please install it!");
                return null;
            }
            const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
            const provider = new ethers.BrowserProvider(window.ethereum);
            const signer = await provider.getSigner();
            const address = await signer.getAddress();

            console.log("Accounts:", accounts);
            console.log("Connected to wallet:", address);
            console.log("Signer:", signer);
            console.log("Provider:", provider);

            setWalletConnected(true);
            setWalletAddress(address);

            return {
                address,
                signer,
                provider,
            };
        } catch (error) {
            console.error("Connection failed:", error);
            setWalletConnected(false);
            return null;
        } finally {
            dispatch(setLoading(false));
        }
    };

    useEffect(() => {
        connectWallet()
    }, [])

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0]
        if (file) {
            setSelectedFile(file)
            const url = URL.createObjectURL(file)
            setPreviewUrl(url)
            console.log("Selected file:", file)
        }
    }

    const handleInputChange = (field: string, value: string) => {
        setFormData((prev) => ({
            ...prev,
            [field]: value,
        }));
        if (field === "startTime") {
            const now = new Date();
            const selectedTime = new Date(value);
            const nowInSeconds = Math.floor(now.getTime() / 1000);
            const selectedInSeconds = Math.floor(selectedTime.getTime() / 1000);
            const difference = selectedInSeconds - nowInSeconds;
            console.log("Time until auction starts (seconds):", difference);
            setTime(difference);
        }
    };


    const handleMintNFT = async () => {
        try {
            console.log("Form Data:", formData, "Selected File:", selectedFile, "Time:", time);
            dispatch(setLoading(true));
            const formdata = new FormData();
            formdata.append("name", formData.userName);
            formdata.append("description", formData.description);
            formdata.append("startTime", time);
            formdata.append("image", selectedFile);
            const response = await axios.post("http://localhost:3000/api/nft/upload", formdata, {
                headers: {
                    "Content-Type": "multipart/form-data",
                },
            });
            if (response.status === 200) {
                alert("NFT uploaded successfully!");
                setMintedNFT(true);
            }
            setMintData(response.data);
            console.log("Upload success:", response.data);
        } catch (error) {
            console.error("Upload failed:", error);
        } finally {
            dispatch(setLoading(false));
        }
    };
    const handleStartAuction = async () => {
        try {
            console.log("Mint Data:", mintData, "Time:", time, "Base Price:", formData.basePrice);
            dispatch(setLoading(true));
            const response = await axios.post("http://localhost:3000/api/nft/start-auction", {
                tokenId: mintData.tokenId,
                durationInSeconds: time,
                basePrice: formData.basePrice || "0",
            }, {
                headers: {
                    "Content-Type": "application/json",
                },
            });
            if (response.status === 200) {
                alert("Auction started successfully!");
                formData.userName = "";
                formData.startTime = "";
                formData.description = "";
                formData.basePrice = "";
                setSelectedFile(null);
                setTime("");
                setPreviewUrl("");
                setMintData(null);
                setMintedNFT(false);
                navigate("/");
            }

        } catch (error) {
            console.error("Start auction failed:", error);
            alert("Failed to start auction. Please try again.");
        }
        finally {
            dispatch(setLoading(false));
        }
    }

    if (loading) {
        return (
            <div className="min-h-screen flex flex-col justify-center items-center bg-gradient-to-br from-black via-gray-900 to-gray-800">
                <div className="text-center">
                    <Spin
                        indicator={<LoadingOutlined style={{ fontSize: 48, color: "#22c55e" }} spin />}
                        tip={<span style={{ color: "white", fontSize: "1.2rem", marginTop: "16px", display: "block" }}>Connecting to MetaMask...</span>}
                    />
                    <div className="mt-6 p-4 bg-gray-800/50 backdrop-blur-sm border border-green-500/20 rounded-xl">
                        <p className="text-gray-300 text-sm">
                            Please approve the connection request in your MetaMask wallet
                        </p>
                    </div>
                </div>
            </div>
        );
    }

    if (!loading && !walletConnected) {
        return (
            <div className="min-h-screen flex flex-col justify-center items-center bg-gradient-to-br from-black via-gray-900 to-gray-800 p-4">
                <div className="text-center max-w-md">
                    <div className="w-20 h-20 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
                        <Shield className="w-10 h-10 text-red-400" />
                    </div>
                    <h2 className="text-2xl font-bold text-white mb-4">Wallet Connection Failed</h2>
                    <p className="text-gray-300 mb-6">
                        Unable to connect to MetaMask. Please make sure it's installed and try again.
                    </p>
                    <Button
                        onClick={connectWallet}
                        className="bg-gradient-to-r from-green-600 to-green-500 hover:from-green-700 hover:to-green-600 text-black font-semibold px-8 py-3 rounded-xl"
                    >
                        Retry Connection
                    </Button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-gray-800 p-4 md:p-8 font-['Poppins']">
            <div className="fixed inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(34,197,94,0.1),transparent_50%)] pointer-events-none" />
            <div className="fixed inset-0 bg-[radial-gradient(circle_at_80%_20%,rgba(34,197,94,0.05),transparent_50%)] pointer-events-none" />

            <div className="relative max-w-2xl mx-auto">
                {/* Header Section */}
                <div className="text-center mb-8 ">
                    <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-r from-green-400 to-green-600 rounded-3xl mb-6 shadow-2xl shadow-green-500/25">
                        <Zap className="w-10 h-10 text-black" />
                    </div>
                    <h1 className="text-4xl md:text-6xl font-bold bg-gradient-to-r from-white via-green-100 to-green-400 bg-clip-text text-transparent mb-4">
                        NFT Auction Admin
                    </h1>
                    <p className="text-gray-300 font-medium text-lg md:text-xl">
                        Mint your NFT for the decentralized auction
                    </p>
                    <div className="mt-4 inline-flex items-center gap-2 px-4 py-2 bg-green-500/10 border border-green-500/20 rounded-full">
                        <Shield className="w-4 h-4 text-green-400" />
                        <span className="text-green-400 font-semibold text-sm">
                            Connected: {walletAddress.slice(0, 6)}...{walletAddress.slice(-4)}
                        </span>
                    </div>
                    <Button
                        onClick={() => {
                            setWalletConnected(false);
                            setFormData({
                                userName: "",
                                startTime: "",
                                description: "",
                            });
                        }}
                        className="ml-2  hover:bg-red-300/10 hover:text-accent-foreground inline-flex items-center gap-2 px-4 py-2 bg-red-500/10 border border-red-500/20 rounded-full">
                        <DoNotDisturbAltIcon fontSize="small" className="text-red-400" />
                        <span className="text-red-400 font-semibold text-sm">
                            Disconnect Wallet
                        </span>
                    </Button>
                </div>

                {/* Main Card */}
                <Card className="bg-gray-900/50 backdrop-blur-xl border border-green-500/20 shadow-2xl shadow-green-500/10 ring-1 ring-green-500/10">
                    <CardHeader className="text-center pb-8 bg-gradient-to-r from-green-500/5 to-green-400/5 rounded-t-lg border-b border-green-500/10">
                        <CardTitle className="text-2xl md:text-3xl font-bold text-white flex items-center justify-center gap-3">
                            <div className="w-10 h-10 bg-gradient-to-r from-green-400 to-green-600 rounded-xl flex items-center justify-center shadow-lg">
                                <Sparkles className="w-6 h-6 text-black" />
                            </div>
                            Mint  NFT
                        </CardTitle>
                        <CardDescription className="text-gray-300 font-medium text-base mt-3">
                            Upload your digital artwork and configure auction parameters
                        </CardDescription>
                    </CardHeader>

                    <CardContent className="space-y-8 p-8">
                        {/* Upload Image Section */}
                        <div className="space-y-4">
                            <Label htmlFor="image-upload" className="text-base font-semibold text-green-400 flex items-center gap-2">
                                <ImageIcon className="w-5 h-5" />
                                NFT Artwork
                            </Label>
                            <div className="relative group">
                                <input id="image-upload" type="file" accept="image/*" onChange={handleFileChange} className="hidden" />
                                <label
                                    htmlFor="image-upload"
                                    className="flex flex-col items-center justify-center w-full h-64 border-2 border-dashed border-green-500/30 rounded-2xl cursor-pointer bg-gradient-to-br from-gray-800/30 to-green-900/10 hover:from-green-900/20 hover:to-green-800/20 hover:border-green-400/50 transition-all duration-300 group relative overflow-hidden"
                                >
                                    {/* Animated background effect */}
                                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-green-500/5 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000" />

                                    {previewUrl ? (
                                        <div className="relative w-full h-full rounded-2xl overflow-hidden">
                                            <img
                                                src={previewUrl || "/placeholder.svg"}
                                                alt="NFT Preview"
                                                className="w-full h-full object-cover"
                                            />
                                            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-all duration-300 flex items-end justify-center pb-8">
                                                <div className="flex items-center gap-2 text-white font-semibold bg-black/50 px-4 py-2 rounded-lg backdrop-blur-sm">
                                                    <Upload className="w-5 h-5 text-green-400" />
                                                    Change Image
                                                </div>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="text-center py-8 relative z-10">
                                            <div className="w-20 h-20 bg-gradient-to-r from-green-400 to-green-600 rounded-3xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300 shadow-xl">
                                                <ImageIcon className="w-10 h-10 text-black" />
                                            </div>
                                            <p className="text-2xl font-bold text-white mb-3">Upload NFT Image</p>
                                            <p className="text-gray-300 font-medium mb-4">Click to browse or drag and drop your artwork</p>
                                            <div className="inline-flex items-center gap-2 px-4 py-2 bg-green-500/10 rounded-full border border-green-500/20">
                                                <Zap className="w-4 h-4 text-green-400" />
                                                <span className="text-green-400 text-sm font-semibold">High Quality Supported</span>
                                            </div>
                                        </div>
                                    )}
                                </label>
                            </div>
                            <div className="bg-gray-800/50 rounded-xl p-4 border border-gray-700/50">
                                <p className="text-sm text-gray-300 font-medium flex items-center gap-2">
                                    <Shield className="w-4 h-4 text-green-400" />
                                    Supported formats: JPG, PNG, GIF, SVG (Max 10MB) • Stored on IPFS
                                </p>
                            </div>
                        </div>

                        {/* User Name Field */}
                        <div className="space-y-4">
                            <Label htmlFor="userName" className="text-base font-semibold text-green-400">
                                Name
                            </Label>
                            <div className="relative">
                                <Input
                                    id="userName"
                                    type="text"
                                    placeholder="Enter your nft name"
                                    value={formData.userName}
                                    onChange={(e) => handleInputChange("userName", e.target.value)}
                                    className="h-14 bg-gray-800/50 border-2 border-gray-700/50 focus:border-green-400 focus:ring-4 focus:ring-green-400/20 rounded-xl font-medium text-base text-white placeholder:text-gray-500 hover:border-gray-600/50 transition-all duration-200"
                                />
                                <div className="absolute right-4 top-1/2 -translate-y-1/2">
                                    <div
                                        className={`w-3 h-3 rounded-full transition-colors duration-200 ${formData.userName ? "bg-green-400" : "bg-gray-600"}`}
                                    />
                                </div>
                            </div>
                            <div className="bg-gray-800/30 rounded-lg p-3 border border-gray-700/30">
                                <p className="text-sm text-gray-300 font-medium flex items-center gap-2">
                                    <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                                    This will be permanently recorded on the blockchain
                                </p>
                            </div>
                        </div>
                        <div className="space-y-4">
                            <Label htmlFor="basePrice" className="text-base font-semibold text-green-400">
                                Base Price <span className="text-gray-300 text-xs">
                                    ( ETH )
                                </span>
                            </Label>
                            <div className="relative">
                                <Input
                                    id="basePrice"
                                    type="number"
                                    placeholder="Enter base price"
                                    value={formData.basePrice}
                                    onChange={(e) => handleInputChange("basePrice", e.target.value)}
                                    className="h-14 bg-gray-800/50 border-2 border-gray-700/50 focus:border-green-400 focus:ring-4 focus:ring-green-400/20 rounded-xl font-medium text-base text-white placeholder:text-gray-500 hover:border-gray-600/50 transition-all duration-200"
                                />
                                <div className="absolute right-4 top-1/2 -translate-y-1/2">
                                    <div
                                        className={`w-3 h-3 rounded-full transition-colors duration-200 ${formData.basePrice ? "bg-green-400" : "bg-gray-600"}`}
                                    />
                                </div>
                            </div>
                            <div className="bg-gray-800/30 rounded-lg p-3 border border-gray-700/30">
                                <p className="text-sm text-gray-300 font-medium flex items-center gap-2">
                                    <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                                    This will be permanently recorded on the blockchain
                                </p>
                            </div>
                        </div>

                        {/* Start Time Field */}
                        <div className="space-y-4">
                            <Label htmlFor="startTime" className="text-base font-semibold text-green-400 flex items-center gap-2">
                                <Calendar className="w-5 h-5" />
                                Auction Start Time
                            </Label>
                            <div className="relative">
                                <Input
                                    id="startTime"
                                    type="datetime-local"
                                    value={formData.startTime}
                                    min={new Date().toISOString().slice(0, 16)}
                                    onChange={(e) => handleInputChange("startTime", e.target.value)}
                                    className="h-14 bg-gray-800/50 border-2 border-gray-700/50 focus:border-green-400 focus:ring-4 focus:ring-green-400/20 rounded-xl font-medium text-base text-white hover:border-gray-600/50 transition-all duration-200"
                                />
                                <div className="absolute right-4 top-1/2 -translate-y-1/2">
                                    <Clock className="w-5 h-5 text-green-400" />
                                </div>
                            </div>
                            <div className="bg-gray-800/30 rounded-lg p-3 border border-gray-700/30">
                                <p className="text-sm text-gray-300 font-medium flex items-center gap-2">
                                    <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                                    Smart contract will automatically start accepting bids at this time
                                </p>
                            </div>
                        </div>

                        {/* Description Field */}
                        <div className="space-y-4">
                            <Label htmlFor="description" className="text-base font-semibold text-green-400">
                                NFT Description
                            </Label>
                            <Textarea
                                id="description"
                                placeholder="Describe your NFT artwork, its inspiration, rarity, and unique features that make it valuable..."
                                value={formData.description}
                                onChange={(e) => handleInputChange("description", e.target.value)}
                                className="min-h-[140px] bg-gray-800/50 border-2 border-gray-700/50 focus:border-green-400 focus:ring-4 focus:ring-green-400/20 rounded-xl font-medium text-base resize-none text-white placeholder:text-gray-500 hover:border-gray-600/50 transition-all duration-200"
                            />
                            <div className="bg-gray-800/30 rounded-lg p-3 border border-gray-700/30">
                                <p className="text-sm text-gray-300 font-medium flex items-center gap-2">
                                    <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                                    Detailed descriptions help attract serious collectors and increase bidding activity
                                </p>
                            </div>
                        </div>

                        {/* Mint NFT Button */}
                        <div className="pt-6 space-y-4">
                            <Button
                                onClick={handleMintNFT}
                                className="w-full h-16 bg-gradient-to-r from-green-600 via-green-500 to-green-400 
      hover:brightness-110 hover:saturate-150 hover:shadow-green-500/50 
      text-black font-bold text-lg rounded-2xl shadow-lg 
      transition-all duration-300 transform hover:scale-[1.03] 
      active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none 
      border border-green-400/30"
                                disabled={!selectedFile || !formData.userName || !formData.startTime || !walletConnected}
                            >
                                <div className="flex items-center justify-center gap-3">
                                    <div className="w-6 h-6 bg-black/20 rounded-lg flex items-center justify-center">
                                        <Sparkles className="w-4 h-4 text-black" />
                                    </div>
                                    <span>Mint NFT </span>
                                    <Zap className="w-5 h-5 text-black" />
                                </div>
                            </Button>

                            {/* Start Auction Button - Enhanced Indigo/Purple/Pink */}
                            {mintedNFT && (
                                <Button
                                    onClick={handleStartAuction}
                                    className="w-full h-16 bg-gradient-to-r from-indigo-600 via-purple-500 to-pink-400 
        hover:brightness-110 hover:saturate-150 hover:shadow-purple-500/50 
        text-white font-bold text-lg rounded-2xl shadow-lg 
        transition-all duration-300 transform hover:scale-[1.03] 
        active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none 
        border border-purple-400/30"
                                    disabled={!selectedFile || !formData.userName || !formData.startTime || !walletConnected}
                                >
                                    <div className="flex items-center justify-center gap-3">
                                        <div className="w-6 h-6 bg-white/20 rounded-lg flex items-center justify-center">
                                            <Sparkles className="w-4 h-4 text-white" />
                                        </div>
                                        <span>Start Auction</span>
                                        <Zap className="w-5 h-5 text-white" />
                                    </div>
                                </Button>
                            )}
                        </div>


                        {/* Footer Section */}
                        <div className="text-center pt-6 border-t border-green-500/10">
                            <div className="bg-gradient-to-r from-gray-800/50 to-green-900/20 rounded-xl p-4 border border-green-500/20">
                                <div className="flex items-center justify-center gap-2 mb-2">
                                    <Shield className="w-5 h-5 text-green-400" />
                                    <span className="text-green-400 font-semibold">Blockchain Secured Transaction</span>
                                </div>
                                <p className="text-sm text-gray-300 font-medium">
                                    By minting, you agree to deploy your NFT on the decentralized auction smart contract
                                </p>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Progress Indicators */}
                <div className="mt-8 grid grid-cols-3 gap-4">
                    <div className="bg-gray-800/50 backdrop-blur-sm border border-green-500/20 rounded-xl p-4 hover:bg-gray-800/70 transition-all duration-200">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div
                                    className={`w-4 h-4 rounded-full transition-all duration-300 ${selectedFile ? "bg-green-400 shadow-lg shadow-green-400/50" : "bg-gray-600"}`}
                                />
                                <span className="text-sm font-semibold text-white">Image</span>
                            </div>
                            <ImageIcon
                                className={`w-4 h-4 transition-colors duration-200 ${selectedFile ? "text-green-400" : "text-gray-500"}`}
                            />
                        </div>
                    </div>
                    <div className="bg-gray-800/50 backdrop-blur-sm border border-green-500/20 rounded-xl p-4 hover:bg-gray-800/70 transition-all duration-200">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div
                                    className={`w-4 h-4 rounded-full transition-all duration-300 ${formData.userName && formData.startTime ? "bg-green-400 shadow-lg shadow-green-400/50" : "bg-gray-600"}`}
                                />
                                <span className="text-sm font-semibold text-white">Details</span>
                            </div>
                            <Calendar
                                className={`w-4 h-4 transition-colors duration-200 ${formData.userName && formData.startTime ? "text-green-400" : "text-gray-500"}`}
                            />
                        </div>
                    </div>
                    <div className="bg-gray-800/50 backdrop-blur-sm border border-green-500/20 rounded-xl p-4 hover:bg-gray-800/70 transition-all duration-200">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div
                                    className={`w-4 h-4 rounded-full transition-all duration-300 ${formData.description ? "bg-green-400 shadow-lg shadow-green-400/50" : "bg-gray-600"}`}
                                />
                                <span className="text-sm font-semibold text-white">Description</span>
                            </div>
                            <Sparkles
                                className={`w-4 h-4 transition-colors duration-200 ${formData.description ? "text-green-400" : "text-gray-500"}`}
                            />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}