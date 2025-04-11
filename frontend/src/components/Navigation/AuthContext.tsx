import React, { createContext, useContext, useState, useEffect, useRef } from "react";
import { v4 as uuidv4 } from "uuid";
import Cookies from "js-cookie";

interface UserInfo {
    name: string;
    email: string;
    [key: string]: any;
  }
  
  interface AuthContextType {
    isGuest: boolean;
    isLoggedIn: boolean;
    userInfo: UserInfo | null;
    loginWithGoogle: () => void;
    loginWithGuest: () => void;
  }
  
  const AuthContext = createContext<AuthContextType>({
    isGuest: false,
    isLoggedIn: false,
    userInfo: null,
    loginWithGoogle: () => {},
    loginWithGuest: () => {},
  });
  
  export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
    const [isGuest, setIsGuest] = useState(false);
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [userInfo, setUserInfo] = useState<UserInfo | null>(null);
    const calledOnce = useRef(false);

    const loginWithGuest = () => {
      const uniqueId = uuidv4();
      const guestData = {
        email: `guest-${uniqueId}@guest.com`,
        name: `guest-${uniqueId}`
      };

      setUserInfo(guestData);
      setIsLoggedIn(true);
      setIsGuest(true);
      createUser(guestData);
    }
  
    const loginWithGoogle = () => {
      const accessToken = Cookies.get("access_token");
      if (accessToken) {
        // setIsLoggedIn(true);
        return;
      }
  
      const callbackUrl = `${window.location.origin}`;
      const googleClientId = "231771820352-cr4c3r9anbsscdol292hic6kvib9opvi.apps.googleusercontent.com";
  
      const targetUrl = `https://accounts.google.com/o/oauth2/auth?redirect_uri=${encodeURIComponent(
        callbackUrl
      )}&response_type=token&client_id=${googleClientId}&scope=openid%20email%20profile&prompt=select_account`;
  
      window.location.href = targetUrl;
    };
  
    useEffect(() => {
      const accessTokenRegex = /access_token=([^&]+)/;
      const isMatch = window.location.href.match(accessTokenRegex);
      let accessToken=   null;
      if (isMatch) {
        accessToken = isMatch[1];
        Cookies.set("access_token", accessToken);
        // Remove the token from the URL to keep it clean
        window.history.replaceState({}, document.title, window.location.pathname);
      } else {
        // Try to get token from cookie (on page refresh)
        accessToken = Cookies.get("access_token");
      }
    
      if (accessToken) {
        // setIsLoggedIn(true);
    
        fetch("https://www.googleapis.com/oauth2/v2/userinfo", {
          method: "GET",
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        })
          .then((res) => res.json())
          .then(async (data) => {
            setUserInfo(data);
            setIsLoggedIn(true);
            setIsGuest(false);
            console.log(data);
            // await fetch("http://localhost:8000/api/login", {
            //   method: "POST",
            //   headers: {
            //     "Content-Type": "application/json",
            //   },
            //   credentials: "include",
            //   body: JSON.stringify({
            //     name: data.name,
            //     email: data.email,
            //     picture: data.picture,
            //   }),
            // });
            const userExists = await foundUser(data.email);
            if (!userExists) {
              await createUser(data);
            }
          })
          .catch((err) => {
            console.error("Failed to fetch user info", err);
            Cookies.remove("access_token"); // Token might be expired or invalid
            setIsLoggedIn(false);
          });
      }
    }, []);
  
    const foundUser = async (email: string) => {
      try {
        const response = await fetch(`http://localhost:8000/api/get_user?email=${email}`);
        const user = await response.json();
        return user.exists;
      } catch (error) {
        console.error("Error checking user existence:", error);
        return false;
      }
    };
  
    const createUser = async (data: any) => {
      try {
        if (calledOnce.current) return;
        calledOnce.current = true;
  
        const response = await fetch("http://localhost:8000/api/add_user", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            name: data.name,
            email: data.email,
            session: "",
            scenarios: [],
            age: 0,
            birthday: new Date(),
            shared_r_scenarios: [],
            shared_rw_scenarios: [],
          }),
        });
  
        const newUser = await response.json();
        console.log("New user created:", newUser);
      } catch (error) {
        console.error("Error creating user:", error);
      }
    };
  
    return (
      <AuthContext.Provider value={{ isGuest, isLoggedIn, userInfo, loginWithGoogle, loginWithGuest}}>
        {children}
      </AuthContext.Provider>
    );
  };
  
  export const useAuth = () => useContext(AuthContext);
  