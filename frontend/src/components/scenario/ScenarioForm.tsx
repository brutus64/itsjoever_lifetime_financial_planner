import { useState, useEffect } from "react";
import Investments from "./Investments";
import EventSeries from "./EventSeries";
import Miscellaneous from "./Miscellaneous";
import Summary from "./Summary";

// should there be some mechanism on saving form progress,
// so that the user doesn't have to start over if they
// accidentally leave the form?
// Solution: "incomplete" scenarios?
export default function ScenarioForm() {
    const [formData, setFormData] = useState({
        scenarioName: "",
        // fill in scenario schema stuff here
    });
    const [currentPage, setCurrentPage] = useState(1)
    

    

    const pages = [
        <Investments />,
        <EventSeries />,
        <Miscellaneous />,
        <Summary />
    ]
    return (
        <div>
            {pages[currentPage-1]}
            <div className="flex">
                <button onClick={()=>setCurrentPage(currentPage+1)} disabled={currentPage==1}></button>
                <button onClick={()=>setCurrentPage(currentPage-1)} disabled={currentPage==pages.length}></button>
            </div>
        </div>
    )
}