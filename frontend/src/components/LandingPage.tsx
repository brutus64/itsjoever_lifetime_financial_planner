import React from 'react';
import Login from './Navigation/Login'

// basic react component for the landing page
const LandingPage: React.FC = () => {    

    return (        
      <div className="h-screen flex flex-col py-8">
          <Header />
          <div className="flex justify-around items-center absolute top-[33%] w-full custom-media-target">
              <div className="flex flex-col items-end text-right p-4 max-w-96 overflow-hidden">
                  <h1 className="text-5xl font-bold mb-4">Lorem ipssum dolor sit amet, adipiscing elit</h1>
                  <p className="text-lg mb-6">Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.</p>
                  <Login />
              </div>
              <div>
                  <img src="lebron.jpg" alt="lebruhn"/> {/*replace with better pic*/}
              </div>
          </div>
          <style>
              {`
                  @media (max-height: 500px) {
                      .custom-media-target {
                          display: none;
                      }
                  }
              `}
          </style>
      </div>
    );
  };
  

const Header: React.FC = () => {
    return (
        <header className="flex justify-between items-center px-8 py-4 bg-[#211A1D] text-white rounded-full mx-18 overflow-hidden">
            <h1 className="text-xl font-bold whitespace-nowrap mr-4">Lifetime Financial Planner</h1>
            <button 
                className="w-40 h-12 px-6 py-2 text-white bg-blue-500 hover:bg-blue-700 font-semibold rounded-full cursor-pointer transition-colors">
                Guest Account
            </button>
        </header>
    );
};

export default LandingPage;
