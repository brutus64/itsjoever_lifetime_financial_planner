import Popup from "reactjs-popup";
import { useState } from "react";
import { setegid } from "process";
const exploreModalStyling = { 
    "border": "none",
    "borderRadius":"8px",
    "width":"600px",
    "height":"480px"
};
const MAX_SIMULATIONS = 100000;
const paramTemplate = {
    parameter:"",
    paramType:"",
    start:"",
    end:"",
    step:""
}
const ExplorePopup = ({open,setOpen,handleExplore,eventSeries,rothOptimizer}) => {
    const [ exploreData, setExploreData ] = useState({
        numParams:1,
        param1: paramTemplate,
        param2: {...paramTemplate},
        numTimes:"",
    })
    const [ error, setError ] = useState("")

    const numericFields = ["start","end","step","numTimes","numParams"];
    const handleGeneral = (event) => {
        let { name, value } = event.target;
        value = parseFloat(value);
        setExploreData({
            ...exploreData,
            [name]:value,
        });
    }
    const handleParam = (event,param) => { // param is either "param1" or "param2"
        let { name, value } = event.target;
        if (name === "parameter") { // change other fields
            if (value === "Roth Optimizer") {
                setExploreData({
                    ...exploreData,
                    [param]: {
                        ...exploreData[param],
                        parameter:value,
                        paramType: "Is Enabled",
                        start:"",
                        end:"",
                        step:""
                    }
                })
            }
            else if (value !== "") {
                setExploreData({
                    ...exploreData,
                    [param]: {
                        ...exploreData[param],
                        parameter:value,
                        paramType: "Start Year",
                    }
                })
            }
            else {
                setExploreData({
                    ...exploreData,
                    [param]: paramTemplate
                })
            }
            return;
        }
        if (numericFields.includes(name))
            value = parseFloat(value)
        setExploreData({
            ...exploreData,
            [param]: {
                ...exploreData[param],
                [name]:value
            }
        })
    }

    const validate = () => {
        // Check if all fields filled out
        if (Number.isNaN(exploreData.numTimes)) {
            setError("Please fill out all fields")
            return;
        }
        if (exploreData.param1.parameter === "" || exploreData.param1.paramType === "" || (exploreData.param1.parameter !== "Roth Optimizer" && (exploreData.param1.start === "" || exploreData.param1.end === "" || exploreData.param1.step === ""))) {
            setError("Please fill out all fields")
            return;
        }
        if (exploreData.numParams === 2 && (exploreData.param2.parameter === "" || exploreData.param2.paramType === "" || (exploreData.param2.parameter !== "Roth Optimizer" && (exploreData.param2.start === "" || exploreData.param2.end === "" || exploreData.param2.step === "")))) {
            setError("Please fill out all fields")
            return;
        }

        // Check if numerics make sense
        if (exploreData.param1.start > exploreData.param1.end || (exploreData.numParams === 2 && exploreData.param2.start > exploreData.param2.end)) {
            setError("Invalid range")
            return;
        }
        if ((exploreData.param1.parameter !== "Roth Optimizer" && exploreData.param1.step <= 0) || (exploreData.param1.parameter !== "Roth Optimizer" && exploreData.numParams === 2 && exploreData.param2.step <= 0)) {
            setError("Step must be positive");
            return;
        }
        if (exploreData.numTimes % 1 !== 0) {
            setError("Number of simulations must be an integer")
            return;
        }
        let simulations = Math.floor((exploreData.param1.end-exploreData.param1.start)/exploreData.param1.step) + 1;
        if (exploreData.numParams === 2)
            simulations *= Math.floor((exploreData.param2.end-exploreData.param2.start)/exploreData.param2.step) + 1;
        simulations *= exploreData.numTimes;
        
        if (simulations > MAX_SIMULATIONS) {
            setError("Max simulations: " + MAX_SIMULATIONS)
            return;
        }

        // Check if different parameter values being used
        if (exploreData.numParams === 2 && exploreData.param1.parameter === exploreData.param2.parameter && exploreData.param1.paramType === exploreData.param2.paramType) {
            setError("Parameters must be different")
            return;
        }
        setError("")
        handleExplore(exploreData);
    }
    
    return (
        <Popup open={open} position="right center" closeOnDocumentClick modal contentStyle={exploreModalStyling} onClose={() => setOpen(false)}>
            <div className="rounded-lg m-10 flex flex-col gap-3 items-center">
                <div className="flex gap-2 justify-between">
                    <input className="" type="radio" name="numParams" value="1" onChange={handleGeneral} checked={exploreData.numParams === 1}/>
                    <div>1-D Exploration</div>
                    <input className="" type="radio" name="numParams" value="2" onChange={handleGeneral} checked={exploreData.numParams === 2}/>
                    <div>2-D Exploration</div>
                </div>
                <div className="flex gap-2 justify-between">
                    <Parameter param="param1" exploreData={exploreData} handleChange={handleParam} rothOptimizer={rothOptimizer} eventSeries={eventSeries} enabled={true}/>
                    <Parameter param="param2" exploreData={exploreData} handleChange={handleParam} rothOptimizer={rothOptimizer} eventSeries={eventSeries} enabled={exploreData.numParams === 2}/>
                </div>
                <div className="flex gap-2 align-middle">
                    <h2>Simulations per parameter value:</h2>
                    <input className="text-lg px-1 border-2 border-gray-200 rounded-md w-30" type="number" min="0" name="numTimes" value={exploreData.numTimes} onChange={handleGeneral}/>
                </div>
                <div className="flex justify-between">
                    <button className="text-white px-4 py-1 rounded-md hover:opacity-80 cursor-pointer disabled:opacity-20 disabled:cursor-default bg-blue-600 w-50" onClick={validate}>Run</button>
                </div>
                <div className="text-red-600 font-bold">{error}</div>
            </div>
        </Popup>
    )
}

