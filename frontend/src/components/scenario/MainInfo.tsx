import { useState, useEffect, useRef } from "react";
import axios from "axios";
import { useAuth } from "../Navigation/AuthContext";

const MainInfo = ({scenario_id}:any) => {
    const { userInfo } = useAuth();
    const [ mainData, setMainData ] = useState(null)
    const [ dirty, setDirty ] = useState(false)
    const [stateError, setStateError] = useState(false);
    const [availStateTaxes, setAvailStateTaxes] = useState([]);
    
    const fetchStateTaxes = async () => {
        try { 
            if (!userInfo?.email) {
                return;
            } 

            const res = await axios.get(`http://localhost:8000/api/state_tax/get_all`, {
                params: { user_email: userInfo.email }
            });
            
            if (res.data && res.data.state_tax) {
                const states = res.data.state_tax.map(state => state.state)
                setAvailStateTaxes(states)
                console.log("available state taxes:", res.data.state_tax, states)
            }

            if (mainData?.state) {
                checkStateTaxExists(mainData.state);
            }
        } catch (err) {
            console.log("Error fetching state taxes:", err);
        }
    }

    const checkStateTaxExists = (state) => {
        if(!state || state === ''){
            setStateError(false)
            return;
        }

        const exists = availStateTaxes.includes(state);
        setStateError(!exists);
    }

    const fetchMain = async () => {
        console.log("Fetching main info")
        let res;
        try {
            res = await axios.get(`http://localhost:8000/api/scenarios/main/${scenario_id}`);
        }
        catch(err){
            console.error("Could not fetch main data: ", err);
            return
        }
        const scenario = res.data.scenario;
        console.log(scenario)
        // convert to form format
        const formFormat = {
            name: scenario.name,
            is_married: scenario.marital === "couple",
            birth_year: scenario.birth_year[0],
            spouse_birth_year: scenario.birth_year[1],
            fin_goal: scenario.fin_goal,
            state: scenario.state,
            limit_posttax: scenario.limit_posttax,
            life_expectancy: scenario.life_expectancy[0],
            spouse_life_expectancy: scenario.life_expectancy[1],
            inflation_assume: scenario.inflation_assume
        }
        setMainData(formFormat)
    }

    const updateMain = async () => {
        if (!mainData)
            return
        console.log("Updating...")
        
        try {
            const scenario_data = {
                name: mainData.name,
                marital: mainData.is_married ? "couple" : "individual",
                birth_year: [mainData.birth_year,mainData.spouse_birth_year],
                life_expectancy: [mainData.life_expectancy,mainData.spouse_life_expectancy],
                inflation_assume: mainData.inflation_assume,
                limit_posttax: mainData.limit_posttax,
                fin_goal: parseFloat(mainData.fin_goal),
                state: mainData.state
            }
            console.log(scenario_data)
            let res = await axios.put(`http://localhost:8000/api/scenarios/main/${scenario_id}`,scenario_data);
            if (res.data.message === "Scenario updated successfully") {
                console.log("Update successful");
                setDirty(false)
            }
            else
                console.log("Update failed")
        }
        catch(err){
            console.error("Could not update main data: ", err);
        }
    }


    // retrieve main information data
    useEffect(() => {
        fetchMain();
        return () => {
            // maybe warn user if data hasn't been saved?
        }
    },[])
    
    useEffect(() => {
        if (userInfo?.email) {
            fetchStateTaxes();
        }
    }, [userInfo]);

    useEffect(() => {
        if (mainData?.state && availStateTaxes.length > 0) {
            checkStateTaxExists(mainData.state);
        }
    }, [mainData?.state, availStateTaxes]);

    const handleChange = (e) => { // Not for radio  
        let { name, value } = e.target;
        
        const float_names = new Set(['fin_goal', 'birth_year', 'spouse_birth_year','limit_posttax']);
        if (float_names.has(name)) {
            value = parseFloat(value);
        }

        if(name === 'state' && value !== mainData.state) {
            checkStateTaxExists(value);
        }

        setMainData({
            ...mainData,
            [name]:value,
        })
        setDirty(true);
    }

    const handleMarried = (e) => {
        setMainData({
            ...mainData,
            "is_married":e.target.checked,
        })
        setDirty(true)
    }

    // annoying radio buttons
    const handleUserRadio = (e) => {
        const { value } = e.target;
        setMainData({
            ...mainData,
            life_expectancy: {
                ...mainData.life_expectancy,
                type: value
            }
        })
        setDirty(true);
    }

    const handleSpouseRadio = (e) => {
        const { value } = e.target;
        setMainData({
            ...mainData,
            spouse_life_expectancy: {
                ...mainData.spouse_life_expectancy,
                type: value
            }
        })
        setDirty(true);
    }

    const handleInfRadio = (e) => {
        const { value } = e.target;
        setMainData({
            ...mainData,
            inflation_assume: {
                ...mainData.inflation_assume,
                type: value
            }
        })
        setDirty(true);
    }

    const handleUserExp = (e) => { // ugh nested state 
        const { name, value } = e.target;
        setMainData({
            ...mainData,
            life_expectancy: {
                ...mainData.life_expectancy,
                [name]:parseFloat(value),
            }
        })
        setDirty(true);
    }
    const handleSpouseExp = (e) => {
        const { name, value } = e.target;
        setMainData({
            ...mainData,
            spouse_life_expectancy: {
                ...mainData.spouse_life_expectancy,
                [name]:parseFloat(value),
            }
        })
        setDirty(true);
    }

    const handleInflation = (e) => {
        const { name, value } = e.target;
        setMainData({
            ...mainData,
            inflation_assume: {
                ...mainData.inflation_assume,
                [name]:parseFloat(value),
            }
        })
        setDirty(true);
    }

    if (mainData === null)
        return <div>Loading</div>
    
    return (
        <div className="flex flex-col gap-4 m-10">
            <div className='flex gap-10'>
                <div className="bg-white shadow-md rounded-lg p-6 flex flex-col gap-3 w-100">
                    <h1 className="text-2xl font-bold">Scenario Name</h1>
                    <input className="text-lg px-1 border-2 border-gray-200 rounded-md w-75" name="name" value={mainData.name} onChange={handleChange}></input>
                </div>

                <div className="bg-white shadow-md rounded-lg p-6 flex flex-col gap-3 w-90">
                    <h1 className="text-2xl font-bold">State of Residence</h1>
                    <select className="text-lg px-1 border-2 border-gray-200 rounded-md w-75" name="state" value={mainData.state} onChange={handleChange}>
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
                    {stateError && (
                        <div className="mt-2 p-2 bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700 text-sm">
                            <div className="flex items-center">
                                Warning: Tax data for this state is missing. State taxes will be ignored in calculations.
                            </div>
                        </div>
                    )}
                </div>
                
                <div className="bg-white shadow-md rounded-lg p-6 flex flex-col gap-3 w-55">
                    <h1 className="text-2xl font-bold">Financial Goal</h1>
                    <input type="number" className="text-lg px-1 border-2 border-gray-200 rounded-md w-40" name="fin_goal" value={mainData.fin_goal} onChange={handleChange}></input>
                </div>
            </div>
            <div className="flex gap-10">
                <div className="bg-white shadow-md rounded-lg p-6 flex flex-col flex-1 gap-3">
                    <div className="flex justify-between">
                        <h1 className="text-2xl font-bold">About You</h1>
                        <div className="flex gap-5 align-middle">
                            <h2 className="font-medium self-cener">Married:</h2>
                            <input type="checkbox" name="is-married" onChange={handleMarried} checked={mainData.is_married}/>  
                        </div>
                    </div>
                    
                    <div className="flex gap-5 align-middle">
                        <h2 className="font-medium">Birth year:</h2>
                        <input type="number" className="text-md px-1 border-2 border-gray-200 rounded-md w-32" name="birth_year" value={mainData.birth_year} onChange={handleChange} min="1900" max="2025"/>
                    </div>
                    <div className="flex flex-col gap-3">
                        <h2 className="font-medium">Life Expectancy (in years):</h2>
                        <div className="flex gap-2 align-middle">
                            <input className="ml-1" type="radio" value="fixed" onChange={handleUserRadio} checked={mainData.life_expectancy.type === "fixed"}/>
                            <div className="">Fixed:</div>
                            <input className="text-md px-1 border-2 border-gray-200 rounded-md w-14" type="number" min="1" name="value" value={mainData.life_expectancy.value} onChange={handleUserExp}/> 
                        </div>
                        <div className="flex gap-2 align-middle">
                            <input className="ml-1" type="radio" value="normal" onChange={handleUserRadio} checked={mainData.life_expectancy.type === "normal"}/>
                            <div className="">Normal: &nbsp; Mean</div>

                            <input className="text-md px-1 border-2 border-gray-200 rounded-md w-14" type="number" min="1" name="mean" value={mainData.life_expectancy.mean} onChange={handleUserExp}/> 
                            <div className="">Std dev:</div>
                            <input className="text-md px-1 border-2 border-gray-200 rounded-md w-14" type="number" min="1" name="stdev" value={mainData.life_expectancy.stdev} onChange={handleUserExp}/> 
                        </div>
                    </div>
                    
                </div>
                <div className="bg-white shadow-md rounded-lg p-6 flex flex-col flex-1 gap-3" style={{opacity: (mainData.is_married ? 1.0 : 0.2)}}>
                    <h1 className="text-2xl font-bold">Spouse</h1>
                    <div className="flex gap-5 align-middle">
                        <h2 className="font-medium">Birth year:</h2>
                        <input type="number" className="text-md px-1 border-2 border-gray-200 rounded-md w-32" name="spouse_birth_year" value={mainData.spouse_birth_year} onChange={handleChange} disabled={!mainData.is_married} min="1900" max="2025"/>
                    </div>
                    <div className="flex flex-col gap-3">
                        <h2 className="font-medium">Life Expectancy (in years):</h2>
                        <div className="flex gap-2 align-middle">
                            <input className="ml-1" type="radio" value="fixed" onChange={handleSpouseRadio} disabled={!mainData.is_married} checked={mainData.spouse_life_expectancy.type === "fixed"}/>
                            <div className="">Fixed:</div>
                            <input className="text-md px-1 border-2 border-gray-200 rounded-md w-14" type="number" min="1" name="value" value={mainData.spouse_life_expectancy.value} onChange={handleSpouseExp} disabled={!mainData.is_married}/> 
                        </div>
                        
                        <div className="flex gap-2 align-middle">
                            <input className="ml-1" type="radio" value="normal" onChange={handleSpouseRadio} disabled={!mainData.is_married} checked={mainData.spouse_life_expectancy.type === "normal"}/>
                            <div className="">Normal: &nbsp; Mean</div>

                            <input className="text-md px-1 border-2 border-gray-200 rounded-md w-14" type="number" min="1" name="mean" value={mainData.spouse_life_expectancy.mean} onChange={handleSpouseExp} disabled={!mainData.is_married}/> 
                            <div className="">Std dev:</div>
                            <input className="text-md px-1 border-2 border-gray-200 rounded-md w-14" type="number" min="1" name="stdev" value={mainData.spouse_life_expectancy.stdev} onChange={handleSpouseExp} disabled={!mainData.is_married}/> 
                        </div>
                    </div>
                </div>
            </div>
            <div className='flex gap-10'>
                <div className="shadow-md rounded-lg flex flex-col gap-3 justify-between p-4">
                    <h1 className="text-2xl font-bold">Inflation Assumption</h1>
                    <div className="flex gap-2 align-middle">
                        <input className="ml-1" type="radio" value="fixed" onChange={handleInfRadio} checked={mainData.inflation_assume.type === "fixed"}/>
                        <div className="">Fixed:</div>
                        <input className="text-md px-1 border-2 border-gray-200 rounded-md w-14" type="number" min="1" name="value" value={mainData.inflation_assume.value} onChange={handleInflation}/> 
                    </div>
                    
                    <div className="flex gap-2 align-middle">
                        <input className="ml-1" type="radio" value="normal" onChange={handleInfRadio} checked={mainData.inflation_assume.type === "normal"}/>
                        <div className="">Normal: &nbsp; Mean</div>
                        <input className="text-md px-1 border-2 border-gray-200 rounded-md w-14" type="number" min="1" name="mean" value={mainData.inflation_assume.mean} onChange={handleInflation}/> 
                        <div className="">Variance:</div>
                        <input className="text-md px-1 border-2 border-gray-200 rounded-md w-14" type="number" min="1" name="stdev" value={mainData.inflation_assume.stdev} onChange={handleInflation}/> 
                    </div>

                    <div className="flex gap-2 align-middle">
                        <input className="ml-1" type="radio" value="uniform" onChange={handleInfRadio} checked={mainData.inflation_assume.type === "uniform"}/>
                        <div className="">Uniform: &nbsp; Lower</div>
                        <input className="text-md px-1 border-2 border-gray-200 rounded-md w-14" type="number" min="1" name="lower_bound" value={mainData.inflation_assume.lower_bound} onChange={handleInflation}/> 
                        <div className="">Upper:</div>
                        <input className="text-md px-1 border-2 border-gray-200 rounded-md w-14" type="number" min="1" name="upper_bound" value={mainData.inflation_assume.upper_bound} onChange={handleInflation}/> 
                    </div>
                </div>
                <div className="bg-white shadow-md rounded-lg p-6 flex flex-col gap-3 w-55">
                    <p className="text-2xl font-bold">Initial Limit</p>
                    <input className="text-lg px-1 border-2 border-gray-200 rounded-md w-40" type="number" min="0" name="limit_posttax" value={mainData.limit_posttax} onChange={handleChange}></input>
                </div>
            </div>
            <div className="flex justify-center">
                <button className="bg-blue-500 text-white w-40 px-4 py-1 rounded-md hover:opacity-80 cursor-pointer disabled:opacity-20 disabled:cursor-default" disabled={!dirty} onClick={updateMain}>Save</button>
            </div>
            
            
        </div>
    )
}

export default MainInfo;