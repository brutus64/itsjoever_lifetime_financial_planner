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
    "width":"600px",
    "height":"375px"
};


// Todo:         
// Handle form submits      
// Repurpose for editing    
// Deleting ability

const Investments = ({formData,setFormData}:any) => {
    return (
        <div className="flex flex-col gap-4 m-10">
            {/* <div className="bg-white shadow-md rounded-lg p-6 flex flex-col gap-3 w-200">
                <h1 className="text-2xl font-bold">Investments</h1>
                <p>An investment is the allocation of money into assets such as stocks, bonds, or real estate, with the expectation that the value of those assets will grow over time, providing returns through appreciation, dividends, or interest payments.</p>
            </div> */}
            <div className="flex gap-5">
                <InvestmentTypePopup formData={formData} setFormData={setFormData} />
                <InvestmentPopup formData={formData} setFormData={setFormData} />
            </div>
        </div>
    )
}

const defaultInvestmentTypeForm = {
    name: "",
    description: "",
    exp_annual_return: {
        is_percent: false,
        type: "fixed", // either "fixed" or "normal"
        fixed: 0,
        mean:0,
        stddev:1,
    },
    exp_annual_income: {
        is_percent: false,
        type: "fixed", // either "fixed" or "normal"
        fixed: 0,
        mean:0,
        stddev:1,
    },
    expense_ratio: 0.0,
    is_tax_exempt: false
}

