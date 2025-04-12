import React from 'react';
import AppLayout from './Navigation/AppLayout';
import { useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
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

const shareModalStyling = { 
    "border": "none",
    "borderRadius":"8px",
    "width":"600px",
    "height":"375px",
    "padding":"0",
    "overflow":"hidden"
};
const ScenarioPage: React.FC = () => {
    const navigate = useNavigate();
    
    const [user, setUser] = useState<User | null>(null);
    const [scenarios, setScenarios] = useState([])
    const [error, setError] = useState("")
    // const [searchTerm, setSearchTerm] = useState('')
    const [loading, setLoading] = useState(true)
    const { isGuest, isLoggedIn, userInfo } = useAuth();
    
    // Fetch user data and then scenarios
    useEffect(() => {
        const fetchUserAndScenarios = async () => {
            try {
                let googleData = userInfo;
                console.log('whats initial data bruh');
                console.log(googleData);

                if (!isGuest) {
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
                    googleData = await googleResponse.json();
                }
                
                // fetch user from your backend using email
                const userResponse = await fetch(`http://localhost:8000/api/get_user?email=${googleData.email}`);
                const userData = await userResponse.json();
                console.log('wtf');
                console.log(userData);
                if (userData.user) {
                    setUser(userData.user);
                    console.log('user data is:')
                    console.log(userData.user)
                    
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
                setError("Error fetching data")
            } finally {
                setLoading(false);
            }
        };
        console.log('finish');

        fetchUserAndScenarios();
    }, []);

    const handleNewScenario = async () => {
        // create a new scenario in the backend
        console.log('before')
        console.log(user);
        if (!user) {
            console.log("User not found")
            return;
        }
        try {
            const newScenarioResponse = await axios.post(`http://localhost:8000/api/scenarios/new`,{user:user._id});
            if (newScenarioResponse.data.message === "ok") {
                console.log("new scenario created")
                navigate(`/scenario/${newScenarioResponse.data.id}/main`);
            }
            else
                console.error(newScenarioResponse.data.detail)
        }
        catch(error:any){
            console.error("Error creating new scenario: ", error);
            setError("Error creating new scenario")
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
                    <button
                        className="bg-gray-900 text-white rounded-full px-4 py-2 ml-4 hover:bg-gray-700 cursor-pointer"
                        onClick={handleNewScenario}>
                        New Scenario
                    </button>
                </div>
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
    const [shareOpen, setShareOpen] = useState(false);
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

    const handleShare = async (e) => {
        e.stopPropagation();
        setShareOpen(true);
    }

    const handleShareClose = async (e) => {
        e.stopPropagation();
        setShareOpen(false);
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
                <img 
                    src="./menu_icons/share.png" 
                    alt="Share" 
                    className="mt-2 w-6 h-6 cursor-pointer hover:opacity-80"
                    onClick={handleShare}
                />
            </div>
            <h3 className="text-xl font-bold mb-2">{scenario.name ? scenario.name : <span className="italic">Untitled Scenario</span>}</h3>
            <p className="text-gray-600">{scenario.marital}</p>
            <p className="text-gray-600">{scenario.fin_goal}</p>
            <SharePopup
                scenario={scenario}
                open={shareOpen}
                handleClose={handleShareClose}
            />
            </div>
    );
};

const SharePopup = ({ scenario, open, handleClose }) => {
    const [shareEmail, setShareEmail] = useState("")
    const [sharePermission, setSharePermission] = useState("read")
    const [shareMsg, setShareMsg] = useState({msg:"", good:true});

    const handleShareSubmit = async (e) => {
        e.preventDefault();
        e.stopPropagation();
        if (!shareEmail) {
            setShareMsg({msg: "Please enter the email address", good: false})
            return
        }
        try {
            const res = await axios.post(
                `http://localhost:8000/api/share/${scenario.id}`, 
                {
                    user_email: shareEmail,
                    perm: sharePermission
                },
                { withCredentials: true }
            );
            
            if (res.data && res.data.success){
                setShareMsg({msg: `Successfully shared with ${shareEmail}`, good: true});                       
                setTimeout(() => {
                    handleClose(true);
                }, 2000);
            }
            else {
                setShareMsg({msg: `Failed sharing with ${shareEmail}`, good: false})
            }
            
        } catch (error) {
            console.error("Error sharing scenario:", error);
            setShareMsg({msg: "Failed to share scenario", good: false });
        }
    };
    

    return (
        <Popup
                open={open}
                position="right center"
                closeOnDocumentClick
                modal
                onClose={()=>handleClose(false)}
                contentStyle={shareModalStyling}
            >
                <div className='rounded-lg flex flex-col gap-3 m-6'>
                    <h1 className='text-2xl font-bold'>Share Scenario</h1>
                    <div className='flex gap-4 items-center'>
                        <h2 className='font-medium'>Email:</h2>
                        <input 
                            type="email"
                            value={shareEmail}
                            onChange={(e) => setShareEmail(e.target.value)}
                            className='text-lg border-2 border-gray-300 rounded-md w-full px-2'
                            placeholder='Enter email address'
                            required
                        />
                    </div>
                    <div className='flex flex-col gap-2 mt-2'>
                        <h2 className='font-medium'>Permissions:</h2>
                        <div className='flex gap-1 items-center'>
                            <input 
                                type="radio"
                                name='permission'
                                value="read"
                                checked={sharePermission==="read"}
                                onChange={() => setSharePermission("read")}
                                className='ml-1'
                            />
                            <div>Read Only</div>
                        </div>
                        <div className='flex gap-1 items-center'>
                            <input 
                                type="radio" 
                                value="read_write" 
                                checked={sharePermission === "read_write"}
                                onChange={() => setSharePermission("read_write")}
                                className='ml-1'
                            />
                            <div>Read & Write</div>
                        </div>
                    </div>
                    {shareMsg.msg && (
                        <div className={`p-3 mb-4 rounded-md ${shareMsg.good ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>{shareMsg.msg}</div>
                    )
                    }
                    <div className='absolute bottom-0 left-0 right-0 p-4 bg-white rounded-b-lg flex justify-between shadow-md'>
                        <button 
                            className='border-2 p-1 rounded-md bg-red-600 hover:opacity-80 cursor-pointer text-white px-4 py-1'
                            onClick={handleClose}
                        >
                            Close
                        </button>
                        <button 
                            className='border-2 p-1 rounded-md bg-blue-600 hover:opacity-80 cursor-pointer text-white px-4 py-1'
                            onClick={handleShareSubmit}
                        >
                            Share
                        </button>
                    </div>
                </div>
        </Popup>
    )
}

export default ScenarioPage;

// import  DebugUser  from './Navigation/DebugUser'

// export default function ScenarioPage() {
//   return (
//     <div>
//       <h1>Scenario Page</h1>
//       <DebugUser />
//     </div>
//   );
// }