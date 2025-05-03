import Plot from 'react-plotly.js';

const SurfacePlot2DContainer = ({ data }: { data: any }) => {
  return <SurfacePlot2D data={data} type={'final_investments'} />;
};

const SurfacePlot2D = ({ data, type }: { data: any; type: string }) => {
  const param1_vals = Object.keys(data.explore_results)
    .map(Number)
    .sort((a, b) => a - b); // e.g., [60000, 70000, 80000, ...]

  const param2_vals = Object.keys(data.explore_results[param1_vals[0]])
    .map(Number)
    .sort((a, b) => a - b); // e.g., [500, 800, 1100, ...]

  let x:number[]  = [];
  let y:number[] = [];
  param1_vals.forEach(param1 => {
    param2_vals.forEach(param2 => {
        x.push(param1);
        y.push(param2);
    })
  })

  const z = x.map((xVal) => {
    return y.map((yVal) => {
      const entry = data.explore_results[xVal][yVal];
      return entry ? entry[type] : null;
    });
  });

  console.log(data);
  console.log(x);
  console.log(y);
  console.log(z);

  return (
    <Plot
      data={[
        {
          x: x,
          y: y,
          z: z,
          type: 'surface',
          colorscale: 'Viridis',
        },
      ]}
      layout={{
        title: { text: `Surface Plot of ${type}`, xanchor: 'center' },
        autosize: true,
        scene: {
          xaxis: { title: data.param1 },
          yaxis: { title: data.param2 },
          zaxis: { title: type },
        },
        hovermode: 'closest',
      }}
      style={{ width: '100%', height: '100%' }}
      config={{ displayModeBar: false, staticPlot: false }}
    />
  );
};

export default SurfacePlot2DContainer;
