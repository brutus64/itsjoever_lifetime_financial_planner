import { useEffect, useState } from 'react';
import Plot from 'react-plotly.js';

const MultiLine = ({data} : {data:any}) => {
    const [selected, setSelected] = useState('success');
    
    const handleChange = (e) => {
        setSelected(e.target.value);
        console.log(`swapped to ${e.target.value}`)
    }
    return (
        <div>
            <select onChange={handleChange} value={selected} className='text-md px-2 border-2 border-gray-200 rounded-md w-fit'>
                <option value="success">Success</option>
                <option value="total_investments">Median of Total Investments</option>
            </select>
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
            mode: "lines+marker",
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
                  title: 'Year',
                  automargin: true,
                  font: { size: 14, color: '#000' },
                },
                yaxis: { 
                  title: selected === 'success' ? 'Percent of Success' : 'Value',
                  automargin: true,
                  font: { size: 14, color: '#000'},
                  tickformat: ',.0f'
                }
              }}
              style={{ width: '100%', height: '100%' }}
              config={{ displayModeBar: false, staticPlot: false }}
        />
    )
}

export default MultiLine;