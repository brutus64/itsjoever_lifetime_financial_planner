import "reactjs-popup/dist/index.css"
import axios from "axios";
import { useState, useEffect } from "react";
import GenericEventSeries from "./GenericEventSeries";

const EventSeries = ({scenario_id}:any) => {
    const [eventSeries, setEventSeries] = useState(null);
    const [investments, setInvestments] = useState(null);
    const [isMarried, setIsMarried] = useState(false);

    const fetchEventSeries = async () => {
        console.log("Fetching event series")
        let res;
        try {
            res = await axios.get(`http://localhost:8000/api/scenarios/event_series/${scenario_id}`);
        }
        catch(err){
            console.error("Could not fetch event series: ", err);
            return
        }
        const event_series = res.data.event_series;
        console.log(event_series);
        setEventSeries(event_series);
    }

    const fetchInvestments = async () => {
        console.log("Fetching investments")
        let res;
        try {
            res = await axios.get(`http://localhost:8000/api/scenarios/investments/${scenario_id}`);
        }
        catch(err){
            console.error("Could not fetch investments: ", err);
            return
        }
        const scenario = res.data.scenario;
        // console.log(scenario)
        setInvestments(scenario.investment)
    }

    const fetchIsMarried = async () => {
        console.log("Fetching main info for is married")
        let res;
        try {
            res = await axios.get(`http://localhost:8000/api/scenarios/main/${scenario_id}`);
        }
        catch(err){
            console.error("Could not fetch main data: ", err);
            return
        }
        const scenario = res.data.scenario;
        setIsMarried(scenario.marital === "couple")
    }

    const createEventSeries = async (newData:any) => {
        try {
            const res = await axios.post(`http://localhost:8000/api/scenarios/event_series/${scenario_id}`, newData);
            console.log(res);
            setEventSeries(res.data.event_series);
        }
        catch(err) {
            console.error("Could not create event series: ",err);
            return;
        }
    }

    const updateEventSeries = async (event_id:any, newData:any) => {
        try {
            const res = await axios.put(`http://localhost:8000/api/scenarios/event_series/${scenario_id}/${event_id}`, newData);
            console.log(res);
            setEventSeries(res.data.event_series);
        } catch(err) {
            console.error("Could not modify event series: ",err);
            return;
        }
    }

    const deleteEventSeries = async(event_id:any) => {
        console.log(`im deleting ${event_id}`);
    }

    useEffect(() => {
        fetchEventSeries();
        fetchInvestments();
        fetchIsMarried();
    },[])


    if (eventSeries === null) {
        return (<div>Loading</div>)
    }

    return (
        <div className="m-5 flex align-center h-full gap-5">
            <div className='flex gap-4 w-60 '>
                <div className="bg-white shadow-md rounded-lg p-6 flex flex-col gap-5 w-fit align-center">
                    <h1 className="text-2xl font-bold inline-block whitespace-nowrap">Event Series</h1>
                    <p className="">An event series represents a sequence of annual events. Event series are categorized into four types: income, expense, invest, or rebalance. These events will last for a specified amount of years.</p>
                </div>
            </div>
            
            <div className="bg-white shadow-md rounded-lg p-2 flex flex-1 gap-4">
                <GenericEventSeries key={'income'} eventSeriesType={'income'} eventSeries={eventSeries} investments={investments} createEventSeries={createEventSeries} updateEventSeries={updateEventSeries} deleteEventSeries={deleteEventSeries} is_married={isMarried}/>
                <GenericEventSeries key={'expense'} eventSeriesType={'expense'} eventSeries={eventSeries} investments={investments} createEventSeries={createEventSeries} updateEventSeries={updateEventSeries} deleteEventSeries={deleteEventSeries} is_married={isMarried}/>
                <GenericEventSeries key={'invest'} eventSeriesType={'invest'} eventSeries={eventSeries} investments={investments} createEventSeries={createEventSeries} updateEventSeries={updateEventSeries} deleteEventSeries={deleteEventSeries} is_married={isMarried}/>
                <GenericEventSeries key={'rebalance'} eventSeriesType={'rebalance'} eventSeries={eventSeries} investments={investments} createEventSeries={createEventSeries} updateEventSeries={updateEventSeries} deleteEventSeries={deleteEventSeries} sis_married={isMarried}/>
            </div>
        </div>
    )
}

const Name = ({handleChange, eventData}: {handleChange:any, eventData:any}) => {
    return (
        <div className="flex gap-4">
            <h2 className="font-medium">Name:</h2>
            <input 
                className="text-lg px-1 border-2 border-gray-200 rounded-md w-75" 
                name="name"
                value={eventData.name}
                onChange={handleChange} 
            />
        </div>
    )
}

