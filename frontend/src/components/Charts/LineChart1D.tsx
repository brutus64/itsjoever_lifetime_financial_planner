import { useState } from "react";
import Plot from "react-plotly.js";

const LineChart = ({data} : {data:any}) => {
    const [selected, setSelected] = useState('final_success');
    
    const handleChange = (e) => {
        setSelected(e.target.value);
        console.log(`swapped to ${e.target.value}`)
    }
    return (
        <div>
            <select onChange={handleChange} value={selected} className='text-md px-2 border-2 border-gray-200 rounded-md w-fit'>
                <option value="final_success">Final Success</option>
                <option value="final_investments">Final Median Investment</option>
            </select>
            <LineChartPlot data={data} selected={selected}/> 
        </div>
    )
    

}

const LineChartPlot = ({data, selected} : {data:any, selected: string}) => {
    const word = selected.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
    console.log(Object.keys(data.explore_results.param_function[selected]))
    console.log(Object.values(data.explore_results.param_function[selected]))
    const traces = {
        x: Object.keys(data.explore_results.param_function[selected]),
        y: Object.values(data.explore_results.param_function[selected]),
        type: "scatter",
        mode: "lines+markers",
        hovertemplate: `${data.param1}: %{x}<br>` + `${word}: %{y}<br>`
    }
    return (
        <Plot
            data={[traces]}
            layout={{
                title: {
                  text: `${word}`,
                  xanchor: 'center'},
                xaxis: { 
                  title: `${data.param1}`,
                  automargin: true,
                  font: { size: 14, color: '#000' },
                },
                yaxis: { 
                  title: `${word}`,
                  automargin: true,
                  font: { size: 14, color: '#000'},
                  tickformat: ',.0f'
                }
              }}
            style={{ width: '100%', height: '100%' }}
        />

    )
}
export default LineChart;