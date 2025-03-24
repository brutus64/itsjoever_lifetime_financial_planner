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
        is_percent: "",
        type: "", // either "fixed" or "normal"
        fixed: 0,
        mean:0,
        stddev:1,
    },
    exp_annual_income: {
        is_percent: "",
        type: "", // either "fixed" or "normal"
        fixed: 0,
        mean:0,
        stddev:1,
    },
    expense_ratio: 0.0,
    is_tax_exempt: true
}

const InvestmentTypePopup = ({formData,setFormData}) => {
    const [ open, setOpen ] = useState(false);
    const [ investmentTypeData, setInvestmentTypeData ] = useState(defaultInvestmentTypeForm);

    // Clear fields if successfully added or cancel button clicked or if editing
    const handleClose = (clear:boolean) => {
        if (clear)
            setInvestmentTypeData(defaultInvestmentTypeForm)
        setOpen(false)
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
        if (name === "ret_is_percent")
            name = "is_percent"
        else if (name === "retType")
            name = "type"
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
        setFormData({
            ...formData,
            investment_types: [...formData.investment_types,investmentTypeData] // do i have to deepcopy?
        })
        handleClose(true)
        console.log("added")
    }

    console.log(formData.investment_types)

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
                

                {/* todo: list of investment types */}
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
                                <input className="ml-1" type="radio" name="ret_is_percent" value={"false"} onChange={handleReturnChange} />
                                <div className="">Amount</div>
                            </div>
                            <div className="flex gap-2 align-middle">
                                <input className="ml-1" type="radio" name="ret_is_percent" value={"true"} onChange={handleReturnChange}/>
                                <div className="">Percent</div>
                            </div>
                        </div>
                        <div className="border-l-2 border-l-black-400 pl-5 flex flex-col gap-1">
                            <div className="flex gap-2 align-middle">
                                <input className="ml-1" type="radio" name="retType" value={"fixed"} onChange={handleReturnChange}/>
                                <div className="">Fixed:</div>
                                <input className="text-md px-1 border-2 border-gray-200 rounded-md w-30" type="number" min="0" name="fixed" value={investmentTypeData.exp_annual_return.fixed} onChange={handleReturnChange}/> 
                            </div>
                            <div className="flex gap-2 align-middle">
                                <input className="ml-1" type="radio" name="retType" value={"normal"} onChange={handleReturnChange}/>
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
                                <input className="ml-1" type="radio" name="is_percent" value={"false"} onChange={handleIncomeChange}/>
                                <div className="">Amount</div>
                            </div>
                            <div className="flex gap-2 align-middle">
                                <input className="ml-1" type="radio" name="is_percent" value={"true"} onChange={handleIncomeChange}/>
                                <div className="">Percent</div>
                            </div>
                        </div>
                        <div className="border-l-2 border-l-black-400 pl-5 flex flex-col gap-1">
                            <div className="flex gap-2 align-middle">
                                <input className="ml-1" type="radio" name="type" value={"fixed"} onChange={handleIncomeChange}/>
                                <div className="">Fixed:</div>
                                <input className="text-md px-1 border-2 border-gray-200 rounded-md w-30" type="number" min="0" name="fixed" value={investmentTypeData.exp_annual_income.fixed} onChange={handleIncomeChange}/> 
                            </div>
                            <div className="flex gap-2 align-middle">
                                <input className="ml-1" type="radio" name="type" value={"normal"} onChange={handleIncomeChange}/>
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
                            <input className="ml-1" type="radio" name="is_tax_exempt" value={"True"} onChange={handleChange}/>
                            <div className="">Tax-exempt</div>
                        </div>
                        <div className="flex gap-1">
                            <input className="ml-1" type="radio" name="is_tax_exempt" value={"False"} onChange={handleChange}/>
                            <div className="">Taxable</div>
                        </div>
                    </div>
                    <div className="flex justify-center gap-20">
                        <button className="text-white px-4 py-1 rounded-md hover:opacity-80 cursor-pointer disabled:opacity-20 disabled:cursor-default bg-red-600 w-20" onClick={() => handleClose(true)}>Cancel</button>
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
    tax_status: "" // is this needed?
}

const InvestmentPopup = ({formData,setFormData}) => {
    const [ open, setOpen ] = useState(false);
    const [ investmentData, setInvestmentData ] = useState(defaultInvestmentForm);

    // Clear fields if successfully added or cancel button clicked or if editing
    const handleClose = (clear:boolean) => {
        if (clear)
            setInvestmentData(defaultInvestmentForm)
        setOpen(false)
    }

    const handleChange = (e: any) => {
        const { name, value } = e.target;
        setInvestmentData({
            ...investmentData,
            [name]:value,
        })
        console.log(e.target)
    }
    // console.log(investmentData)


    
    const handleAddInvestment = () => {
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
                    <InvestmentItem investment_type={inv.investment_type} value={inv.value}/>
                )}
                
            </div>
            <Popup open={open} position="right center" closeOnDocumentClick modal contentStyle={investmentModalStyling} onClose={() => handleClose(false)}>
                
                <div className="rounded-lg m-10 flex flex-col gap-7">
                    <h1 className="text-2xl font-bold">New Investment</h1>
                    <div className="flex gap-4 items-center">
                        <h2 className="font-medium">Investment Type:</h2>
                        <select className="text-lg px-1 border-2 border-gray-200 rounded-md w-70 h-10" name="investment_type" onChange={handleChange}>
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
                    <div className="flex justify-center gap-20">
                        <button className="text-white px-4 py-1 rounded-md hover:opacity-80 cursor-pointer disabled:opacity-20 disabled:cursor-default bg-red-600 w-20" onClick={() => handleClose(true)}>Cancel</button>
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

const InvestmentItem = ({investment_type, value}) => {
    return (
        <div className="bg-white shadow-md rounded-lg p-6 flex flex-col gap-3 w-120 h-30 hover:bg-sky-100 cursor-pointer">
            <h2 className="text-xl font-medium w-85 overflow-ellipsis overflow-hidden">{investment_type}</h2>
            <p className="overflow-ellipsis w-85 overflow-hidden">${value}</p>
            {/* <button>Edit</button> */}
        </div>
    )
}
export default Investments