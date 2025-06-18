// WalletConnect.js
import { ethers } from 'ethers';

export const connectWallet = async () => {
    try {
        if (!window.ethereum) {
            alert("MetaMask not found. Please install it!");
            return;
        }
        const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
        const provider = new ethers.BrowserProvider(window.ethereum);
        const signer = await provider.getSigner();
        const address = await signer.getAddress();
        // console.log("Accounts:", accounts);
        // console.log("Connected to wallet:", address);
        // console.log("Signer:", signer);
        // console.log("Provider:", provider);
        return {
            address,
            signer,
            provider,
        };

    } catch (error) {
        console.error("Connection failed:", error);
    }
};
