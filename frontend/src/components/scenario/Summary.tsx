import axios from "axios";
import { useNavigate } from "react-router-dom";
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
const Summary = ({formData,setFormData}:any) => {
        const [user, setUser] = useState<User | null>(null);
        useEffect(()=>{
            console.log(formData);
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
                const response = (await fetch(`http://localhost:8000/api/get_user?email=${data.email}`));
                const user = await response.json();
                setUser(user.user);
                console.log(user.user);
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
        console.log(user_id)
        const scenario_data = {
            user: user_id,
            name: formData.name,
            marital: formData.is_married ? "couple" : "individual",
            birth_year: [formData.birth_year],
            life_expectancy: [formData.life_expectancy],
            investment_types: [],
            investment: [],
            event_series: [],
            inflation_assume: formData.inflation_assume,
            limit_posttax: 0.0,
            spending_strat: [], 
            expense_withdraw: [], 
            rmd_strat: [] ,
            roth_conversion_strat: [], 
            roth_optimizer: formData.roth_optimizer,
            r_only_share:  [],
            wr_only_share: [],
            ignore_state_tax: true, //?
            fin_goal: parseFloat(formData.fin_goal),
            state: formData.state
        }
        try{
            console.log(scenario_data);
            const response = await axios.post("http://localhost:8000/api/scenario/create_scenario", scenario_data);
            if(response.data.message === "success"){
                console.log("success");
            }
            else{
                console.log("fail");
            }
        }
        catch(error:any){
            console.log("Error saving the scenario: ", error.response.data);
    
        }

    }
    return (
        <div className="flex flex-col items-center mb-2">
            <div className="bg-white shadow-md rounded-lg p-10 m-10 flex flex-col flex-1 gap-3 w-150">
                <h1 className="text-2xl font-bold">Summary</h1>
                <div><span className="font-medium">Scenario Name:</span> {formData.name}</div>
                <div><span className="font-medium">Financial Goal:</span> ${parseInt(formData.fin_goal).toLocaleString()}</div>
                <div><span className="font-medium">State:</span> {formData.state}</div>
                <div><span className="font-medium">Birth year:</span> {formData.birth_year}</div>
                <div><span className="font-medium">Life Expectancy:</span> {formData.life_expectancy.type === "normal" ? `Normal {Mean=${formData.life_expectancy.mean} , Stddev=${formData.life_expectancy.stddev}}` : formData.life_expectancy.fixed}</div>
                <div><span className="font-medium">Married:</span> {formData.is_married ? "Yes" : "No"}</div>
                {formData.is_married &&
                    <div className="flex flex-col flex-1 gap-3">
                        <div><span className="font-medium">Spouse Birth year:</span> {formData.spouse_birth_year}</div>
                        <div><span className="font-medium">Spouse Life Expectancy:</span> {formData.spouse_life_expectancy.type === "normal" ? `Normal {Mean=${formData.spouse_life_expectancy.mean} , Stddev=${formData.spouse_life_expectancy.stddev}}` : formData.spouse_life_expectancy.fixed}</div>
                    </div>
                }
                <div><span className="font-medium">Inflation Assumption:</span> {formData.inflation_assume.type === "normal" ? `Normal {Mean=${formData.inflation_assume.mean} , Stddev=${formData.inflation_assume.stddev}}` : formData.inflation_assume.fixed}</div>


                <div>
                    <div className="font-medium">Investment Types:</div>
                </div>
                <div>
                    <div className="font-medium">Investment:</div>
                </div>
                <div>
                    <div className="font-medium">Event Series:</div>
                </div>
                <div>
                    <div className="font-medium">Spending Strategy:</div>
                </div>
                <div>
                    <div className="font-medium">Withdrawal Strategy:</div>
                </div>
                <div>
                    <div className="font-medium">RMD Strategy:</div>
                </div>
                <div><span className="font-medium">Roth Conversions:</span> {formData.roth_optimizer.is_enable ? `On (${formData.roth_optimizer.start_year} - ${formData.roth_optimizer.end_year}` : "Off"}</div>
                {formData.roth_optimizer.is_enable && 
                <div>
                    <div className="font-medium">Roth Conversion Strategy:</div>
                </div>}
                
            </div>
            
            <button className="text-white font-bold text-xl px-7 py-1 rounded-md hover:opacity-80 cursor-pointer disabled:opacity-20 disabled:cursor-default bg-blue-600 w-40 h-10" onClick={handleSubmit}>Save</button>
        </div>
    )
}

export default Summary;