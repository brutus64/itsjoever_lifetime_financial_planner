import SpendingStrategy from "./SpendingStrategy"
import WithdrawalStrategy from "./WithdrawalStrategy"

const SpendingWithdrawal = ({formData,setFormData}:any) => {
    return (
        <div className='w-[90vw]'>
            <div className='flex'>
            <SpendingStrategy formData={formData} setFormData={setFormData}/>
            <WithdrawalStrategy formData={formData} setFormData={setFormData}/>
            </div>
        </div>
    )
}

export default SpendingWithdrawal