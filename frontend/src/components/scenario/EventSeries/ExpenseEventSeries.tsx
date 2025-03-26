import { useState } from 'react';
import { Name, Description, StartYear, Duration, ExpectedAnnualChange } from './EventSeries'


const defaultExpenseEventForm = {
    type: "expense",
    name: "",
    description: "",
    start_year: {
        type: "", //  fixed, uniform, normal, same year, year after:
        fixed: 0,
        min: 0,
        max: 0,
        mean: 0,
        stddev: 1,
        event_series: "" // if type is "same year" or "year after"
    },
    duration: {
        type: "", //fixed, uniform, normal
        fixed: 0,
        min: 0,
        max: 0,
        mean: 0,
        stddev: 1,

    },
    initial_amount: 0.0,
    exp_annual_change: {
        is_percent: "",
        type: "", // either "fixed" or "normal" or "uniform"
        fixed: 0,
        mean:0,
        stddev:1,
        min: 0,
        max: 0
    },
    inflation_adjust: false,
    percent_associated: 0.0,
    expense: 'Non-discretionary'
}

const ExpenseEventSeries = ({setOpen, formData, setFormData}: {setOpen:any, formData:any, setFormData:any}) => {
    const [ expenseEventData, setExpenseEventData ] = useState(defaultExpenseEventForm);
    const [ error, setError ] = useState("");
    
    // Clear fields if successfully added or cancel button clicked or if editing
    const handleClose = (clear:boolean) => {
        if (clear)
            setExpenseEventData(defaultExpenseEventForm)
        setOpen(false)
        setError("")
    }

    function handleAddExpenseEvent() {
        const important_fields = [expenseEventData.name, expenseEventData.initial_amount, expenseEventData.percent_associated]

        if (important_fields.some((field) => field === "")) {
            setError("Please fill out all fields");
            return;
        }
        let { type: s_type, fixed: s_fixed, min: s_min, max: s_max, mean: s_mean, stddev: s_stddev, event_series: s_event_series } = expenseEventData.start_year;
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
        
        let { type: d_type, fixed: d_fixed, min: d_min, max: d_max, mean: d_mean, stddev: d_stddev } = expenseEventData.duration;
        if (
            d_type == '' ||
            d_type === 'fixed' && d_fixed < 0 ||
            d_type === 'uniform' && (d_min < 0 || d_max < 0) || 
            d_type === 'normal' && (d_mean < 0 || d_stddev < 0)
        ) {
            setError("Please fill out Duration fields");
            return;
        }

        let { is_percent: e_is_percent, type: e_type, fixed: e_fixed, mean: e_mean, stddev: e_stddev, min: e_min, max: e_max } = expenseEventData.exp_annual_change;
        if (
            e_is_percent == "" ||
            e_type == 'fixed' && e_fixed < 0||
            e_type == 'normal' && (e_mean < 0 || e_stddev < 0)||
            e_type == 'uniform' && (e_min < 0 || e_max < 0)
        ) {
            setError("Please fill out Expected Annual Change fields");
            return;
        }
        setFormData({
            ...formData,
            event_series: [...formData.event_series,expenseEventData] 
        })
        handleClose(true)
        console.log(expenseEventData)
    }

    const handleStartYearChange = (e: any) => {
        let { name, value } = e.target;
        if (name.includes("-")) {
            name = name.split('-')[1]
        }

        setExpenseEventData({
            ...expenseEventData,
            start_year: {
                ...expenseEventData.start_year,
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

        setExpenseEventData({
            ...expenseEventData,
            duration: {
                ...expenseEventData.duration,
                [name]:value,
            }
        })
        console.log(`${name} is ${value}`)
    }

    const handleAnnualChange = (e:any) => {
        let { name, value } = e.target;
        if (name.includes("-")) {
            name = name.split('-')[1]
        }

        setExpenseEventData({
            ...expenseEventData,
            exp_annual_change: {
                ...expenseEventData.exp_annual_change,
                [name]:value,
            }
        })
        console.log(`${name} is ${value}`)
    }

    const handleInflationChange = (e: any) => {
        let { name, value } = e.target;
        setExpenseEventData({
            ...expenseEventData,
            [name]:!expenseEventData.inflation_adjust,
        });

        console.log(`${name} is ${expenseEventData.inflation_adjust}`)

    }

    const handleChange = (e: any) => {
        const { name, value } = e.target;
        setExpenseEventData({
            ...expenseEventData,
            [name]:value,
        });
        console.log(`holy shit ${name} ${value}`)
    };



    return (
        <div className="rounded-lg m-10 flex flex-col gap-2 overflow-y-auto h-full">
            <h1 className="text-2xl font-bold">New Expense Event Series</h1>
            <Name handleChange={handleChange} eventData={expenseEventData} />
            <Description handleChange={handleChange} eventData={expenseEventData} />
            <StartYear handleStartYearChange={handleStartYearChange} eventData={expenseEventData} formData={formData} />
            <Duration handleDurationChange={handleDurationChange} eventData={expenseEventData} />
            <div className='flex gap-4'>
                <h2 className="font-medium">Initial Amount</h2>
                <input className="text-md px-1 border-2 border-gray-200 rounded-md w-15" 
                    name="initial_amount" 
                    onChange={handleChange} 
                    value={expenseEventData.initial_amount} 
                    type="number" min="0"/> 
            </div>
            
            <div className="flex gap-5 align-middle">
                <h2 className="font-medium self-cener">Adjust for Inflation:</h2>
                <input type="checkbox" name="inflation_adjust" onChange={handleInflationChange} checked={expenseEventData.inflation_adjust}/>  
            </div>

            <ExpectedAnnualChange handleAnnualChange={handleAnnualChange} eventData={expenseEventData}/>

            <div className='flex gap-4'>
                <h2 className="font-medium">Percentage Associated With User</h2>
                <input className="text-md px-1 border-2 border-gray-200 rounded-md w-15" 
                    name="percent_associated"
                    value={expenseEventData.percent_associated}
                    onChange={handleChange}
                    type="number" min="0"/> %
            </div>
            
            <div className='flex gap-4'>
                <h2 className="font-medium">Expense is</h2>
                <select className="text-md px-1 border-2 border-gray-200 rounded-md w-fit"
                    name="expense"
                    value={expenseEventData.expense}
                    onChange={handleChange}>
                    <option value="Non-discretionary">Non-discretionary</option>
                    <option value="Discretionary">Discretionary</option>
                </select>
            </div>
            
            <div className="flex justify-between">
                <button className="text-white px-4 py-1 rounded-md hover:opacity-80 cursor-pointer disabled:opacity-20 disabled:cursor-default bg-red-600 w-20" onClick={() => setOpen(false)}>Cancel</button>
                <div className="text-red-600 font-bold">{error}</div>
                <button className="text-white px-4 py-1 rounded-md hover:opacity-80 cursor-pointer disabled:opacity-20 disabled:cursor-default bg-blue-600 w-20" onClick={handleAddExpenseEvent}>Add</button>
            </div>
        </div>
    );
};

const ExpenseEventItem = ({ name, description }) => {
    return (
        <div className="bg-white shadow-md rounded-lg p-4 flex flex-col gap-3 w-full hover:bg-sky-100 cursor-pointer">
            <h2 className="text-xl font-medium overflow-ellipsis overflow-hidden">{name}</h2>
            <p className="overflow-ellipsis overflow-hidden">{description}</p>
            {/* <button>Edit</button> */}
        </div>
    );
};

export default ExpenseEventSeries;
export { ExpenseEventItem };