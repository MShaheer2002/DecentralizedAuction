"use client"
import { useState, useEffect } from "react"
import { Search, Zap, TrendingUp } from "lucide-react"
import AuctionNFTCard from "@/components/ui/auction-nft-card"
import axios from "axios"
import { useDispatch } from "react-redux"
import { setLoading } from '../../../redux/slices/loadingSlice';
export const UserSide = () => {
    const [searchTerm, setSearchTerm] = useState("")
    const [filterBy, setFilterBy] = useState<"all" | "live" | "ending" | "new">("all")
    const [auctionData, setAuctionData] = useState<any[]>([])
    const [timeLeft, setTimeLeft] = useState<string>("")
    const dispatch = useDispatch<UseDispatch>()
    const [ethPrice, setEthPrice] = useState<number>(0)
    const handlePlaceBid = (bidAmount: number) => {
        console.log(`Bid placed: ${bidAmount} ETH`)
        alert(`Bid of ${bidAmount} ETH placed successfully!`)
    }

    const handleGetNFT = async () => {
        try {
            dispatch(setLoading(true));
            const response = await axios.get("http://localhost:3000/api/nft/all-auctions")
            console.log("NFTs fetched successfully:", response.data.data)
            setAuctionData(response.data.data)
            // const auctions = response.data.data
        } catch (error) {
            console.error("Error fetching NFTs:", error)
            alert("Failed to fetch NFTs. Please try again later.")
        }finally{
            dispatch(setLoading(false));
        }
    }
    useEffect(() => {
        handleGetNFT()
    }, [])
    const fetchETHPrice = async () => {
        try {
            const res = await axios.get(
                "https://api.coingecko.com/api/v3/simple/price?ids=ethereum&vs_currencies=usd"
            );
            const price = res.data.ethereum.usd;
            setEthPrice(price);
            console.log("ETH Price:", price);
        } catch (err) {
            console.error("Error fetching ETH price:", err);
        }
    };

    const handleFavorite = () => {
        console.log("Added to favorites")
    }

    const handleShare = () => {
        console.log("Sharing NFT")
        if (navigator.share) {
            navigator.share({
                title: "Check out this amazing NFT!",
                text: "Amazing digital artwork on auction",
                url: window.location.href,
            })
        }
    }

    const auctions = [
        {
            id: 1,
            nftTitle: "Digital Masterpiece #001",
            nftDescription: "A stunning piece of digital art that captures the essence of modern creativity and blockchain innovation.",
            highestBid: 2.5,
            basePrice: 1.0,
            endTime: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000),
            isLiked: false,
            viewCount: 1247,

        },
        {
            id: 2,
            nftTitle: "Cosmic Dreams #042",
            nftDescription: "An ethereal journey through space and time...",
            highestBid: 5.2,
            basePrice: 2.0,
            endTime: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000),
            isLiked: true,
            viewCount: 2847,
        },
        {
            id: 3,
            nftTitle: "Abstract Vision #123",
            nftDescription: "A mesmerizing blend of geometric patterns...",
            highestBid: 8.7,
            basePrice: 3.5,
            endTime: new Date(Date.now() - 60 * 60 * 1000), // Ended
            isLiked: false,
            viewCount: 5432,
        },
    ]

    const filteredAuctions = auctions.filter((auction) => {
        const matchesSearch = auction.nftTitle.toLowerCase().includes(searchTerm.toLowerCase())
        const now = new Date()
        const isLive = auction.endTime > now

        switch (filterBy) {
            case "live":
                return matchesSearch && isLive
            case "ending":
                return matchesSearch && isLive && auction.endTime.getTime() - now.getTime() < 24 * 60 * 60 * 1000
            case "new":
                return matchesSearch && isLive && auction.highestBid === auction.basePrice
            default:
                return matchesSearch
        }
    })

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
                                    <button onClick={() => { fetchETHPrice() }} className="bg-gray-800/50 hover:bg-gray-700/50 transition-colors rounded-lg px-4 py-2 flex items-center gap-2 border border-green-500/20">
                                        <p>
                                            fetch Ether price
                                        </p>
                                    </button>
                                    <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-white via-green-100 to-green-400 bg-clip-text text-transparent">
                                        Live Auctions
                                    </h1>
                                    <p className="text-gray-300 font-medium mt-1">
                                        Discover and bid on exclusive NFT collections
                                    </p>
                                </div>

                                <div className="hidden md:flex items-center gap-4">
                                    <div className="bg-gray-800/50 rounded-lg px-3 py-2 border border-green-500/20">
                                        <div className="flex items-center gap-2">
                                            <TrendingUp className="w-4 h-4 text-green-400" />
                                            <span className="text-white font-semibold text-sm">{auctions.length}</span>
                                            <span className="text-gray-400 text-xs">Active</span>
                                        </div>
                                    </div>
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
                                {searchTerm && <span className="text-green-400 ml-1">for "{searchTerm}"</span>}
                            </p>
                        </div>
                    </div>

                    {auctionData.length > 0 ? (
                        <div className="grid gap-8 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
                            {auctionData.map((auction) => (
                                <AuctionNFTCard
                                    key={auction.id}
                                    nftImage={auction.imageUrl}
                                    tokenId={auction.tokenId}
                                    nftTitle={auction.NFTname}
                                    nftDescription={auction.NFTdescription}
                                    highestBid={auction.highestBid}
                                    basePrice={auction.basePrice}
                                    endTime={auction.endTime}
                                    onPlaceBid={handlePlaceBid}
                                    onFavorite={handleFavorite}
                                    onShare={handleShare}
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
