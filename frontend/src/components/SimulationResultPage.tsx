import { useLocation } from 'react-router-dom';
import ProbabilityLineChart from './Charts/ProbabilityLineChart';
import ShadedLineChartContainer from './Charts/ShadedLineChart';
import StackedBarChartContainer from './Charts/StackedBarChart';
import { useEffect, useState } from 'react';
import ChartCollapse from './scenario/Helper/ChartCollapse';
import SuccessRateCircle from './scenario/Helper/SuccessRateCircle';

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

  const all_keys = Object.keys(data.success);
  const largest_year = Math.max(...all_keys.map(key => parseInt(key, 10)));
  const final_prob = data.final_probs*100

  return (
    <div className="flex flex-col gap-6 w-full">
        <div className='flex item justify-between'>
            <p className="text-5xl">Simulation Results</p>
        </div>
        <div className="flex gap-3 bg-gray-100 rounded-lg p-6 shadow-md">
          <SuccessRateCircle final_success={final_prob} />
            <div className="flex flex-col p-6 justify-between">
            <p className="text-xl">{`Financial Goal: $${Number(data.fin_goal).toLocaleString()}`}</p>
            <div className="flex flex-col gap-2">
              <p className="text-xl">{`Highest Year: ${largest_year}`}</p>
              <p className="text-xl">{`Final Probability of Succcess: ${final_prob.toFixed(2)}%`}</p>
            </div>
            </div>
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