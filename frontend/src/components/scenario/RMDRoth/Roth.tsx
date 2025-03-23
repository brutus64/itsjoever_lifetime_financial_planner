import AddButton from "../Helper/AddButton";

const Roth = ({ formData,setFormData }:any) => {
    return (
        <div className="flex flex-col gap-4 w-full">
            <div className="bg-white shadow-md rounded-lg p-6 flex flex-col gap-3 w-full h-60">
                <div className='h-full flex flex-col gap-3'>
                    <h1 className="text-xl font-bold">Roth Conversion Strategy</h1>
                    <p className="text-sm">A Roth conversion strategy is an ordering on investments in pre-tax retirement accounts. When a withdrawal is triggered by the optimizer, investments are transferred in-kind, from pre-tax retirement accounts to after-tax retirement accounts.</p>    
                </div>
                <AddButton text="Add Roth Investment Priority" />  
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

export default Roth;