const Parameter = ({param,exploreData,handleChange,rothOptimizer,eventSeries,enabled}) => {
    const curEvent = eventSeries.find(es => es.id === exploreData[param].parameter)

    const selectValue = curEvent ? exploreData[param].parameter : curEvent;

    let paramTypeOptions = [];
    if (curEvent) {
        paramTypeOptions = ["Start Year","Duration"]
        if (curEvent.type === "income" || curEvent.type === "expense")
            paramTypeOptions.push("Initial Amount")
        else if (curEvent.type === "invest" && curEvent.details.assets.length === 2)
            paramTypeOptions.push("Asset Percent")
    }
    else if (exploreData[param].parameter === "Roth Optimizer")
        paramTypeOptions = ["Is Enabled"]
    return (
        <div className={"flex flex-col gap-3 " + (enabled ? "" : "opacity-30")}>
            <div className="flex flex-col align-middle">
                <div className="">Parameter {param.charAt(param.length-1)}: </div>
                <select className="text-md px-1 border-2 border-gray-200 rounded-md w-55 h-8"
                    name="parameter"
                    value={selectValue}
                    onChange={(event) => handleChange(event,param)}
                    disabled={!enabled}>
                    <option value="">None</option>
                    {rothOptimizer.is_enable && <option key="Roth" value="Roth Optimizer">Roth Optimizer</option>}
                    {eventSeries.map(es => (
                        <option key={es.name + " " + es.type} value={es.id}>{es.name} - {es.type}</option>
                    ))}
                </select>
            </div>

            <div className="flex flex-col align-middle">
                <div className="">Parameter Type: </div>
                <select className="text-md px-1 border-2 border-gray-200 rounded-md w-55 h-8"
                    name="paramType"
                    value={exploreData[param].paramType}
                    onChange={(event) => handleChange(event,param)}
                    disabled={exploreData[param].parameter === "" || !enabled}>
                    <option value=""></option>
                    {paramTypeOptions.map(opt => (
                        <option key={opt} value={opt}>{opt}</option>
                    ))}
                </select>
            </div>

            <div className="flex flex-col gap-1 align-middle">
                <div className="">Range:</div>
                <div className="flex gap-2 align-middle">
                    <div className="w-10">Start:</div>
                    <input className="text-md px-1 border-2 border-gray-200 rounded-md w-24" type="number" name="start" value={exploreData[param].start} onChange={(event) => handleChange(event,param)} disabled={exploreData[param].parameter === "" || exploreData[param].parameter === "Roth Optimizer" || !enabled}/> 
                </div>
                <div className="flex gap-2 align-middle">
                    <div className="w-10">End:</div>
                    <input className="text-md px-1 border-2 border-gray-200 rounded-md w-24" type="number" name="end" value={exploreData[param].end} onChange={(event) => handleChange(event,param)} disabled={exploreData[param].parameter === "" || exploreData[param].parameter === "Roth Optimizer" || !enabled}/> 
                </div>
                <div className="flex gap-2 align-middle">
                    <div className="w-10">Step:</div>
                    <input className="text-md px-1 border-2 border-gray-200 rounded-md w-24" type="number" name="step" value={exploreData[param].step} onChange={(event) => handleChange(event,param)} disabled={exploreData[param].parameter === "" || exploreData[param].parameter === "Roth Optimizer" || !enabled}/> 
                </div>
            </div>
        </div>
    )
}

export default ExplorePopup;