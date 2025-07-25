import {
    DndContext, 
    closestCenter,
    KeyboardSensor,
    PointerSensor,
    useSensor,
    useSensors,
} from '@dnd-kit/core';
import {
    arrayMove,
    SortableContext,
    sortableKeyboardCoordinates,
    verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import {useSortable} from '@dnd-kit/sortable';
import {CSS} from '@dnd-kit/utilities';
import Popup from "reactjs-popup";
import { useState } from 'react';
  
export default function Roth({rothData,setRothData,investments,setDirty}) {
    const [ deleting, setDeleting ] = useState(false)
    const sensors = useSensors(
        useSensor(PointerSensor),
        useSensor(KeyboardSensor, {
        coordinateGetter: sortableKeyboardCoordinates,
        })
    );

    const handleDragEnd = (event) => {
        const {active, over} = event;
        
        if (active.id !== over.id) {
            const oldIndex = rothData.roth_conversion_strat.findIndex((inv) => inv.id === active.id)
            const newIndex = rothData.roth_conversion_strat.findIndex((inv) => inv.id === over.id)
            setRothData({
                ...rothData,
                roth_conversion_strat: arrayMove(rothData.roth_conversion_strat,oldIndex,newIndex)
            })
            setDirty(true)
        }
    }

    const handleAddInvestment = (investment) => {
        setRothData({
            ...rothData,
            roth_conversion_strat: [...rothData.roth_conversion_strat,investment]
        })
        setDirty(true)
    }

    const handleRemoveInvestment = (event,invest_id) => {
        console.log(invest_id)
        event.stopPropagation();
        setRothData({
            ...rothData,
            roth_conversion_strat: rothData.roth_conversion_strat.filter(inv => inv.id !== invest_id)
        })
        setDirty(true)
    }

    const canAdd = investments.filter((inv) => {
        return (inv.tax_status === "pre-tax" && !rothData.roth_conversion_strat.some(roth_inv => roth_inv.id === inv.id))
    })

    return (
        <div className="bg-white shadow-md rounded-lg p-6 flex flex-col flex-1 gap-3 w-full h-110" style={{"opacity":rothData.roth_optimizer.is_enable ? 1.0 : 0.2}}>
            <h1 className="text-xl font-bold">Roth Conversion Strategy</h1>
            {rothData.roth_optimizer.is_enable && <div className="flex gap-4">
                <Popup
                trigger={<div className="bg-white shadow-md rounded-lg p-2 flex flex-col gap-3 w-80 hover:bg-sky-100" style={rothData.roth_optimizer.is_enable ? {"opacity":1.0,"cursor":"pointer"} : {"opacity":0.2,"pointerEvents":"none"}}>
                            + Add an Investment to the Strategy
                        </div>}
                disabled={!rothData.roth_optimizer.is_enable}
                position="bottom center"
                on="click"
                closeOnDocumentClick
                contentStyle={{ padding: '0px', border: 'none', width: "320px"}}
                arrow={false}
                >
                    <div className="max-h-90 overflow-y-scroll">
                        {canAdd.length >= 1 && canAdd.map((inv) => (   
                            <div className="flex flex-col h-8 p-1 hover:bg-sky-100 " key={inv.id} onClick={() => handleAddInvestment(inv)}>
                                {inv.invest_type.name}
                                
                            </div>
                        ))}
                        {canAdd.length === 0 && <div className="flex flex-col p-1 w-70 h-8">
                                No available investments!
                            </div>}
                    </div>
                </Popup>
                <button className={"text-white px-4 py-1 rounded-md hover:opacity-80 cursor-pointer disabled:opacity-20 disabled:cursor-default w-20 " + (deleting ? "bg-blue-600" : "bg-red-600")} onClick={() => setDeleting(!deleting)}>{deleting ? "Sort" : "Delete"}</button>
            </div>}
            
            {rothData.roth_optimizer.is_enable &&
            <div className='flex flex-col gap-3 overflow-y-scroll h-70'>
                <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
                    <SortableContext 
                    items={rothData.roth_conversion_strat}
                    strategy={verticalListSortingStrategy}
                    >
                        {rothData.roth_conversion_strat.map((inv,i) => <SortableItem key={inv.id} inv={inv} ind={i} handleRemoveInvestment={handleRemoveInvestment} deleting={deleting}/>)}
                    </SortableContext>
                </DndContext>
            </div>}
            
        </div>
    );
}

const SortableItem = ({inv,ind,handleRemoveInvestment,deleting}) => {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
    } = useSortable({id: inv.id,disabled:deleting});

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
    };

    return (
        <div className="cursor-pointer flex items-center bg-white shadow-md rounded-lg p-6 w-120 h-15 hover:bg-sky-100" ref={setNodeRef} style={style} {...attributes} {...listeners}>
            <h1 className="text-3xl font-bold mr-10">{ind+1}.</h1>
            <div className="w-100 whitespace-nowrap overflow-ellipsis overflow-hidden">{inv.invest_type.name}</div>
            {deleting && <button className="rounded-full p-2 h-10 w-10 hover:bg-red-300 cursor-pointer" onClick={(event) => handleRemoveInvestment(event,inv.id)}>x</button>}
        </div>
    );
}