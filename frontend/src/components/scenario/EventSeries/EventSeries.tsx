import Popup from "reactjs-popup"
import "reactjs-popup/dist/index.css"
import { useState } from "react";
import ExpenseEventSeries, {ExpenseEventItem} from "./ExpenseEventSeries";
import InvestEventSeries, {InvestEventItem} from "./InvestEventSeries";
import RebalanceEventSeries, {RebalanceEventItem} from "./RebalanceEventSeries";
import IncomeEventSeries, {IncomeEventItem} from "./IncomeEventSeries";

const eventSeriesModalStyling = { 
    "border": "none",
    "borderRadius":"8px",
    "width":"700px",
    "height":"600px"
};

const EventSeries = ({ formData,setFormData }:any) => {
    return (
        <div className="m-10 flex align-center justify-center h-full gap-10">
            <div className='flex flex-col gap-4 w-60 '>
                <div className="bg-white shadow-md rounded-lg p-6 flex flex-col gap-5 w-fit align-center">
                    <h1 className="text-2xl font-bold inline-block whitespace-nowrap">Event Series</h1>
                    <p className="">An event series represents a sequence of annual events. Event series are categorized into four types: income, expense, invest, or rebalance. These events will last for a specified amount of years.</p>
                </div>
                <EventSeriesPopUp formData={formData} setFormData={setFormData} />
            </div>
            <div className="bg-white shadow-md rounded-lg p-6 flex flex-1 gap-4">
                <div className="bg-white shadow-md rounded-lg p-6 flex flex-col flex-1 gap-4 overflow-y-auto w-fit">
                    <h2 className="text-xl font-bold whitespace-nowrap">Income Event Series</h2>
                    
                    {formData.event_series
                    .filter(event_series => event_series.type === 'income')  // Only keep items with type 'income'
                    .map(event_series => 
                        <IncomeEventItem key={event_series.name} name={event_series.name} description={event_series.description} />
                    )}
                </div>
                
                <div className="bg-white shadow-md rounded-lg p-6 flex flex-col flex-1 gap-4 overflow-y-auto w-fit">
                    <h2 className="text-xl font-bold whitespace-nowrap">Expense Event Series</h2>
                    {formData.event_series
                    .filter(event_series => event_series.type === 'expense')  // Only keep items with type 'income'
                    .map(event_series => 
                        <ExpenseEventItem key={event_series.name} name={event_series.name} description={event_series.description} />
                    )}
                </div>
                
                <div className="bg-white shadow-md rounded-lg p-6 flex flex-col flex-1 gap-4 overflow-y-auto w-fit">
                    <h2 className="text-xl font-bold whitespace-nowrap">Invest Event Series</h2>
                    {formData.event_series
                    .filter(event_series => event_series.type === 'invest')  // Only keep items with type 'income'
                    .map(event_series => 
                        <InvestEventItem key={event_series.name} name={event_series.name} description={event_series.description} />
                    )}
                </div>
                
                <div className="bg-white shadow-md rounded-lg p-6 flex flex-col flex-1 gap-4 overflow-y-auto w-fit">
                    <h2 className="text-xl font-bold whitespace-nowrap">Rebalance Event Series</h2>
                    {formData.event_series
                    .filter(event_series => event_series.type === 'rebalance')  // Only keep items with type 'income'
                    .map(event_series => 
                        <RebalanceEventItem key={event_series.name} name={event_series.name} description={event_series.description} />
                    )}
                </div>
            </div>
        </div>
    )
}

