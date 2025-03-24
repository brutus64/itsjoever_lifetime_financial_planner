import { useState } from 'react';
import { Name, Description, StartYear, Duration } from './EventSeries'

const defaultInvestEventForm = {
    type: "invest",
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

const InvestEventSeries = ({setOpen, formData, setFormData}: {setOpen:any, formData:any, setFormData:any}) => {
    const [ investEventData, setInvestEventData ] = useState(defaultInvestEventForm);
    
  // Clear fields if successfully added or cancel button clicked or if editing
    const handleClose = (clear:boolean) => {
        if (clear)
            setInvestEventData(defaultInvestEventForm)
        setOpen(false)
    }

    function handleAddInvestEvent() {
        setFormData({
            ...formData,
            event_series: [...formData.event_series,investEventData] 
        })
        handleClose(true)
    }


    const handleStartYearChange = (e: any) => {
        let { name, value } = e.target;

        setInvestEventData({
            ...investEventData,
            start_year: {
                ...investEventData.start_year,
                [name]:value,
            }
        })

        console.log(`${name} is ${value}`)
    }

    const handleDurationChange = (e:any) => {
        let { name, value } = e.target;

        setInvestEventData({
            ...investEventData,
            duration: {
                ...investEventData.duration,
                [name]:value,
            }
        })
        console.log(`${name} is ${value}`)
    }

    const handleChange = (e: any) => {
        const { name, value } = e.target;
        setInvestEventData({
            ...investEventData,
            [name]:value,
        });
        console.log(`holy shit ${name} ${value}`)
    };

    return (
        <div className="rounded-lg m-10 flex flex-col gap-2 overflow-y-auto h-full">
            <h1 className="text-2xl font-bold">New Invest Event Series</h1>
            <Name handleChange={handleChange} eventData={investEventData} />
            <Description handleChange={handleChange} eventData={investEventData} />
            <StartYear handleStartYearChange={handleStartYearChange} eventData={investEventData} />
            <Duration handleDurationChange={handleDurationChange} eventData={investEventData} />

            {/* need to get investments and list them out...? */}
            <div className="text-2xl font-bold">
                SOMEHOW SHOW ALL INVESTMENTS NOT IN PRE-TAX ACCOUNTS FOR FIXED %S OR A GLIDE PATH
            </div>
            
            <div className='flex gap-4'>
                <h2 className="font-medium">Maximum Cash</h2>
                <input className="text-md px-1 border-2 border-gray-200 rounded-md w-40" 
                    name="maximum_cash"
                    value={investEventData.maximum_cash}
                    onChange={handleChange}
                    type="number" min="0"/>
            </div>

            <div className="flex justify-center gap-20">
                <button className="text-white px-4 py-1 rounded-md hover:opacity-80 cursor-pointer disabled:opacity-20 disabled:cursor-default bg-red-600 w-20" onClick={() => setOpen(false)}>Cancel</button>
                <button className="text-white px-4 py-1 rounded-md hover:opacity-80 cursor-pointer disabled:opacity-20 disabled:cursor-default bg-blue-600 w-20" onClick={handleAddInvestEvent}>Add</button>
            </div>
        </div>
    );
};

const InvestEventItem = ({ name, description }) => {
    return (
        <div className="bg-white shadow-md rounded-lg p-4 flex flex-col gap-3 w-full hover:bg-sky-100 cursor-pointer">
            <h2 className="text-xl font-medium overflow-ellipsis overflow-hidden">{name}</h2>
            <p className="overflow-ellipsis overflow-hidden">{description}</p>
            {/* <button>Edit</button> */}
        </div>
    );
}

export default InvestEventSeries;
export { InvestEventItem };