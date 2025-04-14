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
    invest_type: {},
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

    const validateForm = () => {
        // check if all fields are filled out
        if (Object.keys(investmentData.invest_type).length === 0 || isNaN(investmentData.value)) {
            setError("Please fill out all fields");
            return false;
        }

        // check to see if there is another investment with the same type and tax status
        // check duplicate name
        if (investments.some((inv,i) => {
            if (inv.invest_type.name === investmentData.invest_type.name && inv.tax_status === investmentData.tax_status) {
                if (editing !== i)
                    return true
            }
            return false
        })) {
            setError("Type/tax pair already used.")
            return false;
        }
        return true;
    }
    
    const handleAddInvestment = () => {
        if (!validateForm())
            return;
        console.log("Everything is fine")
        setError("")
        if (editing === -1) { // create new investment
            createInvestment(investmentData)
        }
        else { //modify investment
            updateInvestment(investments[editing].id,investmentData)
        }

        handleClose(true)
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
                    <InvestmentCard key={inv.id} investment={inv} handleEdit={handleEdit} i={i} deleteInvestment={deleteInvestment}/>
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
        else if (name === "invest_type") { // find corresponding invest type
            if (value === "")
                value = {}
            else
                value = investmentTypes.find(inv_type => inv_type.name === value)
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
                    <select className="text-lg px-1 border-2 border-gray-200 rounded-md w-70 h-10" name="invest_type" value={investmentData.invest_type.name} onChange={handleChange} disabled={investmentData.invest_type.name === "cash"}>
                        <option value=""></option>
                        {investmentData.invest_type.name === "cash" && <option value="cash">cash</option>}
                        {investmentTypes.filter(inv_type => inv_type.name !== "cash").map((inv_type) => (
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
                        <input className="ml-1" type="radio" value="non-retirement" onChange={handleTaxRadio} checked={investmentData.tax_status === "non-retirement"} disabled={investmentData.invest_type.name === "cash"}/>
                        <div className="">Non-retirement</div>
                    </div>
                    <div className="flex gap-1">
                        <input className="ml-1" type="radio" value="pre-tax" onChange={handleTaxRadio} checked={investmentData.tax_status === "pre-tax"} disabled={investmentData.invest_type.name === "cash"}/>
                        <div className="">Pre-tax</div>
                    </div>
                    <div className="flex gap-1">
                        <input className="ml-1" type="radio" value="after-tax" onChange={handleTaxRadio} checked={investmentData.tax_status === "after-tax"} disabled={investmentData.invest_type.name === "cash"}/>
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

const InvestmentCard = ({investment,i,handleEdit,deleteInvestment}:{investment:any,i:any,handleEdit:any,deleteInvestment:any}) => {
    return (
        <div className="bg-white shadow-md rounded-lg flex justify-between gap-3 p-6 w-120 h-30 hover:bg-sky-100 cursor-pointer" onClick={() => handleEdit(i)} key={investment.id}>
            <div className="flex flex-col gap-3">
                <h2 className="text-xl font-medium w-85 overflow-ellipsis overflow-hidden whitespace-nowrap">{investment.invest_type.name}</h2>
                <p className="overflow-ellipsis w-85 overflow-hidden whitespace-nowrap">{investment.tax_status} - ${investment.value}</p>
            </div>
            {investment.invest_type.name !== "cash" &&
            <button className="rounded-full p-2 h-10 w-10 hover:bg-red-300 cursor-pointer" onClick={(event) => deleteInvestment(event,investment.id)}>x</button>}
        </div>
    )
}

export default Investment;