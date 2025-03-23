import { useEffect, useState } from "react";
import Investments from "./Investments";
import EventSeries from "./EventSeries";
import RMDRoth from "./RMDRoth/RMDRoth";
import SpendingWithdrawal from "./SpendingWithdrawalStrategy/SpendingWithdrawal";
import Summary from "./Summary";
import MainInfo from "./MainInfo";

// should there be some mechanism on saving form progress,
// so that the user doesn't have to start over if they
// accidentally leave the form?
// Solution: "incomplete" scenarios?
const ScenarioForm = ({scenario}:any) => { 
    const [formData, setFormData] = useState({
        scenarioName: "",
        // fill in scenario schema stuff here
        // todo
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
            <div className="h-150">
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