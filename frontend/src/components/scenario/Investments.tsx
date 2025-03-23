import Popup from "reactjs-popup"
import "reactjs-popup/dist/index.css"
import { useState } from "react";

const investmentTypeModalStyling = { 
    "border": "none",
    "borderRadius":"8px",
    "width":"700px",
    "height":"600px"
};

const investmentModalStyling = { 
    "border": "none",
    "borderRadius":"8px",
    "width":"500px",
    "height":"300px"
};


// Todo:
// Investment lists
// Handle form changes
// Handle form submits
// Repurpose for editing
// Deleting ability

const Investments = ({formData,setFormData}:any) => {
    return (
        <div className="flex flex-col gap-4 m-10">
            <div className="bg-white shadow-md rounded-lg p-6 flex flex-col gap-3 w-200">
                <h1 className="text-2xl font-bold">Investments</h1>
                <p>An investment is the allocation of money into assets such as stocks, bonds, or real estate, with the expectation that the value of those assets will grow over time, providing returns through appreciation, dividends, or interest payments.</p>
            </div>
            <div className="flex gap-5">
                <InvestmentTypePopup formData={formData} setFormData={setFormData} />
                <InvestmentPopup formData={formData} setFormData={setFormData} />
            </div>
        </div>
    )
}

const InvestmentTypePopup = ({formData,setFormData}) => {
    const [ open, setOpen ] = useState(false);
    const [ investmentTypeData, setInvestmentTypeData ] = useState({
        name: "",
        description: "",
        expectedAnnualReturn: {
            isPercent: "",
            type: "", // either "fixed" or "normal"
            fixed: 0,
            mean:0,
            stddev:1,
        },
        expectedAnnualIncome: {
            isPercent: "",
            type: "", // either "fixed" or "normal"
            fixed: 0,
            mean:0,
            stddev:1,
        },
        expenseRatio: 0.0,
        isTaxExempt: true
    });

    // Clear fields if successfully added or cancel button clicked or if editing
    const handleClose = () => {

    }

    const handleChange = (e: any) => {
        const { name, value } = e.target;
        setInvestmentTypeData({
            ...investmentTypeData,
            [name]:value,
        })
    }

    const handleReturnChange = (e: any) => {
        let { name, value } = e.target;
        if (name === "retIsPercent")
            name = "isPercent"
        else if (name === "retType")
            name = "type"
        setInvestmentTypeData({
            ...investmentTypeData,
            expectedAnnualReturn: {
                ...investmentTypeData.expectedAnnualReturn,
                [name]:value,
            }
        })
    }

    const handleIncomeChange = (e: any) => {
        const { name, value } = e.target;
        setInvestmentTypeData({
            ...investmentTypeData,
            expectedAnnualIncome: {
                ...investmentTypeData.expectedAnnualIncome,
                [name]:value,
            }
        })
    }

    const handleAddInvestmentType = () => {
        setFormData({
            ...formData,
            // add here
        })
        
    }

    console.log(investmentTypeData)

    return (
        <div className="bg-white shadow-md rounded-lg p-6 flex flex-col flex-1 gap-3">
            <h1 className="text-2xl font-bold">My Investment Types</h1>
            <div className="flex flex-col">
                {/* todo: list of investment types */}
            </div>
            <div className="bg-white shadow-md rounded-lg p-6 flex flex-col gap-3 w-100 hover:bg-sky-100 cursor-pointer" onClick={() => setOpen(true)}>
                + Add an Investment Type
            </div>
            <Popup open={open} position="right center" modal contentStyle={investmentTypeModalStyling} onClose={() => setOpen(false)}>
                <div className="rounded-lg m-10 flex flex-col gap-2">
                    <h1 className="text-2xl font-bold">New Investment Type</h1>
                    <div className="flex gap-4">
                        <h2 className="font-medium">Name:</h2>
                        <input className="text-lg px-1 border-2 border-gray-200 rounded-md w-75" name="name" value={investmentTypeData.name} onChange={handleChange}/>
                    </div>
                    <h2 className="font-medium">Description:</h2>
                    <textarea className="px-1 border-2 border-gray-200 rounded-md w-150 h-25 resize-none " maxLength={1000} name="description" value={investmentTypeData.description} onChange={handleChange}/>
                    <h2 className="font-medium">Expected Annual Return:</h2>
                    <div className="flex gap-5">
                        <div className="flex flex-col gap-2">
                            <div className="flex gap-2 align-middle">
                                <input className="ml-1" type="radio" name="retIsPercent" value={"false"} onChange={handleReturnChange} />
                                <div className="">Amount</div>
                            </div>
                            <div className="flex gap-2 align-middle">
                                <input className="ml-1" type="radio" name="retIsPercent" value={"true"} onChange={handleReturnChange}/>
                                <div className="">Percent</div>
                            </div>
                        </div>
                        <div className="border-l-2 border-l-black-400 pl-5 flex flex-col gap-1">
                            <div className="flex gap-2 align-middle">
                                <input className="ml-1" type="radio" name="retType" value={"fixed"} onChange={handleReturnChange}/>
                                <div className="">Fixed:</div>
                                <input className="text-md px-1 border-2 border-gray-200 rounded-md w-30" type="number" min="0" name="fixed" value={investmentTypeData.expectedAnnualReturn.fixed} onChange={handleReturnChange}/> 
                            </div>
                            <div className="flex gap-2 align-middle">
                                <input className="ml-1" type="radio" name="retType" value={"normal"} onChange={handleReturnChange}/>
                                <div className="">Normal: &nbsp; Mean:</div>
                                <input className="text-md px-1 border-2 border-gray-200 rounded-md w-30" type="number" min="0" name="mean" value={investmentTypeData.expectedAnnualReturn.mean} onChange={handleReturnChange}/> 
                                <div className="">Std dev:</div>
                                <input className="text-md px-1 border-2 border-gray-200 rounded-md w-30" type="number" min="0" name="stddev" value={investmentTypeData.expectedAnnualReturn.stddev} onChange={handleReturnChange}/> 
                            </div>
                        </div>
                    </div>
                    <h2 className="font-medium">Expected Annual Income:</h2>
                    <div className="flex gap-5">
                        <div className="flex flex-col gap-2">
                            <div className="flex gap-2 align-middle">
                                <input className="ml-1" type="radio" name="isPercent" value={"false"} onChange={handleIncomeChange}/>
                                <div className="">Amount</div>
                            </div>
                            <div className="flex gap-2 align-middle">
                                <input className="ml-1" type="radio" name="isPercent" value={"true"} onChange={handleIncomeChange}/>
                                <div className="">Percent</div>
                            </div>
                        </div>
                        <div className="border-l-2 border-l-black-400 pl-5 flex flex-col gap-1">
                            <div className="flex gap-2 align-middle">
                                <input className="ml-1" type="radio" name="type" value={"fixed"} onChange={handleIncomeChange}/>
                                <div className="">Fixed:</div>
                                <input className="text-md px-1 border-2 border-gray-200 rounded-md w-30" type="number" min="0" name="fixed" value={investmentTypeData.expectedAnnualIncome.fixed} onChange={handleIncomeChange}/> 
                            </div>
                            <div className="flex gap-2 align-middle">
                                <input className="ml-1" type="radio" name="type" value={"normal"} onChange={handleIncomeChange}/>
                                <div className="">Normal: &nbsp; Mean:</div>
                                <input className="text-md px-1 border-2 border-gray-200 rounded-md w-30" type="number" min="0" name="mean" value={investmentTypeData.expectedAnnualIncome.mean} onChange={handleIncomeChange}/> 
                                <div className="">Std dev:</div>
                                <input className="text-md px-1 border-2 border-gray-200 rounded-md w-30" type="number" min="0" name="stddev" value={investmentTypeData.expectedAnnualIncome.stddev} onChange={handleIncomeChange}/> 
                            </div>
                        </div>
                    </div>
                    <div className="flex gap-4">
                        <h2 className="font-medium">Expense Ratio:</h2>
                        <input className="text-md px-1 border-2 border-gray-200 rounded-md w-20" type="number" min="0" name="expenseRatio" value={investmentTypeData.expenseRatio} onChange={handleChange}/> %
                    </div>
                    <div className="flex gap-2 align-middle">
                        <h2 className="font-medium">Taxability:</h2>
                        <div className="flex gap-1">
                            <input className="ml-1" type="radio" name="isTaxExempt" value={"True"} onChange={handleChange}/>
                            <div className="">Tax-exempt</div>
                        </div>
                        <div className="flex gap-1">
                            <input className="ml-1" type="radio" name="isTaxExempt" value={"False"} onChange={handleChange}/>
                            <div className="">Taxable</div>
                        </div>
                    </div>
                    <div className="flex justify-center gap-20">
                        <button className="text-white px-4 py-1 rounded-md hover:opacity-80 cursor-pointer disabled:opacity-20 disabled:cursor-default bg-red-600 w-20" onClick={() => setOpen(false)}>Cancel</button>
                        <button className="text-white px-4 py-1 rounded-md hover:opacity-80 cursor-pointer disabled:opacity-20 disabled:cursor-default bg-blue-600 w-20" onClick={handleAddInvestmentType}>Add</button>
                    </div>
                </div>
            </Popup>
        </div>
    )
}

