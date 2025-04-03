import { useEffect, useState } from "react";
import { useParams, useLocation } from "react-router-dom";
import Investments from "./Investments";
import EventSeries from "./EventSeries/EventSeries";
import RMDRoth from "./RMDRoth/RMDRoth";
import SpendingWithdrawal from "./SpendingWithdrawalStrategy/SpendingWithdrawal";
import Summary from "./Summary";
import MainInfo from "./MainInfo";
import axios from "axios";

// should there be some mechanism on saving form progress,
// so that the user doesn't have to start over if they
// accidentally leave the form?
// Solution: "incomplete" scenarios?
const ScenarioForm = () => { // if want to pass in a scenario to edit, useparam
    const params = useParams();
    const location = useLocation();
    const [formData, setFormData] = useState({
        name: "",
        is_married: false,
        birth_year: 2000,
        spouse_birth_year: 2000,
        life_expectancy: {
            type: "fixed",
            value: 0,
            mean: 0,
            stdev: 1,
        },
        spouse_life_expectancy: {
            type: "fixed",
            value: 0,
            mean: 0,
            stdev: 1,
        },
        investment_types: [],
        investment: [],
        event_series: [],
        inflation_assume: {
            type: "fixed",
            value: 0,
            mean: 0,
            stdev: 1,
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
        const fetchScenario = async () => {
            console.log("Fetching scenario")
            try{
                const res = await axios.get(`http://localhost:8000/api/scenarios/view/${params.id}`);
                console.log(res.data);
                const scenario = res.data.scenario;
                // convert to form format
                const formFormat = {
                    name: scenario.name,
                    is_married: scenario.marital === "couple",
                    birth_year: scenario.birth_year[0],
                    spouse_birth_year: scenario.martial === "couple" ? scenario.birth_year[1] : "",
                    fin_goal: scenario.fin_goal,
                    state: scenario.state,
                    life_expectancy: {
                        ...scenario.life_expectancy[0],
                        fixed: scenario.life_expectancy[0].value,
                    },
                    spouse_life_expectancy: scenario.life_expectancy.length === 2 ? {
                        ...scenario.life_expectancy[1],
                        fixed: scenario.life_expectancy[1].value,
                    } : {
                        type: "fixed",
                        fixed: 0,
                        mean: 0,
                        stddev: 1,
                    },
                    investment_types: scenario.investment_types.map(inv_type => {
                        return {
                            ...inv_type,
                            is_tax_exempt: inv_type.taxability,
                            exp_annual_income: {
                                ...inv_type.exp_annual_income,
                                fixed:inv_type.exp_annual_income.value
                            },
                            exp_annual_return: {
                                ...inv_type.exp_annual_return,
                                fixed:inv_type.exp_annual_return.value
                            }
                        }
                    }),
                    investment: scenario.investment.map(inv => {
                        return {
                            ...inv,
                            investment_type:inv.invest_type,
                            tax_status:(inv.tax_status === "non-retirement") ? inv.tax_status : inv.tax_status+"-retirement"
                        }
                    }),
                    event_series: [],
                    inflation_assume: {
                        ...scenario.inflation_assume,
                        fixed: scenario.inflation_assume.value,
                    },
                    spending_strat: scenario.spending_strat.map(spend => spend.name),
                    expense_withdraw: scenario.expense_withdraw.map(exp => {
                        if (exp.tax_status === "non-retirement")
                            return exp.invest_id;
                        return exp.invest_id+"-retirement"
                    }),
                    rmd_strat: scenario.rmd_strat.map(inv => {
                        const last_index = inv.invest_id.lastIndexOf(" ");
                        return inv.slice(0,last_index)
                    }),
                    roth_conversion_strat: scenario.roth_conversion_strat.map(inv => {
                        const last_index = inv.lastIndexOf(" ");
                        return inv.slice(0,last_index)
                    }),
                    roth_optimizer: scenario.roth_optimizer,
                }
                setFormData(formFormat)
            }
            catch(err){
                console.log("Could not fetch scenario: ", err);
            }
        }
        if (location.pathname.startsWith("/scenario/edit/")) //if editing
            fetchScenario();
        //todo
    },[params])

    const pages = [
        <MainInfo formData={formData} setFormData={setFormData} />,
        <Investments formData={formData} setFormData={setFormData} />,
        <EventSeries formData={formData} setFormData={setFormData} />,
        <RMDRoth formData={formData} setFormData={setFormData} />,
        <SpendingWithdrawal formData={formData} setFormData={setFormData} />,
        <Summary formData={formData} setFormData={setFormData} editing={location.pathname.startsWith("/scenario/edit/")}/>,
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