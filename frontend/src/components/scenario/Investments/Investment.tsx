import Popup from "reactjs-popup"
import "reactjs-popup/dist/index.css"
import { useState } from "react";


const investmentModalStyling = { 
    "border": "none",
    "borderRadius":"8px",
    "width":"600px",
    "height":"375px"
};

const defaultInvestmentForm = {
    invest_type: "", // are investment types uniquely identified by names?
    value: 0.0,
    tax_status: "non-retirement" // is this needed?
}

const Investment = ({investmentTypes,investments,createInvestment,updateInvestment,deleteInvestment}) => {
    // form state, NOT investment list state
    const [ open, setOpen ] = useState(false);
    const [ investmentData, setInvestmentData ] = useState(defaultInvestmentForm);
    const [ error, setError ] = useState("");
    const [ editing, setEditing ] = useState(-1); // -1 means not currently editing

    // Clear fields if successfully added or cancel button clicked or if editing
    const handleClose = (clear:boolean) => {
        if (clear || editing !== -1)
            setInvestmentData(defaultInvestmentForm)
        setOpen(false)
        setEditing(-1)
        setError("")
    }
    
    const handleAddInvestment = () => {
        // if (investmentData.invest_type === "" || investmentData.tax_status === "") {
        //     setError("Please fill out all fields")
        //     return;
        // }

        // // must change all locations on the form too
        // if (editing !== -1) {
        //     // change investment array
        //     const new_investment = formData.investment.map((investment,i) =>
        //         i === editing ? investmentData : investment);
            
            
        //     // if the tax status changed, check to make sure it is not
        //     // part of any event series, becaues that will mess up the 
        //     // allocations and the percents will not sum to 100.
        //     // Then, if it has changed from pre-tax to any other tax, 
        //     // remove it from strategies
        //     const old_tax = formData.investment[editing].tax_status;
        //     const new_tax = investmentData.tax_status;
        //     const old_type = formData.investment[editing].invest_type;
        //     const new_type = investmentData.invest_type;
        //     if (old_tax !== new_tax) {
        //         for (const es of formData.event_series) {
        //             if (es.type === "expense" || es.type === "income")
        //                 continue;
        //             // check if investment type is used in any allocation
        //             for (const [key,val] of Object.entries(es.initial_allocation)) {
        //                 const last_index = key.lastIndexOf("|")
        //                 const type = key.slice(0,last_index);
        //                 const tax = key.slice(last_index+1)
        //                 if (type === old_type && tax === old_tax) {
        //                     setError("Tax status cannot be changed")
        //                     return
        //                 }
        //             }
        //             for (const [key,val] of Object.entries(es.final_allocation)) {
        //                 const last_index = key.lastIndexOf("|")
        //                 const type = key.slice(0,last_index);
        //                 const tax = key.slice(last_index+1)
        //                 if (type === old_type && tax === old_tax) {
        //                     setError("Tax status cannot be changed")
        //                     return
        //                 }
        //             }
        //         }
        //         let new_withdrawal = formData.expense_withdraw;
        //         let new_rmd = formData.rmd_strat;
        //         let new_roth = formData.roth_conversion_strat;
        //         if (old_tax === "pre-tax-retirement") { // remove from strategies
        //             new_roth = new_roth.filter(inv => inv !== old_type)
        //             new_rmd = new_rmd.filter(inv => inv !== old_type)
        //         }

        //         // make sure to only update (old_type,old_tax) pairs
        //         new_withdrawal = new_withdrawal.map((inv) => {
        //             const last_index = inv.lastIndexOf(" ")
        //             const type = inv.slice(0,last_index);
        //             const tax = inv.slice(last_index+1);
        //             if (type === old_type && tax === old_tax)
        //                 return `${new_type} ${new_tax}`
        //             return inv
        //         });
        //         setFormData({
        //             ...formData,
        //             investment: new_investment,
        //             expense_withdraw: new_withdrawal,
        //             rmd_strat: new_rmd,
        //             roth_conversion_strat: new_roth
        //         })
        //     }

        //     // if only the investment type has changed, change corresponding
        //     // event series and strategies
        //     else if (old_type !== new_type) {
        //         const new_event_series = formData.event_series.map(es => {
        //             if (es.type === "expense" || es.type === "income")
        //                 return es;
        //             const new_initial = {}
        //             const new_final = {}
    
        //             // check if investment name is used in any allocation
        //             for (const [key,val] of Object.entries(es.initial)) {
        //                 const last_index = key.lastIndexOf("|")
        //                 const type = key.slice(0,last_index);
        //                 const tax = key.slice(last_index+1);
        //                 if (type === old_type && tax === old_tax)
        //                     new_initial[`${new_type}|${new_tax}`] = val
        //                 else
        //                     new_initial[key] = val;
        //             }
        //             for (const [key,val] of Object.entries(es.final)) {
        //                 const last_index = key.lastIndexOf("|")
        //                 const type = key.slice(0,last_index);
        //                 const tax = key.slice(last_index+1);
        //                 if (type === old_type && tax === old_tax)
        //                     new_initial[`${new_type}|${new_tax}`] = val
        //                 else
        //                     new_initial[key] = val;
        //             }
    
        //             return {...es,initial:new_initial,final:new_final}
        //         });
    
        //         const new_withdrawal = formData.expense_withdraw.map((inv) => {
        //             const last_index = inv.lastIndexOf(" ")
        //             const type = inv.slice(0,last_index);
        //             const tax = inv.slice(last_index+1);
        //             if (type === old_type && tax === old_tax)
        //                 return `${new_type} ${tax}`
        //             return inv
        //         })
                
        //         if (old_tax === "pre-tax-retirement") {
        //             const new_rmd = formData.rmd_strat.map((inv) =>
        //                 inv === old_type ? new_type : inv);
        //             const new_roth = formData.roth_conversion_strat.map((inv) =>
        //                 inv === old_type ? new_type : inv);
        //             setFormData({
        //                 ...formData,
        //                 investment: new_investment,
        //                 event_series: new_event_series,
        //                 expense_withdraw: new_withdrawal,
        //                 rmd_strat: new_rmd,
        //                 roth_conversion_strat: new_roth
        //             })
        //         }
        //         else { //no need to update rmd and roth
        //             setFormData({
        //                 ...formData,
        //                 investment: new_investment,
        //                 event_series: new_event_series,
        //                 expense_withdraw: new_withdrawal,
        //             })
        //         }
        //     }
        //     else {
        //         setFormData({
        //             ...formData,
        //             investment: new_investment
        //         })
        //     }
        // }
        // else {
        //     setFormData({
        //         ...formData,
        //         investment: [...formData.investment,investmentData] // do i have to deepcopy?
        //     })
        // }
        // handleClose(true)
        // console.log(investmentData);
    }
    const handleEdit = (index) => {
        setEditing(index);
        setInvestmentData(investments[index])
        setOpen(true)
    }

    return (
        <div className="bg-white shadow-md rounded-lg p-6 flex flex-col flex-1 gap-3 h-130">
            <h1 className="text-2xl font-bold">My Investments</h1>
            <div className="bg-white shadow-md rounded-lg p-6 flex flex-col gap-3 w-100 hover:bg-sky-100 cursor-pointer" onClick={() => setOpen(true)}>
                + Add an Investment
            </div>
            <div className="flex flex-col gap-3 overflow-y-scroll h-100">
                {investments.map((inv,i) =>
                    <InvestmentCard key={inv.id} investment={inv} handleEdit={handleEdit} i={i}/>
                )}
            </div>
            <InvestmentPopup investmentData={investmentData} setInvestmentData={setInvestmentData} investmentTypes={investmentTypes} open={open} handleClose={handleClose} error={error} handleAddInvestment={handleAddInvestment} editing={editing}/>
        </div>
    )
}

