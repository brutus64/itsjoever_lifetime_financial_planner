import { useEffect, useState } from "react";
import Investments from "./Investments";
import EventSeries from "./EventSeries";
import Miscellaneous from "./Miscellaneous";
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
        <Miscellaneous formData={formData} setFormData={setFormData} />,
        <Summary formData={formData} setFormData={setFormData} />,
    ];
    
    return (
        <div>
            {/* Progess indicator here */}
            {pages[currentPage-1]}
            <div className="flex">
                <button onClick={()=>setCurrentPage(currentPage-1)} disabled={currentPage==1}>Prev</button>
                <button onClick={()=>setCurrentPage(currentPage+1)} disabled={currentPage==pages.length}>Next</button>
            </div>
        </div>
    )
}

export default ScenarioForm;