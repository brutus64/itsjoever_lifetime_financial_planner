import Plot from 'react-plotly.js';

const ProbabilityLineChart = ({data}:{data: any}) => {
  return (
    <Plot className="w-full"
      data={[
        {
          x: Object.keys(data.success),
          y: Object.values(data.success),
          type: 'scatter',
          mode: 'lines',
          hovertemplate: 'Year: %{x}<br>Percent of Success: %{y}<extra></extra>',
        },
      ]}
      layout={{
        title: {
          text: 'Probability of Success Over Time',
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
            text:'Percent',
            font: {
              size: 14,
              color: '#000' 
            }
          },
          automargin: true,
        },
        hovermode: 'x unified', // optional: makes hovering over multiple lines easier
      }}
      style={{ width: '100%', height: '100%' }}
      config={{ displayModeBar: false, staticPlot: false }}
    />
  );
}

export default ProbabilityLineChart