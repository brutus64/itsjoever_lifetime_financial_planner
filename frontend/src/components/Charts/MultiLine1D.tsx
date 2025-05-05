import { useEffect, useState } from 'react';
import Plot from 'react-plotly.js';

const MultiLine = ({data} : {data:any}) => {
    const [selected, setSelected] = useState('success');
    
    const handleChange = (e) => {
        setSelected(e.target.value);
        console.log(`swapped to ${e.target.value}`)
    }
    return (
        <div className="w-full mt-6">
            <div className="flex items-center gap-4 mb-4 bg-white shadow-md rounded-lg p-4 w-fit">
            <label className="text-md font-semibold">Selected Quantity</label>
                <select onChange={handleChange} value={selected} className='text-md px-2 border-2 border-gray-200 rounded-md w-fit'>
                    <option value="success">Success</option>
                    <option value="total_investments">Median of Total Investments</option>
                </select>
            </div>
            <MultiLinePlot data={data} selected={selected} />
        </div>
    )
}

const MultiLinePlot = ({data, selected}: {data:any, selected:string}) => {
    const traces = Object.keys(data.explore_results.multi_line[selected]).map(paramValue => {
        const word = selected.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
        const yearlyResults = data.explore_results.multi_line[selected][paramValue];
        return {
            x: Object.keys(yearlyResults),
            y: Object.values(yearlyResults),
            type: "scatter",
            mode: "lines+markers",
            name: paramValue,
            hovertemplate: `Year: %{x}<br>` + `${word}: %{y}<br>` + `Parameter: ${paramValue}`,
        }
    });
    return (
        <Plot 
            data={traces}
            layout={{
                title: {
                    text: `${selected.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')} Over Time`,
                    xanchor: 'center'},
                xaxis: { 
                    title: {
                        text: 'Year',
                        font: {
                            size: 18,
                        }
                    },
                    automargin: true,
                },
                yaxis: { 
                    title: {
                        text: selected === 'success' ? 'Percent of Success' : 'Value',
                        font: {
                            size: 18,
                        }
                    },
                    automargin: true,
                    tickformat: ',.0f'
                }
              }}
              style={{ width: '100%', height: '100%' }}
        />
    )
}

export default MultiLine;