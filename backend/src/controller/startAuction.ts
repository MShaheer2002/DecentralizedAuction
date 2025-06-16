// import express, { Request, Response } from "express";
// import { AuctionModel } from "../models/auction";
// import { auctionContract } from "../utils/web3";

// const router = express.Router();

// router.post("/start-auction", async (req: Request, res: Response): Promise<void> => {
//     try {
//         const { name, description, tokenURI, auctionDuration } = req.body;

//         const mintTx = await auctionContract.mintNFT(tokenURI);
//         const mintReceipt = await mintTx.wait();

//         const tokenId = (await auctionContract.tokenCounter()).toNumber() - 1;

//         if (tokenId === undefined) {
//             res.status(500).json({ error: "Unable to fetch tokenId" });
//         }

//         const startAuctionTx = await auctionContract.startAuction(tokenId, auctionDuration);
//         await startAuctionTx.wait();

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
