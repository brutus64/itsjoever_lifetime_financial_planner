import React, { useState, useRef } from 'react';

const userData = {
  name: "Steph Curry The Goat",
  profileImage: "currypfp.jpg",
  personalInfo: [{ label: "State of Residence", value: "NY", icon: "🖉" },
    { label: "Date of Birth", value: "January, 1994", icon: "🖉" },
    { label: "Retirement Age", value: "65", icon: "🖉" },],
  scenarios:["scenario1", "scenario2", "scenario3", "scenario4", "scenario5"],
  taxRates:"TaxRates.yaml"
};

const ProfilePage: React.FC = () => {
  const [user, setUser] = useState(userData);
  const taxRatesFileInputRef = useRef<HTMLInputElement>(null);
  const scenariosFileInputRef = useRef<HTMLInputElement>(null);

  const handleTaxRatesUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files && files.length > 0) {
      // Update the tax rates filename
      setUser({
        ...user,
        taxRates: files[0].name
      });
      
      // Here you would typically handle the file upload to a server
      console.log("Tax rates file selected:", files[0]);
    }
  };

  const handleScenariosImport = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files && files.length > 0) {
      // Here you would parse the file and add scenarios
      console.log("Scenarios file selected:", files[0]);
      
      // For demo purposes, let's add a fake scenario with the filename
      setUser({
        ...user,
        scenarios: [...user.scenarios, files[0].name]
      });
    }
  };

  const triggerTaxRatesUpload = () => {
    if (taxRatesFileInputRef.current) {
      taxRatesFileInputRef.current.click();
    }
  };

  const triggerScenariosImport = () => {
    if (scenariosFileInputRef.current) {
      scenariosFileInputRef.current.click();
    }
  };

  return (
    <div className="min-h-screen bg-white px-6 py-8">
      {/* Header */}
      <nav className="flex items-center justify-between px-4 py-2 bg-white shadow-md">
        <div className="flex items-center gap-2">
          <div className="text-2xl cursor-pointer">☰</div>
          <span className="font-bold">{user.name}</span>
        </div>
        <div className="flex items-center gap-3">
          <div className="cursor-pointer">⋮</div>
          <button className="bg-black text-white px-4 py-1 rounded-md">Share</button>
          <img
            src={user.profileImage}
            alt="Profile"
            className="w-8 h-8 rounded-full border"
          />
        </div>
      </nav>

      {/* Profile Section */}
      <div className="flex flex-col items-center mt-8">
        <img
          src={user.profileImage}
          alt="Profile"
          className="w-24 h-24 rounded-full border"
        />
        <h1 className="text-3xl font-bold mt-4">{user.name}</h1>
      </div>

      {/* Info Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 bg-white shadow-md rounded-lg p-6 mt-6">
        {user.personalInfo.map((detail, index) => (
          <div key={index}>
            <p className="font-bold">{detail.label}</p>
            <p>{detail.icon} {detail.value}</p>
          </div>
        ))}
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
            accept=".json,.csv,.yaml,.yml"
          />
        </div>
        <div className="flex flex-wrap gap-3">
          {user.scenarios.length > 0 ? (
            user.scenarios.map((scenario, index) => (
              <div key={index} className="flex items-center gap-2 bg-white shadow p-2 rounded-md">
                {scenario}
              </div>
            ))
          ) : (
            <p className="text-gray-500">No scenarios yet. Import some to get started.</p>
          )}
        </div>
      </div>

      {/* State Tax Rates Section */}
      <div className="bg-white shadow-md rounded-lg p-6 mt-6">
        <h2 className="font-bold mb-4">State Tax Rates</h2>
        <div className="flex items-center gap-2">
          <button 
            onClick={triggerTaxRatesUpload}
            className="flex items-center gap-2 bg-gray-200 hover:bg-gray-300 px-3 py-1 rounded-md text-sm transition-colors"
          >
            <span>📤</span>
            <span>Upload</span>
          </button>
          <input
            type="file"
            ref={taxRatesFileInputRef}
            className="hidden"
            onChange={handleTaxRatesUpload}
            accept=".yaml,.yml,.json"
          />
          <span className="ml-2">{user.taxRates}</span>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;