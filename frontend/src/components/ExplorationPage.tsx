import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import MultiLine from './Charts/MultiLine1D';
import LineChart from './Charts/LineChart1D';
import SurfacePlot from './Charts/SurfacePlot2D';
import ContourPlot from './Charts/ContourPlot2D';

const ExplorationPage: React.FC = () => {
    const location = useLocation();
    const [data, setData] = useState(null);
    const [exploreType, setExploreType] = useState<string | null>(null);
    useEffect(() => {
        if (location.state?.data){
            setData(location.state.data);
            const is2D = 'param1' in location.state.data && 'param2' in location.state.data;
            if (is2D)
                setExploreType('2D');
            else
                setExploreType('1D');
        }
    },[location.state])
    console.log(data)
    
    return (
        <div className='flex flex-col gap-6'>
            <div className='flex item justify-between'>
                <p className="text-5xl">Exploration</p>
                <div className='flex '>

                </div>
            </div>
            {exploreType == '1D' && 
                <>
                    <MultiLine data={data} />
                    <LineChart data={data} />
                </>
            }
            {exploreType == '2D' && 
                <>
                    <SurfacePlot data={data}/>
                    <ContourPlot data={data}/>
                </>
            }
        </div>
    );
};

export default ExplorationPage;