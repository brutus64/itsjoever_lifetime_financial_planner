import { useState } from 'react';
import { Name, Description, StartYear, Duration } from './EventSeries'

const defaultRebalanceEventForm = {
    type: "rebalance",
    name: "",
    description: "",
    start_year: {
        type: "", //  "fixed", "uniform", "normal", "same_year", "year_after"
        fixed: 0,
        min: 0,
        max: 100,
        mean: 0,
        stddev: 1,
        event_series: "" // if type is "same_year" or "year_after"
    },
    duration: {
        type: "", //fixed, uniform, normal
        fixed: 0,
        min: 0,
        max: 0,
        mean: 0,
        stddev: 1,

    },
    maximum_cash: 0.0,
}

const RebalanceEventSeries = ({setOpen, formData, setFormData}: {setOpen:any, formData:any, setFormData:any}) => {
    const [ rebalanceEventData, setRebalanceEventData ] = useState(defaultRebalanceEventForm);
      // Clear fields if successfully added or cancel button clicked or if editing
      const handleClose = (clear:boolean) => {
        if (clear)
            setRebalanceEventData(defaultRebalanceEventForm)
        setOpen(false)
    }

    function handleRebalanceEvent() {
        setFormData({
            ...formData,
            event_series: [...formData.event_series,rebalanceEventData] 
        })
        handleClose(true)
    }


    const handleStartYearChange = (e: any) => {
        let { name, value } = e.target;

        setRebalanceEventData({
            ...rebalanceEventData,
            start_year: {
                ...rebalanceEventData.start_year,
                [name]:value,
            }
        })

        console.log(`${name} is ${value}`)
    }

    const handleDurationChange = (e:any) => {
        let { name, value } = e.target;

        setRebalanceEventData({
            ...rebalanceEventData,
            duration: {
                ...rebalanceEventData.duration,
                [name]:value,
            }
        })
        console.log(`${name} is ${value}`)
    }

    const handleChange = (e: any) => {
        const { name, value } = e.target;
        setRebalanceEventData({
            ...rebalanceEventData,
            [name]:value,
        });
        console.log(`holy shit ${name} ${value}`)
    };
    
    return (
        <div className="rounded-lg m-10 flex flex-col gap-2 overflow-y-auto h-full">
            <h1 className="text-2xl font-bold">New Rebalance Event Series</h1>
            <Name handleChange={handleChange} eventData={rebalanceEventData} />
            <Description handleChange={handleChange} eventData={rebalanceEventData} />
            <StartYear handleStartYearChange={handleStartYearChange} eventData={rebalanceEventData} formData={formData}/>
            <Duration handleDurationChange={handleDurationChange} eventData={rebalanceEventData} />

            
            <div className="text-2xl font-bold">
                SAME AS INVEST SERIES... (fixed/glide)
            </div>

            <div className="flex justify-center gap-20">
                <button className="text-white px-4 py-1 rounded-md hover:opacity-80 cursor-pointer disabled:opacity-20 disabled:cursor-default bg-red-600 w-20" onClick={() => setOpen(false)}>Cancel</button>
                <button className="text-white px-4 py-1 rounded-md hover:opacity-80 cursor-pointer disabled:opacity-20 disabled:cursor-default bg-blue-600 w-20" onClick={handleRebalanceEvent}>Add</button>
            </div>
        </div>
    );
};

const RebalanceEventItem = ({ name, description }) => {
    return (
        <div className="bg-white shadow-md rounded-lg p-4 flex flex-col gap-3 w-full hover:bg-sky-100 cursor-pointer">
            <h2 className="text-xl font-medium overflow-ellipsis overflow-hidden">{name}</h2>
            <p className="overflow-ellipsis overflow-hidden">{description}</p>
            {/* <button>Edit</button> */}
        </div>
    );
}

export default RebalanceEventSeries;
export { RebalanceEventItem };