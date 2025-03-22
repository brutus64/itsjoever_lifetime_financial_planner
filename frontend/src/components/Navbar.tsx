import React from 'react';

const Navbar: React.FC = () => {
    return (
        <nav className="flex items-center justify-between px-4 py-2 bg-white shadow-md">
          {/* Left Section: Hamburger + Name */}
          <div className="flex items-center gap-2">
            <div className="text-2xl cursor-pointer">☰</div> {/* Hamburger Icon */}
            <span className="font-bold">Joe B.</span>
          </div>
    
          {/* Right Section: Icons + Share Button */}
          <div className="flex items-center gap-3">
            <div className="cursor-pointer">⋮</div> {/* Three Dots Icon */}
            <button className="bg-black text-white px-4 py-1 rounded-md">Share</button>
            <img 
              src="currypfp.jpg" 
              alt="Profile" 
              className="w-8 h-8 rounded-full border"
            />
          </div>
        </nav>
      );
    };

export default Navbar;