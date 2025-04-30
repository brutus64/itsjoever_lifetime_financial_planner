import Popup from "reactjs-popup";
import { useState } from "react";
const exploreModalStyling = { 
    "border": "none",
    "borderRadius":"8px",
    "width":"600px",
    "height":"400px"
};
const MAX_SIMULATIONS = 100000;
const ExplorePopup = ({open,setOpen,handleExplore,eventSeries,rothOptimizer}) => {
    const [ exploreData, setExploreData ] = useState({
        parameter:"",
        paramType:"",
        range:{
            start:"",
            end:"",
            step:""
        },
        numTimes:"",
    })
    const [ error, setError ] = useState("")

    const numericFields = ["start","end","step","numTimes"];
    const nestedFields = ["start","end","step"]
    const handleChange = (event) => {
        let {name, value} = event.target;
        if (name === "parameter") { // change other fields
            if (value === "Roth Optimizer") {
                setExploreData({
                    ...exploreData,
                    parameter:value,
                    paramType:"Is Enabled",
                    range:{
                        start:"",
                        end:"",
                        step:""
                    }
                })
            }
            else if (value !== "") {
                setExploreData({
                    ...exploreData,
                    parameter:value,
                    paramType:"Start Year"
                })
            }
            else {
                setExploreData({
                    ...exploreData,
                    parameter:"",
                    paramType:""
                })
            }
            return;
        }
        if (numericFields.includes(name))
            value = parseFloat(value)
        if (nestedFields.includes(name)) {
            setExploreData({
                ...exploreData,
                range:{
                    ...exploreData.range,
                    [name]:value,
                }
            })
            return
        }
        setExploreData({
            ...exploreData,
            [name]:value,
        })
    };

    const validate = () => {
        // const num = parseInt(numSimulations);
        if (typeof num !== 'number' || isNaN(num)) {
            setError("Please enter a number");
            return;
        }
        if (num <= 0) {
            setError("Number must be non-negative")
            return;
        }

        const simulations = Math.floor((exploreData.range.end-exploreData.range.start)/exploreData.range.step) * exploreData.numTimes
        if (simulations > MAX_SIMULATIONS) {
            setError("Max simulations: " + MAX_SIMULATIONS)
            return;
        }
        handleExplore(exploreData);
    }
    
    const curEvent = eventSeries.find(es => es.id === exploreData.parameter)

    const selectValue = curEvent ? exploreData.parameter : curEvent;

    let paramTypeOptions = []
    if (curEvent) {
        paramTypeOptions = ["Start Year","Duration"]
        if (curEvent.type === "income" || curEvent.type === "expense")
            paramTypeOptions.push("Initial Amount")
        else if (curEvent.type === "invest" && curEvent.details.assets.length === 2)
            paramTypeOptions.push("Asset Percent")
    }
    else if (exploreData.parameter === "Roth Optimizer")
        paramTypeOptions = ["Is Enabled"]
    
    return (
        <Popup open={open} position="right center" closeOnDocumentClick modal contentStyle={exploreModalStyling} onClose={() => setOpen(false)}>
            <div className="rounded-lg m-10 flex flex-col gap-3 items-center">
                <div className="flex gap-2 align-middle">
                    <div className="">Parameter: </div>
                    <select className="text-md px-1 border-2 border-gray-200 rounded-md w-fit"
                        name="parameter"
                        value={selectValue}
                        onChange={handleChange}>
                        <option value="">Choose Parameter</option>
                        {rothOptimizer.is_enable && <option key="Roth" value="Roth Optimizer">Roth Optimizer</option>}
                        {eventSeries.map(es => (
                            <option key={es.name + " " + es.type} value={es.id}>{es.name} - {es.type}</option>
                        ))}
                    </select>
                </div>

                <div className="flex gap-2 align-middle">
                    <div className="">Parameter Type: </div>
                    <select className="text-md px-1 border-2 border-gray-200 rounded-md w-fit"
                        name="paramType"
                        value={exploreData.paramType}
                        onChange={handleChange}>
                        <option value="">Choose Parameter Type</option>
                        {paramTypeOptions.map(opt => (
                            <option key={opt} value={opt}>{opt}</option>
                        ))}
                    </select>
                </div>

                <div className="flex gap-2 align-middle">
                    <div className="">Start:</div>
                    <input className="text-md px-1 border-2 border-gray-200 rounded-md w-24" type="number" name="start" value={exploreData.range.start} onChange={handleChange}/> 
                    <div className="">End:</div>
                    <input className="text-md px-1 border-2 border-gray-200 rounded-md w-24" type="number" name="end" value={exploreData.range.end} onChange={handleChange}/> 
                    <div className="">Step:</div>
                    <input className="text-md px-1 border-2 border-gray-200 rounded-md w-24" type="number" name="step" value={exploreData.range.step} onChange={handleChange}/> 
                </div>

                <div className="flex gap-2 align-middle">
                    <div className="">Range: </div>
                    
                </div>

                <div className="flex gap-2 align-middle">
                    <h2>Simulations per parameter value:</h2>
                    <input className="text-lg px-1 border-2 border-gray-200 rounded-md w-30" type="number" min="0" name="numTimes" value={exploreData.numTimes} onChange={handleChange}/>
                </div>
                <div className="flex justify-between">
                    <button className="text-white px-4 py-1 rounded-md hover:opacity-80 cursor-pointer disabled:opacity-20 disabled:cursor-default bg-blue-600 w-50" onClick={validate}>Run</button>
                </div>
                <div className="text-red-600 font-bold">{error}</div>
            </div>
        </Popup>
    )
}

export default ExplorePopup;