import { useState } from 'react';
import { Name, Description, StartYear, Duration } from './EventSeries'
import InvestmentCard from './InvestmentCard';

const defaultInvestEventForm = {
    type: "invest",
    name: "",
    description: "",
    start_year: {
        type: "", //  "fixed", "uniform", "normal", "same_year", "year_after"
        fixed: 2025,
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
    is_glide: false,
    initial_allocation: {}, //key = "investment_type|tax_status", value = percentage AKA asset_allocation1
    final_allocation: {}, //key = "investment_type|tax_status", value = percentage AKA asset_allocation2
}

const InvestEventSeries = ({setOpen, formData, setFormData}: {setOpen:any, formData:any, setFormData:any}) => {
    const [ investEventData, setInvestEventData ] = useState(defaultInvestEventForm);
    const [ error, setError ] = useState("");
    
  // Clear fields if successfully added or cancel button clicked or if editing
    const handleClose = (clear:boolean) => {
        if (clear)
            setInvestEventData(defaultInvestEventForm)
        setOpen(false)
        setError("")
    }

    function handleAddInvestEvent() {
        const important_fields = [investEventData.name, investEventData.maximum_cash]

        if (important_fields.some((field) => field === "")) {
            setError("Please fill out all fields");
            return;
        }
        let { type: s_type, fixed: s_fixed, min: s_min, max: s_max, mean: s_mean, stddev: s_stddev, event_series: s_event_series } = investEventData.start_year;
        if (
            s_type == '' ||
            s_type === 'fixed' && s_fixed < 0 ||
            s_type === 'uniform' && (s_min < 0 || s_max < 0) || 
            s_type === 'normal' && (s_mean < 0 || s_stddev < 0) ||
            (s_type === 'same_year' || s_type === 'year_after') && s_event_series === ""
        ) {
            setError("Please fill out Start Year fields");
            return;
        }
        
        let { type: d_type, fixed: d_fixed, min: d_min, max: d_max, mean: d_mean, stddev: d_stddev } = investEventData.duration;
        if (
            d_type == '' ||
            d_type === 'fixed' && d_fixed < 0 ||
            d_type === 'uniform' && (d_min < 0 || d_max < 0) || 
            d_type === 'normal' && (d_mean < 0 || d_stddev < 0)
        ) {
            setError("Please fill out Duration fields");
            return;
        }

        setFormData({
            ...formData,
            event_series: [...formData.event_series,investEventData] 
        })
        handleClose(true)

        console.log(investEventData)
    }


    const handleStartYearChange = (e: any) => {
        let { name, value } = e.target;
        if (name.includes("-")) {
            name = name.split('-')[1]
        }

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
        if (name.includes("-")) {
            name = name.split('-')[1]
        }

        setInvestEventData({
            ...investEventData,
            duration: {
                ...investEventData.duration,
                [name]:value,
            }
        })
        console.log(`${name} is ${value}`)
    }

    const handleGlide = (e:any) => {
        setInvestEventData({
            ...investEventData,
            "is_glide":e.target.checked,
        })

        console.log(investEventData.is_glide)
    }
    const handleAssetAllocation = (e:any) => {
        let { name, value } = e.target;
        let split = name.split(':');
        let initial_or_final = split[0];
        name = split[1];
        if(initial_or_final == 'initial') {
            setInvestEventData({
                ...investEventData,
                initial_allocation: {
                    ...investEventData.initial_allocation,
                    [name]: parseFloat(value),  
                }
            });
            console.log(investEventData.initial_allocation);
        }
        else { // initial_or_final == 'final'
            setInvestEventData({
                ...investEventData,
                final_allocation: {
                    ...investEventData.final_allocation,  
                    [name]: parseFloat(value),  
                }
            });

            console.log(investEventData.final_allocation);
        }
    };

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
            <StartYear handleStartYearChange={handleStartYearChange} eventData={investEventData} formData={formData} />
            <Duration handleDurationChange={handleDurationChange} eventData={investEventData} />
            
            <div className='flex gap-4'>
                <h2 className="font-medium">Maximum Cash</h2>
                <input className="text-md px-1 border-2 border-gray-200 rounded-md w-40" 
                    name="maximum_cash"
                    value={investEventData.maximum_cash}
                    onChange={handleChange}
                    type="number" min="0"/>
            </div>

            <div>
                <h1 className="font-medium">Asset Allocation</h1>

                <div className="flex gap-5 align-middle">
                    <h2 className="font-medium self-cener">Glide Path:</h2>
                    <input type="checkbox" name="is_glide" onChange={handleGlide} checked={investEventData.is_glide}/>  
                </div>

                <div className="flex gap-4">
                    {formData.investment.filter(investment => investment.tax_status !== 'pre-tax-retirement').length == 0 && (
                        <h1 className="text-center">No investments to allocate</h1>
                    )}

                    <div className="flex flex-col">
                        {formData.investment.filter(investment => investment.tax_status !== 'pre-tax-retirement').length > 0 && (
                            <h1 className="text-center">{investEventData.is_glide ? 'Initial Percentages' : 'Fixed Percent'}</h1>
                        )}
                        <div className="flex flex-col  gap-3">
                            {formData.investment
                            .filter(investment => investment.tax_status != 'pre-tax-retirement')
                            .map(investment =>
                                <div className="flex flex-col gap-1">
                                    <InvestmentCard investment={investment}/>
                                    <div className='flex gap-3'>
                                        <input type="number" className="text-md px-1 border-2 border-gray-200 rounded-md w-full" 
                                            name={"initial:"+investment.investment_type+'|'+investment.tax_status} 
                                            value={(investEventData.final_allocation["initial:"+investment.investment_type+'|'+investment.tax_status])} 
                                            onChange={handleAssetAllocation} 
                                            min="0" max="100"/> %
                                    </div>
                                </div> 
                            )}
                        </div>
                    </div>

                    {investEventData.is_glide && (
                        <div className="flex flex-col">
                            {formData.investment.filter(investment => investment.tax_status !== 'pre-tax-retirement').length > 0 && (
                                <h1 className="text-center">Final Percentages</h1>
                            )}
                            
                            <div className="flex flex-col gap-3">
                            {formData.investment
                                .filter(investment => investment.tax_status !== 'pre-tax-retirement')
                                .map(investment => (
                                    <div className="flex flex-col gap-1" key={investment.name}>
                                        <InvestmentCard investment={investment} />
                                        <div className="flex gap-3">
                                            <input
                                                type="number"
                                                className="text-md px-1 border-2 border-gray-200 rounded-md w-full"
                                                name={"final:"+investment.investment_type+'|'+investment.tax_status}
                                                value={investEventData.initial_allocation["final:"+investment.investment_type+'|'+investment.tax_status]}
                                                onChange={handleAssetAllocation}
                                                min="0"
                                                max="100"
                                            /> %
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </div>

            <div className="flex justify-between">
                <button className="text-white px-4 py-1 rounded-md hover:opacity-80 cursor-pointer disabled:opacity-20 disabled:cursor-default bg-red-600 w-20" onClick={() => setOpen(false)}>Cancel</button>
                <div className="text-red-600 font-bold">{error}</div>
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