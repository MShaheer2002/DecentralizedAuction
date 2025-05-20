import { ethers } from "ethers";
import * as dotenv from "dotenv";
import contractJson from "../../artifacts/contracts/Auction.sol/AuctionContract.json";
dotenv.config();

const provider = new ethers.JsonRpcProvider(process.env.RPC_URL);
const wallet = new ethers.Wallet(process.env.PRIVATE_KEY!, provider);

export const auctionContract = new ethers.Contract(
    process.env.CONTRACT_ADDRESS!,
    contractJson.abi,
    wallet
);
