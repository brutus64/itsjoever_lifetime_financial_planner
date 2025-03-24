import Popup from "reactjs-popup"
import "reactjs-popup/dist/index.css"
import { useState } from "react";

const EventSeries = ({ formData,setFormData }:any) => {
    return (
        <div className="flex flex-col gap-4 m-10">
            <div className="bg-white shadow-md rounded-lg p-6 flex flex-col gap-3 w-200">
                <h1 className="text-2xl font-bold">Event Series</h1>
                <p>An event series represents a sequence of annual events. Event series are categorized into four types: income, expense, invest, or rebalance. These events will last for a specified amount of years.</p>
            </div>
            <div className="flex flex-col gap-10">
                <EventSeriesPopUp formData={formData} setFormData={setFormData} />

                <div className="bg-white shadow-md rounded-lg p-6 flex flex-col flex-0 gap-3 w-fit">
                    <div>test</div>
                    <div>test</div>
                    <div>test</div>
                    <div>test</div>
                    <div>test</div>
                </div>
            </div>
        </div>
    )
}

const eventSeriesModalStyling = { 
    "border": "none",
    "borderRadius":"8px",
    "width":"700px",
    "height":"600px"
};


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
                    <p className="text-lg"> 
                        Add 
                        <select 
                            className="border border-gray-300 rounded-md p-2 inline-block mx-2 w-fit"
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
                    {eventSeriesType === "income" && <IncomeEventSeries/>}
                    {eventSeriesType === "expense" && <ExpenseEventSeries/>}
                    {eventSeriesType === "invest" && <InvestEventSeries/>}
                    {eventSeriesType === "rebalance" && <RebalanceEventSeries/>}
                    <div className="flex justify-center gap-20">
                        <button className="text-white px-4 py-1 rounded-md hover:opacity-80 cursor-pointer disabled:opacity-20 disabled:cursor-default bg-red-600 w-20" onClick={() => setOpen(false)}>Cancel</button>
                        <button className="text-white px-4 py-1 rounded-md hover:opacity-80 cursor-pointer disabled:opacity-20 disabled:cursor-default bg-blue-600 w-20" onClick={handleAddEventSeriesType}>Add</button>
                    </div>
                </div>
            </Popup>
        </div>
    );
}

const IncomeEventSeries = () => {
    function handleAddIncomeEvent() {

    }
    return (
        <div className="rounded-lg m-10 flex flex-col gap-2 overflow-y-auto h-full">
            <h1 className="text-2xl font-bold">New Income Event Series</h1>
            <Name/>
            <Description/>
            <StartYear/>
            <Duration/>
            <div className='flex gap-4'>
                <h2 className="font-medium">Initial Amount</h2>
                <input className="text-md px-1 border-2 border-gray-200 rounded-md w-15" type="number" min="0"/> 
            </div>
            
            <h2 className="font-medium">Expected Annual Change:</h2>
            <div className="flex gap-5">
                <div className="flex flex-col gap-2">
                    <div className="flex gap-2 align-middle">
                        <input className="ml-1" type="radio" name="ann-inc-type"/>
                        <div className="">Amount</div>
                    </div>
                    <div className="flex gap-2 align-middle">
                        <input className="ml-1" type="radio" name="ann-inc-type"/>
                        <div className="">Percent</div>
                    </div>
                </div>
                <div className="border-l-2 border-l-black-400 pl-5 flex flex-col gap-1">
                    <div className="flex gap-2 align-middle">
                        <input className="ml-1" type="radio" name="ann-inc-amt"/>
                        <div className="">Fixed:</div>
                        <input className="text-md px-1 border-2 border-gray-200 rounded-md w-30" type="number" min="0"/> 
                    </div>
                    <div className="flex gap-2 align-middle">
                        <input className="ml-1" type="radio" name="ann-inc-amt"/>
                        <div className="">Normal: &nbsp; Mean:</div>
                        <input className="text-md px-1 border-2 border-gray-200 rounded-md w-30" type="number" min="0"/> 
                        <div className="">Variance:</div>
                        <input className="text-md px-1 border-2 border-gray-200 rounded-md w-30" type="number" min="0"/> 
                    </div>
                    <div className="flex gap-2 align-middle">
                        <input className="ml-1" type="radio" name="ann-inc-amt"/>
                        <div className="">Uniform: &nbsp; Min:</div>
                        <input className="text-md px-1 border-2 border-gray-200 rounded-md w-30" type="number" min="0"/> 
                        <div className="">Max:</div>
                        <input className="text-md px-1 border-2 border-gray-200 rounded-md w-30" type="number" min="0"/> 
                    </div>
                </div>
            </div>

            <div className='flex gap-4'>
                <h2 className="font-medium">Percentage Associated With User</h2>
                <input className="text-md px-1 border-2 border-gray-200 rounded-md w-15" type="number" min="0"/> %
            </div>

            <div className='flex gap-4'>
                <h2 className="font-medium">Income is</h2>
                <select className="text-md px-1 border-2 border-gray-200 rounded-md w-fit">
                    <option value="option1">Wages</option>
                    <option value="option2">Social Security</option>
                </select>
            </div>
        </div>
    );
};

