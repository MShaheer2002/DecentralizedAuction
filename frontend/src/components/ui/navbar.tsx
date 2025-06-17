// components/Navbar.tsx
import React from 'react';
import { Link } from 'react-router-dom';

const Navbar: React.FC = () => {
  return (
    <nav className="bg-black text-white p-4 shadow-md flex justify-between items-center">
      <div className="text-2xl font-bold">
        <Link to="/">Decentralized Auction</Link>
      </div>
      <div className="space-x-4">
        <Link to="/" className="hover:text-gray-300 font-semibold">Aution</Link>
        <Link to="/admin" className="hover:text-gray-300 font-semibold">Admin</Link>
      </div>
    </nav>
  );
};

export default Navbar;