const InvestmentTypePopup = ({formData,setFormData}) => {
    const [ open, setOpen ] = useState(false);
    const [ investmentTypeData, setInvestmentTypeData ] = useState(defaultInvestmentTypeForm);
    const [ error, setError ] = useState("");

    // annoying radio buttons
    const handleRetPercentRadio = (e) => {
        const {value} = e.target
        setInvestmentTypeData({
            ...investmentTypeData,
            exp_annual_return: {
                ...investmentTypeData.exp_annual_return,
                is_percent:(value==="true"),
            }
        })
    }

    const handleRetTypeRadio = (e) => {
        const {value} = e.target
        setInvestmentTypeData({
            ...investmentTypeData,
            exp_annual_return: {
                ...investmentTypeData.exp_annual_return,
                type:value,
            }
        })
    }

    const handleIncPercentRadio = (e) => {
        const {value} = e.target
        setInvestmentTypeData({
            ...investmentTypeData,
            exp_annual_income: {
                ...investmentTypeData.exp_annual_income,
                is_percent:(value==="true"),
            }
        })
    }

    const handleIncTypeRadio = (e) => {
        const {value} = e.target
        setInvestmentTypeData({
            ...investmentTypeData,
            exp_annual_income: {
                ...investmentTypeData.exp_annual_income,
                type:value,
            }
        })
    }

    const handleTaxRadio = (e) => {
        const {value} = e.target
        setInvestmentTypeData({
            ...investmentTypeData,
            exp_annual_income: {
                ...investmentTypeData.exp_annual_income,
                is_tax_exempt:(value==="true"),
            }
        })
    }

    // Clear fields if successfully added or cancel button clicked or if editing
    const handleClose = (clear:boolean) => {
        if (clear)
            setInvestmentTypeData(defaultInvestmentTypeForm)
        setOpen(false)
        setError("")
    }

    const handleChange = (e: any) => {
        const { name, value } = e.target;
        setInvestmentTypeData({
            ...investmentTypeData,
            [name]:value,
        })
    }

    const handleReturnChange = (e: any) => {
        const { name, value } = e.target;
        setInvestmentTypeData({
            ...investmentTypeData,
            exp_annual_return: {
                ...investmentTypeData.exp_annual_return,
                [name]:value,
            }
        })
    }

    const handleIncomeChange = (e: any) => {
        const { name, value } = e.target;
        setInvestmentTypeData({
            ...investmentTypeData,
            exp_annual_income: {
                ...investmentTypeData.exp_annual_income,
                [name]:value,
            }
        })
    }
    // need to validate fields
    const handleAddInvestmentType = () => {
        // Check if all fields are filled out
        const important_fields = [investmentTypeData.name,investmentTypeData.description]
        const numeric_fields = [investmentTypeData.expense_ratio,]

        if (important_fields.some((field) => field === "")) {
            setError("Please fill out all fields");
            return;
        }

        // should check for duplicate name

        if (investmentTypeData.exp_annual_income.stddev <= 0 || investmentTypeData.exp_annual_return.stddev <= 0) {
            setError("Only positive values for stddev")
            return;
        }
        if (investmentTypeData.expense_ratio < 0) {
            setError("Only nonnegative value for expense ratio")
            return;
        }
        setFormData({
            ...formData,
            investment_types: [...formData.investment_types,investmentTypeData]
        })
        handleClose(true)
        console.log("added")
    }

    return (
        <div className="bg-white shadow-md rounded-lg p-6 flex flex-col flex-1 gap-3 h-130">
            <h1 className="text-2xl font-bold">My Investment Types</h1>
            
            <div className="bg-white shadow-md rounded-lg p-6 flex flex-col gap-3 w-100 hover:bg-sky-100 cursor-pointer" onClick={() => setOpen(true)}>
                + Add an Investment Type
            </div>
            <div className="flex flex-col gap-3 overflow-y-scroll h-100">
                {formData.investment_types.map(investment_type => 
                    <InvestmentTypeItem key={investment_type.name} name={investment_type.name} description={investment_type.description}/>
                )}
            </div>
            <Popup open={open} position="right center" modal contentStyle={investmentTypeModalStyling} onClose={() => handleClose(false)}>
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
                                <input className="ml-1" type="radio" value="false" onChange={handleRetPercentRadio} checked={!investmentTypeData.exp_annual_return.is_percent}/>
                                <div className="">Amount</div>
                            </div>
                            <div className="flex gap-2 align-middle">
                                <input className="ml-1" type="radio" value="true" onChange={handleRetPercentRadio} checked={investmentTypeData.exp_annual_return.is_percent}/>
                                <div className="">Percent</div>
                            </div>
                        </div>
                        <div className="border-l-2 border-l-black-400 pl-5 flex flex-col gap-1">
                            <div className="flex gap-2 align-middle">
                                <input className="ml-1" type="radio" value="fixed" onChange={handleRetTypeRadio} checked={investmentTypeData.exp_annual_return.type === "fixed"}/>
                                <div className="">Fixed:</div>
                                <input className="text-md px-1 border-2 border-gray-200 rounded-md w-30" type="number" min="0" name="fixed" value={investmentTypeData.exp_annual_return.fixed} onChange={handleReturnChange}/> 
                            </div>
                            <div className="flex gap-2 align-middle">
                                <input className="ml-1" type="radio" value="normal" onChange={handleRetTypeRadio} checked={investmentTypeData.exp_annual_return.type === "normal"}/>
                                <div className="">Normal: &nbsp; Mean:</div>
                                <input className="text-md px-1 border-2 border-gray-200 rounded-md w-30" type="number" min="0" name="mean" value={investmentTypeData.exp_annual_return.mean} onChange={handleReturnChange}/> 
                                <div className="">Std dev:</div>
                                <input className="text-md px-1 border-2 border-gray-200 rounded-md w-30" type="number" min="0" name="stddev" value={investmentTypeData.exp_annual_return.stddev} onChange={handleReturnChange}/> 
                            </div>
                        </div>
                    </div>
                    <h2 className="font-medium">Expected Annual Income:</h2>
                    <div className="flex gap-5">
                        <div className="flex flex-col gap-2">
                            <div className="flex gap-2 align-middle">
                                <input className="ml-1" type="radio" value="false" onChange={handleIncPercentRadio} checked={!investmentTypeData.exp_annual_income.is_percent}/>
                                <div className="">Amount</div>
                            </div>
                            <div className="flex gap-2 align-middle">
                                <input className="ml-1" type="radio" value="true" onChange={handleIncPercentRadio} checked={investmentTypeData.exp_annual_income.is_percent}/>
                                <div className="">Percent</div>
                            </div>
                        </div>
                        <div className="border-l-2 border-l-black-400 pl-5 flex flex-col gap-1">
                            <div className="flex gap-2 align-middle">
                                <input className="ml-1" type="radio" value="fixed" onChange={handleIncTypeRadio} checked={investmentTypeData.exp_annual_income.type === "fixed"}/>
                                <div className="">Fixed:</div>
                                <input className="text-md px-1 border-2 border-gray-200 rounded-md w-30" type="number" min="0" name="fixed" value={investmentTypeData.exp_annual_income.fixed} onChange={handleIncomeChange}/> 
                            </div>
                            <div className="flex gap-2 align-middle">
                                <input className="ml-1" type="radio" value="normal" onChange={handleIncTypeRadio} checked={investmentTypeData.exp_annual_income.type === "normal"}/>
                                <div className="">Normal: &nbsp; Mean:</div>
                                <input className="text-md px-1 border-2 border-gray-200 rounded-md w-30" type="number" min="0" name="mean" value={investmentTypeData.exp_annual_income.mean} onChange={handleIncomeChange}/> 
                                <div className="">Std dev:</div>
                                <input className="text-md px-1 border-2 border-gray-200 rounded-md w-30" type="number" min="0" name="stddev" value={investmentTypeData.exp_annual_income.stddev} onChange={handleIncomeChange}/> 
                            </div>
                        </div>
                    </div>
                    <div className="flex gap-4">
                        <h2 className="font-medium">Expense Ratio:</h2>
                        <input className="text-md px-1 border-2 border-gray-200 rounded-md w-20" type="number" min="0" name="expense_ratio" value={investmentTypeData.expense_ratio} onChange={handleChange}/> %
                    </div>
                    <div className="flex gap-2 align-middle">
                        <h2 className="font-medium">Taxability:</h2>
                        <div className="flex gap-1">
                            <input className="ml-1" type="radio" value="true" onChange={handleTaxRadio} checked={investmentTypeData.is_tax_exempt}/>
                            <div className="">Tax-exempt</div>
                        </div>
                        <div className="flex gap-1">
                            <input className="ml-1" type="radio" value="false" onChange={handleTaxRadio} checked={!investmentTypeData.is_tax_exempt}/>
                            <div className="">Taxable</div>
                        </div>
                    </div>
                    <div className="flex justify-between">
                        <button className="text-white px-4 py-1 rounded-md hover:opacity-80 cursor-pointer disabled:opacity-20 disabled:cursor-default bg-red-600 w-20" onClick={() => handleClose(true)}>Cancel</button>
                        <div className="text-red-600 font-bold">{error}</div>
                        <button className="text-white px-4 py-1 rounded-md hover:opacity-80 cursor-pointer disabled:opacity-20 disabled:cursor-default bg-blue-600 w-20" onClick={handleAddInvestmentType}>Add</button>
                    </div>
                </div>
            </Popup>
        </div>
    )
}

