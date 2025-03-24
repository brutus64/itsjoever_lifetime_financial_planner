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
    const handleRothYear = (e) => {
        const {name,value} = e.target;
        setFormData({
            ...formData,
            roth_optimizer: {
                ...formData.roth_optimizer,
                [name]:value
            }
        })
    }
    return (
        <div className='flex flex-col w-[90vw] m-10 gap-1'>
            <div className="shadow-md rounded-lg justify-between flex flex-col gap-2 w-130 p-4">
                <h1 className="text-2xl font-bold">Roth Conversion Optimizer</h1>
                {/* <p className='mb-2'>An in-kind transfer of assets from pre-tax retirement accounts to after-tax retirement accounts</p> */}

                    <div className="flex gap-10 items-center">
                        <div className='flex items-center gap-2'>
                            <div className="">Opt-out</div>
                            <input className="ml-1" type="radio" checked={!formData.roth_optimizer.is_enable} value="opt-out" onChange={handleRothOpt}/>
                        </div>
                        <div className='flex items-center gap-2'>
                            <div className="">Opt-in</div>
                            <input className="ml-1" type="radio" checked={formData.roth_optimizer.is_enable} value="opt-in" onChange={handleRothOpt}/>
                            <input type="number" className="text-md px-1 border-2 border-gray-200 rounded-md w-32" name="start_year" value={formData.roth_optimizer.start_year} onChange={handleRothYear} min="2025" max="9999" disabled={!formData.roth_optimizer.is_enable} style={{"opacity":formData.roth_optimizer.is_enable ? 1.0 : 0.2}}/>
                            -
                            <input type="number" className="text-md px-1 border-2 border-gray-200 rounded-md w-32" name="end_year" value={formData.roth_optimizer.end_year} onChange={handleRothYear} min="2025" max="9999" disabled={!formData.roth_optimizer.is_enable} style={{"opacity":formData.roth_optimizer.is_enable ? 1.0 : 0.2}}/>
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