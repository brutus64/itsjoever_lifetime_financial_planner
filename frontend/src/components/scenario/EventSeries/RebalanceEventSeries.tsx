import Popup from "reactjs-popup"
import { useState } from 'react';
import { Name, Description, StartYear, Duration } from './EventSeries'
import InvestmentCard from './InvestmentCard';

const defaultRebalanceEventForm = {
    type: "rebalance",
    name: "",
    description: "",
    start_year: {
        type: "", //  "fixed", "uniform", "normal", "start_with", "end_with"
        fixed: 2025,
        min: 0,
        max: 100,
        mean: 0,
        stddev: 1,
        event_series: "" // if type is "start_with" or "end_with"
    },
    duration: {
        type: "", //fixed, uniform, normal
        fixed: 0,
        min: 0,
        max: 0,
        mean: 0,
        stddev: 1,

    },
    is_glide: false, 
    tax_status: "non-retirement",
    initial_allocation: {}, //key = "investment_type|tax_status", value = percentage AKA asset_allocation1
    final_allocation: {}, //key = "investment_type|tax_status", value = percentage AKA asset_allocation2
    initial_allocation_data: {}, // used to display % in frontend
    final_allocation_data: {}, 
}

const RebalanceEventSeriesPopup = ({eventSeriesModalStyling, formData, setFormData}: {eventSeriesModalStyling:any, formData:any, setFormData:any}) => {
    const [open, setOpen] = useState(false);
    const [ rebalanceEventData, setRebalanceEventData ] = useState(defaultRebalanceEventForm);
    const [ error, setError ] = useState("");
    const [ editing, setEditing ] = useState(-1); // -1 means not currently editing

    // Clear fields if successfully added or cancel button clicked or if editing
    const handleClose = (clear:boolean) => {
        if (clear || editing !== -1)
            setRebalanceEventData(defaultRebalanceEventForm)
        setOpen(false)
        setEditing(-1)
        setError("")
    }
    const handleEdit = (index) => {
        setEditing(index);
        setRebalanceEventData(formData.event_series[index])
        setOpen(true)
    }

    function handleRebalanceEvent() {
        const important_fields = [rebalanceEventData.name]

        if (important_fields.some((field) => field === "")) {
            setError("Please fill out all fields");
            return;
        }
        let { type: s_type, fixed: s_fixed, min: s_min, max: s_max, mean: s_mean, stddev: s_stddev, event_series: s_event_series } = rebalanceEventData.start_year;
        if (
            s_type == '' ||
            s_type === 'fixed' && s_fixed < 0 ||
            s_type === 'uniform' && (s_min < 0 || s_max < 0) || 
            s_type === 'normal' && (s_mean < 0 || s_stddev < 0) ||
            (s_type === 'start_with' || s_type === 'end_with') && s_event_series === ""
        ) {
            setError("Please fill out Start Year fields");
            return;
        }
        
        let { type: d_type, fixed: d_fixed, min: d_min, max: d_max, mean: d_mean, stddev: d_stddev } = rebalanceEventData.duration;
        if (
            d_type == '' ||
            d_type === 'fixed' && d_fixed < 0 ||
            d_type === 'uniform' && (d_min < 0 || d_max < 0) || 
            d_type === 'normal' && (d_mean < 0 || d_stddev < 0)
        ) {
            setError("Please fill out Duration fields");
            return;
        }
        if(d_type === 'fixed' && d_fixed == 0) {
            setError("Fixed year for duration cannot be 0.");
            return;
        }

        console.log(rebalanceEventData.initial_allocation);
        let num_tax_status = formData.investment.filter((investment: { tax_status: string; }) => investment.tax_status == rebalanceEventData.tax_status).length;
        if (num_tax_status == 0) {
            setError("Please create Investments first");
            return;
        }
        
        if (
            Object.keys(rebalanceEventData.initial_allocation).length != num_tax_status ||
            rebalanceEventData.is_glide && (Object.keys(rebalanceEventData.final_allocation).length != num_tax_status)
        ) {
            console.log(`${Object.keys(rebalanceEventData.initial_allocation).length} VS ${num_tax_status} `)
            setError("Please fill out Asset Allocation fields");
            return;
        }

        let cumulative_percentages = 0.0
        for (let key in rebalanceEventData.initial_allocation) {
            const value = rebalanceEventData.initial_allocation[key];
            cumulative_percentages += value
        }
        if(cumulative_percentages != 100.0) {
            setError("Please make sure percentages sum to 100");
            return;
        }

        if(rebalanceEventData.is_glide) {
            cumulative_percentages = 0.0
            for (let key in rebalanceEventData.final_allocation)  {
                const value = rebalanceEventData.final_allocation[key];
                cumulative_percentages += value
                console.log(`${key}: ${value}`);
            }
            if(cumulative_percentages != 100.0) {
                setError("Please make sure percentages sum to 100");
                return;
            }
        }

        if(editing !== -1) {
            setFormData({
                ...formData,
                event_series: formData.event_series.map((event_serie,i) =>
                    i === editing ? rebalanceEventData : event_serie)
            })
        } else {
            setFormData({
                ...formData,
                event_series: [...formData.event_series,rebalanceEventData] 
            })
        }
        handleClose(true)
    }


    const handleStartYearChange = (e: any) => {
        let { name, value } = e.target;
        if (name.includes("-")) {
            name = name.split('-')[1]
        }

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
        if (name.includes("-")) {
            name = name.split('-')[1]
        }

        setRebalanceEventData({
            ...rebalanceEventData,
            duration: {
                ...rebalanceEventData.duration,
                [name]:value,
            }
        })
        console.log(`${name} is ${value}`)
    }

    const handleGlide = (e:any) => {
        setRebalanceEventData({
            ...rebalanceEventData,
            "is_glide":e.target.checked,
        })

        console.log(rebalanceEventData.is_glide)
    }

    const handleAssetAllocation = (e:any) => {
        let { name, value } = e.target;
        console.log(`as ${name} and ${value}`);
        let split = name.split(':');
        let initial_or_final = split[0];
        let rname = split[1];

        console.log(`rname: ${rname} initorfinal ${initial_or_final}`)
        if(initial_or_final == 'initial') {
            setRebalanceEventData({
                ...rebalanceEventData,
                initial_allocation: {
                    ...rebalanceEventData.initial_allocation,
                    [rname]: parseFloat(value),  
                },
                initial_allocation_data: {
                    ...rebalanceEventData.initial_allocation_data,
                    [name]: parseFloat(value) 
                }
            });
            
            console.log(rebalanceEventData.initial_allocation);
            console.log(rebalanceEventData.initial_allocation_data);
        }
        else { // initial_or_final == 'final'
            setRebalanceEventData({
                ...rebalanceEventData,
                final_allocation: {
                    ...rebalanceEventData.final_allocation,  
                    [rname]: parseFloat(value),  
                },
                final_allocation_data: {
                    ...rebalanceEventData.final_allocation_data,  
                    [name]: parseFloat(value)  
                }
            });

            console.log(rebalanceEventData.final_allocation);
        }
    };

    const handleTaxStatusChange = (e: any) => {
        const { name, value } = e.target;
        console.log(`${name} IS ${value}`)
        setRebalanceEventData({
            ...rebalanceEventData,
            initial_allocation: {},
            final_allocation: {},
            initial_allocation_data: {},
            final_allocation_data: {}
        });
        setRebalanceEventData({
            ...rebalanceEventData,
            [name]:value,
        });
        console.log(`holy shit ${name} ${value}`)
    };
    

    const handleChange = (e: any) => {
        const { name, value } = e.target;
        setRebalanceEventData({
            ...rebalanceEventData,
            [name]:value,
        });
        console.log(`holy shit ${name} ${value}`)
    };
    
    return (
        <div className="bg-white shadow-md rounded-lg p-6 flex flex-col flex-1 gap-6 overflow-y-auto w-fit">
            <div className="bg-white shadow-md rounded-lg p-6 flex flex-col gap-3 w-fit hover:bg-sky-100 cursor-pointer" onClick={() => setOpen(true)}>
                + Add Rebalance
            </div>


            <div className="flex flex-col gap-3 h-60 overflow-y-scroll py-2">
            {formData.event_series
                .map((event_series, index) => ({ ...event_series, index }))  // Add index to each item
                .filter(event_series => event_series.type === 'rebalance')  // Only keep items with type 'income'
                .map((event_series) => 
                <RebalanceEventItem 
                    event_series={event_series} 
                    handleEdit={handleEdit} 
                    i = {event_series.index}
                />
                )}
            </div>

            <Popup open={open} onClose={() => setOpen(false)} position="right center" contentStyle={eventSeriesModalStyling}>
                <div className="rounded-lg p-3 flex flex-col gap-2 overflow-y-auto h-full">
                    <h1 className="text-2xl font-bold">New Rebalance Event Series</h1>
                    <Name handleChange={handleChange} eventData={rebalanceEventData} />
                    <Description handleChange={handleChange} eventData={rebalanceEventData} />
                    <StartYear handleStartYearChange={handleStartYearChange} eventData={rebalanceEventData} formData={formData}/>
                    <Duration handleDurationChange={handleDurationChange} eventData={rebalanceEventData} />

                    
                    <div>
                        <h1 className="font-medium">Asset Allocation</h1>
                        <div className='flex gap-4'>
                            <h2 className="font-medium">Tax-status is</h2>
                            <select className="text-md px-1 border-2 border-gray-200 rounded-md w-fit"
                                name="tax_status"
                                value={rebalanceEventData.tax_status}
                                onChange={handleTaxStatusChange}>
                                <option value="non-retirement">Non-retirement</option>
                                <option value="pre-tax-retirement">Pre-tax retirement</option>
                                <option value="after-tax-retirement">After-tax retirement</option>
                            </select>
                        </div>
                        <div className="flex gap-5 align-middle">
                            <h2 className="font-medium self-cener">Glide Path:</h2>
                            <input type="checkbox" name="is_glide" onChange={handleGlide} checked={rebalanceEventData.is_glide}/>  
                        </div>

                        <div className="flex gap-4">
                            {formData.investment.filter(investment => investment.tax_status === rebalanceEventData.tax_status).length == 0 && (
                                <h1 className="text-center">No investments to allocate</h1>
                            )}

                            <div className="flex flex-col">
                                {formData.investment.filter(investment => investment.tax_status ===  rebalanceEventData.tax_status).length > 0 && (
                                    <h1 className="text-center">{rebalanceEventData.is_glide ? 'Initial Percentages' : 'Fixed Percent'}</h1>
                                )}
                                <div className="flex flex-col gap-3">
                                    {formData.investment
                                    .filter(investment => investment.tax_status ===  rebalanceEventData.tax_status)
                                    .map(investment =>
                                        <div className="flex flex-col gap-1 w-60">
                                            <InvestmentCard investment={investment}/>
                                            <div className='flex gap-3'>
                                                <input type="number" className="text-md px-1 border-2 border-gray-200 rounded-md w-full" 
                                                    name={"initial:"+investment.investment_type+'|'+investment.tax_status} 
                                                    value={(rebalanceEventData.initial_allocation_data["initial:"+investment.investment_type+'|'+investment.tax_status])} 
                                                    onChange={handleAssetAllocation} 
                                                    min="0" max="100"/> %
                                            </div>
                                        </div> 
                                    )}
                                </div>
                            </div>

                            {rebalanceEventData.is_glide && (
                                <div className="flex flex-col">
                                    {formData.investment.filter(investment => investment.tax_status ==  rebalanceEventData.tax_status).length > 0 && (
                                        <h1 className="text-center">Final Percentages</h1>
                                    )}
                                    
                                    <div className="flex flex-col gap-3">
                                    {formData.investment
                                        .filter(investment => investment.tax_status ==  rebalanceEventData.tax_status)
                                        .map(investment => (
                                            <div className="flex flex-col gap-1 w-60" key={investment.name}>
                                                <InvestmentCard investment={investment} />
                                                <div className="flex gap-3">
                                                    <input
                                                        type="number"
                                                        className="text-md px-1 border-2 border-gray-200 rounded-md w-full"
                                                        name={"final:"+investment.investment_type+'|'+investment.tax_status}
                                                        value={rebalanceEventData.final_allocation_data["final:"+investment.investment_type+'|'+investment.tax_status]}
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
                        <button className="text-white px-4 py-1 rounded-md hover:opacity-80 cursor-pointer disabled:opacity-20 disabled:cursor-default bg-red-600 w-20" onClick={() => handleClose(true)}>Cancel</button>
                        <div className="text-red-600 font-bold">{error}</div>
                        <button className="text-white px-4 py-1 rounded-md hover:opacity-80 cursor-pointer disabled:opacity-20 disabled:cursor-default bg-blue-600 w-20" onClick={handleRebalanceEvent}>Add</button>
                    </div>
                </div>
            </Popup>
        </div>
    );
};

const RebalanceEventItem = ({ event_series, handleEdit, i }) => {
    return (
        <div className="bg-white shadow-md rounded-lg p-4 flex flex-col w-full hover:bg-sky-100 cursor-pointer" onClick={() => handleEdit(i)}>
            <h2 className="text-ml font-medium overflow-ellipsis overflow-hidden">{event_series.tax_status}</h2>
            <h2 className="text-md font-medium overflow-ellipsis overflow-hidden">{event_series.name}</h2>
            <p className="text-sm overflow-ellipsis overflow-hidden">{event_series.description}</p>
            {/* <button>Edit</button> */}
        </div>
    );
}

export default RebalanceEventSeriesPopup;
export { RebalanceEventItem };