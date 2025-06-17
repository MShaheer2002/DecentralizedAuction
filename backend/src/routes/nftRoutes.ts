import express, { Request, Response } from "express";
import multer from "multer";
import { AuctionModel } from "../models/auction";
import { uploadToPinata, uploadMetadataToPinata } from "../utils/pinata";
import { auctionContract } from "../utils/web3";
import { Log, LogDescription } from "ethers";
import { Console } from "console";
import { parseEther } from "ethers";




const router = express.Router();
const upload = multer({ dest: "uploads/" });

router.post("/upload", upload.single("image"), async (req: Request, res: Response): Promise<void> => {
    try {
        // Upload image to Pinata
        const imageCID = await uploadToPinata(req.file!.path);
        const imageURI = `ipfs://${imageCID}`;

        // Create metadata
        const metadata = {
            name: req.body.name,
            description: req.body.description,
            image: imageURI,
        };

        // Upload metadata to Pinata
        const metadataCID = await uploadMetadataToPinata(metadata);
        const tokenURI = `ipfs://${metadataCID}`;

        // Mint NFT on blockchain
        const mintTx = await auctionContract.mintNFT(tokenURI);
        const receipt = await mintTx.wait();

        // console.log("All logs:", receipt.logs.map(log => log.topics));

        // 🔍 Get tokenId from the event
        // const tokenId = (receipt.logs as Log[])
        //     ?.map(log => auctionContract.interface.parseLog(log))
        //     .find(parsed => parsed?.name === "NFTMinted")
        //     ?.args?.tokenId.toString();

        let tokenId: string | undefined;

        // Filter only logs from your AuctionContract 
        for (const log of receipt.logs as Log[]) {
            try {
                const parsed = auctionContract.interface.parseLog(log) as LogDescription;
                if (parsed.name === "NFTMinted") {
                    tokenId = parsed.args.tokenId.toString();
                    break;
                }
            } catch (err) {
                console.error("Failed to parse log:", err);
            }
        }
        // Invalid log — skip it


        if (!tokenId) {
            res.status(500).json({ error: "Mint failed: tokenId missing" });
            return;
        }

        const auction = await AuctionModel.create({
            NFTname: req.body.name,
            NFTdescription: req.body.description,
            tokenId: tokenId, // default 0, will 
            tokenURI: tokenURI,
            imageUrl: `https://gateway.pinata.cloud/ipfs/${imageCID}`,
            bids: [],
        });

        if (auction) {
            // Send back response
            res.status(200).json({
                message: "NFT minted and uploaded successfully",
                metadataCID,
                imageCID,
                tokenURI,
                tokenId,
            });
            return;
        }

        res.status(400).json({ "error": "Auction not created!" });

    } catch (err) {
        console.error("Upload + Mint error:", err);
        res.status(500).json({ error: "Failed to upload and mint NFT" });
    }
});

router.post("/start-auction", async (req: Request, res: Response): Promise<void> => {
    try {
        const { tokenId, durationInSeconds, basePrice } = req.body;

        if (tokenId === undefined || durationInSeconds === undefined || basePrice === undefined) {
            res.status(400).json({ error: "tokenId, durationInSeconds, and basePrice are required" });
            return;
        }

        // Convert basePrice to wei using parseEther
        const basePriceWei = parseEther(basePrice.toString());

        // Call smart contract to start auction
        const tx = await auctionContract.startAuction(tokenId, durationInSeconds, basePriceWei);
        const receipt = await tx.wait();

        // Parse the AuctionStarted event
        const parsedLog = (receipt.logs as Log[])
            .map(log => {
                try {
                    return auctionContract.interface.parseLog(log);
                } catch {
                    return null;
                }
            })
            .find(parsed => parsed?.name === "AuctionStarted");

        if (!parsedLog) {
            res.status(500).json({ error: "AuctionStarted event not found" });
            return;
        }

        const auctionEndTime = parsedLog.args.endTime.toString();
        const auctionEndDate = new Date(parseInt(auctionEndTime) * 1000);

        await AuctionModel.findOneAndUpdate(
            { tokenId },
            {
                auctionStarted: true,
                auctionEnded: false,
                auctionStartTime: new Date(),
                auctionEndTime: auctionEndDate,
                basePrice: basePrice
            },
            { new: true }
        );

        res.status(200).json({
            message: "Auction started successfully",
            tokenId,
            auctionEndTime: auctionEndDate
        });
    } catch (err) {
        console.error("Start auction error:", err);
        res.status(500).json({ error: "Failed to start auction" });
    }
});



router.post("/record-bid", async (req: Request, res: Response): Promise<void> => {
    try {
        const { tokenId, bidder, amount } = req.body;

        if (!tokenId || !bidder || !amount) {
            res.status(400).json({ error: "tokenId, bidder, and amount are required." });
            return;
        }

        // Convert amount to number (ETH or wei, depending on frontend format)
        const bidAmount = Number(amount);

        // Save to MongoDB
        const updatedAuction = await AuctionModel.findOneAndUpdate(
            { tokenId },
            {
                $push: {
                    bids: {
                        bidder,
                        amount: bidAmount,
                        time: new Date(),
                    },
                },
            },
            { new: true }
        );

        if (!updatedAuction) {
            res.status(404).json({ error: "Auction not found." });
            return;
        }

        res.json({
            message: "Bid recorded successfully",
            tokenId,
            bidder,
            amount: bidAmount,
        });
    } catch (err) {
        console.error("Record bid error:", err);
        res.status(500).json({ error: "Failed to record bid" });
    }
});

router.post("/end-auction", async (req: Request, res: Response): Promise<void> => {
    try {
        const { tokenId } = req.body;

        if (tokenId === undefined) {
            res.status(400).json({ error: "tokenId is required" });
            return;
        }

        // End auction via smart contract
        const tx = await auctionContract.endAuction(tokenId);
        const receipt = await tx.wait();

        // Optional: Extract event from logs
        const endedEvent = (receipt.logs as Log[])
            .map(log => {
                try {
                    return auctionContract.interface.parseLog(log);
                } catch {
                    return null;
                }
            })
            .find(log => log?.name === "AuctionEnded");

        let winner = "";
        let finalBid = 0;

        if (endedEvent) {
            winner = endedEvent.args?.winner;
            finalBid = endedEvent.args?.amount.toString();
        }

        // Update MongoDB
        await AuctionModel.findOneAndUpdate(
            { tokenId },
            {
                auctionEnded: true,
                auctionEndedAt: new Date(),
                ...(winner && { winner }),
                ...(finalBid && { finalBid }),
            }
        );

        res.json({
            message: "Auction ended successfully",
            tokenId,
            winner,
            finalBid,
        });
    } catch (err) {
        console.error("End auction error:", err);
        res.status(500).json({ error: "Failed to end auction" });
    }
});


router.get("/all-auctions", async (req: Request, res: Response): Promise<void> => {
    try {
        const auctions = await AuctionModel.find().sort({ mintedAt: -1 }); // sorted by newest first

        res.status(200).json({
            success: true,
            data: auctions,
        });
    } catch (error) {
        console.error("Error fetching auctions:", error);
        res.status(500).json({
            success: false,
            error: "Failed to fetch auctions",
        });
    }
});



export default router;
