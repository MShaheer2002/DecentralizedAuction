"use client"
import { useState, useEffect } from "react"
import { Search, Zap, } from "lucide-react"
import AuctionNFTCard from "@/components/ui/auction-nft-card"
import axios from "axios"
import { useDispatch } from "react-redux"
import { setLoading } from '../../../redux/slices/loadingSlice';
export const UserSide = () => {
    const [auctionData, setAuctionData] = useState<any[]>([])
    const dispatch = useDispatch()
    const [ethPrice, setEthPrice] = useState<number>(0)

    const handleGetNFT = async () => {
        try {
            dispatch(setLoading(true));
            const response = await axios.get("http://localhost:3000/api/nft/all-auctions")
            console.log("NFTs fetched successfully:", response.data.data)
            setAuctionData(response.data.data)
        } catch (error) {
            console.error("Error fetching NFTs:", error)
            alert("Failed to fetch NFTs. Please try again later.")
        } finally {
            dispatch(setLoading(false));
        }
    }
    const getHighestBid = (bids: any[], basePrice: number): number => {
        if (!bids || bids.length === 0) {
            return basePrice;
        }
        const bidAmounts = bids.map((bid: any) => Number(bid.amount));
        const highestBid = Math.max(...bidAmounts);
        return highestBid.toFixed(9);
    };
    useEffect(() => {

        handleGetNFT();
        fetchETHPrice();
    }, [])

    const fetchETHPrice = async () => {
        try {
            dispatch(setLoading(true));
            const res = await axios.get(
                "https://api.coingecko.com/api/v3/simple/price?ids=ethereum&vs_currencies=usd"
            );
            const price = res.data.ethereum.usd;
            setEthPrice(price);
            console.log("ETH Price:", price);
        } catch (err) {
            console.error("Error fetching ETH price:", err);
        }
        finally {
            dispatch(setLoading(false));
        }
    };
    return (
        <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-gray-800 font-['Poppins']">
            <div className="fixed inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(34,197,94,0.1),transparent_50%)] pointer-events-none" />
            <div className="fixed inset-0 bg-[radial-gradient(circle_at_80%_20%,rgba(34,197,94,0.05),transparent_50%)] pointer-events-none" />

            <div className="relative">
                <div className="bg-gray-900/50 backdrop-blur-xl border-b border-green-500/20 sticky top-0 z-50">
                    <div className="max-w-7xl mx-auto px-4 py-6">
                        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
                            <div className="flex items-center gap-6">
                                <div>
                                    <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-white via-green-100 to-green-400 bg-clip-text text-transparent">
                                        Live Auctions
                                    </h1>
                                    <p className="text-gray-300 font-medium mt-1">
                                        Discover and bid on exclusive NFT collections
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="max-w-7xl mx-auto px-4 py-8">
                    <div className="mb-8">
                        <div className="flex items-center justify-between">
                            <p className="text-gray-300 font-medium">
                                Showing {auctionData.length} of {auctionData.length} auctions

                            </p>
                        </div>
                    </div>

                    {auctionData.length > 0 ? (
                        <div className="grid gap-8 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
                            {auctionData.map((auction) => (
                                <AuctionNFTCard
                                    key={auction._id}
                                    perEthPrice={ethPrice}
                                    nftImage={auction.imageUrl}
                                    tokenId={auction.tokenId}
                                    nftTitle={auction.NFTname}
                                    nftDescription={auction.NFTdescription}
                                    highestBid={getHighestBid(auction.bids, auction.basePrice)}
                                    basePrice={auction.basePrice}
                                    auctionEndTime={auction.auctionEndTime}
                                    isLiked={auction.isLiked}
                                    viewCount={auction.viewCount}
                                />
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-16">
                            <div className="w-24 h-24 bg-gray-800/50 rounded-full flex items-center justify-center mx-auto mb-6">
                                <Search className="w-12 h-12 text-gray-500" />
                            </div>a
                            <h3 className="text-2xl font-bold text-white mb-2">No auctions found</h3>
                            <p className="text-gray-400 font-medium">
                                Try adjusting your search terms or filters to find what you're looking for.
                            </p>
                        </div>
                    )}
                </div>

                <div className="bg-gray-900/50 backdrop-blur-xl border-t border-green-500/20 mt-16">
                    <div className="max-w-7xl mx-auto px-4 py-8">
                        <div className="text-center">
                            <div className="inline-flex items-center gap-2 mb-4">
                                <Zap className="w-6 h-6 text-green-400" />
                                <span className="text-green-400 font-bold text-lg">Decentralized Auctions</span>
                            </div>
                            <p className="text-gray-400 font-medium">
                                Powered by blockchain technology • Secure • Transparent • Decentralized
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
