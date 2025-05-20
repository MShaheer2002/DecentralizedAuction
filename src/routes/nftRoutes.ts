import express from "express";
import multer from "multer";
import { Auction } from "../models/auction";
import { uploadToPinata, uploadMetadataToPinata } from "../utils/pinata";
import { auctionContract } from "../utils/web3";

const router = express.Router();
const upload = multer({ dest: "uploads/" });

router.post("/upload", upload.single("image"), async (req, res) => {
    try {

        const imageCID = await uploadToPinata(req.file!.path);
        const metadata = {
            name: req.body.name,
            description: req.body.description,
            image: `ipfs://${imageCID}`,
        };
        const metadataCID = await uploadMetadataToPinata(metadata);

        res.json({
            metadataCID,
            imageCID,
            tokenURI: `ipfs://${metadataCID}`,
        });
    } catch (err) {
        console.error("Upload failed:", err);
        res.status(500).json({ error: "Failed to upload to IPFS" });
    }
});

router.post("/startAuction", async (req, res) => {

    try {
        const { name, description, imageCID, metadataCID, tokenId, auctionEndTime } = req.body;

        if (!name || !description || !imageCID || !metadataCID || !tokenId || !auctionEndTime) {
            res.status(400).json({ success: "Failed", message: "Data missing!" });
            return;
        }

        const strAuc = await auctionContract.startAuction(tokenId, auctionEndTime);
        await strAuc.wait();


        const auction = new Auction({ name, description, imageCID, metadataCID, tokenId, auctionEndTime });

        auction.save();
        res.status(200).json({ success: "Success", data: auction, strAucHash: strAuc.hash });

        return;


    } catch (err) {
        console.error("Upload failed:", err);
        res.status(500).json({ error: "Server Error" });
    }

});

export default router;
