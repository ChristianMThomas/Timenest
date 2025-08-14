import React from 'react';
import { useNavigate } from 'react-router-dom';

const M_navbar = () => {
  const navigate = useNavigate();

  return (
    <nav className="navbar">
      <button
        className="font-semibold px-4 py-2 bg-transparent text-black border-none cursor-pointer"
        onClick={() => navigate('/manager/home')}
      >
        Home
      </button>
    
      <button
        className="font-semibold px-4 py-2 bg-transparent text-black border-none cursor-pointer"
        onClick={() => navigate('/manager/profile')}
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

export default M_navbar;