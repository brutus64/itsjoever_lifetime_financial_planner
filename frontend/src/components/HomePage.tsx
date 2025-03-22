import { useState, useEffect } from "react";
import Menu from "./Menu";
import Cookies from "js-cookie";
import Header from "./Header";

function HomePage() {
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
          {/* TODO: AI-ed transition */}
            <div
              className={`transition-all duration-500 ease-in-out ${
              isMenuOpen ? "w-64 overflow-visible" : "w-0 overflow-hidden"
              }`}
            >
              {isMenuOpen && <Menu />}
            </div>
          <div className="flex-1 p-4">
            <h1>My Scenarios </h1>
            <h1>My Scenarios </h1>
            <h1>My Scenarios </h1>
            <h1>My Scenarios </h1>
            <h1>My Scenarios </h1>
            <h1>My Scenarios </h1>
            <h1>My Scenarios </h1>
            <h1>My Scenarios </h1>
            <h1>My Scenarios </h1>
            <h1>My Scenarios </h1>
            <h1>My Scenarios </h1>
            <h1>My Scenarios </h1>
            <h1>My Scenarios </h1>
            <h1>My Scenarios </h1>
            <h1>My Scenarios </h1>
            <h1>My Scenarios </h1>
            <h1>My Scenarios </h1>
            <h1>My Scenarios </h1>
            <h1>My Scenarios </h1>
          </div>
        </div>
    </div>
  );
}

export default HomePage;