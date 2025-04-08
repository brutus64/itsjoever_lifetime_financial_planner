import { useNavigate, useParams } from "react-router-dom";
import { useState,useEffect } from "react";
import axios from "axios";

const Scenario = () => {
    const params = useParams();
    const navigate = useNavigate();
    const [ scenario, setScenario ] = useState()

    //fetch the scenario data from backend
    useEffect(() => {
        const fetchScenario = async () => {
            console.log("Fetching scenario")
            try{
                const res = await axios.get(`http://localhost:8000/api/scenarios/all/${params.id}`);
                console.log(res.data);
                setScenario(res.data.scenario)
            }
            catch(err){
                console.log("Could not fetch scenario: ", err);
            }
        }
        fetchScenario();
    },[]);

    const handlePercent = ({type,is_percent,value,mean,stdev,lower,upper}) => {
        let string_amt = ""
        let string_mean = ""
        let string_stdev = ""
        let string_lower = ""
        let string_upper = ""
        if (is_percent) {
            string_amt = (typeof value === "number" ? value.toFixed(2) : "") + "%";
            string_mean = (typeof mean === "number" ? mean.toFixed(2) : "") + "%";
            string_stdev = (typeof stdev === "number" ? stdev.toFixed(2) : "") + "%";
            string_lower = (typeof lower === "number" ? lower.toFixed(2) : "") + "%";
            string_upper = (typeof upper === "number" ? upper.toFixed(2) : "") + "%";
        }
        else {
            string_amt = "$" + (typeof value === "number" ? value.toFixed(2) : "");
            string_mean = "$" + (typeof mean === "number" ? mean.toFixed(2) : "");
            string_stdev = "$" + (typeof stdev === "number" ? stdev.toFixed(2) : "");
            string_lower = "$" + (typeof lower === "number" ? lower.toFixed(2) : "");
            string_upper = "$" + (typeof upper === "number" ? upper.toFixed(2) : "");
        }
        switch (type) {
            case "fixed": return string_amt;
            case "normal": return `Normal(mean=${string_mean},stddev=${string_stdev})`;
            case "uniform": return `Uniform(lower=${string_lower},upper=${string_upper})`
        }
        return ""
    }

    const handleNotPercent = ({type,value,lower,upper,mean,stdev,event_series}) => {
        switch(type) {
            case "fixed": return value
            case "normal": return `Normal(mean=${mean},stddev=${stdev})`
            case "uniform": return `Uniform(lower=${lower},upper=${upper})`
            case "start_with": return "With " + event_series
            default: return "After " + event_series
        }
    }

    const handleEdit = () => {
        navigate(`/scenario/${params.id}/main`)
    }

    if (!scenario)
        return <div>Loading...</div>

    return (
        <div className="flex flex-col gap-4">
            <div className="flex justify-between items-center pb-5 mr-7 border-b-black border-b-2">
                <div className="flex gap-4 items-end">
                    <h1 className="text-5xl font-bold text-wrap break-words">{scenario.name ? scenario.name : <span className="italic">Untitled Scenario</span>}</h1>
                    <h2 className="text-3xl font-medium">By {scenario.user.name}</h2>
                </div>
                <button className="text-white font-bold text-xl rounded-md hover:opacity-80 cursor-pointer disabled:opacity-20 disabled:cursor-default bg-black w-40 h-10" onClick={handleEdit}>Edit</button>
            </div>
            <div className="">
                <h1 className="text-3xl font-medium">General Information</h1>
                <div><b>Financial Goal:</b> <RedText>{scenario.fin_goal}</RedText></div>
                <div><b>State:</b> <RedText>{scenario.state}</RedText></div>
                <div><b>Birth Year:</b> <RedText>{scenario.birth_year[0]}</RedText></div>
                <div><b>Life Expectancy:</b> <RedText>{handleNotPercent(scenario.life_expectancy[0])}</RedText></div>
                <div><b>Marital Status:</b> {scenario.marital}</div>
                {scenario.marital === "couple" && <div>
                    <div><b>Spouse Birth Year:</b> <RedText>{scenario.birth_year[1]}</RedText></div>
                    <div><b>Spouse Life Expectancy:</b> <RedText>{handleNotPercent(scenario.life_expectancy[1])}</RedText></div>
                </div>}
                <div><b>Inflation Assumption:</b> <RedText>{handleNotPercent(scenario.inflation_assume) ? handleNotPercent(scenario.inflation_assume) : ""}</RedText></div>
            </div>
            <div className="flex flex-col gap-3">
                <h1 className="text-3xl font-medium">Investment Types</h1>
                <div className="flex flex-col gap-2">
                    {scenario.investment_types.map((investment,i) =>
                        <Collapse base={<div className="text-xl font-medium">{investment.name}</div>}>
                            <div className="p-4 gap-3 w-140">
                                <div><b>Description:</b> {investment.description}</div>
                                <div><b>Expected Annual Return:</b> {handlePercent(investment.exp_annual_return)}</div>
                                <div><b>Expected Annual Income:</b> {handlePercent(investment.exp_annual_income)}</div>
                                <div><b>Expense Ratio:</b> {investment.expense_ratio}</div>
                                <div><b>Taxability:</b> {investment.taxability ? "yes" : "no"}</div>
                            </div>
                        </Collapse>
                    )}
                </div>
            </div>

            <div className="flex flex-col gap-3">
                <h1 className="text-3xl font-medium">Investments</h1>
                <div className="flex flex-col gap-2">
                    {scenario.investment.map((investment,i) =>
                        <div className="font-medium bg-white shadow-md rounded-lg flex flex-col pl-4 py-4 gap-1 w-140 h-30">
                            <div><b>Invest Type:</b> {investment.invest_type.name}</div>
                            <div><b>Value:</b> ${investment.value}</div>
                            <div><b>Tax Status:</b> {investment.tax_status}</div>
                        </div>
                    )}
                </div>
            </div>

            <div className="flex flex-col gap-3">
                <h1 className="text-3xl font-medium">Event Series</h1>
                <div className="flex flex-col gap-2">
                    {scenario.event_series.map((es,i) =>
                        <Collapse base={<div className="text-xl font-medium">{es.name}<span className="text-gray-400 font-normal text-sm"> - {es.type}</span></div>}>
                            <div className="flex flex-col p-4 gap-1 w-140">
                                <div><b>Description:</b> {es.description}</div>
                                <div><b>Start year:</b> {handleNotPercent(es.start)}</div>
                                <div><b>Duration:</b> {handleNotPercent(es.duration)} years</div>
                                {es.type === "income" && <div className="flex flex-col gap-1">
                                    <div><b>Initial Amount:</b> ${es.details.initial_amt}</div>
                                    <div><b>Annual Change:</b> {handlePercent(es.details.exp_annual_change)}</div>
                                    <div><b>Adjusted for Inflation:</b> {es.details.inflation_adjust ? "yes" : "no"}</div>
                                    <div><b>Percentage associated with user:</b> {es.details.user_split}%</div>
                                    <div><b>Social Security:</b> {es.details.social_security ? "yes" : "no"}</div>
                                </div>}
                                {es.type === "expense" && <div className="flex flex-col gap-1">
                                    <div><b>Initial Amount:</b> ${es.details.initial_amt}</div>
                                    <div><b>Annual Change:</b> {handlePercent(es.details.exp_annual_change)}</div>
                                    <div><b>Adjusted for Inflation:</b> {es.details.inflation_adjust ? "yes" : "no"}</div>
                                    <div><b>Percentage associated with user:</b> {es.details.user_split}%</div>
                                    <div><b>Discretionary:</b> {es.details.is_discretionary ? "yes" : "no"}</div>
                                </div>}
                                {es.type === "invest" && <div className="flex flex-col gap-1">
                                    <div><b>Max cash:</b> ${es.details.max_cash}</div>
                                    <div>
                                        <b>Assets:</b> 
                                        <ul>
                                            {es.details.assets?.map(asset => {
                                                // asset investment link is not resolved properly
                                                const investment = scenario.investment.find(inv => inv.id === asset.invest_id.id)
                                                return <li>{investment.invest_type.name} - {investment.tax_status}: {es.details.is_glide ? `Glide(initial=${(asset.initial*100).toFixed(2)},final=${(asset.final*100).toFixed(2)})` : `${(asset.percentage*100).toFixed(2)}%`}</li>
                                            })}
                                        </ul>
                                    </div>
                                </div>}
                                {es.type === "rebalance" && <div className="flex flex-col gap-1">
                                    <div>
                                        <b>Assets:</b> 
                                        <ul>
                                            {es.details.assets?.map(asset => {
                                                // asset investment link is not resolved properly
                                                const investment = scenario.investment.find(inv => inv.id === asset.invest_id.id)
                                                return <li>{investment.invest_type.name} - {investment.tax_status}: {es.details.is_glide ? `Glide(initial=${(asset.initial*100).toFixed(2)},final=${(asset.final*100).toFixed(2)})` : `${(asset.percentage*100).toFixed(2)}%`}</li>
                                            })}
                                        </ul>
                                    </div>
                                </div>}
                            </div>
                        </Collapse>)
                    }
                </div>
            </div>

            <div className="flex flex-col gap-3">
                <h1 className="text-3xl font-medium">Strategies</h1>
                <div className="text-xl font-medium bg-white shadow-md rounded-lg flex flex-col p-4 gap-3 w-140">
                    <h2 className="text-xl font-medium">Spending Strategy</h2>
                    {scenario.spending_strat.map((expense_series,i) => 
                         (<div className="flex items-center">
                            <h1 className="text-3xl font-bold mr-5">{i+1}.</h1>
                            <div className="w-100 whitespace-nowrap overflow-ellipsis overflow-hidden">{expense_series.name}</div>
                        </div>))}
                </div>
                <div className="text-xl font-medium bg-white shadow-md rounded-lg flex flex-col p-4 gap-3 w-140">
                    <h2 className="text-xl font-medium">Withdrawal Strategy</h2>
                    {scenario.expense_withdraw.map((investment,i) => 
                         (<div className="flex items-center">
                            <h1 className="text-3xl font-bold mr-5">{i+1}.</h1>
                            <div className="w-100 whitespace-nowrap overflow-ellipsis overflow-hidden">{investment.invest_type.name} <span className="text-gray-400 font-normal text-sm"> - {investment.tax_status}</span></div>
                        </div>))}
                    
                </div>
                <div className="text-xl font-medium bg-white shadow-md rounded-lg flex flex-col p-4 gap-3 w-140">
                    <h2 className="text-xl font-medium">RMD Strategy</h2>
                    {scenario.rmd_strat.map((investment,i) => 
                         (<div className="flex items-center">
                            <h1 className="text-3xl font-bold mr-5">{i+1}.</h1>
                            <div className="w-100 whitespace-nowrap overflow-ellipsis overflow-hidden">{investment.invest_type.name}</div>
                        </div>))}

                </div>
                <div className="flex flex-col gap-2">
                    <div><b>Roth Conversion:</b> {scenario.roth_optimizer.is_enable ? "yes" : "no"}</div>
                    {scenario.roth_optimizer.is_enable && <div>
                            <div><b>Year Range:</b> <RedText>{scenario.roth_optimizer.start_year}</RedText> - <RedText>{scenario.roth_optimizer.end_year}</RedText></div>
                            <div className="text-xl font-medium bg-white shadow-md rounded-lg flex flex-col p-4 gap-3 w-140">
                                <h2 className="text-xl font-medium">Roth Conversion Strategy</h2>
                                {scenario.roth_conversion_strat.map((investment,i) => 
                                (<div className="flex items-center">
                                    <h1 className="text-3xl font-bold mr-5">{i+1}.</h1>
                                    <div className="w-100 whitespace-nowrap overflow-ellipsis overflow-hidden">{investment.invest_type.name}</div>
                                </div>))}
                            </div>
                        </div>}
                </div>
            </div>
        </div>
    )
}

const RedText = ({children}) => {
    return (
        <span style={{"color": (children ? "black" : "red")}} className="text-red-600 font-bold">{children ? children : "???"}</span>
    )
}

const Collapse = ({children,base}) => {
    const [ open, setOpen ] = useState(false)
    return (
        <div className="w-140">
            <div className="bg-white shadow-md rounded-lg flex items-center pl-4 gap-3 h-20 hover:bg-sky-100 cursor-pointer" onClick={() => setOpen(!open)}>{base}</div>
            <div className={`mx-1 px-2 border-x-2 border-gray-100 bg-gray-100 rounded-b-xl transition-all duration-500 ease-out ${
            open ? "overflow-visible py-1 border-b-2 opacity-100" : "h-0 overflow-hidden opacity-0"}`}>{children}</div>
        </div>
    )
}
export default Scenario;
