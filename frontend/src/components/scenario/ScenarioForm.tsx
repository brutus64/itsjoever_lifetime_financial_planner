import { useEffect, useState } from "react";
import Investments from "./Investments";
import EventSeries from "./EventSeries/EventSeries";
import RMDRoth from "./RMDRoth/RMDRoth";
import SpendingWithdrawal from "./SpendingWithdrawalStrategy/SpendingWithdrawal";
import Summary from "./Summary";
import MainInfo from "./MainInfo";

// should there be some mechanism on saving form progress,
// so that the user doesn't have to start over if they
// accidentally leave the form?
// Solution: "incomplete" scenarios?
const ScenarioForm = ({scenario}:any) => { // if want to pass in a scenario to edit, use parameter
    const [formData, setFormData] = useState({
        name: "",
        is_married: false,
        birth_year: 2000,
        spouse_birth_year: 2000,
        life_expectancy: {
            type: "fixed",
            fixed: 0,
            mean: 0,
            stddev: 1,
        },
        spouse_life_expectancy: {
            type: "fixed",
            fixed: 0,
            mean: 0,
            stddev: 1,
        },
        investment_types: [],
        investment: [],
        event_series: [],
        inflation_assume: {
            type: "fixed",
            fixed: 0,
            mean: 0,
            stddev: 1,
        },
        // init_limit_posttax: 0.0, // I do not think the user has to fill this in
        spending_strat: [],
        expense_withdraw: [],
        rmd_strat: [],
        roth_conversion_strat: [],
        roth_optimizer: {
            is_enable: false,
            start_year: 2025,
            end_year: 2025
        },
        fin_goal: 0,
        state: ""
    });
    const [currentPage, setCurrentPage] = useState(1)

    

    useEffect(() => { // if editing a scenario
        //todo
    },[scenario])

    const pages = [
        <MainInfo formData={formData} setFormData={setFormData} />,
        <Investments formData={formData} setFormData={setFormData} />,
        <EventSeries formData={formData} setFormData={setFormData} />,
        <RMDRoth formData={formData} setFormData={setFormData} />,
        <SpendingWithdrawal formData={formData} setFormData={setFormData} />,
        <Summary formData={formData} setFormData={setFormData} />,
    ];
    
    return (
        <div className="flex flex-col justify-center align-middle">
            {/* Progess indicator here */}
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