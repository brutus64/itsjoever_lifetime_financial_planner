import React from 'react';
import Login from './Navigation/Login'

// basic react component for the landing page
const LandingPage: React.FC = () => {    

    return (        
        <div className="flex flex-col py-8">
            <div className="flex flex-col py-8 overflow-x-hidden">
                <Header />
                <div className="flex items-center justify-around px-4 md:px-8 lg:px-16 relative mt-16 gap-4 md:gap-10">
                    <div className="flex flex-col items-end text-right p-4 max-w-md lg:max-w-xl">
                        <h1 className="text-4xl md:text-5xl font-bold mb-4">Your Financial Future,<br />Planned Today</h1>
                        <p className="text-base md:text-lg mb-6">
                            Take control of your financial future with our all-in-one planner. Model investments, income, expenses, and optimize Roth conversions to make data-driven decisions. Whether planning for retirement or maximizing tax efficiency, our tools give you the clarity and confidence to achieve your goals. Start planning today!
                        </p>
                        <div className="text-right">  {/* Ensures Login button aligns right */}
                            <Login />
                        </div>
                    </div>
                    <img src="buildings.jpeg" className="max-w-[600px] h-auto" />
                    
                </div>
            </div>
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
