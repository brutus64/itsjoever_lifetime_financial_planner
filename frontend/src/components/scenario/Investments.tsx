import Popup from "reactjs-popup"
import "reactjs-popup/dist/index.css"

const investmentTypeModalStyling = { 
    "border": "none",
    "border-radius":"8px",
    "width":"700px",
    "height":"600px"
};

const investmentModalStyling = { 
    "border": "none",
    "border-radius":"8px",
    "width":"500px",
    "height":"300px"
};

const Investments = ({formData,setFormData}:any) => {
    const handleAddInvestmentType = () => {

    }

    const handleAddInvestment = () => {

    }


    return (
        <div className="flex flex-col gap-4 m-10">
            <div className="bg-white shadow-md rounded-lg p-6 flex flex-col gap-3 w-200">
                <h1 className="text-2xl font-bold">Investments</h1>
                <p>An investment is the allocation of money into assets such as stocks, bonds, or real estate, with the expectation that the value of those assets will grow over time, providing returns through appreciation, dividends, or interest payments.</p>
            </div>
            <div className="flex gap-5">
                <div className="bg-white shadow-md rounded-lg p-6 flex flex-col flex-1 gap-3">
                    <h1 className="text-2xl font-bold">My Investment Types</h1>
                    <div className="flex flex-col">
                        {/* todo: list of investment types */}
                    </div>
                    <Popup trigger={<div className="bg-white shadow-md rounded-lg p-6 flex flex-col gap-3 w-100 hover:bg-sky-100 cursor-pointer">
                        + Add an Investment Type
                    </div>} position="right center" modal contentStyle={investmentTypeModalStyling}>
                        {close => (
                            <div className="rounded-lg m-10 flex flex-col gap-2">
                                <h1 className="text-2xl font-bold">New Investment Type</h1>
                                <div className="flex gap-4">
                                    <h2 className="font-medium">Name:</h2>
                                    <input className="text-lg px-1 border-2 border-gray-200 rounded-md w-75" />
                                </div>
                                

                                <h2 className="font-medium">Description:</h2>
                                <textarea className="px-1 border-2 border-gray-200 rounded-md w-150 h-25 resize-none " maxLength={1000}/>

                                <h2 className="font-medium">Expected Annual Return:</h2>
                                <div className="flex gap-5">
                                    <div className="flex flex-col gap-2">
                                        <div className="flex gap-2 align-middle">
                                            <input className="ml-1" type="radio" name="ann-ret-type"/>
                                            <div className="">Amount</div>
                                        </div>
                                        <div className="flex gap-2 align-middle">
                                            <input className="ml-1" type="radio" name="ann-ret-type"/>
                                            <div className="">Percent</div>
                                            
                                        </div>
                                    </div>
                                    <div className="border-l-2 border-l-black-400 pl-5 flex flex-col gap-1">
                                        <div className="flex gap-2 align-middle">
                                            <input className="ml-1" type="radio" name="ann-ret-amt"/>
                                            <div className="">Fixed:</div>
                                            <input className="text-md px-1 border-2 border-gray-200 rounded-md w-30" type="number" min="1"/> 
                                        </div>
                                        <div className="flex gap-2 align-middle">
                                            <input className="ml-1" type="radio" name="ann-ret-amt"/>
                                            <div className="">Normal: &nbsp; Mean:</div>
                                            <input className="text-md px-1 border-2 border-gray-200 rounded-md w-30" type="number" min="1"/> 
                                            <div className="">Variance:</div>
                                            <input className="text-md px-1 border-2 border-gray-200 rounded-md w-30" type="number" min="1"/> 
                                            
                                        </div>
                                    </div>



                                    
                                </div>

                                <h2 className="font-medium">Expected Annual Income:</h2>
                                <div className="flex gap-5">
                                    <div className="flex flex-col gap-2">
                                        <div className="flex gap-2 align-middle">
                                            <input className="ml-1" type="radio" name="ann-inc-type"/>
                                            <div className="">Amount</div>
                                        </div>
                                        <div className="flex gap-2 align-middle">
                                            <input className="ml-1" type="radio" name="ann-inc-type"/>
                                            <div className="">Percent</div>
                                            
                                        </div>
                                    </div>
                                    <div className="border-l-2 border-l-black-400 pl-5 flex flex-col gap-1">
                                        <div className="flex gap-2 align-middle">
                                            <input className="ml-1" type="radio" name="ann-inc-amt"/>
                                            <div className="">Fixed:</div>
                                            <input className="text-md px-1 border-2 border-gray-200 rounded-md w-30" type="number" min="1"/> 
                                        </div>
                                        <div className="flex gap-2 align-middle">
                                            <input className="ml-1" type="radio" name="ann-inc-amt"/>
                                            <div className="">Normal: &nbsp; Mean:</div>
                                            <input className="text-md px-1 border-2 border-gray-200 rounded-md w-30" type="number" min="1"/> 
                                            <div className="">Variance:</div>
                                            <input className="text-md px-1 border-2 border-gray-200 rounded-md w-30" type="number" min="1"/> 
                                            
                                        </div>
                                    </div>
                                    
                                </div>


                                <div className="flex gap-4">
                                    <h2 className="font-medium">Expense Ratio:</h2>
                                    <input className="text-md px-1 border-2 border-gray-200 rounded-md w-20" type="number" min="1"/> %
                                </div>
                                
                                <div className="flex gap-2 align-middle">
                                    <h2 className="font-medium">Taxability:</h2>
                                    <div className="flex gap-1">
                                        <input className="ml-1" type="radio" name="taxability"/>
                                        <div className="">Tax-exempt</div>
                                    </div>
                                    <div className="flex gap-1">
                                        <input className="ml-1" type="radio" name="taxability"/>
                                        <div className="">Taxable</div>
                                    </div>
                                </div>



                                <div className="flex justify-center gap-20">
                                    <button className="text-white px-4 py-1 rounded-md hover:opacity-80 cursor-pointer disabled:opacity-20 disabled:cursor-default bg-red-600 w-20" onClick={close}>Cancel</button>
                                    <button className="text-white px-4 py-1 rounded-md hover:opacity-80 cursor-pointer disabled:opacity-20 disabled:cursor-default bg-blue-600 w-20" onClick={handleAddInvestmentType}>Add</button>
                                </div>
                            </div>
                        )}
                        
                    </Popup>
                </div>
                <div className="bg-white shadow-md rounded-lg p-6 flex flex-col flex-1 gap-3">
                <h1 className="text-2xl font-bold">My Investments</h1>
                    <div className="flex flex-col">
                        {/* todo: list of investments */}
                    </div>
                    <Popup trigger={<div className="bg-white shadow-md rounded-lg p-6 flex flex-col gap-3 w-100 hover:bg-sky-100 cursor-pointer">
                        + Add an Investment
                    </div>} position="right center" closeOnDocumentClick modal contentStyle={investmentModalStyling}>
                        {close => (
                            <div className="rounded-lg m-10 flex flex-col gap-7">
                                <h1 className="text-2xl font-bold">New Investment</h1>
                                <div className="flex gap-4">
                                    <h2 className="font-medium">Investment Type:</h2>
                                    Todo: Put dropdown here
                                </div>

                                <div className="flex gap-4">
                                    <h2 className="font-medium">Initial Value:</h2>
                                    $<input className="text-md px-1 border-2 border-gray-200 rounded-md w-30" type="number" min="1"/>
                                </div>


                                <div className="flex justify-center gap-20">
                                    <button className="text-white px-4 py-1 rounded-md hover:opacity-80 cursor-pointer disabled:opacity-20 disabled:cursor-default bg-red-600 w-20" onClick={close}>Cancel</button>
                                    <button className="text-white px-4 py-1 rounded-md hover:opacity-80 cursor-pointer disabled:opacity-20 disabled:cursor-default bg-blue-600 w-20" onClick={handleAddInvestmentType}>Add</button>
                                </div>
                            </div>
                        )}
                        
                    </Popup>
                </div>
            </div>
            
            
            
        </div>
    )
}

const InvestmentTypeItem = ({name, description}) => {
    return (
        <div>
            <h2>{name}</h2>
            <p>{description}</p>
            <button>Edit</button>
        </div>
    )
}



export default Investments