import axios from "axios";
import { useNavigate } from "react-router-dom";

// Quick summary of form inputs before form is submitted and saved

const Summary = ({formData,setFormData}:any) => {

    // must validate fields
    const handleSubmit = () => { // redirect to page that lets u view, edit, or simulate scenario

    }
    return (
        <div className="flex flex-col items-center">
            <div className="bg-white shadow-md rounded-lg p-10 m-10 flex flex-col flex-1 gap-3 w-150">
                <h1 className="text-2xl font-bold">Summary</h1>
                <div><span className="font-medium">Scenario Name:</span> {formData.name}</div>
                <div><span className="font-medium">Financial Goal:</span> ${parseInt(formData.fin_goal).toLocaleString()}</div>
                <div><span className="font-medium">State:</span> {formData.state}</div>
                <div><span className="font-medium">Birth year:</span> {formData.birth_year}</div>
                <div><span className="font-medium">Life Expectancy:</span> {formData.life_expectancy.type === "normal" ? `Normal {Mean=${formData.life_expectancy.mean} , Stddev=${formData.life_expectancy.stddev}}` : formData.life_expectancy.fixed}</div>
                <div><span className="font-medium">Married:</span> {formData.is_married ? "Yes" : "No"}</div>
                {formData.is_married &&
                    <div className="flex flex-col flex-1 gap-3">
                        <div><span className="font-medium">Spouse Birth year:</span> {formData.spouse_birth_year}</div>
                        <div><span className="font-medium">Spouse Life Expectancy:</span> {formData.spouse_life_expectancy.type === "normal" ? `Normal {Mean=${formData.spouse_life_expectancy.mean} , Stddev=${formData.spouse_life_expectancy.stddev}}` : formData.spouse_life_expectancy.fixed}</div>
                    </div>
                }
                <div><span className="font-medium">Inflation Assumption:</span> {formData.inflation_assume.type === "normal" ? `Normal {Mean=${formData.life_expectancy.mean} , Stddev=${formData.life_expectancy.stddev}}` : formData.life_expectancy.fixed}</div>


                <div>
                    <div className="font-medium">Investment Types:</div>
                </div>
                <div>
                    <div className="font-medium">Investment:</div>
                </div>
                <div>
                    <div className="font-medium">Event Series:</div>
                </div>
                <div>
                    <div className="font-medium">Spending Strategy:</div>
                </div>
                <div>
                    <div className="font-medium">Withdrawal Strategy:</div>
                </div>
                <div>
                    <div className="font-medium">RMD Strategy:</div>
                </div>
                <div><span className="font-medium">Roth Conversions:</span> {formData.roth_optimizer.is_enable ? `On (${formData.roth_optimizer.start_year} - ${formData.roth_optimizer.end_year}` : "Off"}</div>
                {formData.roth_optimizer.is_enable && 
                <div>
                    <div className="font-medium">Roth Conversion Strategy:</div>
                </div>}
                


            </div>
            
            <button className="text-white font-bold text-xl px-7 py-1 rounded-md hover:opacity-80 cursor-pointer disabled:opacity-20 disabled:cursor-default bg-blue-600 w-40 h-10" onClick={handleSubmit}>Save</button>
        </div>
    )
}

export default Summary;