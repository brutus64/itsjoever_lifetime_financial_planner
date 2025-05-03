import Plot from 'react-plotly.js';
import { useState } from 'react';

const SurfacePlot = ({ data }: { data: any }) => {
    const [selected, setSelected] = useState('final_success');
    const handleChange = (e) => {
        setSelected(e.target.value);
        console.log(`swapped to ${e.target.value}`)
    }
    return (
        <>
            <select onChange={handleChange} value={selected}>
                <option value="final_success">Final Success</option>
                <option value="final_investments">Final Median Investment</option>
            </select>
            <SurfacePlotChart data={data} selected={selected}/>
        </>
    )
};

const SurfacePlotChart = ({data, selected} : {data:any, selected:string}) => {
    const word = selected.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
    const param1 = Object.keys(data.explore_results)
    const param2 = Object.keys(data.explore_results[param1[0]]) //to get the y value variations since its the same nxm array across all n values
    const z = [];
    for (const paramTwo of param2) {
        const row = [];
        for (const paramOne of param1) {
            const value = data.explore_results[paramOne][paramTwo][selected];
            row.push(value);
        }
        z.push(row);
    }

    console.log("PARAM1", param1)
    console.log("PARAM2", param2)
    console.log("Z", z)

    const trace = {
        type: 'surface',
        z: z,
        x: param1,
        y: param2,
        colorscale: 'Viridis',
        hovertemplate:
            `${data.param1}: %{x}<br>` +
            `${data.param2}: %{y}<br>` + 
            `${word}: ` + (selected.includes('success') ? '%{z:,.2f}%' : '$%{z:,.2f}') +
            '<extra></extra>'
    }
    return (
        <Plot
            data={[trace]}
            layout={{
                title: { text: `Surface Plot of ${word}`, xanchor: 'center' },
                autosize: true,
                scene: {
                    xaxis: { 
                        title: {
                            text: data.param1, 
                            font: {
                                size: 8,
                            }
                        },
                        automargin: true,
                    },
                    yaxis: { 
                        title: {
                            text: data.param2,
                            font: {
                                size: 8,
                            }
                        },
                        automargin: true,
                    },
                    zaxis: { 
                        title: {
                            text: word,
                            font: {
                                size: 8,
                            }
                        },
                        automargin: true,
                    },
                },
                hovermode: 'closest',
            }}
            style={{ width: '100%', height: '100%' }}
            config={{ displayModeBar: false, staticPlot: false }}
    />
  );
}
    

export default SurfacePlot;
