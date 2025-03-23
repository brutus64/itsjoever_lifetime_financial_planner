const MainInfo = ({formData,setFormData}:any) => {
    return (
        <div className="flex flex-col gap-4 m-10">
            <div className='flex gap-10'>
                <div className="bg-white shadow-md rounded-lg p-6 flex flex-col gap-3 w-100">
                    <h1 className="text-2xl font-bold">Scenario Name</h1>
                    <input className="text-lg px-1 border-2 border-gray-200 rounded-md w-75"></input>
                </div>

                <div className="bg-white shadow-md rounded-lg p-6 flex flex-col gap-3 w-90">
                    <h1 className="text-2xl font-bold">State of Residence</h1>
                    <select className="text-lg px-1 border-2 border-gray-200 rounded-md w-75">
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
                        <input className="text-lg px-1 border-2 border-gray-200 rounded-md w-40"></input>
                    </div>
            </div>
            <div className="flex gap-10">
                <div className="bg-white shadow-md rounded-lg p-6 flex flex-col flex-1 gap-3">
                    <div className="flex justify-between">
                        <h1 className="text-2xl font-bold">About You</h1>
                        <div className="flex gap-5 align-middle">
                            <h2 className="font-medium self-cener">Married:</h2>
                            <input type="checkbox" name="is-married"/>  
                        </div>
                    </div>
                    
                    <div className="flex gap-5 align-middle">
                        <h2 className="font-medium">Date of birth:</h2>
                        <input type="date" className="text-md px-1 border-2 border-gray-200 rounded-md w-32" />
                    </div>
                    <div className="flex flex-col gap-3">
                        <h2 className="font-medium">Life Expectancy (in years):</h2>
                        <div className="flex gap-2 align-middle">
                            <input className="ml-1" type="radio" name="user-exp"/>
                            <div className="">Fixed:</div>
                            <input className="text-md px-1 border-2 border-gray-200 rounded-md w-14" type="number" min="1"/> 
                        </div>
                        
                        <div className="flex gap-2 align-middle">
                            <input className="ml-1" type="radio" name="user-exp"/>
                            <div className="">Normal: &nbsp; Mean</div>

                            <input className="text-md px-1 border-2 border-gray-200 rounded-md w-14" type="number" min="1"/> 
                            <div className="">Variance:</div>
                            <input className="text-md px-1 border-2 border-gray-200 rounded-md w-14" type="number" min="1"/> 
                            
                        </div>
                    </div>
                    
                </div>
                <div className="bg-white shadow-md rounded-lg p-6 flex flex-col flex-1 gap-3">
                    <h1 className="text-2xl font-bold">Spouse</h1>
                    <div className="flex gap-5 align-middle">
                        <h2 className="font-medium">Date of birth:</h2>
                        <input type="date" className="text-md px-1 border-2 border-gray-200 rounded-md w-32" />
                    </div>
                    <div className="flex flex-col gap-3">
                        <h2 className="font-medium">Life Expectancy (in years):</h2>
                        <div className="flex gap-2 align-middle">
                            <input className="ml-1" type="radio" name="user-exp"/>
                            <div className="">Fixed:</div>
                            <input className="text-md px-1 border-2 border-gray-200 rounded-md w-14" type="number" min="1"/> 
                        </div>
                        
                        <div className="flex gap-2 align-middle">
                            <input className="ml-1" type="radio" name="user-exp"/>
                            <div className="">Normal: &nbsp; Mean</div>

                            <input className="text-md px-1 border-2 border-gray-200 rounded-md w-14" type="number" min="1"/> 
                            <div className="">Variance:</div>
                            <input className="text-md px-1 border-2 border-gray-200 rounded-md w-14" type="number" min="1"/> 
                        </div>
                    </div>
                </div>
            </div>
            <div className='flex gap-10'>
                <div className="shadow-md rounded-lg justify-between flex-col w-full p-4">
                    <h1 className="text-2xl font-bold">Inflation Assumption</h1>
                        <div className="flex gap-2 align-middle">
                            <input className="ml-1" type="radio" name="user-exp"/>
                            <div className="">Fixed:</div>
                            <input className="text-md px-1 border-2 border-gray-200 rounded-md w-14" type="number" min="1"/> 
                        </div>
                        
                        <div className="flex gap-2 align-middle">
                            <input className="ml-1" type="radio" name="user-exp"/>
                            <div className="">Normal: &nbsp; Mean</div>

                            <input className="text-md px-1 border-2 border-gray-200 rounded-md w-14" type="number" min="1"/> 
                            <div className="">Variance:</div>
                            <input className="text-md px-1 border-2 border-gray-200 rounded-md w-14" type="number" min="1"/> 
                        </div>
                </div>
                
                <div className="bg-white shadow-md rounded-lg p-6 flex flex-col w-full gap-3 w-55">
                    <p className="text-2xl font-bold">Initial Limit on Annual Contributions (After-tax accounts)</p>
                    <input className="text-lg px-1 border-2 border-gray-200 rounded-md w-40"></input>
                </div>
            </div>
            
        </div>
    )
}

export default MainInfo;