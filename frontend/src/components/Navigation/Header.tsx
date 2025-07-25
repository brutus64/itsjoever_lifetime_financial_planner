import React from 'react';
import { useAuth } from './AuthContext';

const Header: React.FC<{ toggleMenu: () => void }> = ({ toggleMenu }) => {
    const { isGuest, isLoggedIn, userInfo } = useAuth();
    console.log(userInfo)
    console.log(isLoggedIn)
    return (
        <div className='flex justify-between bg-white shadow-md'>
            <div className="flex items-center w-50 gap-5 p-4 hover:bg-gray-300 cursor-pointer" onClick={toggleMenu}>
                <img className="w-6 h-6" src='/menu_icons/menu.png' alt='menu icon' />
                <div className="flex-1 flex items-center">
                    <span>{(isLoggedIn && isGuest) ? "Guest" : userInfo?.name}</span>
                </div>
            </div>
        </div>
    );
};

export default Header;