import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import MultiLine from './Charts/MultiLine1D';
import LineChart from './Charts/LineChart1D';
import Section4Chart1DContainer from './Charts/Section4Chart1D';
import Section4Chart2DContainer from './Charts/Section4Chart2D';
import SurfacePlot from './Charts/SurfacePlot2D';
import ContourPlot from './Charts/ContourPlot2D';
import ChartCollapse from './scenario/Helper/ChartCollapse';
import SuccessRateCircle from './scenario/Helper/SuccessRateCircle';

const ExplorationPage: React.FC = () => {
    const location = useLocation();
    const [data, setData] = useState(null);
    const [exploreType, setExploreType] = useState<string | null>(null);
    useEffect(() => {
        if (location.state?.data){
            setData(location.state.data);
            console.log("PARAM2", location.state.data.param2)
            console.log("PARAM1", location.state.data.param1)
            if (location.state.data.param1 && location.state.data.param2 !== null)
                setExploreType('2D');
            else if (location.state.data.param1)
                setExploreType('1D');
            else
                console.log("how is param1 and param2 non-existent at all")
        }
    },[location.state])
    console.log(data)
    
    if (!data) {
        return <div>Loading...</div>;
    }

    let success_1D = 0
    let num_years1D = 0
    let success_2D = 0
    let num_years2D = 0

    if (exploreType == '1D') {
        Object.keys(data.individual_results).forEach((key) => {
            let years = Object.keys(data.individual_results[key].success)
            const largest_year = Math.max(...years.map(key => parseInt(key, 10)));
            const final_success = data.individual_results[key].success[largest_year] 
            success_1D += final_success
            num_years1D += 1
        })
    } else {
        Object.keys(data.individual_results).forEach((key) => {
            Object.keys(data.individual_results[key]).forEach((key2) => {
                let years = Object.keys(data.individual_results[key][key2].success)
                const largest_year = Math.max(...years.map(key => parseInt(key, 10)));
                const final_success = data.individual_results[key][key2].success[largest_year] 
                success_2D += final_success
                num_years2D += 1
            })
        })
    }

    let avg_success1D = success_1D/num_years1D
    let avg_success2D = success_2D/num_years2D
    
    console.log(exploreType)
    return (
        <div className='flex flex-col gap-6 w-full'>
            <div className='flex item justify-between'>
                <p className="text-5xl">{`${exploreType} Exploration Results`}</p>
            </div>
            
            <div className="flex gap-3 bg-gray-100 rounded-lg p-6 shadow-md">
                <SuccessRateCircle final_success={exploreType == '1D' ? avg_success1D : avg_success2D} />
                <div className="flex flex-col p-6 justify-between">
                    <div className="flex flex-col gap-1">
                        <p className="text-xl">{`Parameter 1: ${data.param1}`}</p>
                        {data.param2 && <p className="text-xl">{`Parameter 2: ${data.param2}`}</p>}
                    </div>
                    <div className="flex flex-col gap-1">
                        <p className="text-xl">{`Average Final Probability of Succcess: ${exploreType == '1D' ? avg_success1D : avg_success2D}%`}</p>
                    </div>
                </div>
            </div>
            
            <div className='flex item justify-between'>
                <p className="text-3xl">Visualized Charts</p>
            </div>
            {exploreType == '1D' && 
                <div className="flex flex-col gap-3 w-full">
                    <ChartCollapse base={<div>Single Value Charts</div>}>
                        <Section4Chart1DContainer data={data} />
                    </ChartCollapse>
                    
                    <ChartCollapse base={<div>Multi Line Chart</div>}>
                        <MultiLine data={data} />
                    </ChartCollapse>
                    
                    <ChartCollapse base={<div>Final Value Line Chart</div>}>
                        <LineChart data={data} />
                    </ChartCollapse>
                </div>
            }
            {exploreType == '2D' && 
                <div className="flex flex-col gap-3 w-full">
                    <ChartCollapse base={<div>Single Value Charts</div>}>
                        <Section4Chart2DContainer data={data} />
                    </ChartCollapse>
                    <ChartCollapse base={<div>Surface Plot</div>}>
                        <SurfacePlot data={data} />
                    </ChartCollapse>
                    <ChartCollapse base={<div>Contour Plot</div>}>
                        <ContourPlot data={data} />
                    </ChartCollapse>
                </div>
            }
        </div>
    );
};

export default ExplorationPage;