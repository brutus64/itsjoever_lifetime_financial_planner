import Popup from "reactjs-popup"
import "reactjs-popup/dist/index.css"


const Investments = ({formData,setFormData}:any) => {
    return (
        <div className="flex flex-col gap-4 m-10">
            <div className="bg-white shadow-md rounded-lg p-6 flex flex-col gap-3 w-200">
                <h1 className="text-2xl font-bold">Investments</h1>
                <p>An investment is the allocation of money into assets such as stocks, bonds, or real estate, with the expectation that the value of those assets will grow over time, providing returns through appreciation, dividends, or interest payments.</p>
            </div>
            <div className="bg-white shadow-md rounded-lg p-6 flex flex-col gap-3 w-200">
                <h1 className="text-2xl font-bold">My Investments</h1>
                <div className="flex flex-col">

                </div>
                <Popup trigger={<div className="bg-white shadow-md rounded-lg p-6 flex flex-col gap-3 w-100 hover:bg-sky-100 cursor-pointer">
                    + Add an Investment
                </div>} position="right center" closeOnDocumentClick modal nested>
                    Hello
                </Popup>
                {/* <div className="bg-white shadow-md rounded-lg p-6 flex flex-col gap-3 w-100 hover:bg-sky-100 cursor-pointer">
                    + Add an Investment
                </div> */}
            </div>
            
            
            
        </div>
    )
}

export default Investments