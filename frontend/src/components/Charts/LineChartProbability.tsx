import Plot from 'react-plotly.js';

const LineChartProbability = ({data}:{data: any}) => {
  return (
    <Plot
      data={[
        {
          x: Object.keys(data.success),
          y: Object.values(data.success),
          type: 'scatter',
          mode: 'lines+markers',
          hovertemplate: 'Year: %{x}<br>Percent of Success: %{y}<extra></extra>',
        },
      ]}
      layout={{
        title: {
          text: 'Probability of Success Over Time',
          xanchor: 'center'},
        xaxis: { 
          title: 'Year',
          automargin: true,
          font: { size: 14, color: '#000' },
        },
        yaxis: { 
          title: 'Percent of Success',
          automargin: true,
          font: { size: 14, color: '#000' },
        },
        hovermode: 'x unified', // optional: makes hovering over multiple lines easier
      }}
      style={{ width: '100%', height: '100%' }}
      config={{ displayModeBar: false, staticPlot: false }}
    />
  );
}

export default LineChartProbability