import React from 'react';

const Header: React.FC<{ userInfo: any, toggleMenu: () => void }> = ({ userInfo, toggleMenu }) => {
    return (
        <div className='flex w-100'>
            <div className="flex w-64 items-center gap-2 p-4 hover:bg-gray-300 cursor-pointer" onClick={toggleMenu}>
                <img className="w-6 h-6" src='./menu_icons/menu.png' alt='menu icon' />
                <div className="flex-1 flex justify-center items-center">
                    <span>{userInfo?.given_name ? `${userInfo.given_name} ${userInfo.family_name || ""}` : "Loading..."}</span>
                </div>
            </div>
        </div>
    );
};

export default Header;