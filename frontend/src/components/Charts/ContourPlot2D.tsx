import { useState } from "react";
import Plot from "react-plotly.js";

const ContourPlot = ({data} : {data:any}) => {
    const [selected, setSelected] = useState('final_success');
    const handleChange = (e) => {
        setSelected(e.target.value);
        console.log(`swapped to ${e.target.value}`)
    }
    return (
        <div className="w-full mt-6">
            <div className="flex items-center gap-4 mb-4 bg-white shadow-md rounded-lg p-4 w-fit">
                <label className="text-md font-semibold">Selected Quantity</label>
                <select onChange={handleChange} value={selected}>
                    <option value="final_success">Final Success</option>
                    <option value="final_investments">Final Median Investment</option>
                </select>
            </div>
            <ContourPlotChart data={data} selected={selected} />
        </div>
    )
}

const ContourPlotChart = ({data, selected} : {data:any, selected:string}) => {
    const word = selected.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
    const param1 = Object.keys(data.explore_results)
    const param2 = Object.keys(data.explore_results[param1[0]]) //to get the y value variations since its the same nxm array across all n values
    const z = [];
    for (const paramTwo of param2) { //each row has constant y, move onto new y when we pushed a row
        const row = [];
        for (const paramOne of param1) {
            const value = data.explore_results[paramOne][paramTwo][selected]; //x changes y is constant here
            row.push(value);
        }
        z.push(row); //pushes row, so your y is constant but x changes
    }
    // e.g.
    // param1=[2020,2025,2030]
    // param2=[50,55]
    // z=[[value(2020,50),value(2025,50), value(2030,50)],
    //     [value(2020,55)...]
    //     ...
    // ]
    //meaning len(param2) == len(z) and len(param1) == len(z[0])

    console.log("PARAM1", param1)
    console.log("PARAM2", param2)
    console.log("Z", z)

    const trace = {
        type: 'contour',
        z: z,
        x: param1,
        y: param2,
        contours: {
            coloring: 'heatmap',
            showlabels: true,
        },
        colorscale: selected.includes('success') ? 'Greens' : 'Viridis',
        colorbar: {
            title: {
                text: selected.includes('success') ? 'Success (%)' : 'Investment ($)',
                side: 'right'
            },
            tickformat: selected.includes('success') ? '.0f' : '$.3s',
        },
        hovertemplate: 
            `${data.param1}: %{x}<br>` +
            `${data.param2}: %{y}<br>` +
            `${word}: ` + (selected.includes('success') ? '%{z:,.2f}%' : '$%{z:,.2f}') +
            '<extra></extra>'
    };
    return (
        <Plot 
            data={[trace]}
            layout={{
                title: {
                text: `${word} by ${data.param1} and ${data.param2}`,
                xanchor: 'center'
                },
                xaxis: { 
                    title: {
                        text: data.param1, 
                        font: {
                            size: 18,
                        }
                    },
                    automargin: true,
                },
                yaxis: { 
                    title: {
                        text: data.param2,
                        font: {
                            size: 18,
                        }
                    },
                    automargin: true,
                },
                width: 800,
                height: 600,
            }}
            style={{ width: '100%', height: '100%' }}
            config={{
                responsive: true,
                displaylogo: false
            }}
        />
    )
}


export default ContourPlot;