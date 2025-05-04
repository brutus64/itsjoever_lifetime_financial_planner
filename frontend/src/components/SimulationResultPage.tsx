import { useLocation } from 'react-router-dom';
import ProbabilityLineChart from './Charts/ProbabilityLineChart';
import ShadedLineChartContainer from './Charts/ShadedLineChart';
import StackedBarChartContainer from './Charts/StackedBarChart';
import { useEffect, useState } from 'react';

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
    <div className="">
        <ProbabilityLineChart data={data} />
        <ShadedLineChartContainer data={data} />
        <StackedBarChartContainer data={data} />
    </div>
  );
};

export default SimulationResultPage;