import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import Cookies from "js-cookie";
import axios from 'axios';
import { useAuth } from './Navigation/AuthContext';
import Popup from "reactjs-popup";

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
const SharedPage: React.FC = () => {
    const navigate = useNavigate();
    
    const [user, setUser] = useState<User | null>(null);
    const [scenarios, setScenarios] = useState([])
    const [error, setError] = useState("")
    // const [searchTerm, setSearchTerm] = useState('')
    const [loading, setLoading] = useState(true)
    
    // Fetch user data and then scenarios
    useEffect(() => {
        const fetchUserAndScenarios = async () => {
            try {
                console.log("Hello")
                // get the access token from cookies
                const accessToken = Cookies.get("access_token");
                if (!accessToken) {
                    setLoading(false);
                    setError("Please log in to see your saved scenarios!")
                    return;
                }
                setError("")
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
                    const scenariosResponse = await fetch(`http://localhost:8000/api/scenarios/share/${userData.user._id}`);
                    const scenariosData = await scenariosResponse.json();
                    console.log(scenariosData)
                    const allSharedScenarios = [
                        ...((scenariosData.read_only || []).map(scenario => ({
                            ...scenario,
                            permission: "read_only"
                        }))),
                        
                        ...((scenariosData.read_write || []).map(scenario => ({
                            ...scenario,
                            permission: "read_write"
                        })))
                    ];
                    
                    setScenarios(allSharedScenarios);

                }
            } catch (error) {
                console.error("Error fetching data:", error);
                setError("Error fetching data")
            } finally {
                setLoading(false);
            }
        };

        fetchUserAndScenarios();
    }, []);
    return (
        <div className='flex flex-col gap-6'>
            <div className='flex item justify-between'>
                <p className="text-5xl">Shared with me</p>
            </div>
            <div className="text-red-600 font-bold">{error}</div>
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
    const handleExport = async (e) => {
        e.stopPropagation();
        try{
            const res = await axios.get(`http://localhost:8000/api/scenarios/export/${scenario.id}`, {
                withCredentials: true,
                responseType: 'blob'
            })
            console.log(res)
            const blob = new Blob([res.data], { type: 'application/x-yaml' });
            const url = window.URL.createObjectURL(blob);
            const linkElement = document.createElement('a');
            linkElement.href = url;
            linkElement.download = `${scenario.id}.yaml`
            document.body.appendChild(linkElement)
            linkElement.click()
            linkElement.remove()
        }
        catch(e) {
            console.log("error downloading yaml file from export", e)
        }
    }
        return (
            <div className="border rounded-lg p-4 shadow-md hover:shadow-lg cursor-pointer relative" onClick={handleClick}>
                <div className="absolute top-2 right-2">
                    <img 
                        src="./menu_icons/download.png" 
                        alt="Export" 
                        className="w-6 h-6 cursor-pointer hover:opacity-80"
                        onClick={handleExport}
                    />
                </div>
                <h3 className="text-xl font-bold mb-2">{scenario.name ? scenario.name : <span className="italic">Untitled Scenario</span>}</h3>
                <p className="text-gray-600">{scenario.marital}</p>
                <p className="text-gray-600">{scenario.fin_goal}</p>
            </div>
        )
}

export default SharedPage;