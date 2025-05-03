import Popup from "reactjs-popup";
import { useState } from "react";
const simulateModalStyling = { 
    "border": "none",
    "borderRadius":"8px",
    "width":"300px",
    "height":"200px"
};
const MAX_SIMULATIONS = 100000;
const SimulatePopup = ({open,setOpen,handleSimulate}) => {
    const [ numSimulations, setNumSimulations] = useState();
    const [ error, setError ] = useState("")

    const handleChange = (event) => {
        setNumSimulations(event.target.value);
    };

    const validate = () => {
        const num = parseInt(numSimulations);
        if (typeof num !== 'number' || isNaN(num)) {
            setError("Please enter a number");
            return;
        }
        if (num <= 0) {
            setError("Number must be non-negative")
            return;
        }
        if (num > MAX_SIMULATIONS) {
            setError("Max simulations: " + MAX_SIMULATIONS)
            return;
        }
        handleSimulate(num);
    }

    return (
        <Popup open={open} position="right center" closeOnDocumentClick modal contentStyle={simulateModalStyling} onClose={() => setOpen(false)}>
            <div className="rounded-lg m-10 flex flex-col gap-3 items-center">
                <div className="flex flex-col gap-1">
                    <h2 className="font-medium">Simulations:</h2>
                    <input className="text-lg px-1 border-2 border-gray-200 rounded-md w-30" type="number" min="0" name="value" value={numSimulations} onChange={handleChange}/>
                </div>
                <div className="flex justify-between">
                    <button className="text-white px-4 py-1 rounded-md hover:opacity-80 cursor-pointer disabled:opacity-20 disabled:cursor-default bg-blue-600 w-50" onClick={validate}>Run</button>
                </div>
                <div className="text-red-600 font-bold">{error}</div>
            </div>
        </Popup>
    )
}

export default SimulatePopup;