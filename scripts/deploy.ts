import { ethers } from "hardhat";

async function main() {
    const Test = await ethers.getContractFactory("TestContract");
    const test = await Test.deploy();
    await test.waitForDeployment();

    const address = await test.getAddress();

    console.log(`TestContract deployed at: ${address}`);
}


main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});