import { useState, useEffect } from "react";
import Cookies from "js-cookie";

// Reference URL: https://www.descope.com/blog/post/oauth2-react-authentication-authorization
export default function Login() {
  const [isLoggedin, setIsLoggedin] = useState(false);
  const [userInfo, setUserInfo] = useState(null);

  const handleClick = () => {
    const callbackUrl = `${window.location.origin}`;
    const googleClientId = "231771820352-cr4c3r9anbsscdol292hic6kvib9opvi.apps.googleusercontent.com";

    // Access token is visible in the URL, so it's not safe to use in reality
    const targetUrl = `https://accounts.google.com/o/oauth2/auth?redirect_uri=${encodeURIComponent(
      callbackUrl
    )}&response_type=token&client_id=${googleClientId}&scope=openid%20email%20profile&prompt=select_account`;

    window.location.href = targetUrl;
  };

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

          // Step 3: Redirect the user
          window.location.href = "http://localhost:5173/";  // Redirect to the desired location after logout
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
    const accessTokenRegex = /access_token=([^&]+)/;
    const isMatch = window.location.href.match(accessTokenRegex);

    if (isMatch) {
      const accessToken = isMatch[1];
      Cookies.set("access_token", accessToken);
      setIsLoggedin(true);

      // Fetch user info using the access token
      fetch("https://www.googleapis.com/oauth2/v2/userinfo", {
        method: "GET",
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      })
        .then((response) => response.json())
        .then((data) => {
          // Set user info from the response
          setUserInfo(data);
        })
        .catch((error) => {
          console.error("Error fetching user info", error);
        });
    }
  }, []);

  function test() {
    console.log(userInfo);
  }

  return (
    <div>
      <div className="cursor-pointer flex w-full px-6 py-3 bg-blue-500 hover:bg-blue-800 transition-colors gap-2 items-center" onClick={handleClick}>
        <img src="./google_icon.webp" alt="Google Icon" className="bg-white w-6 h-6" />
        <div className="flex-1 text-center">
          <button className="btn btn-primary text-white">
            Continue with Google
          </button>
        </div>
      </div>
      {/* <button onClick={handleLogout}>Logout</button> */}
    </div>
  );
}
