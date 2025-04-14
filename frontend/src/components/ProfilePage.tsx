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
  const [file, setFile] = useState<File | null>(null);
  const [state, setState] = useState('')
  const scenariosFileInputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [status, setStatus] = useState<{ message: string; success: boolean } | null>(null);
  const [stateTaxes, setStateTaxes] = useState([]);

  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
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
        const res = await axios.get(`http://localhost:8000/api/state_tax/get_all`, {params: {user_email: data.email}});
        console.log("RESPONSE",  res)
        if (res.data) {
          setStateTaxes(res.data.state_tax)
        }
      })
      .catch((error) => {
        console.error("Error fetching user info", error);
      });
  },[]);



  const handleScenariosImport = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files && files.length > 0) {
      const file = files[0]
      console.log("Scenarios file selected:", file);
      const formData = new FormData();
      formData.append('file', file);
      console.log(user)
      if (user && user.email) {
        formData.append('user_email', user.email);
      }
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

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
      setStatus(null);
    }
  };

  const triggerFileInput = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleStateSubmit = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!state) {
      setStatus({ message: "Please select a state", success: false });
      return;
    }
    
    if (!file) {
      setStatus({ message: "Please select a YAML file", success: false });
      return;
    }
    
    if (!file.name.endsWith('.yaml') && !file.name.endsWith('.yml')) {
      setStatus({ message: "Only YAML files are accepted", success: false });
      return;
    }
    
    if (!user) {
      setStatus({ message: "User not authenticated", success: false });
      return;
    }

    try {
      setUploading(true);
      setStatus(null);
      
      const formData = new FormData();
      formData.append('file', file);
      formData.append('state', state);

      const res = await axios.post(
        `http://localhost:8000/api/state_tax/import/${user.email}`, 
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data'
          },
          withCredentials: true
        }
      );
      
      if (res.data.success) {
        setStatus({ message: `Successfully imported tax data for ${state}`, success: true });
        setFile(null);
        if (fileInputRef.current) {
          fileInputRef.current.value = '';
        }
        setStateTaxes(res.data.state_taxes)
      } else {
        setStatus({ message: "Failed to import tax data", success: false });
      }
    } catch (error) {
      console.error("Error importing state tax data:", error);
      setStatus({ message: "Error importing tax data: " + error, success: false });
    } finally {
      setUploading(false);
    }
  }
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
          <p className = "font-bold">Email</p>
          <p>{user.email}</p>
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
        {/* saved import tax section */}
        <div className="bg-white shadow-md rounded-lg p-6 mt-6">
          <h2 className="font-bold mb-4">Saved State Tax</h2>
          <div>
            <form onSubmit={handleStateSubmit} className='space-y-4'>
              <div className="bg-white shadow-md rounded-lg p-6 flex gap-3 w-90">
                    <h1 className="text-md font-bold">State of Residence</h1>
                    <select className="text-lg px-1 border-2 border-gray-200 rounded-md w-75" name="state" value={state} onChange={(e)=>setState(e.target.value)}>
                        <option value=""></option>
                        {[
                            { name: "Alabama", abbreviation: "AL" }, { name: "Alaska", abbreviation: "AK" }, { name: "Arizona", abbreviation: "AZ" },
                            { name: "Arkansas", abbreviation: "AR" }, { name: "California", abbreviation: "CA" }, { name: "Colorado", abbreviation: "CO" },
                            { name: "Connecticut", abbreviation: "CT" }, { name: "Delaware", abbreviation: "DE" }, { name: "Florida", abbreviation: "FL" },
                            { name: "Georgia", abbreviation: "GA" }, { name: "Hawaii", abbreviation: "HI" }, { name: "Idaho", abbreviation: "ID" },
                            { name: "Illinois", abbreviation: "IL" }, { name: "Indiana", abbreviation: "IN" }, { name: "Iowa", abbreviation: "IA" },
                            { name: "Kansas", abbreviation: "KS" }, { name: "Kentucky", abbreviation: "KY" }, { name: "Louisiana", abbreviation: "LA" },
                            { name: "Maine", abbreviation: "ME" }, { name: "Maryland", abbreviation: "MD" }, { name: "Massachusetts", abbreviation: "MA" },
                            { name: "Michigan", abbreviation: "MI" }, { name: "Minnesota", abbreviation: "MN" }, { name: "Mississippi", abbreviation: "MS" },
                            { name: "Missouri", abbreviation: "MO" }, { name: "Montana", abbreviation: "MT" }, { name: "Nebraska", abbreviation: "NE" },
                            { name: "Nevada", abbreviation: "NV" }, { name: "New Hampshire", abbreviation: "NH" }, { name: "New Jersey", abbreviation: "NJ" },
                            { name: "New Mexico", abbreviation: "NM" }, { name: "New York", abbreviation: "NY" }, { name: "North Carolina", abbreviation: "NC" },
                            { name: "North Dakota", abbreviation: "ND" }, { name: "Ohio", abbreviation: "OH" }, { name: "Oklahoma", abbreviation: "OK" },
                            { name: "Oregon", abbreviation: "OR" }, { name: "Pennsylvania", abbreviation: "PA" }, { name: "Rhode Island", abbreviation: "RI" },
                            { name: "South Carolina", abbreviation: "SC" }, { name: "South Dakota", abbreviation: "SD" }, { name: "Tennessee", abbreviation: "TN" },
                            { name: "Texas", abbreviation: "TX" }, { name: "Utah", abbreviation: "UT" }, { name: "Vermont", abbreviation: "VT" },
                            { name: "Virginia", abbreviation: "VA" }, { name: "Washington", abbreviation: "WA" }, { name: "West Virginia", abbreviation: "WV" },
                            { name: "Wisconsin", abbreviation: "WI" }, { name: "Wyoming", abbreviation: "WY" }
                        ].map((state) => (
                            <option key={state.abbreviation} value={state.abbreviation}>
                                {state.abbreviation}
                            </option>
                        ))}
                    </select>
              </div>
              <div>
                <label className="block text-gray-700 mb-2">YAML File:</label>
                <div className="flex items-center gap-2">
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileChange}
                    className="hidden"
                    accept=".yaml,.yml"
                  />
                  <button 
                    type="button"
                    onClick={triggerFileInput}
                    className="bg-gray-200 hover:bg-gray-300 px-4 py-2 rounded-md transition-colors"
                  >
                    Choose File
                  </button>
                  <span className="text-gray-600 truncate max-w-xs">
                    {file ? file.name : "No file selected"}
                  </span>
                </div>
                <p className="text-sm text-gray-500 mt-1">
                  Only .yaml or .yml files are accepted
                </p>
            </div>
            {status && (
              <div className={`p-3 rounded-md ${
                status.success ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
              }`}>
                {status.message}
              </div>
            )}
            <div>
              <button
                type="submit"
                className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 disabled:opacity-50"
                disabled={uploading || !file || !state}
              >
                {uploading ? "Uploading..." : "Import Tax Data"}
              </button>
            </div>
            </form>
            <div className="flex flex-wrap gap-3 mt-3">
              {stateTaxes.length > 0 ? (
                stateTaxes.map((tax, index) => (
                  <div key={index} className="flex items-center gap-2 bg-white shadow p-2 rounded-md">
                    {tax.state}
                  </div>
                ))
              ) : (
                <p className="text-gray-500">No state taxes yet. Import some to get started.</p>
              )}
            </div>
          </div>
        </div>
        
    </div>
  );
};

export default ProfilePage;