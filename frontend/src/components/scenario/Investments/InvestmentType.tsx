import Popup from "reactjs-popup"
import "reactjs-popup/dist/index.css"
import { useState } from "react";

const investmentTypeModalStyling = { 
    "border": "none",
    "borderRadius":"8px",
    "width":"700px",
    "height":"600px"
};

const defaultInvestmentTypeForm = {
    name: "",
    description: "",
    exp_annual_return: {
        is_percent: false,
        type: "fixed", // either "fixed" or "normal"
        value: 0,
        mean:0,
        stdev:1,
    },
    exp_annual_income: {
        is_percent: false,
        type: "fixed", // either "fixed" or "normal"
        value: 0,
        mean:0,
        stdev:1,
    },
    expense_ratio: 0.0,
    taxability: false
}

// no longer have to modify any event series or strategies when changing name 
// since not submitting all at once

const InvestmentType = ({investmentTypes,investments,createInvestmentType,updateInvestmentType,deleteInvestmentType}) => {
    // form state, NOT investment type list state
    const [ open, setOpen ] = useState(false);
    const [ investmentTypeData, setInvestmentTypeData ] = useState(defaultInvestmentTypeForm);
    const [ error, setError ] = useState("");
    const [ editing, setEditing ] = useState(-1);

    // Clear fields if successfully added or cancel button clicked or if editing
    const handleClose = (clear:boolean) => {
        if (clear || editing !== -1)
            setInvestmentTypeData(defaultInvestmentTypeForm)
        setEditing(-1);
        setOpen(false)
        setError("")
    }

    const validateForm = () => {
        // Check if all fields filled out
        if (investmentTypeData.name === "" || investmentTypeData.description === "" || isNaN(investmentTypeData.expense_ratio)) {
            setError("Please fill out all fields");
            return false;
        }
        if ((investmentTypeData.exp_annual_return.type === "fixed" && isNaN(investmentTypeData.exp_annual_return.value)) || (investmentTypeData.exp_annual_return.type === "normal" && (isNaN(investmentTypeData.exp_annual_return.stdev) || isNaN(investmentTypeData.exp_annual_return.mean)))) {
            setError("Please fill out all fields")
            return false;
        }
        if ((investmentTypeData.exp_annual_income.type === "fixed" && isNaN(investmentTypeData.exp_annual_income.value)) || (investmentTypeData.exp_annual_income.type === "normal" && (isNaN(investmentTypeData.exp_annual_income.stdev) || isNaN(investmentTypeData.exp_annual_income.mean)))) {
            setError("Please fill out all fields")
            return false;
        }

        // check duplicate name
        if (investmentTypes.some((inv_type,i) => {
            if (inv_type.name === investmentTypeData.name) {
                if (editing !== i)
                    return true
            }
            return false
        })) {
            setError("Name is taken. Please use a different name")
            return false;
        }

        // check numeric values
        if ((investmentTypeData.exp_annual_income.type === "normal" && investmentTypeData.exp_annual_income.stdev <= 0) || (investmentTypeData.exp_annual_return.type === "normal" && investmentTypeData.exp_annual_return.stdev <= 0)) {
            setError("Only positive values for stddev")
            return false;
        }
        if (investmentTypeData.expense_ratio < 0) {
            setError("Only nonnegative value for expense ratio")
            return false;
        }
        return true;
    }

    // TODO
    // need to validate fields
    const handleAddInvestmentType = () => {
        if (!validateForm())
            return;
        console.log("Everything is fine")
        setError("")

        if (editing === -1) { // create new investment type
            createInvestmentType(investmentTypeData)
        }
        else { //modify investment type
            updateInvestmentType(investmentTypes[editing].id,investmentTypeData)
        }

        handleClose(true)
        // // must change all locations on the form too
        // if (editing !== -1) {
        //     // change investment type array
        //     const new_investment_types = formData.investment_types.map((investment,i) =>
        //         i === editing ? investmentTypeData : investment);

        //     // if the name has changed, change all investments and strategies that reference this 
        //     // investment type, and also change any event series
        //     const old_name = formData.investment_types[editing].name;
        //     const new_name = investmentTypeData.name;
        //     if (new_name !== old_name) {
        //         const new_investment = formData.investment.map((inv) =>
        //             inv.invest_type === old_name ? {...inv,invest_type:new_name} : inv);
        //         const new_event_series = formData.event_series.map(es => {
        //             if (es.type === "expense" || es.type === "income")
        //                 return es;
        //             const new_initial = {}
        //             const new_final = {}
    
        //             // check if investment name is used in any allocation
        //             for (const [key,val] of Object.entries(es.initial)) {
        //                 const last_index = key.lastIndexOf("|")
        //                 const type = key.slice(0,last_index);
        //                 if (type === old_name)
        //                     new_initial[`${new_name}|${key.slice(last_index+1)}`] = val
        //                 else
        //                     new_initial[key] = val;
        //             }
        //             for (const [key,val] of Object.entries(es.final)) {
        //                 const last_index = key.lastIndexOf("|")
        //                 const type = key.slice(0,last_index);
        //                 if (type === old_name)
        //                     new_final[`${new_name}|${key.slice(last_index+1)}`] = val
        //                 else
        //                     new_final[key] = val;
        //             }
    
        //             return {...es,initial:new_initial,final:new_final}
        //         });
    
        //         const new_withdrawal = formData.expense_withdraw.map((inv) => {
        //             const last_index = inv.lastIndexOf(" ")
        //             const type = inv.slice(0,last_index);
        //             const tax = inv.slice(last_index+1);
        //             if (type === old_name)
        //                 return `${new_name} ${tax}`
        //             return inv
        //         })
        //         const new_rmd = formData.rmd_strat.map((inv) =>
        //             inv === old_name ? new_name : inv);
        //         const new_roth = formData.roth_conversion_strat.map((inv) =>
        //             inv === old_name ? new_name : inv);
        //         setFormData({
        //             ...formData,
        //             investment_types: new_investment_types,
        //             investment: new_investment,
        //             event_series: new_event_series,
        //             expense_withdraw: new_withdrawal,
        //             rmd_strat: new_rmd,
        //             roth_conversion_strat: new_roth
        //         })
        //     }
        //     else {
        //         setFormData({
        //             ...formData,
        //             investment_types: new_investment_types
        //         })
        //     }
        //     console.log("edited")
        // }
        // else {// if adding, append to end
        //     setFormData({
        //         ...formData,
        //         investment_types: [...formData.investment_types,investmentTypeData]
        //     })
        //     console.log("added")
        // }        
    }

    const handleEdit = (index) => {
        setEditing(index);
        setInvestmentTypeData(investmentTypes[index])
        setOpen(true);
    }

    return (
        <div className="bg-white shadow-md rounded-lg p-6 flex flex-col flex-1 gap-3 h-130">
            <h1 className="text-2xl font-bold">My Investment Types</h1>
            
            <div className="bg-white shadow-md rounded-lg p-6 flex flex-col gap-3 w-100 hover:bg-sky-100 cursor-pointer" onClick={() => setOpen(true)}>
                + Add an Investment Type
            </div>
            <div className="flex flex-col gap-3 overflow-y-scroll h-100">
                {investmentTypes.map((investment_type,i) => 
                    <InvestmentTypeCard key={investment_type.name} name={investment_type.name} description={investment_type.description} i={i} handleEdit={handleEdit}/>
                )}
            </div>
            <InvestmentTypePopup investmentTypeData={investmentTypeData} setInvestmentTypeData={setInvestmentTypeData} open={open} handleClose={handleClose} error={error} handleAddInvestmentType={handleAddInvestmentType} editing={editing}/>
        </div>
    )
}

