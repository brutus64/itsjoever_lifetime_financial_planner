import Plot from 'react-plotly.js';
import { useEffect, useState } from 'react';
import ProbabilityLineChart from './ProbabilityLineChart';
import ShadedLineChartContainer from './ShadedLineChart';
import StackedBarChartContainer from './StackedBarChart';


const Section4Chart1DContainer = ({data}:{data: any}) => {
    const [graphType, setGraphType] = useState("success") // success, shaded, stacked
    const [quantityValue, setQuantityValue] = useState(Object.keys(data.individual_results)[0])


    const changeGraphType = (e) => {
        setGraphType(e.target.value)
    }

    const changeQuantityValue = (e) => {
        setQuantityValue(e.target.value)
        console.log(`quantity value changed to ${e.target.value}`)
    }

    return (
        <div className="w-full mt-6">
            <div className="flex gap-10">
                <div className="flex items-center gap-4 mb-4 bg-white shadow-md rounded-lg p-4 w-fit">
                    <label className="text-md font-semibold">Chart Type</label>
                    <select onChange={changeGraphType} value={graphType} className="text-md px-2 border-2 border-gray-200 rounded-md w-fit">
                        <option value="success">Success Probability Line Chart</option>
                        <option value="shaded">Shaded Line Chart</option>
                        <option value="stacked">Stacked Bar Chart</option>
                    </select>
                </div>
                
                <div className="flex items-center gap-4 mb-4 bg-white shadow-md rounded-lg p-4 w-fit">
                    <label className="text-md font-semibold">Parameter 1 Value</label>
                    <select onChange={changeQuantityValue} value={quantityValue} className="text-md px-2 border-2 border-gray-200 rounded-md w-fit">
                        {Object.keys(data.individual_results).map((key) => (
                            <option key={key} value={key}>
                            {key}
                            </option>
                        ))}
                    </select>
                </div>
            </div>
            {graphType == "success" && <ProbabilityLineChart data={data.individual_results[quantityValue]}/>}
            {graphType == "shaded" && <ShadedLineChartContainer data={data.individual_results[quantityValue]}/>}
            {graphType == "stacked" && <StackedBarChartContainer data={data.individual_results[quantityValue]}/>}
        </div>
    )
} 


export default Section4Chart1DContainer;