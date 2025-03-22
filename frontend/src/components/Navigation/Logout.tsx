import React from 'react';
import { useState, useEffect } from "react";
import { useNavigate } from 'react-router-dom';
import Cookies from "js-cookie";

const Logout: React.FC = () => {
    const [isLoggedin, setIsLoggedin] = useState(true);
    const navigate = useNavigate();

    const handleLogout = () => {
        const accessToken = Cookies.get("access_token");
        if (accessToken) {
          // Step 1: Revoke the Google OAuth2 access token
          fetch(`https://oauth2.googleapis.com/revoke?token=${accessToken}`, {
            method: 'POST',
          })
            .then(() => {
              // Step 2: Remove the access token from cookies
              Cookies.remove("access_token");
              setIsLoggedin(false);
            })
            .catch((error) => {
              console.error("Error revoking access token", error);
            });
        } else {
          // If no access token is found, just clear the login state
          Cookies.remove("access_token");
          setIsLoggedin(false);
          window.location.href = "http://localhost:5173/";  // Redirect after logout
        }
      };
    
    useEffect(() => {
        if (!isLoggedin) {
            navigate('/');
        }
    }, [isLoggedin, navigate]);

    return (
        <div className="flex items-center gap-2 p-2 hover:bg-red-300 cursor-pointer" onClick={handleLogout}>
            <img className="w-6 h-6" src="./menu_icons/logout.png" alt="logout icon" />
            <span>Logout</span>
        </div>
    );
};

export default Logout;