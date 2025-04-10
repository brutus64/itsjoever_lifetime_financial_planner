import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "./AuthContext"; 
export default function Login() {
  const navigate = useNavigate();
  const { isLoggedIn, userInfo, loginWithGoogle } = useAuth();

  useEffect(() => {
    if (isLoggedIn) {
      navigate("/scenario");
    }
  }, [isLoggedIn, navigate]);

  return (
    <div>
      <div
        className="cursor-pointer flex w-full px-6 py-3 bg-blue-500 hover:bg-blue-800 transition-colors gap-2 items-center"
        onClick={loginWithGoogle}
      >
        <img
          src="/google_icon.webp"
          alt="Google Icon"
          className="bg-white w-6 h-6"
        />
        <div className="flex-1 text-center">
          <button className="btn btn-primary text-white">
            Continue with Google
          </button>
          {userInfo && (
            <p className="text-white mt-2">Email: {userInfo.email}</p>
          )}
        </div>
      </div>
    </div>
  );
}



// import { useState, useEffect } from "react";
// import { useRef } from "react";
// import { useNavigate } from "react-router-dom"; // Import the useNavigate hook
// import Cookies from "js-cookie";
// import { useAuth } from "./AuthContext"

// // Reference URL: https://www.descope.com/blog/post/oauth2-react-authentication-authorization
// export default function Login() {
//   const [isLoggedin, setIsLoggedin] = useState(false);
//   const { isLoggedIn, userInfo } = useAuth();
//   const [userInfo, setUserInfo] = useState(null);
//   const navigate = useNavigate();
//   const calledOnce = useRef(false);
//   const handleClick = () => {
//     const accessToken = Cookies.get("access_token");
//     if (accessToken) {
//       // If the user is already logged in, redirect to the home page
//       setIsLoggedin(true);
//       return;
//     }

//     const callbackUrl = `${window.location.origin}`;
//     const googleClientId = "231771820352-cr4c3r9anbsscdol292hic6kvib9opvi.apps.googleusercontent.com";

//     // Access token is visible in the URL, so it's not safe to use in reality 
//     const targetUrl = `https://accounts.google.com/o/oauth2/auth?redirect_uri=${encodeURIComponent(
//       callbackUrl
//     )}&response_type=token&client_id=${googleClientId}&scope=openid%20email%20profile&prompt=select_account`;

//     window.location.href = targetUrl;
//   };

//   // useEffect is being called twice for some reason?
//   useEffect(() => {
    
//     const accessTokenRegex = /access_token=([^&]+)/;
//     const isMatch = window.location.href.match(accessTokenRegex);
   
//     if (isMatch) {
//       const accessToken = isMatch[1];
//       Cookies.set("access_token", accessToken);
//       setIsLoggedin(true);

//       // Fetch user info using the access token
//       fetch("https://www.googleapis.com/oauth2/v2/userinfo", {
//         method: "GET",
//         headers: {
//           Authorization: `Bearer ${accessToken}`,
//         },
//       })
//         .then((response) => response.json())
//         .then(async (data) => {
//           // Set user info from the response
//           setUserInfo(data);
          
//           const userExists = await foundUser(data.email);
//           if (!userExists){
//             await createUser(data);
//           }

//         })
//         .catch((error) => {
//           console.error("Error fetching user info", error);
//         });
//     }
//   }, [navigate]);

//   useEffect(() => {
//     if (isLoggedin) {
//         navigate('/scenario');
//     }
//   }, [isLoggedin, navigate]);

//   const foundUser = async (email: string) => {
//     try{
//       const response = await fetch(`http://localhost:8000/api/get_user?email=${email}`);
//       const user = await response.json();
//       return user.exists;
//     }

//     catch(error) {
//       console.error("Error checking for user existence: ", error);
//       return false;
//     }
//   };

//   const createUser = async (data: any) => {
//     try {
      
//       if (calledOnce.current) return; // Prevent multiple runs
//       calledOnce.current = true;

//       const response = await fetch('http://localhost:8000/api/add_user', {
//         method: 'POST',
//         headers: {
//           'Content-Type': 'application/json',
//         },
//         body: JSON.stringify({
//           name: data.name,
//           email: data.email,  
//           session: '',  
//           scenarios: [],
//           age: 0,  
//           birthday: new Date( ),
//           shared_r_scenarios: [],
//           shared_rw_scenarios: [],
//         }),
//       });

//       const newUser = await response.json();
//       console.log("New user created:", newUser);
//     } catch (error) {
//       console.error("Error creating user", error);
//     }
//   };
  
//   return (
//     <div>
//       <div className="cursor-pointer flex w-full px-6 py-3 bg-blue-500 hover:bg-blue-800 transition-colors gap-2 items-center" onClick={handleClick}>
//         <img src="./google_icon.webp" alt="Google Icon" className="bg-white w-6 h-6" />
//         <div className="flex-1 text-center">
//           <button className="btn btn-primary text-white">
//             Continue with Google
//           </button>
//           <p>Email: {userInfo?.email}</p>
//         </div>
//       </div>
//     </div>
//   );
// }
