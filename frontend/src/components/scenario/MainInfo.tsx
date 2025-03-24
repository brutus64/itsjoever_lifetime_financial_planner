import { useState } from "react";
const MainInfo = ({formData,setFormData}:any) => {
    console.log(formData)
    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({
            ...formData,
            [name]:value,
        })
    }
    const handleMarried = (e) => {
        setFormData({
            ...formData,
            "is_married":e.target.checked,
        })
    }
    const handleUser = (e) => { // ugh nested state 
        let { name, value } = e.target;
        if (name === "user_type")
            name = "type"
        setFormData({
            ...formData,
            life_expectancy: {
                ...formData.life_expectancy,
                [name]:value,
            }
        })
    }
    const handleSpouse = (e) => {
        const { name, value } = e.target;
        setFormData({
            ...formData,
            spouse_life_expectancy: {
                ...formData.spouse_life_expectancy,
                [name]:value,
            }
        })
    }

    const handleInflation = (e) => {
        let { name, value } = e.target;
        if (name === "inf_type")
            name = "type"
        setFormData({
            ...formData,
            inflation_assume: {
                ...formData.inflation_assume,
                [name]:value,
            }
        })
    }
    
    return (
        <div className="flex flex-col gap-4 m-10">
            <div className='flex gap-10'>
                <div className="bg-white shadow-md rounded-lg p-6 flex flex-col gap-3 w-100">
                    <h1 className="text-2xl font-bold">Scenario Name</h1>
                    <input className="text-lg px-1 border-2 border-gray-200 rounded-md w-75" name="name" value={formData.name} onChange={handleChange}></input>
                </div>

                <div className="bg-white shadow-md rounded-lg p-6 flex flex-col gap-3 w-90">
                    <h1 className="text-2xl font-bold">State of Residence</h1>
                    <select className="text-lg px-1 border-2 border-gray-200 rounded-md w-75" name="state" value={formData.state} onChange={handleChange}>
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
                </div>
                
                <div className="bg-white shadow-md rounded-lg p-6 flex flex-col gap-3 w-55">
                    <h1 className="text-2xl font-bold">Financial Goal</h1>
                    <input className="text-lg px-1 border-2 border-gray-200 rounded-md w-40" name="fin_goal" value={formData.fin_goal} onChange={handleChange}></input>
                </div>
            </div>
            <div className="flex gap-10">
                <div className="bg-white shadow-md rounded-lg p-6 flex flex-col flex-1 gap-3">
                    <div className="flex justify-between">
                        <h1 className="text-2xl font-bold">About You</h1>
                        <div className="flex gap-5 align-middle">
                            <h2 className="font-medium self-cener">Married:</h2>
                            <input type="checkbox" name="is-married" onChange={handleMarried}/>  
                        </div>
                    </div>
                    
                    <div className="flex gap-5 align-middle">
                        <h2 className="font-medium">Date of birth:</h2>
                        <input type="number" className="text-md px-1 border-2 border-gray-200 rounded-md w-32" name="birth_year" value={formData.birth_year} onChange={handleChange} min="1900" max="2025"/>
                    </div>
                    <div className="flex flex-col gap-3">
                        <h2 className="font-medium">Life Expectancy (in years):</h2>
                        <div className="flex gap-2 align-middle">
                            <input className="ml-1" type="radio" name="user_type" value="fixed" onChange={handleUser}/>
                            <div className="">Fixed:</div>
                            <input className="text-md px-1 border-2 border-gray-200 rounded-md w-14" type="number" min="1" name="fixed" value={formData.life_expectancy.fixed} onChange={handleUser}/> 
                        </div>
                        <div className="flex gap-2 align-middle">
                            <input className="ml-1" type="radio" name="user_type" value="normal" onChange={handleUser}/>
                            <div className="">Normal: &nbsp; Mean</div>

                            <input className="text-md px-1 border-2 border-gray-200 rounded-md w-14" type="number" min="1" name="mean" value={formData.life_expectancy.mean} onChange={handleUser}/> 
                            <div className="">Std dev:</div>
                            <input className="text-md px-1 border-2 border-gray-200 rounded-md w-14" type="number" min="1" name="stddev" value={formData.life_expectancy.stddev} onChange={handleUser}/> 
                        </div>
                    </div>
                    
                </div>
                <div className="bg-white shadow-md rounded-lg p-6 flex flex-col flex-1 gap-3" style={{opacity: (formData.is_married ? 1.0 : 0.2)}}>
                    <h1 className="text-2xl font-bold">Spouse</h1>
                    <div className="flex gap-5 align-middle">
                        <h2 className="font-medium">Date of birth:</h2>
                        <input type="number" className="text-md px-1 border-2 border-gray-200 rounded-md w-32" name="spouse_birth_year" value={formData.spouse_birth_year} onChange={handleChange} disabled={!formData.is_married} min="1900" max="2025"/>
                    </div>
                    <div className="flex flex-col gap-3">
                        <h2 className="font-medium">Life Expectancy (in years):</h2>
                        <div className="flex gap-2 align-middle">
                            <input className="ml-1" type="radio" name="type" value="fixed" onChange={handleSpouse} disabled={!formData.is_married}/>
                            <div className="">Fixed:</div>
                            <input className="text-md px-1 border-2 border-gray-200 rounded-md w-14" type="number" min="1" name="fixed" value={formData.spouse_life_expectancy.fixed} onChange={handleSpouse} disabled={!formData.is_married}/> 
                        </div>
                        
                        <div className="flex gap-2 align-middle">
                            <input className="ml-1" type="radio" name="type" value="normal" onChange={handleSpouse} disabled={!formData.is_married}/>
                            <div className="">Normal: &nbsp; Mean</div>

                            <input className="text-md px-1 border-2 border-gray-200 rounded-md w-14" type="number" min="1" name="mean" value={formData.spouse_life_expectancy.mean} onChange={handleSpouse} disabled={!formData.is_married}/> 
                            <div className="">Std dev:</div>
                            <input className="text-md px-1 border-2 border-gray-200 rounded-md w-14" type="number" min="1" name="stddev" value={formData.spouse_life_expectancy.stddev} onChange={handleSpouse} disabled={!formData.is_married}/> 
                        </div>
                    </div>
                </div>
            </div>
            <div className='flex gap-10'>
                <div className="shadow-md rounded-lg justify-between flex-col p-4">
                    <h1 className="text-2xl font-bold">Inflation Assumption</h1>
                        <div className="flex gap-2 align-middle">
                            <input className="ml-1" type="radio" name="inf_type" value="fixed" onChange={handleInflation}/>
                            <div className="">Fixed:</div>
                            <input className="text-md px-1 border-2 border-gray-200 rounded-md w-14" type="number" min="1" name="fixed" value={formData.inflation_assume.fixed} onChange={handleInflation}/> 
                        </div>
                        
                        <div className="flex gap-2 align-middle">
                            <input className="ml-1" type="radio" name="inf_type" value="normal" onChange={handleInflation}/>
                            <div className="">Normal: &nbsp; Mean</div>

                            <input className="text-md px-1 border-2 border-gray-200 rounded-md w-14" type="number" min="1" name="mean" value={formData.inflation_assume.mean} onChange={handleInflation}/> 
                            <div className="">Variance:</div>
                            <input className="text-md px-1 border-2 border-gray-200 rounded-md w-14" type="number" min="1" name="stddev" value={formData.inflation_assume.stddev} onChange={handleInflation}/> 
                        </div>
                </div>
                
                {/* <div className="bg-white shadow-md rounded-lg p-6 flex flex-col w-full gap-3 w-55">
                    <p className="text-2xl font-bold">Initial Limit on Annual Contributions (After-tax accounts)</p>
                    <input className="text-lg px-1 border-2 border-gray-200 rounded-md w-40" min="0"></input>
                </div> */}
            </div>
            
        </div>
    )
}

export default MainInfo;