import SpendingStrategy from "./SpendingStrategy"
import WithdrawalStrategy from "./WithdrawalStrategy"
import axios from "axios"
import { useState, useEffect } from "react"

const SpendingWithdrawal = ({scenario_id}:any) => {
    const [ spendingStrat, setSpendingStrat ] = useState()
    const [ withdrawalStrat, setWithdrawalStrat ] = useState()
    const [ investments, setInvestments ] = useState()
    const [ eventSeries, setEventSeries ] = useState()
    const [ dirty, setDirty ] = useState(false)

    const fetchSpendWith = async () => {
        console.log("Fetching strategies")
        let res;
        try {
            res = await axios.get(`http://localhost:8000/api/scenarios/spendwith/${scenario_id}`);
        }
        catch(err){
            console.error("Could not fetch strategies: ", err);
            return
        }
        console.log(res)
        setSpendingStrat(res.data.spending_strat)
        setWithdrawalStrat(res.data.expense_withdraw)
        setInvestments(res.data.investment.filter(inv => inv.invest_type.name !== "cash"))
        setEventSeries(res.data.event_series)
    }

    useEffect(() => {
        fetchSpendWith();
    },[])

    const updateSpendWith = async () => {
        if (!spendingStrat || !withdrawalStrat)
            return
        console.log("Updating...")

        const updated_scenario = {
            "spending_strat":spendingStrat.map(inv => inv.id),
            "expense_withdraw":withdrawalStrat.map(inv => inv.id)
        }
        
        try {
            let res = await axios.put(`http://localhost:8000/api/scenarios/spendwith/${scenario_id}`,updated_scenario);
            if (res.data.message === "Strategies updated successfully") {
                console.log("Update successful");
                setDirty(false)
            }
            else
                console.log("Update failed")
        }
        catch(err){
            console.error("Could not update strategies: ", err);
        }
    }
    
    if (!spendingStrat || !withdrawalStrat)
        return <div>Loading...</div>
    return (
        <div className='flex flex-col m-10 gap-1'>
            <div className='flex gap-4'>
                <SpendingStrategy spendingStrat={spendingStrat} setSpendingStrat={setSpendingStrat} eventSeries={eventSeries} setDirty={setDirty}/>
                <WithdrawalStrategy withdrawalStrat={withdrawalStrat} setWithdrawalStrat={setWithdrawalStrat} investments={investments} setDirty={setDirty}/>
            </div>
            <div className="flex justify-center">
                <button className="bg-blue-500 text-white w-40 px-4 py-1 mt-4 rounded-md hover:opacity-80 cursor-pointer disabled:opacity-20 disabled:cursor-default" disabled={!dirty} onClick={updateSpendWith}>Save</button>
            </div>
        </div>
    )
}

export default SpendingWithdrawal