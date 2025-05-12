// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract NFTAuction is ERC721URIStorage, Ownable {
    uint public tokenCounter;
    uint public highestBid;
    address public highestBidder;
    bool public auctionEnded;

    uint public auctionEndTime;

    constructor() ERC721("AuctionNFT", "ANFT") {
        tokenCounter = 0;
    }
    event AuctionStarted(uint indexed tokenId, uint endTime);
    event NewBid(uint indexed tokenId, address bidder, uint amount);
    event AuctionEnded(uint indexed tokenId, address winner, uint amount);
    event NFTMinted(uint indexed tokenId, string tokenURI);

    function mintNFT(string memory tokenURI) public onlyOwner returns (uint) {
        uint tokenId = tokenCounter;
        _safeMint(owner(), tokenId);
        _setTokenURI(tokenId, tokenURI);
        tokenCounter++;
        emit NFTMinted(tokenId, tokenURI);

        return tokenId;
    }

    function startAuction(uint durationInSeconds) external onlyOwner {
        auctionEndTime = block.timestamp + durationInSeconds;
        auctionEnded = false;
        highestBid = 0;
        highestBidder = address(0);
        emit AuctionStarted(tokenCounter - 1, auctionEndTime);
    }

    function bid() external payable {
        require(block.timestamp < auctionEndTime, "Auction ended");
        require(msg.value > highestBid, "Bid too low");

        if (highestBid > 0) {
            payable(highestBidder).transfer(highestBid); // Refund old bid
        }

        highestBid = msg.value;
        highestBidder = msg.sender;
        emit NewBid(tokenCounter - 1, msg.sender, msg.value);
    }

    function endAuction(uint tokenId) external onlyOwner {
        require(block.timestamp >= auctionEndTime, "Auction not yet ended");
        require(!auctionEnded, "Already ended");

        auctionEnded = true;
        if (highestBidder != address(0)) {
            _transfer(owner(), highestBidder, tokenId);
            payable(owner()).transfer(highestBid); // Transfer funds
            emit AuctionEnded(tokenId, highestBidder, highestBid);
        }
    }
}
