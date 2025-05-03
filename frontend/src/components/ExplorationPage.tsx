import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import MultiLine from './Charts/MultiLine1D';
import LineChart from './Charts/LineChart1D';
import Section4Chart1DContainer from './Charts/Section4Chart1D';
import Section4Chart2DContainer from './Charts/Section4Chart2D';
import SurfacePlot from './Charts/SurfacePlot2D';
import ContourPlot from './Charts/ContourPlot2D';

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
    console.log(exploreType)
    return (
        <div className='flex flex-col gap-6'>
            <div className='flex item justify-between'>
                <p className="text-5xl">Exploration</p>
            </div>
            {exploreType == '1D' && 
                <>
                    <Section4Chart1DContainer data={data} />
                    <MultiLine data={data} />
                    <LineChart data={data} />
                </>
            }
            {exploreType == '2D' && 
                <>
                    <Section4Chart2DContainer data={data} />
                    <SurfacePlot data={data} />
                    <ContourPlot data={data}/>
                </>
            }
        </div>
    );
};

export default ExplorationPage;