const EventSeriesPopUp = ({ formData, setFormData }:any) => {
    const [open, setOpen] = useState(false);
    const [eventSeriesType, setEventSeriesType] = useState('income');

    const handleAddEventSeriesType = () => {
            
    }
    return (
        <div>
            <div 
                className="bg-white shadow-md rounded-lg p-6 flex items-center justify-center flex-0 gap-3 w-fit hover:bg-gray-100 cursor-pointer"
                onClick={() => setOpen(true)}
            >
                <img src='add.png' className="w-7 h-7"/>
                <div className="flex items-center gap-3">
                    <p className="text-md"> 
                        Add 
                        <select 
                            className="border border-gray-300 rounded-md inline-block mx-2 w-fit"
                            onChange={(e) => setEventSeriesType(e.target.value)}
                            value={eventSeriesType}
                            onClick={(e) => e.stopPropagation()} // Prevent modal from opening
                        >
                            <option value="income">Income</option>
                            <option value="expense">Expense</option>
                            <option value="invest">Invest</option>
                            <option value="rebalance">Rebalance</option>
                        </select>
                        Event Series
                    </p>
                </div>
            </div>

            <Popup open={open} onClose={() => setOpen(false)} position="right center" contentStyle={eventSeriesModalStyling}>
                <div className="rounded-lg flex flex-col gap-2 overflow-y-auto h-full">
                    {eventSeriesType === "income" && <IncomeEventSeries setOpen={setOpen} formData={formData} setFormData={setFormData}/>}
                    {eventSeriesType === "expense" && <ExpenseEventSeries setOpen={setOpen} formData={formData} setFormData={setFormData}/>}
                    {eventSeriesType === "invest" && <InvestEventSeries setOpen={setOpen} formData={formData} setFormData={setFormData}/>}
                    {eventSeriesType === "rebalance" && <RebalanceEventSeries setOpen={setOpen} formData={formData} setFormData={setFormData}/>}
                </div>
            </Popup>
        </div>
    );
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
                        <input className="ml-1" type="radio" name="type" value="fixed" onChange={handleStartYearChange}/>
                        <div className="">Fixed:</div>
                        <input className="text-md px-1 border-2 border-gray-200 rounded-md w-30" 
                            name="fixed" 
                            value={eventData.start_year.fixed} 
                            onChange={handleStartYearChange}
                            type="number" min="0"/> 
                    </div>
                    <div className="flex gap-2 align-middle">
                        <input className="ml-1" type="radio" name="type" value="uniform" onChange={handleStartYearChange}/>
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
                        <input className="ml-1" type="radio" name="type" value="normal" onChange={handleStartYearChange}/>
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
                        <input className="ml-1" type="radio" name="type" value="same_year" onChange={handleStartYearChange}/>
                        <div className="">Same year event series</div>
                        <select className="text-md px-1 border-2 border-gray-200 rounded-md w-fit"
                            name="event_series"
                            value={eventData.event_series}>
                            <option value="">Choose Event</option>
                            {formData.event_series
                            .map(event_series => 
                                <option value={event_series.name}>{event_series.name}</option>
                            )}
                        </select>
                        <div className=""> starts</div> 
                    </div>
                    <div className="flex gap-2 align-middle">
                        <input className="ml-1" type="radio" name="type" value="year_afater" onChange={handleStartYearChange}/>
                        <div className="">Year after event series</div>
                        <select className="text-md px-1 border-2 border-gray-200 rounded-md w-fit"
                            name="event_series"
                            value={eventData.event_series}>
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
                        <input className="ml-1" type="radio" name="type" value="fixed" onChange={handleDurationChange}/>
                        <div className="">Fixed:</div>
                        <input className="text-md px-1 border-2 border-gray-200 rounded-md w-30" 
                            name="fixed"
                            value={eventData.duration.fixed}
                            onChange={handleDurationChange}
                            type="number" min="0"/> 
                    </div>
                    <div className="flex gap-2 align-middle">
                        <input className="ml-1" type="radio" name="type" value="uniform" onChange={handleDurationChange}/>
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
                        <input className="ml-1" type="radio" name="type" value="normal" onChange={handleDurationChange}/>
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
                        <input className="ml-1" type="radio" name="is_percent" value="false" onChange={handleAnnualChange}/>
                        <div className="">Amount</div>
                    </div>
                    <div className="flex gap-2 align-middle">
                        <input className="ml-1" type="radio" name="is_percent" value="true" onChange={handleAnnualChange}/>
                        <div className="">Percent</div>
                    </div>
                </div>
                <div className="border-l-2 border-l-black-400 pl-5 flex flex-col gap-1">
                    <div className="flex gap-2 align-middle">
                        <input className="ml-1" type="radio" name="type" value="fixed" onChange={handleAnnualChange}/>
                        <div className="">Fixed:</div>
                        <input className="text-md px-1 border-2 border-gray-200 rounded-md w-30" 
                            onChange={handleAnnualChange}
                            name="fixed"
                            value={eventData.exp_annual_change.fixed}
                            type="number" min="0"/> 
                    </div>
                    <div className="flex gap-2 align-middle">
                        <input className="ml-1" type="radio" name="type" value="normal" onChange={handleAnnualChange}/>
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
                        <input className="ml-1" type="radio" name="type" value="uniform"/>
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