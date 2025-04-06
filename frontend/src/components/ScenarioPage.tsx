import React from 'react';
import AppLayout from './Navigation/AppLayout';
import { useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import Cookies from "js-cookie";
import axios from 'axios';
type User = {
    age: number;
    birthday: string;
    email: string;
    name: string;
    scenarios: any[];            
    session: string;
    shared_r_scenarios: any[];   
    shared_rw_scenarios: any[];  
    _id: string;                 // The field you need
};

const ScenarioPage: React.FC = () => {
    const navigate = useNavigate();
    const [user, setUser] = useState<User | null>(null);
    const [scenarios, setScenarios] = useState([])
    const [searchTerm, setSearchTerm] = useState('')
    const [loading, setLoading] = useState(true)
    // Fetch user data and then scenarios
    useEffect(() => {
        const fetchUserAndScenarios = async () => {
            try {
                // get the access token from cookies
                const accessToken = Cookies.get("access_token");
                if (!accessToken) {
                    setLoading(false);
                    return;
                }
                
                // fetch user info, mainly want email
                const googleResponse = await fetch("https://www.googleapis.com/oauth2/v2/userinfo", {
                    method: "GET",
                    headers: {
                        Authorization: `Bearer ${accessToken}`,
                    },
                });
                const googleData = await googleResponse.json();
                
                // fetch user from your backend using email
                const userResponse = await fetch(`http://localhost:8000/api/get_user?email=${googleData.email}`);
                const userData = await userResponse.json();
                if (userData.user) {
                    setUser(userData.user);
                    
                    // fetch scenarios for this user
                    const scenariosResponse = await fetch(`http://localhost:8000/api/${userData.user._id}/scenarios`);
                    const scenariosData = await scenariosResponse.json();
                    console.log(scenariosData)
                    if (scenariosData.scenario) {
                        setScenarios(scenariosData.scenario);
                    }
                }
            } catch (error) {
                console.error("Error fetching data:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchUserAndScenarios();
    }, []);

    const handleNewScenario = async () => {
        // create a new scenario in the backend
        try {
            const newScenarioResponse = await axios.post(`http://localhost:8000/api/scenario/new`,{user:user._id});
            if (newScenarioResponse.data.message === "ok") {
                console.log("new scenario created")
                navigate(`/scenario/${newScenarioResponse.data.id}/main`);
            }
            else
                console.error(newScenarioResponse.data.detail)
        }
        catch(error:any){
            console.error("Error creating new scenario: ", error);
        }
        
    }

    return (
        <div className='flex flex-col gap-6'>
            <div className='flex item justify-between'>
                <p className="text-5xl">Scenario Page</p>
                <div className='flex '>
                    {/* <div className="flex items-center bg-gray-200 rounded-full px-4 py-2 ml-4">
                        <img src="./menu_icons/explore.png" alt="Search" className="w-5 h-5 mr-2"/>
                        <input
                            type="text"
                            placeholder="Search Scenarios"
                            className="bg-transparent outline-none text-sm"
                        />
                    </div> */}
                    <button className="bg-gray-900 text-white rounded-full px-4 py-2 ml-4 hover:bg-gray-700 cursor-pointer"
                        onClick={handleNewScenario}>
                        New Scenario
                    </button>
                </div>
            </div>
            <div className='flex flex-col gap-4'>
                {scenarios.map((scenario)=> {
                    return <ScenarioCard key={scenario.id} scenario={scenario} />
                })}
            </div>
        </div>
    );
};


const ScenarioCard: React.FC = ({ scenario }) => {
    const navigate = useNavigate();

    const handleClick = () => {
        navigate(`/scenario/${scenario.id}`);
    };
    return (
        <div className="border rounded-lg p-4 shadow-md hover:shadow-lg cursor-pointer" onClick={handleClick}>
            <h3 className="text-xl font-bold mb-2">{scenario.name ? scenario.name : <span className="italic">Untitled Scenario</span>}</h3>
            <p className="text-gray-600">{scenario.marital}</p>
            <p className="text-gray-600">{scenario.fin_goal}</p>

        </div>
    );
};

export default ScenarioPage;