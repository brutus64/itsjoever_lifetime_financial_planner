import RMD from "./RMD"
import Roth from "./Roth"

const RMDRoth = ({formData,setFormData}:any) => {
    return (
        <div className='flex flex-col items-center w-[90vw] m-10 gap-1'>
            <div className="shadow-md rounded-lg justify-between flex-col w-full p-4">
                <h1 className="text-2xl font-bold">Roth Conversion Optimizer</h1>
                <div className="flex gap-5 align-middle">
                    <div className="flex gap-10 align-middle">
                        <div className='flex items-center gap-2'>
                            <div className="">Yes:</div>
                            <input className="ml-1" type="radio" name="yes"/>
                        </div>
                        <div className='flex items-center gap-2'>
                            <div className="">No:</div>
                            <input className="ml-1" type="radio" name="no"/>
                        </div>

                    </div>
                </div>
            </div>

            <div className='flex gap-4'>
                <RMD formData={formData} setFormData={setFormData}/>
                <Roth formData={formData} setFormData={setFormData}/>     
            </div>
        </div>
    )
}

export default RMDRoth