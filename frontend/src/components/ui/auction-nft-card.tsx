"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { Clock, TrendingUp, DollarSign, Zap, Heart, Share2, Eye, Timer, TimerOff } from "lucide-react"
import { connectWallet } from "./meta_mask"
import { getAuctionContract } from "../../lib/getContract";
import { ethers } from "ethers";
import { setLoading } from "../../../redux/slices/loadingSlice";
import { useDispatch } from "react-redux"
import AuctionTimer from "./CountdownTimer"
import axios from "axios"

interface AuctionNFTCardProps {
    nftImage?: string
    nftTitle?: string
    nftDescription?: string
    highestBid?: number
    basePrice?: number
    auctionEndTime?: Date
    currency?: string
    onPlaceBid?: (bidAmount: number) => void
    onFavorite?: () => void
    onShare?: () => void
    className?: string
    isLiked?: boolean
    viewCount?: number
    tokenId?: number
    perEthPrice?: number
}

const AuctionNFTCard: React.FC<AuctionNFTCardProps> = ({
    nftImage = "https://media.cnn.com/api/v1/images/stellar/prod/211227135008-02-the-batman-trailer.jpg?c=16x9&q=h_383,w_680,c_fill/f_webp",
    nftTitle = "Digital Masterpiece #001",
    nftDescription = "A stunning piece of digital art that captures the essence of modern creativity and blockchain innovation.",
    highestBid: initialHighestBid = 2.5,
    basePrice = 0,
    tokenId = 1,
    auctionEndTime = new Date(Date.now() + 2 * 24 * 60 * 60 * 1000 + 2 * 60 * 60 * 1000 + 30 * 60 * 1000),
    currency = "ETH",
    perEthPrice = 2000,
    onPlaceBid = (bidAmount: number) => console.log(`Placing bid: ${bidAmount} ${currency}`),
    onFavorite = () => console.log("Added to favorites"),
    onShare = () => console.log("Sharing NFT"),
    className = "",
    isLiked = false,
    viewCount = 1247,
}) => {
    const [isAuctionActive, setIsAuctionActive] = useState<boolean>(true)
    const [liked, setLiked] = useState<boolean>(isLiked)
    const [bidAmount, setBidAmount] = useState<string>("")
    const [showBidInput, setShowBidInput] = useState<boolean>(false)
    const [isAuctionEnded, setIsAuctionEnded] = useState(false);
    const dispatch = useDispatch<UseDispatch>()
    const [highestBid, setHighestBid] = useState<number>(initialHighestBid)
    const handlePlaceBid = async () => {
        if (!bidAmount || Number.parseFloat(bidAmount) < basePrice) {
            return alert("Bid must be higher than the current base price.");
        }
        try {
            dispatch(setLoading(true))
            // console.log("[check Tokenid]", tokenId);
            const { signer } = await connectWallet();
            // console.log("Signer:", signer);
            const contract = getAuctionContract(signer);
            if (!contract) return alert("Contract not connected");
            const tx = await contract.bid(tokenId, {
                value: ethers.parseEther(bidAmount), // Convert ETH to wei
            });

            const receipt = await tx.wait(); // wait for transaction to be mined
            if (receipt.status === 1) {
                const response = await axios.post(
                    "http://localhost:3000/api/nft/record-bid",
                    {
                        tokenId: tokenId,
                        bidder: receipt.from,
                        amount: bidAmount,
                    },
                    {
                        headers: {
                            "Content-Type": "application/json",
                        },
                    }
                );
                console.log("Transaction successful:", receipt);
                alert("✅ Bid placed successfully!");
                setHighestBid(bidAmount);
            } else if (receipt.status == 0) {
                return alert("❌ Transaction failed. Please try again.");
            }
            // Reset state
            setBidAmount("");
            setShowBidInput(false);
            onPlaceBid(Number.parseFloat(bidAmount));
        } catch (error) {
            console.error("❌ Failed to place bid:", error);
            alert("Something went wrong while placing the bid.");
        } finally {
            dispatch(setLoading(false))
        }
    };
    const handleFavorite = () => {
        setLiked(!liked)
        onFavorite()
    }

    const minimumBid = highestBid + 0.1

    return (
        <div
            className={`w-full max-w-md mx-auto bg-gray-900/60 backdrop-blur-xl border border-green-500/20 rounded-2xl shadow-2xl shadow-green-500/10 hover:shadow-green-500/20 transition-all duration-500 overflow-hidden group font-['Poppins'] ${className}`}
        >
            <div className="relative overflow-hidden">
                <div className="w-full h-[300px] bg-gradient-to-br from-gray-800 to-gray-900 flex items-center justify-center border-b border-green-500/10 relative">
                    <img
                        src={nftImage || "/placeholder.svg"}
                        alt={nftTitle}
                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110 border border-green-500/20 shadow-lg shadow-black/50"
                        onError={(e) => {
                            const target = e.target as HTMLImageElement
                            target.src = "/placeholder.svg?height=300&width=300"
                        }}
                    />

                    {/* Image Overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-all duration-500" />

                    {/* Top Action Bar */}
                    <div className="absolute top-4 left-4 right-4 flex justify-between items-center">
                        {/* Status Badge */}
                        <div
                            className={`px-3 py-1 rounded-full text-xs font-bold backdrop-blur-sm border transition-all duration-300 ${!isAuctionEnded
                                ? "bg-green-500/20 text-green-400 border-green-500/40 shadow-lg shadow-green-500/25"
                                : "bg-red-500/20 text-red-400 border-red-500/40 shadow-lg shadow-red-500/25"
                                }`}
                        >
                            {!isAuctionEnded ? "🔴 LIVE" : "⏹️ ENDED"}
                        </div>

                        {/* Action Buttons */}
                        {/* <div className="flex gap-2">
                            <button
                                onClick={handleFavorite}
                                className="w-8 h-8 bg-black/50 backdrop-blur-sm rounded-full flex items-center justify-center border border-gray-600/50 hover:border-green-500/50 transition-all duration-300 group/heart"
                            >
                                <Heart
                                    className={`w-4 h-4 transition-all duration-300 ${liked
                                        ? "text-red-500 fill-red-500 scale-110"
                                        : "text-gray-300 group-hover/heart:text-red-400 group-hover/heart:scale-110"
                                        }`}
                                />
                            </button>
                            <button
                                onClick={onShare}
                                className="w-8 h-8 bg-black/50 backdrop-blur-sm rounded-full flex items-center justify-center border border-gray-600/50 hover:border-green-500/50 transition-all duration-300 group/share"
                            >
                                <Share2 className="w-4 h-4 text-gray-300 group-hover/share:text-green-400 group-hover/share:scale-110 transition-all duration-300" />
                            </button>
                        </div> */}
                    </div>

                    {/* Bottom Title Overlay */}
                    <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/90 via-black/60 to-transparent p-4 transform translate-y-2 group-hover:translate-y-0 transition-transform duration-500">
                        <h3 className="text-white font-bold text-xl mb-1 truncate">{nftTitle}</h3>
                        {/* <div className="flex items-center gap-2 text-gray-300 text-sm">
                            <Eye className="w-4 h-4" />
                            <span>{viewCount.toLocaleString()} views</span>
                        </div> */}
                    </div>
                </div>
            </div>

            {/* Content Section */}
            <div className="p-6 space-y-6">
                {/* NFT Description */}
                <div className="space-y-2">
                    <p className="text-gray-300 text-sm leading-relaxed line-clamp-2">{nftDescription}</p>
                </div>

                {/* Bid Information Grid */}
                <div className="grid grid-cols-2 gap-4">
                    {/* Highest Bid */}
                    <div className="bg-gradient-to-br from-gray-800/60 to-gray-900/40 rounded-xl p-4 border border-gray-700/50 hover:border-green-500/30 transition-all duration-300 group/bid">
                        <div className="flex items-center gap-2 mb-3">
                            <div className="w-8 h-8 bg-gradient-to-r from-green-400 to-green-600 rounded-lg flex items-center justify-center">
                                <TrendingUp className="w-4 h-4 text-black" />
                            </div>
                            <span className="text-gray-400 text-sm font-semibold">Highest Bid:</span>
                        </div>
                        <div className="flex items-baseline gap-1">
                            <span className="text-white text-sm font-bold">{highestBid}</span>
                            <span className="text-green-400 text-sm font-bold">{currency}</span>
                        </div>
                        <div className="text-gray-500 text-xs mt-1">≈ ${(highestBid * perEthPrice).toFixed(9)} USD</div>
                    </div>

                    {/* Base Price */}
                    <div className="bg-gradient-to-br from-gray-800/60 to-gray-900/40 rounded-xl p-4 border border-gray-700/50 hover:border-green-500/30 transition-all duration-300 group/price">
                        <div className="flex items-center gap-2 mb-3">
                            <div className="w-8 h-8 bg-gradient-to-r from-green-400 to-green-600 rounded-lg flex items-center justify-center">
                                <DollarSign className="w-4 h-4 text-black" />
                            </div>
                            <span className="text-gray-400 text-sm font-semibold">Base Price:</span>
                        </div>
                        <div className="flex items-baseline gap-1">
                            <span className="text-white text-sm font-bold">{basePrice}</span>
                            <span className="text-green-400 text-md font-bold">{currency}</span>
                        </div>
                        <div className="text-gray-500 text-xs mt-1 flex justify-between items-center">
                            <span>≈ ${(basePrice * perEthPrice).toFixed(9)} USD</span>
                        </div>
                    </div>
                </div>

                {/* Auction End Time */}
                <div className="bg-gradient-to-r from-gray-800/40 to-green-900/20 rounded-xl p-4 border border-green-500/20">
                    <div className="flex items-center justify-center gap-3">
                        <div
                            className={`w-10 h-10 rounded-xl flex items-center justify-center 
        ${isAuctionEnded
                                    ? 'bg-red-600'
                                    : 'bg-gradient-to-r from-green-400 to-green-600'
                                }`}
                        >
                            {isAuctionEnded ? (
                                <TimerOff className="w-5 h-5 text-white" />
                            ) : (
                                <Clock className="w-5 h-5 text-black animate-pulse" />
                            )}
                        </div>

                        <div className="text-center">
                            {!isAuctionEnded && (
                                <div className="text-gray-300 font-semibold text-sm mb-1">
                                    Ends in:
                                </div>
                            )}
                            <AuctionTimer
                                auctionEndTime={auctionEndTime}
                                onAuctionEnd={() => setIsAuctionEnded(true)}
                            />
                        </div>
                    </div>
                </div>


                {/* Bid Input Section */}
                {showBidInput && !isAuctionEnded && (
                    <div className="bg-gray-800/50 rounded-xl p-4 border border-green-500/30 space-y-4">
                        <div className="flex items-center justify-between">
                            <span className="text-green-400 font-semibold">Enter your bid:</span>
                            <span className="text-gray-400 text-sm">
                                Min <span className="text-gray-400 font-semibold">{">"}</span> {highestBid} {currency}
                            </span>
                        </div>
                        <div className="flex gap-3">
                            <div className="flex-1 relative space-x-14 justify-between  ">
                                <div
                                    className=" w-full h-12 bg-gray-900/50 border-2 border-gray-700/50 focus:border-green-400 focus:ring-2 focus:ring-green-400/20 rounded-lg px-2 text-white font-semibold text-md placeholder:text-gray-500 transition-all duration-200"
                                >
                                    <input
                                        type="number"
                                        step="0.1"
                                        min={basePrice}
                                        value={bidAmount}
                                        onChange={(e) => setBidAmount(e.target.value)
                                        }
                                        placeholder={`${highestBid}`}
                                        className="border-none w-43 h-full bg-transparent outline-none text-white placeholder:text-gray-500"
                                    // className=" w-full h-12 bg-gray-900/50 border-2 border-gray-700/50 focus:border-green-400 focus:ring-2 focus:ring-green-400/20 rounded-lg px-2 text-white font-semibold text-md placeholder:text-gray-500 transition-all duration-200"
                                    />
                                    <span className="absolute right-2 top-1/2 -translate-y-1/2 text-green-400 font-bold">{currency}</span>
                                </div>
                            </div>
                            <button
                                onClick={handlePlaceBid}
                                disabled={!bidAmount || Number.parseFloat(bidAmount) <= highestBid}
                                className="px-6 h-12 bg-gradient-to-r from-green-600 to-green-500 hover:from-green-700 hover:to-green-600 disabled:from-gray-600 disabled:to-gray-500 text-black font-bold rounded-lg transition-all duration-300 transform hover:scale-105 active:scale-95 disabled:cursor-not-allowed disabled:transform-none"
                            >
                                Bid
                            </button>
                        </div>
                    </div>
                )}

                {/* Place Bid Button */}
                <div className="space-y-3">
                    {!showBidInput && !isAuctionEnded && (
                        <button
                            onClick={() => {
                                setShowBidInput(true);
                            }}
                            disabled={!isAuctionActive}
                            className="w-full h-16 bg-gradient-to-r from-green-600 via-green-500 to-green-400 hover:from-green-700 hover:via-green-600 hover:to-green-500 disabled:from-gray-600 disabled:via-gray-500 disabled:to-gray-400 text-black font-bold text-lg rounded-xl shadow-2xl shadow-green-500/25 hover:shadow-green-500/40 transition-all duration-300 transform hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none border border-green-400/20"
                        >
                            <div className="flex items-center justify-center gap-3">
                                <div className="w-6 h-6 bg-black/20 rounded-lg flex items-center justify-center">
                                    <Zap className="w-4 h-4 text-black" />
                                </div>
                                <span>{isAuctionActive ? "Place Bid" : "Auction Ended"}</span>
                                {isAuctionActive && <span className="text-black/70">💎</span>}
                            </div>
                        </button>
                    )}
                    {/* Additional Info */}
                    {!isAuctionEnded && (
                        <div className="text-center space-y-1">
                            <p className="text-gray-400 text-sm font-medium">
                                Minimum bid{" > "}
                                <span className="text-green-400 font-bold">
                                    {highestBid} {currency}
                                </span>
                            </p>
                            <p className="text-gray-500 text-xs">🔒 Secured by smart contract • Gas fees apply</p>
                        </div>
                    )}
                </div>
            </div>
        </div >
    )
}

export default AuctionNFTCard
