import SpendingStrategy from "./SpendingStrategy"
import WithdrawalStrategy from "./WithdrawalStrategy"

const SpendingWithdrawal = ({formData,setFormData}:any) => {
    return (
        <div className='m-10'>
            <div className='flex gap-4'>
                <SpendingStrategy formData={formData} setFormData={setFormData}/>
                <WithdrawalStrategy formData={formData} setFormData={setFormData}/>
            </div>
        </div>
    )
}

export default SpendingWithdrawal