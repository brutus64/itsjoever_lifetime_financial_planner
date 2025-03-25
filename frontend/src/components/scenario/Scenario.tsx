import { useParams } from "react-router-dom";
import { useState,useEffect } from "react";

const Scenario = ({}) => {
    const [ collapse, setCollapse ] = useState({ //need to set the lengths to array sizes
        investment_types: [false],
        event_series: [false],
    })
    const params = useParams();
    // can either pass scenario data in or query database given scenario id
    console.log("RERENDER")
    const handleCollapse = (field,ind) => {
        console.log(field,ind)
        console.log(collapse[field][ind])
        setCollapse({
            ...collapse,
            [field]:collapse[field].map((b,i) => 
                i === ind ? !b : b
            )
        })
    }

    const handlePercent = (type,percent,amt,mean,stdev) => {
        let string_amt = ""
        let string_mean = ""
        let string_stdev = ""
        if (percent) {
            string_amt = amt + "%";
            string_mean = mean + "%";
            string_stdev = stdev + "%";
        }
        else {
            string_amt = "$" + amt;
            string_mean = "$" + mean;
            string_stdev = "$" + stdev;
        }

        return type === "fixed" ? string_amt : `Normal(mean=${string_mean},stddev=${string_stdev})`
    }

    //sample
    const scenario = {
        user: "Bob",
        name: "Retirement Plan",
        marital: "individual",
        birth_year: [2003],
        life_expectancy: [{
            type:"normal",
            value:82,
            mean:82,
            stdev:8

        }],
        investment_types: [{
            name:"stocks",
            description:"moneyyyy",
            exp_annual_return: {
                type:"normal",
                amt:0,
                is_percent:true,
                mean:5,
                stdev:3
            },
            expense_ratio: 0.2,
            exp_annual_income: {
                type:"fixed",
                amt:1000,
                is_percent:false,
                mean:0,
                stdev:1
            },
            taxability:true
        }],
        investment: [{
            invest_type: "stocks",
            invest_id: "3284235",
            value: 34000,
            tax_status:"pre-tax"
        }],
        event_series: [{

        }],
        inflation_assume: {

        },
        spending_strat: [{

        }], 
        expense_withdraw: [{

        }], 
        rmd_strat: [{

        }] ,
        roth_conversion_strat: [{

        }], 
        roth_optimizer: {

        },
        r_only_share:  [],
        wr_only_share: [],
        fin_goal: 750000,
        state: "New Jersey"
    }


    return (
        <div className="flex flex-col gap-4">
            <div className="flex justify-between items-center pb-5 mr-7 border-b-black border-b-2">
                <div className="flex gap-4 items-end">
                    <h1 className="text-5xl font-bold text-wrap break-words">{scenario.name}</h1>
                    <h2 className="text-3xl font-medium">By {scenario.user}</h2>
                </div>
                <button className="text-white font-bold text-xl rounded-md hover:opacity-80 cursor-pointer disabled:opacity-20 disabled:cursor-default bg-black w-40 h-10" >Edit</button>
            </div>
            <div className="">
                <h1 className="text-3xl font-medium">General Information</h1>
                <div><b>Financial Goal:</b> ${scenario.fin_goal}</div>
                <div><b>State:</b> {scenario.state}</div>
                <div><b>Birth Year:</b> {scenario.birth_year[0]}</div>
                <div><b>Life Expectancy:</b> {scenario.life_expectancy[0].type === "fixed" ? scenario.life_expectancy[0].value : `Normal(mean=${scenario.life_expectancy[0].mean},stddev=${scenario.life_expectancy[0].stdev})`}</div>
                <div><b>Marital Status:</b> {scenario.marital}</div>
            </div>
            <div className="flex flex-col gap-3">
                <h1 className="text-3xl font-medium">Investment Types</h1>
                <div className="flex flex-col gap-2">
                    {scenario.investment_types.map((investment,i) =>
                        <div >
                            <div className="text-xl font-medium bg-white shadow-md rounded-lg flex items-center pl-4 gap-3 w-140 h-20 hover:bg-sky-100 cursor-pointer" onClick={() => handleCollapse("investment_types",i)}>{investment.name}</div>
                            {collapse.investment_types[i] && 
                            <div className="p-4 gap-3 w-140">
                                <div><b>Description:</b> {investment.description}</div>
                                <div><b>Expected Annual Return:</b> {handlePercent(investment.exp_annual_return.type,investment.exp_annual_return.is_percent,investment.exp_annual_return.amt,investment.exp_annual_return.mean,investment.exp_annual_return.stdev)}</div>
                                <div><b>Expected Annual Income:</b> {handlePercent(investment.exp_annual_income.type,investment.exp_annual_income.is_percent,investment.exp_annual_income.amt,investment.exp_annual_income.mean,investment.exp_annual_income.stdev)}</div>
                                <div><b>Expense Ratio:</b> {investment.expense_ratio}</div>
                                <div><b>Taxability:</b> {investment.taxability}</div>
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
                            <div><b>Tax Status:</b> ${investment.tax_status}</div>
                        </div>
                    )}
                </div>
                
            </div>

            

            

            
        </div>
    )
}
export default Scenario;
