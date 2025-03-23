import React from 'react';

interface AddButtonProps {
    text: string;
}

const AddButton: React.FC<AddButtonProps> = ({ text }) => {
    return (
        <div className="bg-white shadow-md rounded-lg py-2 flex justify-center flex-1 gap-3 w-full">
            <img src='add.png' className="w-7 h-7"/>
            <p className="text-md">{text}</p>
        </div>
    );
};

export default AddButton;