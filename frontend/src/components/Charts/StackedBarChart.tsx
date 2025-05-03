import Plot from 'react-plotly.js';
import { useEffect, useState } from 'react';


const StackedBarChartContainer = ({data}:{data: any}) => {
    const [selected, setSelected] = useState(0) // 0 for average, 1 for median (indices of data.breakdowns lists)
    const [aggregation, setAggregation] = useState(0)
    const [type, setType] = useState("investments")

    const changeType = (e) => {
        setType(e.target.value)
    }

    const changeSelected = (e) => {
        const value = e.target.value
        if (value === "average") {
            setSelected(0)
        } else {
            setSelected(1)
        }
        console.log(`changed to ${e.target.value}, index${value == "average" ? 0 : 1}`)
    }

    const changeAggregation = (e) => {
        setAggregation(e.target.value)
        console.log(`aggregation changed to ${e.target.value}`)
    }

    return (
        <div className="">
            <div className="flex gap-10">
                <select onChange={changeType} value={type} className="text-md px-2 border-2 border-gray-200 rounded-md w-fit">
                    <option value="investments">Investments</option>
                    <option value="income">Income</option>
                    <option value="expenses">Expenses</option>
                </select>
                <select onChange={changeSelected} value={selected == 0 ? "average" : "median"} className="text-md px-2 border-2 border-gray-200 rounded-md w-fit">
                    <option value="average">Average</option>
                    <option value="median">Median</option>
                </select>
                <div className="flex gap-2 items-center">
                    <label>Aggregation Threshold</label>
                    <input className="border border-gray-300 rounded px-2 py-1 w-30" type="number" onChange={changeAggregation} value={aggregation} min="0"/>
                </div>
            </div>
            <StackedBarChart data={data} type={type} mean_or_median={selected} aggregation={aggregation}/>
        </div>
    )
} 

const StackedBarChart = ({data, type, mean_or_median, aggregation}:{data: any, type:string, mean_or_median:number, aggregation:number}) => {
  const years = Object.keys(data.breakdowns[type])

  // Get all unique components for the selected type (e.g., investments, income, expenses) for each year
  const bar_components = Array.from(
    new Set(
        years.flatMap(year => Object.keys(data.breakdowns[type][year]))
    )
  )

  const plot_data = (() => {
    // Step 1: Compute all y-values per component
    const componentData = bar_components.map(component => {
      const yValues = years.map(
        year => data.breakdowns[type]?.[year]?.[component]?.[mean_or_median] ?? 0
      );
      return { component, yValues };
    });
  
    // Step 2: Separate components based on aggregation threshold
    const aboveThreshold = [];
    const belowThreshold = [];
  
    for (const { component, yValues } of componentData) {
      const allBelow = yValues.every(value => value < aggregation);
      if (allBelow) {
        belowThreshold.push(yValues);
      } else {
        aboveThreshold.push({
          x: years,
          y: yValues,
          name: component,
          type: 'bar',
        });
      }
    }
  
    // Step 3: Create the "Other" component by summing belowThreshold components
    if (belowThreshold.length > 0) {
      const otherY = years.map((_, i) =>
        belowThreshold.reduce((sum, yVals) => sum + yVals[i], 0)
      );
  
      aboveThreshold.push({
        x: years,
        y: otherY,
        name: 'Other',
        type: 'bar',
      });
    }
  
    return aboveThreshold;
  })();
  

  return (
    <Plot
        data={plot_data.map(trace => ({
            ...trace,
            hovertemplate: '%{fullData.name}<br>Year: %{x}<br>Value: $%{y:,.2f}<extra></extra>',
        }))}
        layout={{
            title: {
                text: `${type.charAt(0).toUpperCase() + type.slice(1)} Over Time`,
                xanchor: 'center'
            },
            barmode: 'stack',
            xaxis: {
              title: {
                text:'Year',
                font: {
                  size: 14,
                  color: '#000' 
                }
              },
              automargin: true
            },
            yaxis: { 
              title: {
                text:'Dollars',
                font: {
                  size: 14,
                  color: '#000' 
                }
              },
              automargin: true,
              tickformat: ',.0f'
            },
        }}
        style={{ width: '100%', height: '100%' }}
        config={{ displayModeBar: false, staticPlot: false }}
    />
  )
}

export default StackedBarChartContainer;