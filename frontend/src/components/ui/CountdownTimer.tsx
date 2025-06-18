import React, { useEffect, useState } from "react";

const AuctionTimer = ({ auctionEndTime, onAuctionEnd }) => {
  const [timeLeft, setTimeLeft] = useState(getTimeLeft(auctionEndTime));

  useEffect(() => {
    const interval = setInterval(() => {
      const remaining = getTimeLeft(auctionEndTime);
      setTimeLeft(remaining);

      if (remaining === "Auction Ended") {
        clearInterval(interval);
        onAuctionEnd?.(); // Call the callback if provided
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [auctionEndTime, onAuctionEnd]);

  return (
    <div className="text-sm text-gray-400 font-semibold">
      {timeLeft === "Auction Ended" ? (
        <span className="text-red-500 font-bold">Auction Ended</span>
      ) : (
        <span>⏳ {timeLeft} left</span>
      )}
    </div>
  );
};

function getTimeLeft(auctionEndTime) {
  const end = new Date(auctionEndTime).getTime();
  const now = new Date().getTime();
  const diff = end - now;

  if (diff <= 0) return "Auction Ended";

  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
  const minutes = Math.floor((diff / (1000 * 60)) % 60);
  const seconds = Math.floor((diff / 1000) % 60);

  return `${days}d ${hours}h ${minutes}m ${seconds}s`;
}

export default AuctionTimer;
