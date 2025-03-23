import AddButton from "../Helper/AddButton";

const SpendingStrategy = ({ formData,setFormData }:any) => {
    return (
        <div className="flex flex-col gap-4 m-10 w-full">
            <div className="bg-white shadow-md rounded-lg p-6 flex flex-col gap-3 w-full h-60">
                <div className='h-full flex flex-col gap-3'>
                    <h1 className="text-xl font-bold">Spending Strategy</h1>
                    <p className="text-sm">A spending strategy is an ordering on discretionary expenses. Discretionary expenses are paid one at a time, in the specified order, as long as cash is available</p>    
                </div>
                <AddButton text="Add Spending Priority" />  
            </div>
            <div className="bg-white shadow-md rounded-lg p-6 flex flex-col gap-3 w-full h-50 overflow-y-auto">
                <div>test</div>
                <div>test</div>
                <div>test</div>
                <div>test</div>
                <div>test</div>
            </div>
        </div>
    )
}

export default SpendingStrategy;