import axios from "axios";
import { useNavigate, useParams} from "react-router-dom";
import React, { useState, useRef, useEffect } from 'react';
import Cookies from "js-cookie";

// Quick summary of form inputs before form is submitted and saved
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
const Summary = ({formData,setFormData,editing}:any) => {
    const navigate = useNavigate();
    const params = useParams();
    const [user, setUser] = useState<User | null>(null);
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
            const response = (await fetch(`http://localhost:8000/api/get_user?email=${data.email}`));
            const user = await response.json();
            setUser(user.user);
        })
        .catch((error) => {
            console.error("Error fetching user info", error);
        });
    

    },[]);
        
    // must validate fields
    const handleSubmit = async () => { // redirect to page that lets u view, edit, or simulate scenario
        if (!user){
            return
        }
        const user_id = user?._id;
        
        const scenario_data = {
            user: user_id,
            name: formData.name,
            marital: formData.is_married ? "couple" : "individual",
            birth_year: [formData.birth_year],
            life_expectancy: [formData.life_expectancy],
            investment_types: formData.investment_types,
            investment: formData.investment,
            event_series: formData.event_series,
            inflation_assume: formData.inflation_assume,
            limit_posttax: 0.0,
            spending_strat: formData.spending_strat, 
            expense_withdraw: formData.expense_withdraw, 
            rmd_strat: formData.rmd_strat ,
            roth_conversion_strat: formData.roth_conversion_strat, 
            roth_optimizer: formData.roth_optimizer,
            r_only_share:  [],
            wr_only_share: [],
            ignore_state_tax: true, //?
            fin_goal: parseFloat(formData.fin_goal),
            state: formData.state
        }
        if (editing) { 
            try{
                console.log(scenario_data);
                const response = await axios.put(`http://localhost:8000/api/scenario/update_scenario/${params.id}`, scenario_data);
                if(response.data.message === "Scenario updated successfully"){
                    console.log("success",response.data);
                    navigate(`/scenario/${params.id}`);
                }
                else{
                    console.log("fail");
                }
            }
            catch(error:any){
                console.log("Error editing the scenario: ", error);
                
            }
            return;
        }

        try{
            console.log(scenario_data);
            const response = await axios.post("http://localhost:8000/api/scenario/create_scenario", scenario_data);
            if(response.data.message === "success"){
                console.log("success",response.data);
                navigate(`/scenario/${response.data.id}`);
            }
            else{
                console.log("fail");
            }
        }
        catch(error:any){
            console.log("Error saving the scenario: ", error);
    
        }

    }
    return (
        <div className="flex flex-col items-center mb-2">
            <button className="text-white font-bold text-xl px-7 py-1 rounded-md hover:opacity-80 cursor-pointer disabled:opacity-20 disabled:cursor-default bg-blue-600 w-140 h-80" onClick={handleSubmit}>Save</button>
        </div>
    )
}

export default Summary;