import React from 'react';
import AppLayout from './Navigation/AppLayout';

const ScenarioPage: React.FC = () => {
    return (
        <div className='flex flex-col gap-6'>
            <div className='flex item justify-between'>
                <p className="text-5xl">Scenario Page</p>
                <div className='flex '>
                    <div className="flex items-center bg-gray-200 rounded-full px-4 py-2 ml-4">
                        <img src="./menu_icons/explore.png" alt="Search" className="w-5 h-5 mr-2"/>
                        <input
                            type="text"
                            placeholder="Search Scenarios"
                            className="bg-transparent outline-none text-sm"
                        />
                    </div>
                    <button className="bg-gray-900 text-white rounded-full px-4 py-2 ml-4 hover:bg-gray-700 cursor-pointer">
                        New Scenario
                    </button>
                </div>
            </div>
            <div className='flex flex-col gap-4'>
                <ScenarioCard/>
                <ScenarioCard/>
            </div>
        </div>
    );
};


const ScenarioCard: React.FC = () => {
    return (
        <div className="border rounded-lg p-4 shadow-md hover:shadow-lg cursor-pointer">
            <h3 className="text-xl font-bold mb-2">Title</h3>
            <p className="text-gray-600">Description</p>
        </div>
    );
};

export default ScenarioPage;