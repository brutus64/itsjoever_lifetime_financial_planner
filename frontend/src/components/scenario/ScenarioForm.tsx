import { useParams, useNavigate } from "react-router-dom";
import Investments from "./Investments/Investments";
import EventSeries from "./EventSeries/EventSeries";
import RMDRoth from "./RMDRoth/RMDRoth";
import SpendingWithdrawal from "./SpendingWithdrawalStrategy/SpendingWithdrawal";
import MainInfo from "./MainInfo";

const pages = ["main","investments","eventseries","strategy","rmdroth"]

const ScenarioForm = () => {
    const params = useParams();
    const navigate = useNavigate();

    const handlePageChange = (direction) => {
        const ind = pages.indexOf(params.page);
        if (ind === -1) 
            return;
        if ((ind === 0 && direction === -1) || (ind === pages.length - 1 && direction === 1)) 
            navigate(`/scenario/${params.id}`)
        else
            navigate(`/scenario/${params.id}/${pages[ind+direction]}`)
    }
    const pageMap = {
        "main": <MainInfo scenario_id={params.id} />,
        "investments":<Investments scenario_id={params.id} />,
        "eventseries":<EventSeries scenario_id={params.id} />,
        "strategy":<SpendingWithdrawal scenario_id={params.id} />,
        "rmdroth":<RMDRoth scenario_id={params.id} />,
    };
    if (!pageMap.hasOwnProperty(params.page))
        return (<div>Page not found</div>)

    const prevText = params.page === pages[0] ? "Back" : "Prev";
    const nextText = params.page === pages[pages.length-1] ? "Finish" : "Next"
    
    return (
        <div className="flex flex-col justify-center align-middle">
            <div className="min-h-150">
                {pageMap[params.page]}
            </div>
            
            <div className="flex justify-center gap-4">
                <button className="flex bg-black text-white px-4 py-1 rounded-md hover:opacity-80 cursor-pointer disabled:opacity-20 disabled:cursor-default" onClick={()=>handlePageChange(-1)}>{prevText}</button>
                <button className="flex bg-black text-white px-4 py-1 rounded-md hover:opacity-80 cursor-pointer disabled:opacity-20 disabled:cursor-default" onClick={()=>handlePageChange(1)}>{nextText}</button>
            </div>
        </div>
    )
}

export default ScenarioForm;