const Description = ({handleChange, eventData}: {handleChange:any, eventData:any}) => {
    return (
        <div>
            <h2 className="font-medium">Description:</h2>
            <textarea 
                className="px-1 border-2 border-gray-200 rounded-md w-145 h-25 resize-none flex-shrink-0" 
                name='description'
                value={eventData.description}
                onChange={handleChange}
                maxLength={1000}
            />
        </div>
    )
};

const StartYear = ({handleStartYearChange, eventData, eventSeries}: {handleStartYearChange:any, eventData:any, eventSeries:any}) => {
    
    return (
        <div>
            <h2 className="font-medium">Start Year:</h2>
            <div className="flex gap-5">
                <div className="flex flex-col gap-1">
                    <div className="flex gap-2 align-middle">
                        <input className="ml-1" type="radio" name="start_year-type" value="fixed" onChange={handleStartYearChange} checked={eventData.start_year.type === 'fixed'}/>
                        <div className="">Fixed:</div>
                        <input className="text-md px-1 border-2 border-gray-200 rounded-md w-30" 
                            name="value" 
                            value={eventData.start_year.value} 
                            onChange={handleStartYearChange}
                            type="number" min="0"/> 
                    </div>
                    <div className="flex gap-2 align-middle">
                        <input className="ml-1" type="radio" name="start_year-type" value="uniform" onChange={handleStartYearChange} checked={eventData.start_year.type === 'uniform'}/>
                        <div className="">Uniform: &nbsp; Min:</div>
                        <input className="text-md px-1 border-2 border-gray-200 rounded-md w-30" 
                            name="lower"
                            value={eventData.start_year.lower}
                            onChange={handleStartYearChange}
                            type="number" min="0"/> 
                        <div className="">Max:</div>
                        <input className="text-md px-1 border-2 border-gray-200 rounded-md w-30"  
                            name="upper"
                            value={eventData.start_year.upper}
                            onChange={handleStartYearChange}
                            type="number" min="0"/> 
                    </div>
                    <div className="flex gap-2 align-middle">
                        <input className="ml-1" type="radio" name="start_year-type" value="normal" onChange={handleStartYearChange} checked={eventData.start_year.type === 'normal'}/>
                        <div className="">Normal: &nbsp; Mean:</div>
                        <input className="text-md px-1 border-2 border-gray-200 rounded-md w-30" 
                            name="mean"
                            value={eventData.start_year.mean}
                            onChange={handleStartYearChange}
                            type="number" min="0"/> 
                        <div className="">Variance:</div>
                        <input className="text-md px-1 border-2 border-gray-200 rounded-md w-30" 
                            name="stdev"
                            value={eventData.start_year.stdev}
                            onChange={handleStartYearChange}
                            type="number" min="0"/> 
                    </div>
                    <div className="flex gap-2 align-middle">
                        <input className="ml-1" type="radio" name="start_year-type" value="start_with" onChange={handleStartYearChange} checked={eventData.start_year.type === 'start_with'}/>
                        <div className="">Same year event series</div>
                        <select className="text-md px-1 border-2 border-gray-200 rounded-md w-fit"
                            name="start_year-start_with"
                            value={eventData.start_year.start_with}
                            onChange={handleStartYearChange}>
                            <option value="">Choose Event</option>
                            {eventSeries && eventSeries
                            .map(event_series => 
                                <option key={event_series.name} value={event_series.id}>{event_series.name}</option>
                            )}
                        </select>
                        <div className=""> starts</div> 
                    </div>
                    <div className="flex gap-2 align-middle">
                        <input className="ml-1" type="radio" name="start_year-type" value="end_with" onChange={handleStartYearChange} checked={eventData.start_year.type === 'end_with'}/>
                        <div className="">Year after event series</div>
                        <select className="text-md px-1 border-2 border-gray-200 rounded-md w-fit"
                            name="start_year-end_with"
                            value={eventData.start_year.end_with}
                            onChange={handleStartYearChange}>
                            <option value="">Choose Event</option>
                            {eventSeries && eventSeries
                            .map(event_series => 
                                <option key={event_series.name} value={event_series.id}>{event_series.name}</option>
                            )}
                        </select>
                        <div className=""> ends</div>
                    </div>
                </div>
            </div>
        </div>
    )
};

