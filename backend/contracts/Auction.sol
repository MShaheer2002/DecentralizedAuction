// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";

contract AuctionContract is ERC721URIStorage {
    uint public tokenCounter;
    address owner = msg.sender;

    struct Auction {
        uint basePrice;
        uint highestBid;
        address highestBidder;
        uint auctionEndTime;
        bool auctionEnded;
        bool exists;
    }

    mapping(uint => Auction) public auctions;

    event NFTMinted(uint indexed tokenId, string tokenURI);
    event AuctionStarted(uint indexed tokenId, uint endTime, uint basePrice, uint startTime);
    event NewBid(uint indexed tokenId, address bidder, uint amount);
    event AuctionEnded(uint indexed tokenId, address winner, uint amount);

    constructor() ERC721("AuctionNFT", "ANFT") {
        tokenCounter = 0;
    }

    modifier onlyOwner() {
        require(msg.sender == owner, "Not the contract owner");
        _;
    }

    // Mints a new NFT and returns the token ID
    function mintNFT(string memory tokenURI) public onlyOwner returns (uint) {
        uint tokenId = tokenCounter;
        // mint tokenId to the owner
        _safeMint(owner, tokenId); 
        // set the token URI
        _setTokenURI(tokenId, tokenURI);
        tokenCounter++;

        emit NFTMinted(tokenId, tokenURI);
        return tokenId;
    }

    // Starts a new auction for the specified token ID
    function startAuction(uint tokenId, uint durationInSeconds, uint basePrice) external onlyOwner() {
        
        require(!auctions[tokenId].exists, "Auction already exists");
        uint currentTime = block.timestamp;
        // Add the new Auction to the struct
        auctions[tokenId] = Auction({
            basePrice: basePrice,
            highestBid: 0,
            highestBidder: address(0),
            auctionEndTime: currentTime+ durationInSeconds,
            auctionEnded: false,
            exists: true
        });

        emit AuctionStarted(tokenId, auctions[tokenId].auctionEndTime, basePrice, currentTime);
    }

    // Places a bid on the specified auction
    function bid(uint tokenId) external payable {
        Auction storage auction = auctions[tokenId];
        require(auction.exists, "Auction doesn't exist");
        require(block.timestamp < auction.auctionEndTime, "Auction ended");

        // Check: is this the first bid?
        if (auction.highestBid == 0) {
            require(msg.value >= auction.basePrice, "Bid must be >= base price");
        } else {
            // Check: is this bid higher than the current highest bid?
            require(msg.value > auction.highestBid, "Bid too low");
            payable(auction.highestBidder).transfer(auction.highestBid); // refund previous
        }

        // Update the auction with the new highest bid and bidder
        auction.highestBid = msg.value;
        auction.highestBidder = msg.sender;

        emit NewBid(tokenId, msg.sender, msg.value);
    }

    // Ends the specified auction and transfers the NFT to the winner
    function endAuction(uint tokenId) external onlyOwner{
        Auction storage auction = auctions[tokenId];
        require(auction.exists, "Auction doesn't exist");
        require(block.timestamp >= auction.auctionEndTime, "Auction not ended yet");
        require(!auction.auctionEnded, "Already ended");

        // set current auction as ended
        auction.auctionEnded = true;

        // get the owner of the NFT
        address nftOwner = ownerOf(tokenId);

        if (auction.highestBidder != address(0)) {
            // transfer the NFT to the highest bidder
            _transfer(nftOwner, auction.highestBidder, tokenId);
            // transfer the highest bid amount to the NFT owner
            payable(nftOwner).transfer(auction.highestBid);

            emit AuctionEnded(tokenId, auction.highestBidder, auction.highestBid);
        }
    }
}