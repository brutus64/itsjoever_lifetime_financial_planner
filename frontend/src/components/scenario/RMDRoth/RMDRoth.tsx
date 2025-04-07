import RMD from "./RMD"
import Roth from "./Roth"
import axios from "axios"
import { useState, useEffect } from "react"


const RMDRoth = ({scenario_id}:any) => {
    const [ rothData, setRothData ] = useState();
    const [ rmdStrat, setRMDStrat ] = useState();
    const [ investments, setInvestments ] = useState();

    const fetchRMDRoth = async () => {
        console.log("Fetching RMD and Roth data")
        let res;
        try {
            res = await axios.get(`http://localhost:8000/api/scenarios/rmdroth/${scenario_id}`);
        }
        catch(err){
            console.error("Could not fetch investments: ", err);
            return
        }
        console.log(res)
        setRothData({
            "roth_conversion_strat":res.data.roth_conversion_strat,
            "roth_optimizer":res.data.roth_optimizer
        })
        setRMDStrat(res.data.rmd_strat)
        setInvestments(res.data.investment)

    }

    useEffect(() => {
        fetchRMDRoth();
    },[])

    const handleRothOpt = (e) => {
        const {value} = e.target;
        setRothData({
            ...rothData,
            roth_optimizer: {
                ...rothData.roth_optimizer,
                is_enable:(value === "opt-in")
            }
        })
    }
    const handleRothYear = (e) => {
        const {name,value} = e.target;
        setRothData({
            ...rothData,
            roth_optimizer: {
                ...rothData.roth_optimizer,
                [name]:value
            }
        })
    }
    if (!rothData || !rmdStrat || !investments)
        return <div>Loading...</div>
    return (
        <div className='flex flex-col m-10 gap-1'>
            <div className="shadow-md rounded-lg justify-between flex flex-col gap-2 w-130 p-4">
                <h1 className="text-2xl font-bold">Roth Conversion Optimizer</h1>
                {/* <p className='mb-2'>An in-kind transfer of assets from pre-tax retirement accounts to after-tax retirement accounts</p> */}

                    <div className="flex gap-10 items-center">
                        <div className='flex items-center gap-2'>
                            <div className="">Opt-out</div>
                            <input className="ml-1" type="radio" checked={!rothData.roth_optimizer.is_enable} value="opt-out" onChange={handleRothOpt}/>
                        </div>
                        <div className='flex items-center gap-2'>
                            <div className="">Opt-in</div>
                            <input className="ml-1" type="radio" checked={rothData.roth_optimizer.is_enable} value="opt-in" onChange={handleRothOpt}/>
                            <input type="number" className="text-md px-1 border-2 border-gray-200 rounded-md w-32" name="start_year" value={rothData.roth_optimizer.start_year} onChange={handleRothYear} min="2025" max="9999" disabled={!rothData.roth_optimizer.is_enable} style={{"opacity":rothData.roth_optimizer.is_enable ? 1.0 : 0.2}}/>
                            -
                            <input type="number" className="text-md px-1 border-2 border-gray-200 rounded-md w-32" name="end_year" value={rothData.roth_optimizer.end_year} onChange={handleRothYear} min="2025" max="9999" disabled={!rothData.roth_optimizer.is_enable} style={{"opacity":rothData.roth_optimizer.is_enable ? 1.0 : 0.2}}/>
                        </div>
                        

                    </div>

            </div>

            <div className='flex gap-4'>
                {/* <Roth rothData={rothData} setRothData={setRothData}/>
                <RMD rmdStrat={rmdStrat} setRMDStrat={setRMDStrat}/> */}
                
            </div>
        </div>
    )
}

export default RMDRoth