const ExpenseEventSeries = () => {
    return (
        <div className="rounded-lg m-10 flex flex-col gap-2 overflow-y-auto h-full">
            <h1 className="text-2xl font-bold">New Expense Event Series</h1>
            <Name/>
            <Description/>
            <StartYear/>
            <Duration/>
            <div className='flex gap-4'>
                <h2 className="font-medium">Initial Amount</h2>
                <input className="text-md px-1 border-2 border-gray-200 rounded-md w-15" type="number" min="0"/> 
            </div>
            
            <h2 className="font-medium">Expected Annual Change:</h2>
            <div className="flex gap-5">
                <div className="flex flex-col gap-2">
                    <div className="flex gap-2 align-middle">
                        <input className="ml-1" type="radio" name="ann-inc-type"/>
                        <div className="">Amount</div>
                    </div>
                    <div className="flex gap-2 align-middle">
                        <input className="ml-1" type="radio" name="ann-inc-type"/>
                        <div className="">Percent</div>
                    </div>
                </div>
                <div className="border-l-2 border-l-black-400 pl-5 flex flex-col gap-1">
                    <div className="flex gap-2 align-middle">
                        <input className="ml-1" type="radio" name="ann-inc-amt"/>
                        <div className="">Fixed:</div>
                        <input className="text-md px-1 border-2 border-gray-200 rounded-md w-30" type="number" min="0"/> 
                    </div>
                    <div className="flex gap-2 align-middle">
                        <input className="ml-1" type="radio" name="ann-inc-amt"/>
                        <div className="">Normal: &nbsp; Mean:</div>
                        <input className="text-md px-1 border-2 border-gray-200 rounded-md w-30" type="number" min="0"/> 
                        <div className="">Variance:</div>
                        <input className="text-md px-1 border-2 border-gray-200 rounded-md w-30" type="number" min="0"/> 
                    </div>
                    <div className="flex gap-2 align-middle">
                        <input className="ml-1" type="radio" name="ann-inc-amt"/>
                        <div className="">Uniform: &nbsp; Min:</div>
                        <input className="text-md px-1 border-2 border-gray-200 rounded-md w-30" type="number" min="0"/> 
                        <div className="">Max:</div>
                        <input className="text-md px-1 border-2 border-gray-200 rounded-md w-30" type="number" min="0"/> 
                    </div>
                </div>
            </div>

            <div className='flex gap-4'>
                <h2 className="font-medium">Percentage Associated With User</h2>
                <input className="text-md px-1 border-2 border-gray-200 rounded-md w-15" type="number" min="0"/> %
            </div>
            
            <div className='flex gap-4'>
                <h2 className="font-medium">Expense is</h2>
                <select className="text-md px-1 border-2 border-gray-200 rounded-md w-fit">
                    <option value="option1">Non-discretionary</option>
                    <option value="option2">Discretionary</option>
                </select>
            </div>
        </div>
    );
};

const InvestEventSeries = () => {
    return (
        <div className="rounded-lg m-10 flex flex-col gap-2 overflow-y-auto h-full">
            <h1 className="text-2xl font-bold">New Invest Event Series</h1>
            <Name/>
            <Description/>
            <StartYear/>
            <Duration/>

            {/* need to get investments and list them out...? */}
            <div className="text-2xl font-bold">
                SOMEHOW SHOW ALL INVESTMENTS NOT IN PRE-TAX ACCOUNTS FOR FIXED %S OR A GLIDE PATH
            </div>
            
            <div className='flex gap-4'>
                <h2 className="font-medium">Maximum Cash</h2>
                <input className="text-md px-1 border-2 border-gray-200 rounded-md w-40" type="number" min="0"/>
            </div>
        </div>
    );
};

const RebalanceEventSeries = () => {
    return (
        <div className="rounded-lg m-10 flex flex-col gap-2 overflow-y-auto h-full">
            <h1 className="text-2xl font-bold">New Rebalance Event Series</h1>
            <Name/>
            <Description/>
            <StartYear/>
            <Duration/>
            
            <div className="text-2xl font-bold">
                SAME AS INVEST SERIES... (fixed/glide)
            </div>
        </div>
    );
};

