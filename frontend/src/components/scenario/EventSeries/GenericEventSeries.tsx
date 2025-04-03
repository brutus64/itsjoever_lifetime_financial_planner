import Popup from "reactjs-popup"
import { useState } from 'react';
import { Name, Description, StartYear, Duration, ExpectedAnnualChange } from './EventSeries'

const eventSeriesModalStyling = { 
    "border": "none",
    "borderRadius":"8px",
    "width":"700px",
    "height":"600px"
};
// 
const defaultGenericEventForm = {
    // INCOME/EXPENSE/INVEST/REBALANCE
    type: "",
    name: "",
    description: "",
    start_year: {
        type: "", //  "fixed", "uniform", "normal", "start_with", "end_with"
        value: 2025,
        lower: 0,
        upper: 100,
        mean: 0,
        stdev: 1,
        start_with: "", // if type is "start_with" or "end_with"
        end_with: ""
    },
    duration: {
        type: "", //fixed, uniform, normal
        value: 0,
        lower: 0,
        upper: 0,
        mean: 0,
        stdev: 1,
    },

    // INCOME/EXPENSE
    initial_amt: 0.0,
    exp_annual_change: {
        is_percent: null,
        type: "", // either "fixed" or "normal" or "uniform"
        value: 0,
        mean:0,
        stdev:1,
        lower: 0,
        upper: 0
    },
    inflation_adjust: false,
    user_split: 100.0,
    // INCOME
    social_security: false,
    // EXPENSE
    is_discretionary: false,
    
    // INVEST/REBALANCE
    is_glide: false,
    initial: {}, //key = "investment_type|tax_status", value = percentage AKA asset_allocation1
    final: {}, //key = "investment_type|tax_status", value = percentage AKA asset_allocation2
    initial_allocation_data: {}, // used to display % in frontend; stores entirety of input's value parameter (eg in InitialAssetAllocationCard)
    final_allocation_data: {},

    // INVEST
    max_cash: 0.0,
    // REBALANCE
    tax_status: "non-retirement"

}

