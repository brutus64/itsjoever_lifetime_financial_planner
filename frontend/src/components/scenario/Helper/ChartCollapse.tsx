import { useState } from "react";

const ChartCollapse = ({children,base}) => {
    const [ open, setOpen ] = useState(false)
    return (
        <div className="w-full">
            <div className={`bg-white shadow-md rounded-lg flex items-center pl-4 gap-3 h-20 hover:bg-sky-100 cursor-pointer`} style={{ backgroundColor: "#AAC0AA" }} onClick={() => setOpen(!open)}>{base}</div>
            <div className={`mx-1 px-2 border-gray-100 rounded-b-xl transition-all duration-500 ease-out ${
            open ? "overflow-visible py-1 border-b-2 opacity-100" : "h-0 overflow-hidden opacity-0"}`}>{children}</div>
        </div>
    )
}

export default ChartCollapse;