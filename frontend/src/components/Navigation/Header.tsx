import React from 'react';

const Header: React.FC<{ userInfo: any, toggleMenu: () => void }> = ({ userInfo, toggleMenu }) => {
    return (
        <div className='flex justify-between bg-white shadow-md'>
            <div className="flex items-center w-50 gap-5 p-4 hover:bg-gray-300 cursor-pointer" onClick={toggleMenu}>
                <img className="w-6 h-6" src='/menu_icons/menu.png' alt='menu icon' />
                <div className="flex-1 flex items-center">
                    <span>{userInfo?.given_name ? `${userInfo.given_name} ${userInfo.family_name || ""}` : "Loading..."}</span>
                </div>
            </div>
            <div className='bg-black px-4  m-4 text-lg text-white rounded-md hover:bg-gray-800'>
                Share
            </div>
        </div>
    );
};

export default Header;