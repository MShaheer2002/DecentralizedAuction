import { ethers } from "hardhat";

async function main() {
    const Auction = await ethers.getContractFactory("AuctionContract");
    const auction = await Auction.deploy();
    await auction.waitForDeployment();

    const address = await auction.getAddress();

    console.log(`Auction Contract deployed at: ${address}`);
}


main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});