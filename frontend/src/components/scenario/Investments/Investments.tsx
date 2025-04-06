import Popup from "reactjs-popup"
import "reactjs-popup/dist/index.css"
import { useState, useEffect } from "react";
import axios from "axios";
import Investment from "./Investment";
import InvestmentType from "./InvestmentType";

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

// do not need to use debounce here, there is a separete form for investments

// for investments, only need the id of the investment type, must find name every time
// to avoid inconsistency

// investment and investment components will be handling form field state, which updates
// state over here when successfully updated in backend

const Investments = ({scenario_id}:any) => {
    const [ investmentTypes, setInvestmentTypes ] = useState(null)
    const [ investments, setInvestments ] = useState(null)
    // get all investments and investment types associated with scenario
    const fetchInvestments = async () => {
        console.log("Fetching investments")
        let res;
        try {
            res = await axios.get(`http://localhost:8000/api/scenarios/${scenario_id}/investments`);
        }
        catch(err){
            console.error("Could not fetch investments: ", err);
            return
        }
        const scenario = res.data.scenario;
        console.log(scenario)
        setInvestmentTypes(res.data.scenario.investment_types)
        setInvestments(res.data.scenario.investment)
    }

    const createInvestmentType = async (newData) => {
        try {
            console.log(newData)
            const res = await axios.post(`http://localhost:8000/api/scenarios/${scenario_id}/investment_type`,newData)
            console.log(res)
            setInvestmentTypes(res.data.investment_types)
        }
        catch(err) {
            console.error("Could not create investment type: ",err)
            return
        }
    }

    const createInvestment = async (newData) => {

    }

    const updateInvestmentType = async (invest_id,newData) => {

    }

    const updateInvestment = async (invest_id,newData) => {

    }

    const deleteInvestmentType = async (invest_id) => {

    }

    const deleteInvestment = async (invest_id) => {
        
    }

    useEffect(() => {
        fetchInvestments();
    },[])

    if (investmentTypes === null || investments === null)
        return (<div>Loading</div>)
    
    return (
        <div className="flex gap-5 m-10">
            <InvestmentType investmentTypes={investmentTypes} investments={investments} createInvestmentType={createInvestmentType} updateInvestmentType={updateInvestmentType} deleteInvestmentType={deleteInvestmentType}/>
            <Investment investmentTypes={investmentTypes} investments={investments} createInvestment={createInvestment} updateInvestment={updateInvestment} deleteInvestment={deleteInvestment}/>
        </div>
    )
}

export default Investments