const InvestmentPopup = ({formData,setFormData}) => {
    const [ open, setOpen ] = useState(false);
    const [ investmentData, setInvestmentData ] = useState({
        investmentType: "", // are investment types uniquely identified by names?
        value: 0.0
    });

    const handleChange = (e: any) => {
        const { name, value } = e.target;
        setInvestmentData({
            ...investmentData,
            [name]:value,
        })
    }
    // console.log(investmentData)


    
    const handleAddInvestment = () => {

    }
    return (
        <div className="bg-white shadow-md rounded-lg p-6 flex flex-col flex-1 gap-3">
            <h1 className="text-2xl font-bold">My Investments</h1>
            <div className="flex flex-col">
                {/* todo: list of investments */}
            </div>
            <div className="bg-white shadow-md rounded-lg p-6 flex flex-col gap-3 w-100 hover:bg-sky-100 cursor-pointer" onClick={() => setOpen(true)}>
                + Add an Investment
            </div>
            <Popup open={open} position="right center" closeOnDocumentClick modal contentStyle={investmentModalStyling} onClose={() => setOpen(false)}>
                
                <div className="rounded-lg m-10 flex flex-col gap-7">
                    <h1 className="text-2xl font-bold">New Investment</h1>
                    <div className="flex gap-4">
                        <h2 className="font-medium">Investment Type:</h2>
                        Todo: Put dropdown here
                    </div>
                    <div className="flex gap-4">
                        <h2 className="font-medium">Initial Value:</h2>
                        $<input className="text-md px-1 border-2 border-gray-200 rounded-md w-30" type="number" min="0" name="value" value={investmentData.value} onChange={handleChange}/>
                    </div>
                    <div className="flex justify-center gap-20">
                        <button className="text-white px-4 py-1 rounded-md hover:opacity-80 cursor-pointer disabled:opacity-20 disabled:cursor-default bg-red-600 w-20" onClick={() => setOpen(false)}>Cancel</button>
                        <button className="text-white px-4 py-1 rounded-md hover:opacity-80 cursor-pointer disabled:opacity-20 disabled:cursor-default bg-blue-600 w-20" onClick={handleAddInvestment}>Add</button>
                    </div>
                </div>
            </Popup>
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