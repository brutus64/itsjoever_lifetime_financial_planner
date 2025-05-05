import { useLocation } from 'react-router-dom';
import ProbabilityLineChart from './Charts/ProbabilityLineChart';
import ShadedLineChartContainer from './Charts/ShadedLineChart';
import StackedBarChartContainer from './Charts/StackedBarChart';
import { useEffect, useState } from 'react';
import ChartCollapse from './scenario/Helper/ChartCollapse';
import { CircularProgressbar, buildStyles } from 'react-circular-progressbar';
import 'react-circular-progressbar/dist/styles.css';

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
  const final_success_value = data.success[largest_year];
  const final_success = parseFloat(final_success_value);  

  return (
    <div className="flex flex-col gap-6 w-full">
        <div className='flex item justify-between'>
            <p className="text-5xl">Simulation Results</p>
        </div>
        <div className="flex gap-3 bg-gray-100 rounded-lg p-6 shadow-md">
          <SuccessRateCircle final_success={final_success} />
            <div className="flex flex-col p-6 justify-between">
            <p className="text-xl">{`Financial Goal: $${Number(data.fin_goal).toLocaleString()}`}</p>
            <div className="flex flex-col gap-2">
              <p className="text-xl">{`Final Year: ${largest_year}`}</p>
              <p className="text-xl">{`Final Probability of Succcess: ${final_success}%`}</p>
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

const SuccessRateCircle = ({ final_success }) => {
  const [animatedValue, setAnimatedValue] = useState(0);

  useEffect(() => {
    let start = 0;
    const duration = 1000;
    const startTime = performance.now();

    const animate = (currentTime) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const currentValue = start + (final_success - start) * progress;
      setAnimatedValue(currentValue);

      if (progress < 1) {
        requestAnimationFrame(animate);
      }
    };

    requestAnimationFrame(animate);
  }, [final_success]);

  return (
    <div style={{ width: 200, height: 200, position: "relative" }}>
      <CircularProgressbar
        value={animatedValue}
        text={""}
        strokeWidth={14}
        background
        backgroundPadding={6}
        styles={buildStyles({
          backgroundColor: "#f0f0f0", // full background fill
          trailColor: "transparent",  // hide the default trail
          pathColor: "#007940",
        })}
      />
      {/* Text overlay */}
      <div
        style={{
          position: "absolute",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          textAlign: "center",
          fontSize: "20px",
          color: "#000",
          lineHeight: "1.3",
          fontWeight: "bold",
        }}
      >
        <div>{`${animatedValue.toFixed(2)}%`}</div>
        <div>Success Rate</div>
      </div>
    </div>
  );
};


export default SimulationResultPage;