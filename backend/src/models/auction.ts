import mongoose from "mongoose";

const bidSchema = new mongoose.Schema({
  bidder: { type: String, required: true },
  amount: { type: Number, required: true },
  time: { type: Date, default: Date.now },
});

const auctionSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: { type: String, required: true },
  imageCID: { type: String, required: true },
  metadataCID: { type: String, required: true },
  tokenId: { type: Number, required: true },
  auctionEndTime: { type: Number, required: true },
  highestBid: { type: Number },
  highestBidder: { type: String },
  bids: [bidSchema], 
});

export const Auction = mongoose.model("Auction", auctionSchema);
