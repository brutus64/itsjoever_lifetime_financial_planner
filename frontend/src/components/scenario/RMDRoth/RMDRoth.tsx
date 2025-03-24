import RMD from "./RMD"
import Roth from "./Roth"

const RMDRoth = ({formData,setFormData}:any) => {
    const handleRothOpt = (e) => {
        const {value} = e.target;
        setFormData({
            ...formData,
            roth_optimizer: {
                ...formData.roth_optimizer,
                is_enable:(value === "opt-in")
            }
        })
    }
    return (
        <div className='flex flex-col w-[90vw] m-10 gap-1'>
            <div className="shadow-md rounded-lg justify-between flex-col w-90 p-4">
                <h1 className="text-2xl font-bold">Roth Conversion Optimizer</h1>
                {/* <p className='mb-2'>An in-kind transfer of assets from pre-tax retirement accounts to after-tax retirement accounts</p> */}
                <div className="flex gap-5 align-middle">
                    <div className="flex gap-10 align-middle">
                        <div className='flex items-center gap-2'>
                            <div className="">Opt-in</div>
                            <input className="ml-1" type="radio" checked={formData.roth_optimizer.is_enable} value="opt-in" onChange={handleRothOpt}/>
                        </div>
                        <div className='flex items-center gap-2'>
                            <div className="">Opt-out</div>
                            <input className="ml-1" type="radio" checked={!formData.roth_optimizer.is_enable} value="opt-out" onChange={handleRothOpt}/>
                        </div>

                    </div>
                </div>
            </div>

            <div className='flex gap-4'>
                <Roth formData={formData} setFormData={setFormData}/>
                <RMD formData={formData} setFormData={setFormData}/>
                
            </div>
        </div>
    )
}

export default RMDRoth