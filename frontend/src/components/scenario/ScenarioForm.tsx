import { useEffect, useState } from "react";
import { useParams, useLocation } from "react-router-dom";
import Investments from "./Investments";
import EventSeries from "./EventSeries/EventSeries";
import RMDRoth from "./RMDRoth/RMDRoth";
import SpendingWithdrawal from "./SpendingWithdrawalStrategy/SpendingWithdrawal";
import Summary from "./Summary";
import MainInfo from "./MainInfo";
import axios from "axios";

const ScenarioForm = () => { // if want to pass in a scenario to edit, useparam
    const params = useParams();
    const [currentPage, setCurrentPage] = useState(1)
    // const location = useLocation();
    // const [formData, setFormData] = useState({
    //     name: "",
    //     is_married: false,
    //     birth_year: 2000,
    //     spouse_birth_year: 2000,
    //     life_expectancy: {
    //         type: "fixed",
    //         value: 0,
    //         mean: 0,
    //         stdev: 1,
    //     },
    //     spouse_life_expectancy: {
    //         type: "fixed",
    //         value: 0,
    //         mean: 0,
    //         stdev: 1,
    //     },
    //     investment_types: [],
    //     investment: [],
    //     event_series: [],
    //     inflation_assume: {
    //         type: "fixed",
    //         value: 0,
    //         mean: 0,
    //         stdev: 1,
    //     },
    //     // init_limit_posttax: 0.0, // I do not think the user has to fill this in
    //     spending_strat: [],
    //     expense_withdraw: [],
    //     rmd_strat: [],
    //     roth_conversion_strat: [],
    //     roth_optimizer: {
    //         is_enable: false,
    //         start_year: 2025,
    //         end_year: 2025
    //     },
    //     fin_goal: 0,
    //     state: ""
    // });
    

    // useEffect(() => {
    //     const fetchScenario = async () => {
    //         console.log("Fetching scenario")
    //         let res;
    //         try{
    //             res = await axios.get(`http://localhost:8000/api/scenarios/view/${params.id}`);
    //             console.log(res.data);
    //         }
    //         catch(err){
    //             console.log("Could not fetch scenario: ", err);
    //             return (<div>Scenario not found</div>)
    //         }
    //         const scenario = res.data.scenario;
    //         // convert to form format
    //         const formFormat = {
    //             name: scenario.name,
    //             is_married: scenario.marital === "couple",
    //             birth_year: scenario.birth_year[0],
    //             spouse_birth_year: scenario.martial === "couple" ? scenario.birth_year[1] : "",
    //             fin_goal: scenario.fin_goal,
    //             state: scenario.state,
    //             life_expectancy: {
    //                 ...scenario.life_expectancy[0],
    //                 fixed: scenario.life_expectancy[0].value,
    //             }, 
    //             spouse_life_expectancy: {
    //                 ...scenario.life_expectancy[1],
    //                 fixed: scenario.life_expectancy[1].value,
    //             },
    //             investment_types: scenario.investment_types.map(inv_type => {
    //                 return {
    //                     ...inv_type,
    //                     is_tax_exempt: inv_type.taxability,
    //                     exp_annual_income: {
    //                         ...inv_type.exp_annual_income,
    //                         fixed:inv_type.exp_annual_income.value
    //                     },
    //                     exp_annual_return: {
    //                         ...inv_type.exp_annual_return,
    //                         fixed:inv_type.exp_annual_return.value
    //                     }
    //                 }
    //             }),
    //             investment: scenario.investment.map(inv => {
    //                 return {
    //                     ...inv,
    //                     investment_type:inv.invest_type,
    //                     tax_status:(inv.tax_status === "non-retirement") ? inv.tax_status : inv.tax_status+"-retirement"
    //                 }
    //             }),
    //             event_series: [],
    //             inflation_assume: {
    //                 ...scenario.inflation_assume,
    //                 fixed: scenario.inflation_assume.value,
    //             },
    //             spending_strat: scenario.spending_strat,
    //             expense_withdraw: scenario.expense_withdraw,
    //             rmd_strat: scenario.rmd_strat,
    //             roth_conversion_strat: scenario.roth_conversion_strat,
    //             roth_optimizer: scenario.roth_optimizer,
    //         }
    //         console.log(formFormat)
    //         setFormData(formFormat)
            
    //     }
    //     fetchScenario();
    // },[params])

    // const pages = [
    //     <MainInfo formData={formData} setFormData={setFormData} />,
    //     <Investments formData={formData} setFormData={setFormData} />,
    //     <EventSeries formData={formData} setFormData={setFormData} />,
    //     <RMDRoth formData={formData} setFormData={setFormData} />,
    //     <SpendingWithdrawal formData={formData} setFormData={setFormData} />,
    //     <Summary formData={formData} setFormData={setFormData} editing={location.pathname.startsWith("/scenario/edit/")}/>,
    // ];
    const pages = [
        <MainInfo scenario_id={params.id} />,
        <Investments scenario_id={params.id} />,
        <EventSeries scenario_id={params.id} />,
        <RMDRoth scenario_id={params.id} />,
        <SpendingWithdrawal scenario_id={params.id} />,
        <Summary scenario_id={params.id}/>,
    ];
    
    return (
        <div className="flex flex-col justify-center align-middle">
            <div className="min-h-150">
                {pages[currentPage-1]}
            </div>
            
            <div className="flex justify-center gap-4">
                <button className="flex bg-black text-white px-4 py-1 rounded-md hover:opacity-80 cursor-pointer disabled:opacity-20 disabled:cursor-default" onClick={()=>setCurrentPage(currentPage-1)} disabled={currentPage==1}>Prev</button>
                <button className="flex bg-black text-white px-4 py-1 rounded-md hover:opacity-80 cursor-pointer disabled:opacity-20 disabled:cursor-default" onClick={()=>setCurrentPage(currentPage+1)} disabled={currentPage==pages.length}>Next</button>
            </div>
        </div>
    )
}

export default ScenarioForm;