import express from "express";
import multer from "multer";
import { uploadToPinata, uploadMetadataToPinata } from "../utils/pinata";

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

export default router;
