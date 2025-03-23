import AddButton from "../Helper/AddButton";

const WithdrawalStrategy = ({ formData,setFormData }:any) => {
    return (
        <div className="flex flex-col gap-4 m-10 w-full">
            <div className="bg-white shadow-md rounded-lg p-6 flex flex-col gap-3 h-60">
                <div className='h-full flex flex-col gap-3'>
                    <h1 className="text-xl font-bold">Expense Withdrawal Strategy</h1>
                    <p className="text-sm">An expense withdrawal strategy is an ordering on a set of investments that specifies the order in which investments are sold to generate cash, if the cash account does not contain sufficient funds to pay expenses and taxes. Investments are sold strictly in that order.</p>    
                </div>
                <AddButton text="Add Withdrawal Priority" />
            </div>
            <div className="flex flex-col gap-10 w-full">
                <div className="bg-white shadow-md rounded-lg p-6 flex flex-col gap-3 w-full  h-50 overflow-y-auto">
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

export default WithdrawalStrategy;