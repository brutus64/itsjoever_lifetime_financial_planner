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
  
export default function SpendingStrategy({spendingStrat,setSpendingStrat,eventSeries,setDirty}) {
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
            const oldIndex = spendingStrat.findIndex((es) => es.id === active.id)
            const newIndex = spendingStrat.findIndex((es) => es.id === over.id)
            setSpendingStrat(arrayMove(spendingStrat,oldIndex,newIndex))
            setDirty(true)
        }
    }

    const handleAddExpense = (expense) => {
        setSpendingStrat([...spendingStrat,expense])
        setDirty(true)
    }

    const handleRemoveExpense = (event,es_id) => {
        console.log(es_id)
        event.stopPropagation();
        setSpendingStrat(spendingStrat.filter(es => es.id !== es_id))
        setDirty(true)
    }

    const canAdd = eventSeries.filter((es) => {
        return es.type === "expense" && es.details.is_discretionary && !spendingStrat.some(spend_es => spend_es.id == es.id)
    })

    return (
        <div className="bg-white shadow-md rounded-lg p-6 flex flex-col flex-1 gap-3 w-full h-130">
            <h1 className="text-xl font-bold">Spending Strategy</h1>
            <div className="flex gap-4">
                <Popup
                trigger={<div className="bg-white shadow-md rounded-lg p-2 flex flex-col gap-3 w-80 hover:bg-sky-100 cursor-pointer">
                            + Add an Event Series to the Strategy
                        </div>}
                position="bottom center"
                on="click"
                closeOnDocumentClick
                contentStyle={{ padding: '0px', border: 'none', width: "320px"}}
                arrow={false}
                >
                    <div className="max-h-90 overflow-y-scroll">
                        {canAdd.length >= 1 && canAdd.map((es) => (   
                            <div className="flex flex-col h-8 p-1 hover:bg-sky-100 " key={es.id} onClick={() => handleAddExpense(es)}>
                                {es.name}
                                
                            </div>
                        ))}
                        {canAdd.length === 0 && <div className="flex flex-col p-1 w-70 h-8">
                                No available event series!
                            </div>}
                    </div>
                </Popup>
                <button className={"text-white px-4 py-1 rounded-md hover:opacity-80 cursor-pointer disabled:opacity-20 disabled:cursor-default w-20 " + (deleting ? "bg-blue-600" : "bg-red-600")} onClick={() => setDeleting(!deleting)}>{deleting ? "Sort" : "Delete"}</button>
            </div>
            <div className='flex flex-col gap-3 overflow-y-scroll h-90'>
                <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
                    <SortableContext 
                    items={spendingStrat}
                    strategy={verticalListSortingStrategy}
                    >
                        {spendingStrat.map((es,i) => <SortableItem key={es.id} es={es} ind={i} handleRemoveExpense={handleRemoveExpense} deleting={deleting}/>)}
                    </SortableContext>
                </DndContext>
            </div>
            
        </div>
    );
}

const SortableItem = ({es,ind,handleRemoveExpense,deleting}) => {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
    } = useSortable({id: es.id,disabled:deleting});

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
    };

    return (
        <div className="cursor-pointer flex items-center bg-white shadow-md rounded-lg p-6 w-120 h-15 hover:bg-sky-100" ref={setNodeRef} style={style} {...attributes} {...listeners}>
            <h1 className="text-3xl font-bold mr-10">{ind+1}.</h1>
            <div className="w-100 whitespace-nowrap overflow-ellipsis overflow-hidden">{es.name}</div>
            {deleting && <button className="rounded-full p-2 h-10 w-10 hover:bg-red-300 cursor-pointer" onClick={(event) => handleRemoveExpense(event,es.id)}>x</button>}
        </div>
    );
}