const defaultInvestmentForm = {
    investment_type: "", // are investment types uniquely identified by names?
    value: 0.0,
    tax_status: "non-retirement" // is this needed?
}

const InvestmentPopup = ({formData,setFormData}) => {
    const [ open, setOpen ] = useState(false);
    const [ investmentData, setInvestmentData ] = useState(defaultInvestmentForm);
    const [ error, setError ] = useState("");

    const handleTaxRadio = (e) => {
        const {value} = e.target
        setInvestmentData({
            ...investmentData,
            tax_status: value
        })
    }

    // Clear fields if successfully added or cancel button clicked or if editing
    const handleClose = (clear:boolean) => {
        if (clear)
            setInvestmentData(defaultInvestmentForm)
        setOpen(false)
        setError("")
    }

    const handleChange = (e: any) => {
        const { name, value } = e.target;
        setInvestmentData({
            ...investmentData,
            [name]:value,
        })
    }


    
    const handleAddInvestment = () => {
        console.log(investmentData)
        if (investmentData.investment_type === "" || investmentData.tax_status === "") {
            setError("Please fill out all fields")
            return;
        }
        setFormData({
            ...formData,
            investment: [...formData.investment,investmentData] // do i have to deepcopy?
        })
        handleClose(true)
    }
    return (
        <div className="bg-white shadow-md rounded-lg p-6 flex flex-col flex-1 gap-3 h-130">
            <h1 className="text-2xl font-bold">My Investments</h1>
            <div className="bg-white shadow-md rounded-lg p-6 flex flex-col gap-3 w-100 hover:bg-sky-100 cursor-pointer" onClick={() => setOpen(true)}>
                + Add an Investment
            </div>
            <div className="flex flex-col gap-3 overflow-y-scroll h-100">
                {formData.investment.map(inv =>
                    <InvestmentItem investment={inv}/>
                )}
                
            </div>
            <Popup open={open} position="right center" closeOnDocumentClick modal contentStyle={investmentModalStyling} onClose={() => handleClose(false)}>
                
                <div className="rounded-lg m-10 flex flex-col gap-3">
                    <h1 className="text-2xl font-bold">New Investment</h1>
                    <div className="flex gap-4 items-center">
                        <h2 className="font-medium">Investment Type:</h2>
                        <select className="text-lg px-1 border-2 border-gray-200 rounded-md w-70 h-10" name="investment_type" value={investmentData.investment_type} onChange={handleChange}>
                            <option value=""></option>
                            {formData.investment_types.map((inv_type) => (
                                <option className="flex flex-col w-100 h-23" key={inv_type.name} value={inv_type.name}>
                                    {inv_type.name}
                                </option>
                            ))}
                        </select>
                    </div>
                    <div className="flex gap-4">
                        <h2 className="font-medium">Initial Value:</h2>
                        $<input className="text-md px-1 border-2 border-gray-200 rounded-md w-30" type="number" min="0" name="value" value={investmentData.value} onChange={handleChange}/>
                    </div>
                    <div className="flex flex-col gap-1">
                        <h2 className="font-medium">Tax Status:</h2>
                        <div className="flex gap-1">
                            <input className="ml-1" type="radio" value="non-retirement" onChange={handleTaxRadio} checked={investmentData.tax_status === "non-retirement"}/>
                            <div className="">Non-retirement</div>
                        </div>
                        <div className="flex gap-1">
                            <input className="ml-1" type="radio" value="pre-tax-retirement" onChange={handleTaxRadio} checked={investmentData.tax_status === "pre-tax-retirement"}/>
                            <div className="">Pre-tax retirement</div>
                        </div>
                        <div className="flex gap-1">
                            <input className="ml-1" type="radio" value="after-tax-retirement" onChange={handleTaxRadio} checked={investmentData.tax_status === "after-tax-retirement"}/>
                            <div className="">After-tax retirement</div>
                        </div>
                    </div>
                    <div className="flex justify-between">
                        <button className="text-white px-4 py-1 rounded-md hover:opacity-80 cursor-pointer disabled:opacity-20 disabled:cursor-default bg-red-600 w-20" onClick={() => handleClose(true)}>Cancel</button>
                        <div className="text-red-600 font-bold">{error}</div>
                        <button className="text-white px-4 py-1 rounded-md hover:opacity-80 cursor-pointer disabled:opacity-20 disabled:cursor-default bg-blue-600 w-20" onClick={handleAddInvestment}>Add</button>
                    </div>
                </div>
            </Popup>
        </div>
    )
}

// click to edit
const InvestmentTypeItem = ({name, description}) => {
    return (
        <div className="bg-white shadow-md rounded-lg p-6 flex flex-col gap-3 w-120 h-30 hover:bg-sky-100 cursor-pointer">
            <h2 className="text-xl font-medium w-85 overflow-ellipsis overflow-hidden">{name}</h2>
            <p className="overflow-ellipsis w-85 overflow-hidden">{description}</p>
            {/* <button>Edit</button> */}
        </div>
    )
}

const InvestmentItem = ({investment}) => {
    return (
        <div className="bg-white shadow-md rounded-lg p-6 flex flex-col gap-3 w-120 h-30 hover:bg-sky-100 cursor-pointer">
            <h2 className="text-xl font-medium w-85 overflow-ellipsis overflow-hidden">{investment.investment_type}</h2>
            <p className="overflow-ellipsis w-85 overflow-hidden">{investment.tax_status} - ${investment.value}</p>
            {/* <button>Edit</button> */}
        </div>
    )
}
export default Investments