import { useState, useEffect } from "react";
import { Outlet } from 'react-router-dom';
import Menu from "./Menu";
import Cookies from "js-cookie";
import Header from "./Header";

function AppLayout() {
  const [userInfo, setUserInfo] = useState(null);
  const [isMenuOpen, setIsMenuOpen] = useState(Cookies.get("menu_open") === "true");
  
  const toggleMenu = () => {
    const newMenuState = !isMenuOpen;
    setIsMenuOpen(newMenuState);
    Cookies.set("menu_open", newMenuState.toString());
  };

  useEffect(() => {
    const fetchUserInfo = async () => {
        try {
            const accessToken = Cookies.get("access_token");
            // Fetch user info using the access token
            const response = await fetch("https://www.googleapis.com/oauth2/v2/userinfo", {
                method: "GET",
                headers: {
                    Authorization: `Bearer ${accessToken}`,
                },
            });
            const data = await response.json();
            // Set user info from the response
            setUserInfo(data);
        } catch (error) {
            console.error("Error fetching user info", error);
        }
    };

      fetchUserInfo();
  }, []);

  return (
    <div className="flex flex-col h-screen">
        <Header userInfo={userInfo} toggleMenu={toggleMenu} />
        <div className="flex flex-1 overflow-hidden">
            <div
              className={`h-full transition-all duration-500 ease-in-out ${
              isMenuOpen ? "w-50 overflow-visible" : "w-0 overflow-hidden"
              }`}
            >
              <div
              className={`h-full transition-opacity duration-500 ${
                isMenuOpen ? "opacity-100 delay-300" : "opacity-0"
              }`}
              >
              <Menu />
              </div>
            </div>
            <div className="flex-1 px-10 py-4 overflow-auto">
              <Outlet />
            </div>
        </div>
    </div>
  );
}

export default AppLayout;