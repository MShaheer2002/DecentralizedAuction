import mongoose from "mongoose";

const bidSchema = new mongoose.Schema({
  bidder: { type: String, required: true },
  amount: { type: Number, required: true },
  time: { type: Date, default: Date.now },
});

const auctionSchema = new mongoose.Schema({
  NFTname: { type: String, required: true },
  NFTdescription: { type: String, required: true }  ,
  tokenId: { type: Number, required: true },
  tokenURI: { type: String, required: true },
  auctionStarted: { type: Boolean, default: false },
  auctionEnded: { type: Boolean, default: false },
  imageUrl: { type: String, required: true },
  mintedAt: { type: Date, default: Date.now },
  auctionStartTime: { type: Date, default: Date.now },
  auctionEndTime: { type: Date, default: Date.now },
  basePrice: { type: String }, // Base price in ETH or wei
  bids: [bidSchema],
});

export const AuctionModel = mongoose.model("Auction", auctionSchema);
