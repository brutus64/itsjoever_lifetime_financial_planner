import { useNavigate, useParams } from "react-router-dom";
import { useState,useEffect } from "react";
import axios from "axios";

const Scenario = ({}) => {
    const params = useParams();
    const navigate = useNavigate();
    const [ scenario, setScenario ] = useState()
    const [ collapse, setCollapse ] = useState({ //need to set the lengths to array sizes
        investment_types: [],
        event_series: [],
    });
    const [ editing, setEditing ] = useState(false);

    //fetch the scenario data from backend
    useEffect(() => {
        const fetchScenario = async () => {
            console.log("Fetching scenario")
            try{
                const res = await axios.get(`http://localhost:8000/api/scenarios/view/${params.id}`);
                console.log(res.data);
                setScenario(res.data.scenario)
                setCollapse({
                    investment_types: Array(res.data.scenario.investment_types.length).fill(false),
                    event_series: Array(res.data.scenario.event_series.length).fill(false)
                })
            }
            catch(err){
                console.log("Could not fetch scenario: ", err);
            }
        }
        fetchScenario();
    },[params.id]);

    const handleCollapse = (field,ind) => {
        setCollapse({
            ...collapse,
            [field]:collapse[field].map((b,i) => 
                i === ind ? !b : b
            )
        })
    }

    const handlePercent = ({type,is_percent,value,mean,stdev,lower,upper}) => {
        let string_amt = ""
        let string_mean = ""
        let string_stdev = ""
        let string_lower = ""
        let string_upper = ""
        if (is_percent) {
            string_amt = value + "%";
            string_mean = mean + "%";
            string_stdev = stdev + "%";
            string_lower = lower + "%";
            string_upper = upper + "%"
        }
        else {
            string_amt = "$" + value;
            string_mean = "$" + mean;
            string_stdev = "$" + stdev;
            string_lower = "$" + lower;
            string_upper = "$" + upper;
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
        navigate(`/scenario/edit/${params.id}`)
    }

    return (scenario &&
        <div className="flex flex-col gap-4">
            <div className="flex justify-between items-center pb-5 mr-7 border-b-black border-b-2">
                <div className="flex gap-4 items-end">
                    <h1 className="text-5xl font-bold text-wrap break-words">{scenario.name}</h1>
                    <h2 className="text-3xl font-medium">By {scenario.user.name}</h2>
                </div>
                <button className="text-white font-bold text-xl rounded-md hover:opacity-80 cursor-pointer disabled:opacity-20 disabled:cursor-default bg-black w-40 h-10" onClick={handleEdit}>Edit</button>
            </div>
            <div className="">
                <h1 className="text-3xl font-medium">General Information</h1>
                <div><b>Financial Goal:</b> ${scenario.fin_goal}</div>
                <div><b>State:</b> {scenario.state}</div>
                <div><b>Birth Year:</b> {scenario.birth_year[0]}</div>
                <div><b>Life Expectancy:</b> {handleNotPercent(scenario.life_expectancy[0])} years</div>
                <div><b>Marital Status:</b> {scenario.marital}</div>
                {scenario.birth_year.length === 2 && scenario.life_expectancy.length === 2 && <div>
                    <div><b>Spouse Birth Year:</b> {scenario.birth_year[1]}</div>
                    <div><b>Spouse Life Expectancy:</b> {handleNotPercent(scenario.life_expectancy[1])}</div>
                </div>}
                <div><b>Inflation Assumption:</b> {handleNotPercent(scenario.inflation_assume)}%</div>
            </div>
            <div className="flex flex-col gap-3">
                <h1 className="text-3xl font-medium">Investment Types</h1>
                <div className="flex flex-col gap-2">
                    {scenario.investment_types.map((investment,i) =>
                        <div>
                            <div className="text-xl font-medium bg-white shadow-md rounded-lg flex items-center pl-4 gap-3 w-140 h-20 hover:bg-sky-100 cursor-pointer" onClick={() => handleCollapse("investment_types",i)}>{investment.name}</div>
                            {collapse.investment_types[i] && 
                            <div className="p-4 gap-3 w-140">
                                <div><b>Description:</b> {investment.description}</div>
                                <div><b>Expected Annual Return:</b> {handlePercent(investment.exp_annual_return)}</div>
                                <div><b>Expected Annual Income:</b> {handlePercent(investment.exp_annual_income)}</div>
                                <div><b>Expense Ratio:</b> {investment.expense_ratio}</div>
                                <div><b>Taxability:</b> {investment.taxability ? "yes" : "no"}</div>
                            </div>}
                        </div>
                    )}
                </div>
            </div>

            <div className="flex flex-col gap-3">
                <h1 className="text-3xl font-medium">Investments</h1>
                <div className="flex flex-col gap-2">
                    {scenario.investment.map((investment,i) =>
                        <div className="font-medium bg-white shadow-md rounded-lg flex flex-col pl-4 py-4 gap-1 w-140 h-30">
                            <div><b>Invest Type:</b> {investment.invest_type}</div>
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
                        <div >
                            <div className="text-xl font-medium bg-white shadow-md rounded-lg flex items-center pl-4 gap-3 w-140 h-20 hover:bg-sky-100 cursor-pointer" onClick={() => handleCollapse("event_series",i)}>{es.name}<span className="text-gray-400 font-normal text-sm"> - {es.type}</span></div>
                            {collapse.event_series[i] && 
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
                                            {es.details.assets?.map(asset => 
                                                <li>{asset.invest_id}: {es.details.is_glide ? `Glide(initial=${asset.initial},final=${asset.final})` : `${asset.percentage}%`}</li>
                                            )}
                                        </ul>
                                    </div>
                                </div>}
                                {es.type === "rebalance" && <div className="flex flex-col gap-1">
                                    <div>
                                        <b>Assets:</b> 
                                        <ul>
                                            {es.details.assets?.map(asset => 
                                                <li>{asset.invest_id}: {es.details.is_glide ? `Glide(initial=${asset.initial},final=${asset.final})` : `${asset.percentage}%`}</li>
                                            )}
                                        </ul>
                                    </div>
                                </div>}
                            </div>}
                        </div>
                    )}
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
                            <div className="w-100 whitespace-nowrap overflow-ellipsis overflow-hidden">{investment.invest_id}</div>
                        </div>))}
                    
                </div>
                <div className="text-xl font-medium bg-white shadow-md rounded-lg flex flex-col p-4 gap-3 w-140">
                    <h2 className="text-xl font-medium">RMD Strategy</h2>
                    {scenario.rmd_strat.map((investment,i) => 
                         (<div className="flex items-center">
                            <h1 className="text-3xl font-bold mr-5">{i+1}.</h1>
                            <div className="w-100 whitespace-nowrap overflow-ellipsis overflow-hidden">{investment.invest_id}</div>
                        </div>))}

                </div>
                <div className="flex flex-col gap-2">
                    <div><b>Roth Conversion:</b> {scenario.roth_optimizer.is_enable ? "yes" : "no"}</div>
                    {scenario.roth_optimizer.is_enable && <div>
                            <div><b>Year Range:</b> {scenario.roth_optimizer.start_year}-{scenario.roth_optimizer.end_year}</div>
                            <div className="text-xl font-medium bg-white shadow-md rounded-lg flex flex-col p-4 gap-3 w-140">
                                <h2 className="text-xl font-medium">Roth Conversion Strategy</h2>
                                {scenario.roth_conversion_strat.map((investment,i) => 
                                (<div className="flex items-center">
                                    <h1 className="text-3xl font-bold mr-5">{i+1}.</h1>
                                    <div className="w-100 whitespace-nowrap overflow-ellipsis overflow-hidden">{investment.invest_id}</div>
                                </div>))}
                            </div>
                            

                        </div>}
                    

                </div>
            </div>
        </div>
    )
}
export default Scenario;
