import React from 'react';
import { useNavigate } from 'react-router-dom';

const Navbar = () => {
  const navigate = useNavigate();

  return (
    <nav className="navbar">
      <button
        className="font-semibold px-4 py-2 bg-transparent text-black border-none cursor-pointer"
        onClick={() => navigate('/employee/home')}
      >
        Home
      </button>
      <button
        className="font-semibold px-4 py-2 bg-transparent text-black border-none cursor-pointer"
        onClick={() => navigate('/chat')}
      >
        Chat
      </button>
      <button
        className="font-semibold px-4 py-2 bg-transparent text-black border-none cursor-pointer"
        onClick={() => navigate('/employee/profile')}
      >
        Profile
      </button>
      <button
        className="font-semibold px-4 py-2 bg-transparent text-black border-none cursor-pointer"
        onClick={() => navigate('/login')}
      >
        Logout
      </button>
    </nav>
  );
};

export default Navbar;