const InvestmentTypePopup = ({investmentTypeData,setInvestmentTypeData,open,handleClose,error,handleAddInvestmentType,editing}) => {
    // form handling functions
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
            taxability:(value==="true"),
        })
    }

    const handleChange = (e: any) => {
        let { name, value } = e.target;

        const float_names = new Set(['expense_ratio', 'initial_amt']);
        if (float_names.has(name)) {
            value = parseFloat(value);
        }

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
                [name]:parseFloat(value),
            }
        })
    }

    const handleIncomeChange = (e: any) => {
        const { name, value } = e.target;
        setInvestmentTypeData({
            ...investmentTypeData,
            exp_annual_income: {
                ...investmentTypeData.exp_annual_income,
                [name]:parseFloat(value),
            }
        })
    }

    return (
        <Popup open={open} position="right center" modal contentStyle={investmentTypeModalStyling} onClose={() => handleClose(false)}>
            <div className="rounded-lg m-10 flex flex-col gap-2">
                <h1 className="text-2xl font-bold">{editing === -1 ?"New" : "Modify"} Investment Type</h1>
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
                            <input className="text-md px-1 border-2 border-gray-200 rounded-md w-30" type="number" min="0" name="value" value={investmentTypeData.exp_annual_return.value} onChange={handleReturnChange}/> 
                        </div>
                        <div className="flex gap-2 align-middle">
                            <input className="ml-1" type="radio" value="normal" onChange={handleRetTypeRadio} checked={investmentTypeData.exp_annual_return.type === "normal"}/>
                            <div className="">Normal: &nbsp; Mean:</div>
                            <input className="text-md px-1 border-2 border-gray-200 rounded-md w-30" type="number" min="0" name="mean" value={investmentTypeData.exp_annual_return.mean} onChange={handleReturnChange}/> 
                            <div className="">Std dev:</div>
                            <input className="text-md px-1 border-2 border-gray-200 rounded-md w-30" type="number" min="0" name="stdev" value={investmentTypeData.exp_annual_return.stdev} onChange={handleReturnChange}/> 
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
                            <input className="text-md px-1 border-2 border-gray-200 rounded-md w-30" type="number" min="0" name="value" value={investmentTypeData.exp_annual_income.value} onChange={handleIncomeChange}/> 
                        </div>
                        <div className="flex gap-2 align-middle">
                            <input className="ml-1" type="radio" value="normal" onChange={handleIncTypeRadio} checked={investmentTypeData.exp_annual_income.type === "normal"}/>
                            <div className="">Normal: &nbsp; Mean:</div>
                            <input className="text-md px-1 border-2 border-gray-200 rounded-md w-30" type="number" min="0" name="mean" value={investmentTypeData.exp_annual_income.mean} onChange={handleIncomeChange}/> 
                            <div className="">Std dev:</div>
                            <input className="text-md px-1 border-2 border-gray-200 rounded-md w-30" type="number" min="0" name="stdev" value={investmentTypeData.exp_annual_income.stdev} onChange={handleIncomeChange}/> 
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
                        <input className="ml-1" type="radio" value="true" onChange={handleTaxRadio} checked={investmentTypeData.taxability}/>
                        <div className="">Tax-exempt</div>
                    </div>
                    <div className="flex gap-1">
                        <input className="ml-1" type="radio" value="false" onChange={handleTaxRadio} checked={!investmentTypeData.taxability}/>
                        <div className="">Taxable</div>
                    </div>
                </div>
                <div className="flex justify-between">
                    <button className="text-white px-4 py-1 rounded-md hover:opacity-80 cursor-pointer disabled:opacity-20 disabled:cursor-default bg-red-600 w-20" onClick={() => handleClose(true)}>Cancel</button>
                    <div className="text-red-600 font-bold">{error}</div>
                    <button className="text-white px-4 py-1 rounded-md hover:opacity-80 cursor-pointer disabled:opacity-20 disabled:cursor-default bg-blue-600 w-20" onClick={handleAddInvestmentType}>{editing === -1 ? "Add" : "Save"}</button>
                </div>
            </div>
        </Popup>
    )
}

// click to edit
const InvestmentTypeCard = ({name, description,i,handleEdit}:{name:any, description:any,i:any,handleEdit:any}) => {
    return (
        <div className="bg-white shadow-md rounded-lg p-6 flex flex-col gap-3 w-120 h-30 hover:bg-sky-100 cursor-pointer" onClick={() => handleEdit(i)}>
            <h2 className="text-xl font-medium w-85 overflow-ellipsis overflow-hidden">{name}</h2>
            <p className="overflow-ellipsis w-85 overflow-hidden">{description}</p>
            {/* <button>Delete</button> */}
        </div>
    )
}

export default InvestmentType;