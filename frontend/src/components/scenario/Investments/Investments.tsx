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
            res = await axios.get(`http://localhost:8000/api/scenarios/investments/${scenario_id}`);
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
            const res = await axios.post(`http://localhost:8000/api/scenarios/investment_type/${scenario_id}`,newData)
            console.log(res)
            setInvestmentTypes(res.data.investment_types)
        }
        catch(err) {
            console.error("Could not create investment type: ",err)
            return
        }
    }

    const createInvestment = async (newData) => {
        const data = {...newData,"invest_type":newData.invest_type.id}
        try {
            console.log(newData)
            const res = await axios.post(`http://localhost:8000/api/scenarios/investment/${scenario_id}`,data)
            console.log(res)
            setInvestments(res.data.investment)
        }
        catch(err) {
            console.error("Could not create investment: ",err)
            return
        }

    }

    const updateInvestmentType = async (invest_id,newData) => {
        try {
            console.log(newData)
            const res = await axios.put(`http://localhost:8000/api/scenarios/investment_type/${scenario_id}/${invest_id}`,newData)
            console.log(res)
            setInvestmentTypes(res.data.investment_types)
            setInvestments(res.data.investment) // changing investment type may change investments
        }
        catch(err) {
            console.error("Could not modify investment type: ",err)
            return
        }
    }

    const updateInvestment = async (invest_id,newData) => {
        const data = {...newData,"invest_type":newData.invest_type.id}
        console.log(data)
        try {
            const res = await axios.put(`http://localhost:8000/api/scenarios/investment/${scenario_id}/${invest_id}`,data)
            console.log(res)
            setInvestments(res.data.investment)
        }
        catch(err) {
            console.error("Could not modify investment type: ",err)
            return
        }
    }

    const deleteInvestmentType = async (event,invest_id) => {
        event.stopPropagation();
        console.log(`im deleting ${invest_id}`);
        try {
            const res = await axios.delete(`http://localhost:8000/api/scenarios/investment_type/${scenario_id}/${invest_id}`);
            console.log(res);
            setInvestmentTypes(investmentTypes.filter(inv => inv.id !== invest_id));
        } catch(err) {
            console.error("Could not delete investment type: ",err);
            return;
        }
    }

    const deleteInvestment = async (event,invest_id) => {
        event.stopPropagation();
        console.log(`im deleting ${invest_id}`);
        try {
            const res = await axios.delete(`http://localhost:8000/api/scenarios/investment/${scenario_id}/${invest_id}`);
            console.log(res);
            setInvestments(investments.filter(inv => inv.id !== invest_id));
        } catch(err) {
            console.error("Could not delete investment: ",err);
            return;
        }
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