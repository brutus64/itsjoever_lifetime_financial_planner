import React, { useState, useRef, useEffect } from 'react';
import Cookies from "js-cookie";
import axios from 'axios';


// const userData = {
//   name: "Guest",
//   profileImage: "currypfp.jpg",
//   personalInfo: [{ label: "State of Residence", value: "NY", icon: "🖉" },
//     { label: "Date of Birth", value: "January, 1994", icon: "🖉" },
//     { label: "Retirement Age", value: "65", icon: "🖉" },],
//   scenarios:[],
//   taxRates:"TaxRates.yaml"
// };

const userData = {
  name: "Guest",
  email: "",
  scenarios: [],
  age: 0,
  birthday: new Date(),
  profileImage: "menu_icons/user.png",
}

const ProfilePage: React.FC = () => {
  const [user, setUser] = useState(userData);
  const scenariosFileInputRef = useRef<HTMLInputElement>(null);

  useEffect(()=>{
    const accessToken = Cookies.get("access_token");
    console.log(accessToken);
  

      fetch("https://www.googleapis.com/oauth2/v2/userinfo", {
        method: "GET",
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      })
      .then((response) => response.json())
      .then(async (data) => {
        console.log(data);
        const response = await fetch(`http://localhost:8000/api/get_user?email=${data.email}`);
        const dbUser = await response.json();
        const newUser = {
          name: dbUser.user.name,
          email: dbUser.user.email,
          scenarios: dbUser.user.scenarios,
          age: dbUser.user.age,
          birthday: dbUser.user.birthday,
          profileImage: "menu_icons/user.png",
        };
        setUser(newUser);
        console.log(newUser.scenarios)
      })
      .catch((error) => {
        console.error("Error fetching user info", error);
      });

    // }
  },[]);



  const handleScenariosImport = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files && files.length > 0) {
      // Here you would parse the file and add scenarios
      const file = files[0]
      console.log("Scenarios file selected:", file);
      const formData = new FormData();
      formData.append('file', file);
      console.log(user)
      if (user && user.email) {
        formData.append('user_email', user.email);
      }
      // For demo purposes, let's add a fake scenario with the filename
      const res = await axios.post("http://localhost:8000/api/scenarios/import", formData, {
        headers: {
          "Content-Type": "multipart/form-data"
        },
        withCredentials: true
      })
      if (res.status === 200){
        const result = res.data;
        console.log("Import successful", result)
        if (result.scenarios) {
          setUser({
            ...user,
            scenarios: result.scenarios
          });
        }
      };
    }
  }


  const triggerScenariosImport = () => {
    if (scenariosFileInputRef.current) {
      scenariosFileInputRef.current.click();
    }
  };

  return (
    <div className="min-h-screen bg-white px-6">
      {/* Profile Section */}
      <div className="flex gap-4 items-center mt-8">
        <img
          src={user.profileImage}
          alt="Profile"
          className="w-24 h-24 rounded-full border"
        />
        <h1 className="text-3xl font-bold mt-4">{user.name}</h1>
      </div>

      {/* Info Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 bg-white shadow-md rounded-lg p-6 mt-6">
        <div>
          <p className = "font-bold">State Of Residence</p>
          <p>{"NY"}</p>
        </div>
        <div>
          <p className = "font-bold">Age</p>
          <p>{user.age}</p>
        </div>
        <div>
          <p className = "font-bold">Retirement Age</p>
          <p>{0}</p>
        </div>
      </div>

      {/* Saved Scenarios Section */}
      <div className="bg-white shadow-md rounded-lg p-6 mt-6">
        <h2 className="font-bold mb-4">Saved Scenarios</h2>
        <div className="flex items-center gap-4 mb-4">
          <button 
            onClick={triggerScenariosImport}
            className="flex items-center gap-2 bg-gray-300 hover:bg-gray-400 px-4 py-2 rounded-md transition-colors"
          >
            <span>📥</span>
            <span>Import</span>
          </button>
          <input
            type="file"
            ref={scenariosFileInputRef}
            className="hidden"
            onChange={handleScenariosImport}
            accept=".json, .yaml"
          />
        </div>
        <div className="flex flex-wrap gap-3">
          {user.scenarios.length > 0 ? (
            user.scenarios.map((scenario, index) => (
              <div key={index} className="flex items-center gap-2 bg-white shadow p-2 rounded-md">
                {scenario.name}
              </div>
            ))
          ) : (
            <p className="text-gray-500">No scenarios yet. Import some to get started.</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;