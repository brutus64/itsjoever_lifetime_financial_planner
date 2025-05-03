import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
// import MultiLine from './Charts/MultiLine1D';
// import LineChart from './Charts/LineChart1D';
import SurfacePlotContainer from './Charts/SurfacePlot2D';
import ContourPlotContainer from './Charts/ContourPlot2D';

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
                    {/* <MultiLine data={data} />
                    <LineChart data={data} /> */}
                </>
            }
            {exploreType == '2D' && 
                <>
<<<<<<< HEAD
                    <SurfacePlotContainer data={data} />
                    <ContourPlotContainer data={data}/>
=======
                    {/* <SurfacePlot data={data}/>
                    <ContourPlot data={data}/> */}
>>>>>>> 9b764575ea06fb9ee2f498d94284f85c6e8fa3f4
                </>
            }
        </div>
    );
};

export default ExplorationPage;