// investmentData -> form inputs
// investmentTypes -> scenario investment types
const InvestmentPopup = ({investmentData,setInvestmentData,investmentTypes,open,handleClose,error,handleAddInvestment,editing}) => {
    // form handling functions
    const handleTaxRadio = (e) => {
        const {value} = e.target
        setInvestmentData({
            ...investmentData,
            tax_status: value
        })
    }

    const handleChange = (e: any) => {
        let { name, value } = e.target;
        if(name == 'value') {
            value = parseFloat(value);
        }

        setInvestmentData({
            ...investmentData,
            [name]:value,
        })
    }

    return (
        <Popup open={open} position="right center" closeOnDocumentClick modal contentStyle={investmentModalStyling} onClose={() => handleClose(false)}>
            <div className="rounded-lg m-10 flex flex-col gap-3">
                <h1 className="text-2xl font-bold">{editing === -1 ?"New" : "Modify"} Investment</h1>
                <div className="flex gap-4 items-center">
                    <h2 className="font-medium">Investment Type:</h2>
                    <select className="text-lg px-1 border-2 border-gray-200 rounded-md w-70 h-10" name="invest_type" value={investmentData.invest_type} onChange={handleChange}>
                        <option value=""></option>
                        {investmentTypes.map((inv_type) => (
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
                        <input className="ml-1" type="radio" value="pre-tax" onChange={handleTaxRadio} checked={investmentData.tax_status === "pre-tax"}/>
                        <div className="">Pre-tax</div>
                    </div>
                    <div className="flex gap-1">
                        <input className="ml-1" type="radio" value="after-tax" onChange={handleTaxRadio} checked={investmentData.tax_status === "after-tax"}/>
                        <div className="">After-tax</div>
                    </div>
                </div>
                <div className="flex justify-between">
                    <button className="text-white px-4 py-1 rounded-md hover:opacity-80 cursor-pointer disabled:opacity-20 disabled:cursor-default bg-red-600 w-20" onClick={() => handleClose(true)}>Cancel</button>
                    <div className="text-red-600 font-bold">{error}</div>
                    <button className="text-white px-4 py-1 rounded-md hover:opacity-80 cursor-pointer disabled:opacity-20 disabled:cursor-default bg-blue-600 w-20" onClick={handleAddInvestment}>{editing === -1 ? "Add" : "Save"}</button>
                </div>
            </div>
        </Popup>
    )
}

const InvestmentCard = ({investment,i,handleEdit}:{investment:any,i:any,handleEdit:any}) => {
    return (
        <div className="bg-white shadow-md rounded-lg p-6 flex flex-col gap-3 w-120 h-30 hover:bg-sky-100 cursor-pointer" onClick={() => handleEdit(i)} key={investment.id}>
            <h2 className="text-xl font-medium w-85 overflow-ellipsis overflow-hidden">{investment.invest_type}</h2>
            <p className="overflow-ellipsis w-85 overflow-hidden">{investment.tax_status} - ${investment.value}</p>
            {/* <button>Delete</button> */}
        </div>
    )
}

export default Investment;