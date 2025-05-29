import axios from "axios";
import fs from "fs";
import FormData from "form-data";
import dotenv from "dotenv";

dotenv.config();

const PINATA_API = "https://api.pinata.cloud";

export async function uploadToPinata(filePath: string) {
    const data = new FormData();
    data.append("file", fs.createReadStream(filePath));

    const res = await axios.post(`${PINATA_API}/pinning/pinFileToIPFS`, data, {
        maxContentLength: Infinity,
        headers: {
            ...data.getHeaders(),
            pinata_api_key: process.env.PINATA_API_KEY,
            pinata_secret_api_key: process.env.PINATA_SECRET_API_KEY,
        },

    });
    return res.data.IpfsHash;

}

export async function uploadMetadataToPinata(metadata: object) {
    const res = await axios.post(`${PINATA_API}/pinning/pinJSONToIPFS`, metadata, {
        headers: {
            pinata_api_key: process.env.PINATA_API_KEY!,
            pinata_secret_api_key: process.env.PINATA_SECRET_API_KEY!,
        },
    });

    return res.data.IpfsHash;
}