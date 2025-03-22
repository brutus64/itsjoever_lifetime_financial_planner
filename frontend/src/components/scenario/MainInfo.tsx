const MainInfo = ({formData,setFormData}:any) => {
    return (
        <div className="flex flex-col gap-4 m-10">
            <div className="bg-white shadow-md rounded-lg p-6 flex flex-col gap-3 w-100">
                <h1 className="text-2xl font-bold">Scenario Name</h1>
                <input className="text-lg px-1 border-2 border-gray-200 rounded-md w-75"></input>
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
            
            
        </div>
    )
}

export default MainInfo;