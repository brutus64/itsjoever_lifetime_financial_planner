import Popup from "reactjs-popup"
import "reactjs-popup/dist/index.css"
import { useState } from "react";
import ExpenseEventSeriesPopup from "./ExpenseEventSeries";
import InvestEventSeriesPopup from "./InvestEventSeries";
import RebalanceEventSeriesPopup from "./RebalanceEventSeries";
import IncomeEventSeriesPopup from "./IncomeEventSeries";

const eventSeriesModalStyling = { 
    "border": "none",
    "borderRadius":"8px",
    "width":"700px",
    "height":"600px"
};

const EventSeries = ({ formData,setFormData }:any) => {
    return (
        <div className="m-5 flex align-center h-full gap-5">
            <div className='flex gap-4 w-60 '>
                <div className="bg-white shadow-md rounded-lg p-6 flex flex-col gap-5 w-fit align-center">
                    <h1 className="text-2xl font-bold inline-block whitespace-nowrap">Event Series</h1>
                    <p className="">An event series represents a sequence of annual events. Event series are categorized into four types: income, expense, invest, or rebalance. These events will last for a specified amount of years.</p>
                </div>
            </div>
            
            <div className="bg-white shadow-md rounded-lg p-2 flex flex-1 gap-4">
                    <IncomeEventSeriesPopup eventSeriesModalStyling={eventSeriesModalStyling} formData={formData} setFormData={setFormData} />
                    <ExpenseEventSeriesPopup eventSeriesModalStyling={eventSeriesModalStyling} formData={formData} setFormData={setFormData} />
                    <InvestEventSeriesPopup eventSeriesModalStyling={eventSeriesModalStyling} formData={formData} setFormData={setFormData} />
                    <RebalanceEventSeriesPopup eventSeriesModalStyling={eventSeriesModalStyling}formData={formData} setFormData={setFormData} />
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

const StartYear = ({handleStartYearChange, eventData, formData}: {handleStartYearChange:any, eventData:any, formData:any}) => {
    return (
        <div>
            <h2 className="font-medium">Start Year:</h2>
            <div className="flex gap-5">
                <div className="flex flex-col gap-1">
                    <div className="flex gap-2 align-middle">
                        <input className="ml-1" type="radio" name="start_year-type" value="fixed" onChange={handleStartYearChange} checked={eventData.start_year.type === 'fixed'}/>
                        <div className="">Fixed:</div>
                        <input className="text-md px-1 border-2 border-gray-200 rounded-md w-30" 
                            name="fixed" 
                            value={eventData.start_year.fixed} 
                            onChange={handleStartYearChange}
                            type="number" min="0"/> 
                    </div>
                    <div className="flex gap-2 align-middle">
                        <input className="ml-1" type="radio" name="start_year-type" value="uniform" onChange={handleStartYearChange} checked={eventData.start_year.type === 'uniform'}/>
                        <div className="">Uniform: &nbsp; Min:</div>
                        <input className="text-md px-1 border-2 border-gray-200 rounded-md w-30" 
                            name="min"
                            value={eventData.start_year.min}
                            onChange={handleStartYearChange}
                            type="number" min="0"/> 
                        <div className="">Max:</div>
                        <input className="text-md px-1 border-2 border-gray-200 rounded-md w-30"  
                            name="max"
                            value={eventData.start_year.max}
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
                            name="stddev"
                            value={eventData.start_year.stddev}
                            onChange={handleStartYearChange}
                            type="number" min="0"/> 
                    </div>
                    <div className="flex gap-2 align-middle">
                        <input className="ml-1" type="radio" name="start_year-type" value="start_with" onChange={handleStartYearChange} checked={eventData.start_year.type === 'start_with'}/>
                        <div className="">Same year event series</div>
                        <select className="text-md px-1 border-2 border-gray-200 rounded-md w-fit"
                            name="start_year-event_series"
                            value={eventData.event_series}
                            onChange={handleStartYearChange}>
                            <option value="">Choose Event</option>
                            {formData.event_series
                            .map(event_series => 
                                <option value={event_series.name}>{event_series.name}</option>
                            )}
                        </select>
                        <div className=""> starts</div> 
                    </div>
                    <div className="flex gap-2 align-middle">
                        <input className="ml-1" type="radio" name="start_year-type" value="year_after" onChange={handleStartYearChange} checked={eventData.start_year.type === 'year_after'}/>
                        <div className="">Year after event series</div>
                        <select className="text-md px-1 border-2 border-gray-200 rounded-md w-fit"
                            name="start_year-event_series"
                            value={eventData.event_series}
                            onChange={handleStartYearChange}>
                            <option value="">Choose Event</option>
                            {formData.event_series
                            .map(event_series => 
                                <option value={event_series.name}>{event_series.name}</option>
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
                            name="fixed"
                            value={eventData.duration.fixed}
                            onChange={handleDurationChange}
                            type="number" min="0"/> 
                    </div>
                    <div className="flex gap-2 align-middle">
                        <input className="ml-1" type="radio" name="duration-type" value="uniform" onChange={handleDurationChange} checked={eventData.duration.type === 'uniform'}/>
                        <div className="">Uniform: &nbsp; Min:</div>
                        <input className="text-md px-1 border-2 border-gray-200 rounded-md w-30" 
                            name="min"
                            value={eventData.duration.min}
                            onChange={handleDurationChange}
                            type="number" min="0"/> 
                        <div className="">Max:</div>
                        <input className="text-md px-1 border-2 border-gray-200 rounded-md w-30" 
                            name="max"
                            value={eventData.duration.max}
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
                            name="stddev"
                            value={eventData.duration.stddev}
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
                        <input className="ml-1" type="radio" name="exp-is_percent" value="false" onChange={handleAnnualChange} checked={eventData.exp_annual_change.is_percent === 'false'}/>
                        <div className="">Amount</div>
                    </div>
                    <div className="flex gap-2 align-middle">
                        <input className="ml-1" type="radio" name="exp-is_percent" value="true" onChange={handleAnnualChange} checked={eventData.exp_annual_change.is_percent === 'true'}/>
                        <div className="">Percent</div>
                    </div>
                </div>
                <div className="border-l-2 border-l-black-400 pl-5 flex flex-col gap-1">
                    <div className="flex gap-2 align-middle">
                        <input className="ml-1" type="radio" name="exp-type" value="fixed" onChange={handleAnnualChange} checked={eventData.exp_annual_change.type === 'fixed'}/>
                        <div className="">Fixed:</div>
                        <input className="text-md px-1 border-2 border-gray-200 rounded-md w-30" 
                            onChange={handleAnnualChange}
                            name="fixed"
                            value={eventData.exp_annual_change.fixed}
                            type="number" min="0"/> 
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
                            name="stddev"
                            value={eventData.exp_annual_change.stddev}
                            type="number" min="0"/> 
                    </div>
                    <div className="flex gap-2 align-middle">
                        <input className="ml-1" type="radio" name="exp-type" value="uniform" onChange={handleAnnualChange} checked={eventData.exp_annual_change.type === 'uniform'}/>
                        <div className="">Uniform: &nbsp; Min:</div>
                        <input className="text-md px-1 border-2 border-gray-200 rounded-md w-30" 
                            onChange={handleAnnualChange}
                            name="min"
                            value={eventData.exp_annual_change.min}
                            type="number" min="0"/> 
                        <div className="">Max:</div>
                        <input className="text-md px-1 border-2 border-gray-200 rounded-md w-30" 
                            onChange={handleAnnualChange}
                            name="max"
                            value={eventData.exp_annual_change.max}
                            type="number" min="0"/> 
                    </div>
                </div>
            </div>
        </div>
    )
}

export default EventSeries;
export { Name, Description, StartYear, Duration, ExpectedAnnualChange};