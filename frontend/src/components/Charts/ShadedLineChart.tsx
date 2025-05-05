import Plot from 'react-plotly.js';
import { useEffect, useState } from 'react';

// TODO: 
// Possibly change colors of the lines to be more distinct
// Styling for dropdown menu/chart
// ***ADD IN FINANCIAL GOAL LINE, y={financial_goal}, financial_goal doesnt exist in {data} yet***

const ShadedLineChartContainer = ({data}:{data: any}) => {
    const [selected, setSelected] = useState('total_investments')

    const changeSelected = (e) => {
        setSelected(e.target.value)
        console.log(`changed to ${e.target.value}`)
    }

    return (
        <div className="">
            <select onChange={changeSelected} value={selected} className="text-md px-2 border-2 border-gray-200 rounded-md w-fit">
                <option value="total_investments">Total Investments</option>
                <option value="total_income">Total Income</option>
                <option value="total_expenses">Total Expenses</option>
                <option value="early_withdrawal_tax">Early Withdrawal Tax</option>
                <option value="discretionary_percent">Percentage of Total Discretionary Expenses Incurred</option>
            </select>
            <ShadedLineChart data={data} selected={selected}/>
        </div>
        
    )
} 

const ShadedLineChart = ({data, selected}:{data: any, selected:string}) => {
  return (
    <Plot
    data={[
        // y = Financial Goal Line (only for "total_investments")
        ...(selected === "total_investments" ? [{
          x: Object.keys(data.percentiles[selected]),
          y: Object.keys(data.percentiles[selected]).map(() => data.fin_goal),
          type: 'scatter',
          mode: 'lines',
          line: { color: 'rgb(81, 255, 0)' },
          name: 'Financial Goal',
          hovertemplate: 'Financial Goal: $%{y:,.2f}<extra></extra>',
        }] : []),

        // Median (50th percentile) line
        {
          x: Object.keys(data.percentiles[selected]),
          y: Object.values(data.percentiles[selected]).map(yearData => yearData[5]),
          type: 'scatter',
          mode: 'lines',
          line: { color: 'rgb(0, 0, 0)'},
          name: 'Median',
          hovertemplate: 'Year: %{x}<br>Median%: $%{y:,.2f}<extra></extra>',
        },
      
        // Shaded area between 10th and 90th percentiles
        {
          x: [
            ...Object.keys(data.percentiles[selected]),
            ...Object.keys(data.percentiles[selected]).slice().reverse()
          ],
          y: [
            ...Object.values(data.percentiles[selected]).map(yearData => yearData[1]),
            ...Object.values(data.percentiles[selected]).map(yearData => yearData[9]).reverse()
          ],
          fill: 'toself',
          fillcolor: 'rgba(5, 182, 138, 0.3)',
          line: { color: 'transparent' },
          type: 'scatter',
          mode: 'lines',
          name: '10%-90%',
          hoverinfo: 'skip', // disables hover for the filled area
        },
          
        // 10th percentile line
        {
          x: Object.keys(data.percentiles[selected]),
          y: Object.values(data.percentiles[selected]).map(yearData => yearData[1]),
          type: 'scatter',
          mode: 'lines',
          line: { color: 'transparent'},
          name: '10th Percentile',
          hovertemplate: 'Year: %{x}<br>10%: $%{y:,.2f}<extra></extra>',
        },
        // 90th percentile line
        {
          x: Object.keys(data.percentiles[selected]),
          y: Object.values(data.percentiles[selected]).map(yearData => yearData[9]),
          type: 'scatter',
          mode: 'lines',
          line: { color: 'transparent'},
          name: '90th Percentile',
          hovertemplate: 'Year: %{x}<br>90%: $%{y:,.2f}<extra></extra>',
        },

        // ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
        // Shaded area between 20th and 80th percentiles
        {
            x: [
              ...Object.keys(data.percentiles[selected]),
              ...Object.keys(data.percentiles[selected]).slice().reverse()
            ],
            y: [
              ...Object.values(data.percentiles[selected]).map(yearData => yearData[2]),
              ...Object.values(data.percentiles[selected]).map(yearData => yearData[8]).reverse()
            ],
            fill: 'toself',
            fillcolor: 'rgba(126, 23, 136, 0.3)',
            line: { color: 'transparent' },
            type: 'scatter',
            mode: 'lines',
            name: '20%-80%',
            hoverinfo: 'skip', // disables hover for the filled area
        },
        // 20th percentile line
        {
            x: Object.keys(data.percentiles[selected]),
            y: Object.values(data.percentiles[selected]).map(yearData => yearData[2]),
            type: 'scatter',
            mode: 'lines',
            line: { color: 'transparent'},
            name: '20th Percentile',
            hovertemplate: 'Year: %{x}<br>20%: $%{y:,.2f}<extra></extra>',
        },
        // 80th percentile line
        {
            x: Object.keys(data.percentiles[selected]),
            y: Object.values(data.percentiles[selected]).map(yearData => yearData[8]),
            type: 'scatter',
            mode: 'lines',
            line: { color: 'transparent' },
            name: '90th Percentile',
            hovertemplate: 'Year: %{x}<br>80%: $%{y:,.2f}<extra></extra>',
        },


        // ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
        // Shaded area between 30th and 70th percentiles
        {
            x: [
              ...Object.keys(data.percentiles[selected]),
              ...Object.keys(data.percentiles[selected]).slice().reverse()
            ],
            y: [
              ...Object.values(data.percentiles[selected]).map(yearData => yearData[3]),
              ...Object.values(data.percentiles[selected]).map(yearData => yearData[7]).reverse()
            ],
            fill: 'toself',
            fillcolor: 'rgba(208, 218, 70, 0.3)',
            line: { color: 'transparent' },
            type: 'scatter',
            mode: 'lines',
            name: '30%-70%',
            hoverinfo: 'skip', // disables hover for the filled area
        },
        // 30th percentile line
        {
            x: Object.keys(data.percentiles[selected]),
            y: Object.values(data.percentiles[selected]).map(yearData => yearData[3]),
            type: 'scatter',
            mode: 'lines',
            line: { color: 'transparent'},
            name: '30th Percentile',
            hovertemplate: 'Year: %{x}<br>30%: $%{y:,.2f}<extra></extra>',
        },
        // 70th percentile line
        {
            x: Object.keys(data.percentiles[selected]),
            y: Object.values(data.percentiles[selected]).map(yearData => yearData[7]),
            type: 'scatter',
            mode: 'lines',
            line: { color: 'transparent'},
            name: '70th Percentile',
            hovertemplate: 'Year: %{x}<br>70%: $%{y:,.2f}<extra></extra>',
        },
        
        // ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
        // Shaded area between 40th and 60th percentiles
        {
            x: [
              ...Object.keys(data.percentiles[selected]),
              ...Object.keys(data.percentiles[selected]).slice().reverse()
            ],
            y: [
              ...Object.values(data.percentiles[selected]).map(yearData => yearData[4]),
              ...Object.values(data.percentiles[selected]).map(yearData => yearData[6]).reverse()
            ],
            fill: 'toself',
            fillcolor: 'rgba(181, 49, 207, 0.3)',
            line: { color: 'transparent' },
            type: 'scatter',
            mode: 'lines',
            name: '40%-60%',
            hoverinfo: 'skip', // disables hover for the filled area
          },
            
          // 40th percentile line
          {
            x: Object.keys(data.percentiles[selected]),
            y: Object.values(data.percentiles[selected]).map(yearData => yearData[4]),
            type: 'scatter',
            mode: 'lines',
            line: { color: 'transparent'},
            name: '40th Percentile',
            hovertemplate: 'Year: %{x}<br>40%: $%{y:,.2f}<extra></extra>',
          },
          // 90th percentile line
          {
            x: Object.keys(data.percentiles[selected]),
            y: Object.values(data.percentiles[selected]).map(yearData => yearData[6]),
            type: 'scatter',
            mode: 'lines',
            line: { color: 'transparent'},
            name: '60th Percentile',
            hovertemplate: 'Year: %{x}<br>60%: $%{y:,.2f}<extra></extra>',
          },
      ]}
      layout={{
        title: {
          text: `${selected.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')} Over Time`,
          xanchor: 'center'},
        xaxis: { 
          title: {
            text:'Year',
            font: {
              size: 14,
              color: '#000' 
            }
          },
          automargin: true,
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
        }
      }}
      style={{ width: '100%', height: '100%' }}
      config={{ displayModeBar: false, staticPlot: false }}
    />
  );
}

export default ShadedLineChartContainer;