const Name = () => {
    return (
        <div className="flex gap-4">
            <h2 className="font-medium">Name:</h2>
            <input className="text-lg px-1 border-2 border-gray-200 rounded-md w-75" />
        </div>
    )
}

const Description = () => {
    return (
        <div>
            <h2 className="font-medium">Description:</h2>
            <textarea 
                className="px-1 border-2 border-gray-200 rounded-md w-145 h-25 resize-none flex-shrink-0" 
                maxLength={1000}
            />
        </div>
    )
};

const StartYear = () => {
    return (
        <div>
            <h2 className="font-medium">Start Year:</h2>
            <div className="flex gap-5">
                <div className="flex flex-col gap-1">
                    <div className="flex gap-2 align-middle">
                        <input className="ml-1" type="radio" name="ann-inc-amt"/>
                        <div className="">Fixed:</div>
                        <input className="text-md px-1 border-2 border-gray-200 rounded-md w-30" type="number" min="0"/> 
                    </div>
                    <div className="flex gap-2 align-middle">
                        <input className="ml-1" type="radio" name="ann-inc-amt"/>
                        <div className="">Uniform: &nbsp; Min:</div>
                        <input className="text-md px-1 border-2 border-gray-200 rounded-md w-30" type="number" min="0"/> 
                        <div className="">Max:</div>
                        <input className="text-md px-1 border-2 border-gray-200 rounded-md w-30" type="number" min="0"/> 
                    </div>
                    <div className="flex gap-2 align-middle">
                        <input className="ml-1" type="radio" name="ann-inc-amt"/>
                        <div className="">Normal: &nbsp; Mean:</div>
                        <input className="text-md px-1 border-2 border-gray-200 rounded-md w-30" type="number" min="0"/> 
                        <div className="">Variance:</div>
                        <input className="text-md px-1 border-2 border-gray-200 rounded-md w-30" type="number" min="0"/> 
                    </div>
                    <div className="flex gap-2 align-middle">
                        <input className="ml-1" type="radio" name="ann-inc-amt"/>
                        <div className="">Same Year that: &nbsp; </div>
                        <select className="text-md px-1 border-2 border-gray-200 rounded-md w-fit">
                            <option value="option1">Option 1</option>
                            <option value="option2">Option 2</option>
                            <option value="option3">Option 3</option>
                        </select>
                        <div className="">Event Series Starts</div> 
                    </div>
                    <div className="flex gap-2 align-middle">
                        <input className="ml-1" type="radio" name="ann-inc-amt"/>
                        <div className="">Year After: &nbsp;</div>
                        <select className="text-md px-1 border-2 border-gray-200 rounded-md w-fit">
                            <option value="option1">Option 1</option>
                            <option value="option2">Option 2</option>
                            <option value="option3">Option 3</option>
                        </select>
                        <div className="">Event Series Ends</div>
                    </div>
                </div>
            </div>
        </div>
    )

};

const Duration = () => {
    return  (
        <div>
            <h2 className="font-medium">Duration (Years):</h2>
            <div className="flex gap-5">
                <div className="flex flex-col gap-1">
                    <div className="flex gap-2 align-middle">
                        <input className="ml-1" type="radio" name="ann-inc-amt"/>
                        <div className="">Fixed:</div>
                        <input className="text-md px-1 border-2 border-gray-200 rounded-md w-30" type="number" min="0"/> 
                    </div>
                    <div className="flex gap-2 align-middle">
                        <input className="ml-1" type="radio" name="ann-inc-amt"/>
                        <div className="">Uniform: &nbsp; Min:</div>
                        <input className="text-md px-1 border-2 border-gray-200 rounded-md w-30" type="number" min="0"/> 
                        <div className="">Max:</div>
                        <input className="text-md px-1 border-2 border-gray-200 rounded-md w-30" type="number" min="0"/> 
                    </div>
                    <div className="flex gap-2 align-middle">
                        <input className="ml-1" type="radio" name="ann-inc-amt"/>
                        <div className="">Normal: &nbsp; Mean:</div>
                        <input className="text-md px-1 border-2 border-gray-200 rounded-md w-30" type="number" min="0"/> 
                        <div className="">Variance:</div>
                        <input className="text-md px-1 border-2 border-gray-200 rounded-md w-30" type="number" min="0"/> 
                    </div>
                </div>
            </div>
        </div>
    )
}

export default EventSeries;