const Duration = ({handleDurationChange, eventData}: {handleDurationChange:any, eventData:any}) => {
    return  (
        <div>
            <h2 className="font-medium">Duration (Years):</h2>
            <div className="flex gap-5">
                <div className="flex flex-col gap-1">
                    <div className="flex gap-2 align-middle">
                        <input className="ml-1" type="radio" name="duration-type" value="fixed" onChange={handleDurationChange} checked={eventData.duration.type === 'fixed'}/>
                        <div className="">Fixed:</div>
                        <input className="text-md px-1 border-2 border-gray-200 rounded-md w-30" 
                            name="value"
                            value={eventData.duration.value}
                            onChange={handleDurationChange}
                            type="number" min="0"/> 
                    </div>
                    <div className="flex gap-2 align-middle">
                        <input className="ml-1" type="radio" name="duration-type" value="uniform" onChange={handleDurationChange} checked={eventData.duration.type === 'uniform'}/>
                        <div className="">Uniform: &nbsp; Min:</div>
                        <input className="text-md px-1 border-2 border-gray-200 rounded-md w-30" 
                            name="lower"
                            value={eventData.duration.lower}
                            onChange={handleDurationChange}
                            type="number" min="0"/> 
                        <div className="">Max:</div>
                        <input className="text-md px-1 border-2 border-gray-200 rounded-md w-30" 
                            name="upper"
                            value={eventData.duration.upper}
                            onChange={handleDurationChange}
                            type="number" min="0"/> 
                    </div>
                    <div className="flex gap-2 align-middle">
                        <input className="ml-1" type="radio" name="duration-type" value="normal" onChange={handleDurationChange} checked={eventData.duration.type === 'normal'}/>
                        <div className="">Normal: &nbsp; Mean:</div>
                        <input className="text-md px-1 border-2 border-gray-200 rounded-md w-30" 
                            name="mean"
                            value={eventData.duration.mean}
                            onChange={handleDurationChange}
                            type="number" min="0"/> 
                        <div className="">Variance:</div>
                        <input className="text-md px-1 border-2 border-gray-200 rounded-md w-30" 
                            name="stdev"
                            value={eventData.duration.stdev}
                            onChange={handleDurationChange}
                            type="number" min="0"/> 
                    </div>
                </div>
            </div>
        </div>
    )
}

const ExpectedAnnualChange = ({handleAnnualChange, eventData}: {handleAnnualChange:any, eventData:any}) => {
    return  (
        <div>
            <h2 className="font-medium">Expected Annual Change:</h2>
            <div className="flex gap-5">
                <div className="flex flex-col gap-2">
                    <div className="flex gap-2 align-middle">
                        <input className="ml-1" type="radio" name="exp-is_percent" value="false" onChange={handleAnnualChange} checked={eventData.exp_annual_change.is_percent === false}/>
                        <div className="">Amount</div>
                    </div>
                    <div className="flex gap-2 align-middle">
                        <input className="ml-1" type="radio" name="exp-is_percent" value="true" onChange={handleAnnualChange} checked={eventData.exp_annual_change.is_percent === true}/>
                        <div className="">Percent</div>
                    </div>
                </div>
                <div className="border-l-2 border-l-black-400 pl-5 flex flex-col gap-1">
                    <div className="flex gap-2 align-middle">
                        <input className="ml-1" type="radio" name="exp-type" value="fixed" onChange={handleAnnualChange} checked={eventData.exp_annual_change.type === 'fixed'}/>
                        <div className="">Fixed:</div>
                        <input className="text-md px-1 border-2 border-gray-200 rounded-md w-30" 
                            onChange={handleAnnualChange}
                            name="value"
                            value={eventData.exp_annual_change.value}
                            type="number" min="0"/>%
                    </div>
                    <div className="flex gap-2 align-middle">
                        <input className="ml-1" type="radio" name="exp-type" value="normal" onChange={handleAnnualChange} checked={eventData.exp_annual_change.type === 'normal'}/>
                        <div className="">Normal: &nbsp; Mean:</div>
                        <input className="text-md px-1 border-2 border-gray-200 rounded-md w-30" 
                            onChange={handleAnnualChange}
                            name="mean"
                            value={eventData.exp_annual_change.mean}
                            type="number" min="0"/> 
                        <div className="">Variance:</div>
                        <input className="text-md px-1 border-2 border-gray-200 rounded-md w-30" 
                            onChange={handleAnnualChange}
                            name="stdev"
                            value={eventData.exp_annual_change.stdev}
                            type="number" min="0"/> 
                    </div>
                    <div className="flex gap-2 align-middle">
                        <input className="ml-1" type="radio" name="exp-type" value="uniform" onChange={handleAnnualChange} checked={eventData.exp_annual_change.type === 'uniform'}/>
                        <div className="">Uniform: &nbsp; Min:</div>
                        <input className="text-md px-1 border-2 border-gray-200 rounded-md w-30" 
                            onChange={handleAnnualChange}
                            name="lower"
                            value={eventData.exp_annual_change.lower}
                            type="number" min="0"/> 
                        <div className="">Max:</div>
                        <input className="text-md px-1 border-2 border-gray-200 rounded-md w-30" 
                            onChange={handleAnnualChange}
                            name="upper"
                            value={eventData.exp_annual_change.upper}
                            type="number" min="0"/> 
                    </div>
                </div>
            </div>
        </div>
    )
}

export default EventSeries;
export { Name, Description, StartYear, Duration, ExpectedAnnualChange};