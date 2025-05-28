// import express from "express";
// import { AuctionModel } from "../models/auction";
// import  {AuctionContract}  from "../../contracts/Auction.sol";
// import { sendTx } from "../utils/tx"; // optional helper to abstract transaction sending

// const router = express.Router();

// router.post("/start-auction", async (req, res) => {
//     try {
//         const { name, description, tokenURI, auctionDuration } = req.body;

//         // Mint NFT
//         const mintTx = await nftContract.methods
//             .mintNFT(tokenURI)
//             .send({ from: process.env.OWNER_ADDRESS });

//         const tokenId = await nftContract.methods.tokenCounter().call() - 1;

//         // Start auction
//         await nftContract.methods
//             .startAuction(auctionDuration)
//             .send({ from: process.env.OWNER_ADDRESS });

//         // Save to DB
//         const auction = await AuctionModel.create({
//             name,
//             description,
//             imageCID: tokenURI.replace("ipfs://", ""),
//             metadataCID: tokenURI.replace("ipfs://", ""),
//             tokenId,
//             auctionEndTime: Date.now() + auctionDuration * 1000,
//             highestBid: 0,
//             highestBidder: "",
//             bidders: [],
//         });

//         res.json({ message: "Auction started", tokenId, auction });
//     } catch (err) {
//         console.error("Auction error:", err);
//         res.status(500).json({ error: "Failed to start auction" });
//     }
// });

// export default router;
