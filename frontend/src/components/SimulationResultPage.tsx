import { useLocation } from 'react-router-dom';
import ProbabilityLineChart from './Charts/ProbabilityLineChart';
import ShadedLineChartContainer from './Charts/ShadedLineChart';
import StackedBarChartContainer from './Charts/StackedBarChart';
import { useEffect, useState } from 'react';
import ChartCollapse from './scenario/Helper/ChartCollapse';

const SimulationResultPage = () => {
  const location = useLocation();
  const [data, setData] = useState(null);

  useEffect(() => {
    if (location.state?.data) {
        setData(location.state.data)
    }
  }, [location.state]); // Log the data to the console when it changes
  
  if (!data) {
    return <div>Loading...</div>; // Show a loading message while data is being fetched
  }

  return (
    <div className="flex flex-col gap-6">
        <div className='flex item justify-between'>
            <p className="text-5xl">Simulation Results</p>
        </div>
        <div className='flex item justify-between'>
            <p className="text-3xl">Visualized Charts</p>
        </div>
        <ChartCollapse base={<div>Probability Line Chart</div>}>
          <ProbabilityLineChart data={data} />
        </ChartCollapse>
        
        <ChartCollapse base={<div>Shaded Line Chart</div>}>
        <ShadedLineChartContainer data={data} />
        </ChartCollapse>
        
        <ChartCollapse base={<div>Stacked Bar Chart</div>}>
        <StackedBarChartContainer data={data} />
        </ChartCollapse>
    </div>
  );
};

export default SimulationResultPage;