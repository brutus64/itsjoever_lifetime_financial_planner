import Plot from 'react-plotly.js';
import { useEffect, useState } from 'react';
import ProbabilityLineChart from './ProbabilityLineChart';
import ShadedLineChartContainer from './ShadedLineChart';
import StackedBarChartContainer from './StackedBarChart';


const Section4Chart2DContainer = ({data}:{data: any}) => {
    const [graphType, setGraphType] = useState("success") // success, shaded, stacked
    const [param1, setParam1] = useState(Object.keys(data.individual_results)[0])
    const [param2, setParam2] = useState(Object.keys(data.individual_results[Object.keys(data.individual_results)[0]])[0])


    const changeGraphType = (e) => {
        setGraphType(e.target.value)
    }

    const changeParam1 = (e) => {
        setParam1(e.target.value)
        console.log(`param2 changed to ${e.target.value}`)
    }

    const changeParam2 = (e) => {
        setParam2(e.target.value)
        console.log(`param2 changed to ${e.target.value}`)
    }

    return (
        <div className="">
            <div className="flex gap-10">
                <select onChange={changeGraphType} value={graphType} className="text-md px-2 border-2 border-gray-200 rounded-md w-fit">
                    <option value="success">Success Probability Line Chart</option>
                    <option value="shaded">Shaded Line Chart</option>
                    <option value="stacked">Stacked Bar Chart</option>
                </select>
                <select onChange={changeParam1} value={param1} className="text-md px-2 border-2 border-gray-200 rounded-md w-fit">
                    {Object.keys(data.individual_results).map((key) => (
                        <option key={key} value={key}>
                        {key}
                        </option>
                    ))}
                </select>
                <select onChange={changeParam2} value={param2} className="text-md px-2 border-2 border-gray-200 rounded-md w-fit">
                    {Object.keys(data.individual_results[Object.keys(data.individual_results)[0]]).map((key) => (
                        <option key={key} value={key}>
                        {key}
                        </option>
                    ))}
                </select>
            </div>
            {graphType == "success" && <ProbabilityLineChart data={data.individual_results[param1][param2]}/>}
            {graphType == "shaded" && <ShadedLineChartContainer data={data.individual_results[param1][param2]}/>}
            {graphType == "stacked" && <StackedBarChartContainer data={data.individual_results[param1][param2]}/>}
        </div>
    )
} 


export default Section4Chart2DContainer;

