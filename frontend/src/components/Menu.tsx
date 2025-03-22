import React from 'react';
import Logout from './Logout';

const Menu: React.FC = () => {
    return (
        <div className="flex flex-col w-64 h-full transition-all duration-2000 ease-in-out">
            <h1 className="text-center font-bold pt-4">Discover</h1>
            <div className="flex flex-col justify-between h-full p-4 pt-2">
                <div>
                    <MenuItem imagePath="./menu_icons/scenario.png" text="Scenarios" />
                    <MenuItem imagePath="./menu_icons/explore.png" text="Exploration" />
                    <MenuItem imagePath="./menu_icons/simulation.png" text="Simulation Logs" />
                    <MenuItem imagePath="./menu_icons/share.png" text="Shared" />
                    <MenuItem imagePath="./menu_icons/user.png" text="Personal" />
                </div>
                <Logout />
            </div>
        </div>
    );
};

const MenuItem: React.FC<{ imagePath: string; text: string }> = ({ imagePath, text }) => {
    return (
        <div className="flex items-center gap-2 p-2 hover:bg-gray-300 cursor-pointer">
            <img className="w-6 h-6" src={imagePath} alt={text} />
            <span>{text}</span>
        </div>
    );
};

export default Menu;