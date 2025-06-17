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
    event AuctionStarted(uint indexed tokenId, uint endTime, uint basePrice);
    event NewBid(uint indexed tokenId, address bidder, uint amount);
    event AuctionEnded(uint indexed tokenId, address winner, uint amount);

    constructor() ERC721("AuctionNFT", "ANFT") {
        tokenCounter = 0;
    }

    function mintNFT(string memory tokenURI) public returns (uint) {
        uint tokenId = tokenCounter;
        _safeMint(owner, tokenId); // Mints to msg.sender
        _setTokenURI(tokenId, tokenURI);
        tokenCounter++;

        emit NFTMinted(tokenId, tokenURI);
        return tokenId;
    }

    function startAuction(uint tokenId, uint durationInSeconds, uint basePrice) external {
        // require(ownerOf(tokenId) == msg.sender, "You must own the NFT");
        require(!auctions[tokenId].exists, "Auction already exists");

        auctions[tokenId] = Auction({
            basePrice: basePrice,
            highestBid: 0,
            highestBidder: address(0),
            auctionEndTime: block.timestamp + durationInSeconds,
            auctionEnded: false,
            exists: true
        });

        emit AuctionStarted(tokenId, auctions[tokenId].auctionEndTime, basePrice);
    }

    function bid(uint tokenId) external payable {
        Auction storage auction = auctions[tokenId];
        require(auction.exists, "Auction doesn't exist");
        require(block.timestamp < auction.auctionEndTime, "Auction ended");

        // Check: is this the first bid?
        if (auction.highestBid == 0) {
            require(msg.value >= auction.basePrice, "Bid must be >= base price");
        } else {
            require(msg.value > auction.highestBid, "Bid too low");
            payable(auction.highestBidder).transfer(auction.highestBid); // refund previous
        }

        auction.highestBid = msg.value;
        auction.highestBidder = msg.sender;

        emit NewBid(tokenId, msg.sender, msg.value);
    }

    function endAuction(uint tokenId) external {
        Auction storage auction = auctions[tokenId];
        require(auction.exists, "Auction doesn't exist");
        require(block.timestamp >= auction.auctionEndTime, "Auction not ended yet");
        require(!auction.auctionEnded, "Already ended");

        auction.auctionEnded = true;

        address nftOwner = ownerOf(tokenId);

        if (auction.highestBidder != address(0)) {
            _transfer(nftOwner, auction.highestBidder, tokenId);
            payable(nftOwner).transfer(auction.highestBid);

            emit AuctionEnded(tokenId, auction.highestBidder, auction.highestBid);
        }
    }
}
