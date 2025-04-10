import React from 'react';
import Logout from './Logout';
import { useNavigate } from 'react-router-dom';

const Menu: React.FC = () => {
    return (
        <div className="w-50 h-full flex flex-col transition-all duration-2000 ease-in-out shadow-lg">
            <h1 className="text-center font-bold pt-4">Discover</h1>
            <div className="flex flex-col justify-between flex-1 p-4 pt-2">
            <div className="flex flex-col">
                <MenuItem imagePath="/menu_icons/scenario.png" text="Scenarios" router='scenario'/>
                <MenuItem imagePath="/menu_icons/explore.png" text="Exploration" router='exploration'/>
                <MenuItem imagePath="/menu_icons/simulation.png" text="Simulation Logs" router='simulation'/>
                <MenuItem imagePath="/menu_icons/share.png" text="Shared" router='shared'/>
                <MenuItem imagePath="/menu_icons/user.png" text="Personal" router='profile' />
            </div>
            
            <Logout />
            </div>
        </div>
    );
};

const MenuItem: React.FC<{ imagePath: string; text: string, router: string }> = ({ imagePath, text, router }) => {
    const navigate = useNavigate();

    const handleNavigation = () => {
        navigate(router);
    };

    return (
        <div
            className="flex items-center gap-2 p-2 hover:bg-gray-300 cursor-pointer"
            onClick={handleNavigation}
        >
            <img className="w-6 h-6" src={imagePath} alt={text} />
            <span>{text}</span>
        </div>
    );
};

export default Menu;