const GenericEventSeriesPopup = ({eventSeriesType, formData, setFormData}: {eventSeriesType: string, formData:any, setFormData:any}) => {
    const [open, setOpen] = useState(false);
    const [ genericEventData, setGenericEventData ] = useState(defaultGenericEventForm);
    const [ error, setError ] = useState("");
    const [ editing, setEditing ] = useState(-1); // -1 means not currently editing

    const openPopup = (open: boolean) => {
        setOpen(open)
        setGenericEventData({
            ...genericEventData,
            type: eventSeriesType
        })
    }

    // Clear fields if successfully added or cancel button clicked or if editing
    const handleClose = (clear:boolean) => {
        if (clear || editing !== -1)
            setGenericEventData(defaultGenericEventForm)
        setOpen(false)
        setEditing(-1)
        setError("")
    }
    
    const handleEdit = (index : number) => {
        setEditing(index);
        setGenericEventData(formData.event_series[index])
        setOpen(true)
    }
    
    function handleAddGenericEvent() {
        const important_fields = [genericEventData.name, genericEventData.initial_amt, genericEventData.user_split]

        if (important_fields.some((field) => field === "")) {
            setError("Please fill out all fields");
            return;
        }
        let { type: s_type, value: s_fixed, lower: s_lower, upper: s_upper, mean: s_mean, stdev: s_stdev, start_with: s_start_with, end_with : s_end_with } = genericEventData.start_year;
        if (
            s_type == '' ||
            s_type === 'fixed' && s_fixed < 0 ||
            s_type === 'uniform' && (s_lower < 0 || s_upper < 0) || 
            s_type === 'normal' && (s_mean < 0 || s_stdev < 0) ||
            s_type === 'start_with' && s_start_with === "" ||
            s_type === 'end_with' && s_end_with === ""
        ) {
            setError("Please fill out Start Year fields");
            return;
        }

        
        let { type: d_type, value: d_fixed, lower: d_lower, upper: d_upper, mean: d_mean, stdev: d_stdev } = genericEventData.duration;
        if (
            d_type == '' ||
            d_type === 'fixed' && d_fixed < 0 ||
            d_type === 'uniform' && (d_lower < 0 || d_upper < 0) || 
            d_type === 'normal' && (d_mean < 0 || d_stdev < 0)
        ) {
            setError("Please fill out Duration fields");
            return;
        }
        if(d_type === 'fixed' && d_fixed == 0) {
            setError("Fixed year for duration cannot be 0.");
            return;
        }

        let { is_percent: e_is_percent, type: e_type, value: e_value, mean: e_mean, stdev: e_stdev, lower: e_lower, upper: e_upper } = genericEventData.exp_annual_change;
        if ((eventSeriesType == 'income'  || eventSeriesType == 'expense') &&
            ( e_is_percent == null || 
            e_type == "" ||
            e_type == 'fixed' && e_value < 0||
            e_type == 'normal' && (e_mean < 0 || e_stdev < 0)||
            e_type == 'uniform' && (e_lower < 0 || e_upper < 0))
        ) {
            setError("Please fill out Expected Annual Change fields");
            return;
        }

        if(eventSeriesType == 'invest' || eventSeriesType == 'rebalance') {
            let num_assets = 0
            if(eventSeriesType == 'invest'){
                num_assets = formData.investment.filter((investment: { tax_status: string; }) => investment.tax_status !== "pre-tax-retirement").length;
            } else {
                num_assets = formData.investment.filter((investment: { tax_status: string; }) => investment.tax_status == genericEventData.tax_status).length;
            }
            if (num_assets == 0) {
                setError("Please create Investments first");
                return;
            }

            if (
                Object.keys(genericEventData.initial).length != num_assets ||
                genericEventData.is_glide && (Object.keys(genericEventData.final).length != num_assets)
            ) {
                console.log(genericEventData.initial)
                console.log(genericEventData.final)
                setError("Please fill out Asset Allocation fields");
                return;
            }

            let cumulative_percentages = 0.0
            for (let key in genericEventData.initial) {
                const value = genericEventData.initial[key];
                cumulative_percentages += value
            }
            if(cumulative_percentages != 100.0) {
                setError("Please make sure percentages sum to 100");
                return;
            }

            if(genericEventData.is_glide) {
                cumulative_percentages = 0.0
                for (let key in genericEventData.final)  {
                    const value = genericEventData.final[key];
                    cumulative_percentages += value
                }
                if(cumulative_percentages != 100.0) {
                    setError("Please make sure percentages sum to 100");
                    return;
                }
            }
        }

        if(editing !== -1) {
            setFormData({
                ...formData,
                event_series: formData.event_series.map((event_serie,i) =>
                    i === editing ? genericEventData : event_serie)
            })
        } else {
            setFormData({
                ...formData,
                event_series: [...formData.event_series,genericEventData] 
            })
        }
        handleClose(true)
        console.log(genericEventData);
        console.log(formData);
    }

    const handleStartYearChange = (e: any) => {
        let { name, value } = e.target;
        if (name.includes("-")) {
            name = name.split('-')[1]
        }
        const float_names = new Set(['value', 'lower', 'upper', 'mean', 'stdev'])
        if(float_names.has(name)) {
            value = parseFloat(value);
        }

        setGenericEventData({
            ...genericEventData,
            start_year: {
                ...genericEventData.start_year,
                [name]:value,
            }
        })
    }

    const handleDurationChange = (e:any) => {
        let { name, value } = e.target;
        if (name.includes("-")) {
            name = name.split('-')[1]
        }
        const float_names = new Set(['value', 'lower', 'upper', 'mean', 'stdev'])
        if(float_names.has(name)) {
            value = parseFloat(value);
        }

        setGenericEventData({
            ...genericEventData,
            duration: {
                ...genericEventData.duration,
                [name]:value,
            }
        })
    }

    const handleAnnualChange = (e:any) => {
        let { name, value } = e.target;
        if (name.includes("-")) {
            name = name.split('-')[1]
        }
        if(name == 'is_percent') {
            value = value === 'true'
        } 
        const float_names = new Set(['value', 'lower', 'upper', 'mean', 'stdev'])
        if(float_names.has(name)) {
            value = parseFloat(value);
        }

        setGenericEventData({
            ...genericEventData,
            exp_annual_change: {
                ...genericEventData.exp_annual_change,
                [name]:value,
            }
        })

    }

    const handleCheckBoxChange = (e: any) => {
        let { name, value } = e.target;
        setGenericEventData({
            ...genericEventData,
            [name]:!genericEventData[name],
        });
    }
    
    const handleGlide = (e:any) => {
        setGenericEventData({
            ...genericEventData,
            "is_glide":e.target.checked,
        });
    };

    const handleTaxStatusChange = (e: any) => {
        const { name, value } = e.target;
        setGenericEventData({
            ...genericEventData,
            initial: {},
            final: {},
            initial_allocation_data: {},
            final_allocation_data: {}
        });
        setGenericEventData({
            ...genericEventData,
            [name]:value,
        });
    };

    const handleAssetAllocation = (e:any) => {
        let { name, value } = e.target;
        let split = name.split(':');
        let initial_or_final = split[0];
        let rname = split[1];

        if(initial_or_final == 'initial') {
            setGenericEventData({
                ...genericEventData,
                initial: {
                    ...genericEventData.initial,
                    [rname]: parseFloat(value),  
                },
                initial_allocation_data: {
                    ...genericEventData.initial_allocation_data,
                    [name]: parseFloat(value) 
                }
            });
            
        }
        else { // initial_or_final == 'final'
            setGenericEventData({
                ...genericEventData,
                final: {
                    ...genericEventData.final,  
                    [rname]: parseFloat(value),  
                },
                final_allocation_data: {
                    ...genericEventData.final_allocation_data,  
                    [name]: parseFloat(value)  
                }
            });

        }
    };

    const handleChange = (e: any) => {
        let { name, value } = e.target;

        const float_names = new Set(['initial_amt', 'user_split']);
        if (float_names.has(name)) {
            value = parseFloat(value);
        }

        setGenericEventData({
            ...genericEventData,
            [name]:value,
        });
    };

    return (
        <div className="bg-white shadow-md rounded-lg p-6 flex flex-col flex-1 gap-6 overflow-y-auto w-fit">
            <div className="bg-white shadow-md rounded-lg p-6 flex flex-col gap-3 w-fit hover:bg-sky-100 cursor-pointer" onClick={() => openPopup(true)}>
                + Add {eventSeriesType.charAt(0).toUpperCase() + eventSeriesType.slice(1)}
            </div>

            <div className="flex flex-col gap-3 h-60 overflow-y-scroll py-2">
            {formData.event_series
                .map((event_series, index) => ({ ...event_series, index }))  // Add index to each item
                .filter(event_series => event_series.type === eventSeriesType)  // Only keep items with specified type
                .map((event_series) => {
                    if(eventSeriesType == 'income') {
                        return (<IncomeEventItem 
                            key={event_series.index}
                            event_series={event_series} 
                            handleEdit={handleEdit} 
                            i = {event_series.index}/>)
                    } else if(eventSeriesType == 'expense') {
                        return (<ExpenseEventItem 
                            key={event_series.index}
                            event_series={event_series} 
                            handleEdit={handleEdit} 
                            i = {event_series.index}/>)
                    } else if(eventSeriesType == 'invest') {
                        return (<InvestEventItem 
                            key={event_series.index}
                            event_series={event_series} 
                            handleEdit={handleEdit} 
                            i = {event_series.index}/>)
                    } else if(eventSeriesType == 'rebalance') {
                        return (<RebalanceEventItem 
                            key={event_series.index}
                            event_series={event_series} 
                            handleEdit={handleEdit} 
                            i = {event_series.index}/>)
                    }
                })}
            </div>

            <Popup open={open} onClose={() => setOpen(false)} position="right center" contentStyle={eventSeriesModalStyling}>
                <div className="rounded-lg p-3 flex flex-col gap-2 overflow-y-auto h-full">
                    <h1 className="text-2xl font-bold">New {eventSeriesType.charAt(0).toUpperCase() + eventSeriesType.slice(1)} Event Series</h1>
                    <Name handleChange={handleChange} eventData={genericEventData} />
                    <Description handleChange={handleChange} eventData={genericEventData} />

                    {eventSeriesType == 'income' && (
                        <div className='flex gap-4'>
                            <h2 className="font-medium">Income is Social Security</h2>
                            <input type='checkbox' 
                                name='social_security'
                    
                                checked={genericEventData.social_security}
                                onChange={handleCheckBoxChange}/> 
                        </div>

                    )}

                    {eventSeriesType == 'expense' && (   
                        <div className='flex gap-4'>
                            <h2 className="font-medium">Expense is Discretionary</h2>
                            <input type='checkbox'
                                name='is_discretionary'
                                checked={genericEventData.is_discretionary}
                                onChange={handleCheckBoxChange}/>
                        </div>
                    )}
                    
                    
                    {(eventSeriesType == 'income' || eventSeriesType == 'expense') && (
                    <div className='flex gap-4'>
                        <h2 className="font-medium">Initial Amount</h2>
                        <input className="text-md px-1 border-2 border-gray-200 rounded-md w-30" 
                            name="initial_amt" 
                            onChange={handleChange} 
                            value={genericEventData.initial_amt} 
                            type="number" 
                            min="0"/> 
                    </div>
                        
                    )}
                    {(eventSeriesType == 'income' || eventSeriesType == 'expense') && (
                        <div className='flex gap-4' style={{opacity: (formData.is_married ? 1.0 : 0.2)}}>
                            <h2 className="font-medium">Percentage Associated With User</h2>
                            <input className="text-md px-1 border-2 border-gray-200 rounded-md w-15" 
                                disabled={!formData.is_married}
                                name="user_split"
                                value={genericEventData.user_split}
                                onChange={handleChange}
                                type="number" 
                                min="0"/> %
                        </div>    
                    )}

                    {(eventSeriesType == 'invest' || eventSeriesType == 'expense') && (
                        <div className='flex gap-4'>
                            <h2 className="font-medium">Maximum Cash to Hold</h2>
                            <input className="text-md px-1 border-2 border-gray-200 rounded-md w-40" 
                                name="max_cash"
                                value={genericEventData.max_cash}
                                onChange={handleChange}
                                type="number" min="0"/>
                        </div>
                    )}

                    <StartYear handleStartYearChange={handleStartYearChange} eventData={genericEventData} formData={formData}/>
                    <Duration handleDurationChange={handleDurationChange} eventData={genericEventData} />

                    {(eventSeriesType == 'income' || eventSeriesType == 'expense') && (
                        <div className="flex gap-5 align-middle">
                            <h2 className="font-medium self-cener">Adjust for Inflation:</h2>
                            <input type="checkbox" name="inflation_adjust" onChange={handleCheckBoxChange} checked={genericEventData.inflation_adjust}/>  
                        </div>
                    )}

                    {(eventSeriesType == 'income' || eventSeriesType == 'expense') && (
                        <ExpectedAnnualChange handleAnnualChange={handleAnnualChange} eventData={genericEventData}/>
                    )}

                    {(eventSeriesType == 'invest' || eventSeriesType == 'rebalance') && (
                        <div>
                            <h1 className="font-medium">Asset Allocation</h1>
                            {eventSeriesType == 'rebalance' && (
                                <div className='flex gap-4'>
                                <h2 className="font-medium">Tax-status is</h2>
                                <select className="text-md px-1 border-2 border-gray-200 rounded-md w-fit"
                                    name="tax_status"
                                    value={genericEventData.tax_status}
                                    onChange={handleTaxStatusChange}>
                                    <option value="non-retirement">Non-retirement</option>
                                    <option value="pre-tax-retirement">Pre-tax retirement</option>
                                    <option value="after-tax-retirement">After-tax retirement</option>
                                </select>
                            </div>
                            )}

                            <div className="flex gap-5 align-middle">
                                <h2 className="font-medium self-cener">Glide Path:</h2>
                                <input type="checkbox" name="is_glide" onChange={handleGlide} checked={genericEventData.is_glide}/>  
                            </div>
                        </div>
                    )}
                    
                    {eventSeriesType == 'invest' && (
                        <div className="flex gap-4">
                            {formData.investment.filter((investment: { tax_status: string; }) => investment.tax_status !== 'pre-tax-retirement').length == 0 && (
                                <h1 className="text-center">No investments to allocate</h1>
                            )}

                            <div className="flex flex-col">
                                {formData.investment.filter((investment: { tax_status: string; }) => investment.tax_status !== 'pre-tax-retirement').length > 0 && (
                                    <h1 className="text-center">{genericEventData.is_glide ? 'Initial Percentages' : 'Fixed Percent'}</h1>
                                )}
                                <div className="flex flex-col  gap-3">
                                    {formData.investment
                                    .filter((investment: { tax_status: string; }) => investment.tax_status != 'pre-tax-retirement')
                                    .map((investment: unknown) =>
                                        <InitialAssetAllocationCard investment={investment} genericEventData={genericEventData} handleAssetAllocation={handleAssetAllocation}/>
                                    )}
                                </div>
                            </div>

                            {genericEventData.is_glide && (
                                <div className="flex flex-col">
                                    {formData.investment.filter((investment: { tax_status: string; }) => investment.tax_status !== 'pre-tax-retirement').length > 0 && (
                                        <h1 className="text-center">Final Percentages</h1>
                                    )}
                                    
                                    <div className="flex flex-col gap-3">
                                    {formData.investment
                                        .filter((investment: { tax_status: string; }) => investment.tax_status !== 'pre-tax-retirement')
                                        .map((investment: unknown) => (
                                            <FinalAssetAllocationCard investment={investment} genericEventData={genericEventData} handleAssetAllocation={handleAssetAllocation}/>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    )}
                        
                    {eventSeriesType ==  'rebalance' && (
                        <div className="flex gap-4">
                            {formData.investment.filter(investment => investment.tax_status === genericEventData.tax_status).length == 0 && (
                                <h1 className="text-center">No investments to allocate</h1>
                            )}

                            <div className="flex flex-col">
                                {formData.investment.filter(investment => investment.tax_status ===  genericEventData.tax_status).length > 0 && (
                                    <h1 className="text-center">{genericEventData.is_glide ? 'Initial Percentages' : 'Fixed Percent'}</h1>
                                )}
                                <div className="flex flex-col gap-3">
                                    {formData.investment
                                    .filter(investment => investment.tax_status ===  genericEventData.tax_status)
                                    .map(investment =>
                                        <InitialAssetAllocationCard investment={investment} genericEventData={genericEventData} handleAssetAllocation={handleAssetAllocation}/>
                                    )}
                                </div>
                            </div>

                            {genericEventData.is_glide && (
                                <div className="flex flex-col">
                                    {formData.investment.filter(investment => investment.tax_status ==  genericEventData.tax_status).length > 0 && (
                                        <h1 className="text-center">Final Percentages</h1>
                                    )}
                                    
                                    <div className="flex flex-col gap-3">
                                    {formData.investment
                                        .filter(investment => investment.tax_status ==  genericEventData.tax_status)
                                        .map(investment => (
                                            <FinalAssetAllocationCard investment={investment} genericEventData={genericEventData} handleAssetAllocation={handleAssetAllocation}/>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    )}
                    <div className="flex justify-between">
                        <button className="text-white px-4 py-1 rounded-md hover:opacity-80 cursor-pointer disabled:opacity-20 disabled:cursor-default bg-red-600 w-20" onClick={() => handleClose(true)}>Cancel</button>
                        <div className="text-red-600 font-bold">{error}</div>
                        <button className="text-white px-4 py-1 rounded-md hover:opacity-80 cursor-pointer disabled:opacity-20 disabled:cursor-default bg-blue-600 w-20" onClick={handleAddGenericEvent}>Add</button>
                    </div>
                </div>
            </Popup>
        </div>
    );
};


const IncomeEventItem = ({event_series, handleEdit, i}:{ event_series:any, handleEdit:any, i:number }) => {
    return (
        <div className="bg-white shadow-md rounded-lg p-4 flex flex-col w-full hover:bg-sky-100 cursor-pointer" onClick={() => handleEdit(i)}>
            <p className="text-ml overflow-ellipsis overflow-hidden">${event_series.initial_amt}</p>
            <h2 className="text-ml font-medium overflow-ellipsis overflow-hidden">{event_series.name}</h2>
            <p className="text-sm overflow-ellipsis overflow-hidden">{event_series.description}</p>
        </div>
    );
}

const ExpenseEventItem = ({event_series, handleEdit, i}:{ event_series:any, handleEdit:any, i:number }) => {
    return (
        <div className="bg-white shadow-md rounded-lg p-4 flex flex-col w-full hover:bg-sky-100 cursor-pointer" onClick={() => handleEdit(i)}>
            <p className="text-ml overflow-ellipsis overflow-hidden">${event_series.initial_amt}</p>
            <h2 className="text-md font-medium overflow-ellipsis overflow-hidden">{event_series.name}</h2>
            <p className="text-sm overflow-ellipsis overflow-hidden">{event_series.description}</p>
            {/* <button>Edit</button> */}
        </div>
    );
};

const InvestEventItem = ({event_series, handleEdit, i}:{ event_series:any, handleEdit:any, i:number }) => {
    return (
        <div className="bg-white shadow-md rounded-lg p-4 flex flex-col w-full hover:bg-sky-100 cursor-pointer" onClick={() => handleEdit(i)}>
            <h2 className="text-ml font-medium overflow-ellipsis overflow-hidden">{event_series.name}</h2>
            <p className="text-sm overflow-ellipsis overflow-hidden">{event_series.description}</p>
            {/* <button>Edit</button> */}
        </div>
    );
}

const RebalanceEventItem = ({event_series, handleEdit, i}:{event_series:any, handleEdit:any, i:number}) => {
    return (
        <div className="bg-white shadow-md rounded-lg p-4 flex flex-col w-full hover:bg-sky-100 cursor-pointer" onClick={() => handleEdit(i)}>
            <h2 className="text-ml font-medium overflow-ellipsis overflow-hidden">{event_series.tax_status}</h2>
            <h2 className="text-md font-medium overflow-ellipsis overflow-hidden">{event_series.name}</h2>
            <p className="text-sm overflow-ellipsis overflow-hidden">{event_series.description}</p>
            {/* <button>Edit</button> */}
        </div>
    );
}

const InitialAssetAllocationCard = ({ investment, genericEventData, handleAssetAllocation } : { investment:any, genericEventData:any, handleAssetAllocation:any}) => {
    return (
        <div className="flex flex-col gap-1" key={investment.name}>
            <AssetAllocationCard investment={investment} />
            <div className="flex gap-3">
                <input
                    type="number"
                    className="text-md px-1 border-2 border-gray-200 rounded-md w-full"
                    name={"initial:"+investment.investment_type+'|'+investment.tax_status}
                    value={genericEventData.final_allocation_data["initial:"+investment.investment_type+'|'+investment.tax_status]}
                    onChange={handleAssetAllocation}
                    min="0"
                    max="100"
                /> %
            </div>
        </div>
    );
}

const FinalAssetAllocationCard = ({investment, genericEventData, handleAssetAllocation} : {investment: any , genericEventData:any, handleAssetAllocation:any}) => {
    return (
        <div className="flex flex-col gap-1" key={investment.name}>
            <AssetAllocationCard investment={investment} />
            <div className="flex gap-3">
                <input
                    type="number"
                    className="text-md px-1 border-2 border-gray-200 rounded-md w-full"
                    name={"final:"+investment.investment_type+'|'+investment.tax_status}
                    value={genericEventData.final_allocation_data["final:"+investment.investment_type+'|'+investment.tax_status]}
                    onChange={handleAssetAllocation}
                    min="0"
                    max="100"
                /> %
            </div>
        </div>
    );
}

const AssetAllocationCard = ({ investment } : { investment : any}) => {
    return (
        <div className="bg-white shadow-md rounded-lg p-4 flex flex-col w-full ">            
            <h1 className="text-md">{investment.investment_type} | {investment.tax_status}</h1>
            <h2 className="text-sm">${investment.value}</h2>
        </div>
    );
}


export default GenericEventSeriesPopup;