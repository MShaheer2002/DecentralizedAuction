// utils/getAuctionContract.js
import { ethers } from "ethers";
import AuctionABI from "../../../backend/artifacts/contracts/Auction.sol/AuctionContract.json";

// Load contract address from environment or fallback to a hardcoded one
const CONTRACT_ADDRESS =
    "0xfdCd6f5aFec2E6CA25a60334673762c2CF2dfC10";

/**
 * Returns an instance of the auction contract
 * @param {ethers.Signer} signer - Signer from MetaMask (for write operations)
 * @returns {ethers.Contract} AuctionContract instance
 */
export const getAuctionContract = (signer) => {
    try {
        if (!signer) {
            throw new Error("Signer is undefined. Make sure MetaMask is connected.");
        }

        if (!CONTRACT_ADDRESS) {
            throw new Error("Contract address is missing.");
        }

        // Log available functions for debugging
        console.log(
            "Auction Contract ABI Methods:",
            AuctionABI.abi.map((i) => i.name).filter(Boolean)
        );

        const contract = new ethers.Contract(CONTRACT_ADDRESS, AuctionABI.abi, signer);
        console.log("Contract connected at:", CONTRACT_ADDRESS);
        return contract;
    } catch (error) {
        console.error("❌ Error getting Auction contract:", error.message);
        throw error;
    }
};
