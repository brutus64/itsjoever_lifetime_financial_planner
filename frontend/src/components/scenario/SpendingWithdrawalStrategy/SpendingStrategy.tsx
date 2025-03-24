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
import Popup from "reactjs-popup"
  
export default function SpendingStrategy({formData,setFormData}) {
    const sensors = useSensors(
        useSensor(PointerSensor),
        useSensor(KeyboardSensor, {
        coordinateGetter: sortableKeyboardCoordinates,
        })
    );

    const handleDragEnd = (event) => {
        const {active, over} = event;
        
        if (active.id !== over.id) {
            const oldIndex = formData.spending_strat.indexOf(active.id);
            const newIndex = formData.spending_strat.indexOf(over.id);
            setFormData({
                ...formData,
                spending_strat: arrayMove(formData.spending_strat,oldIndex,newIndex)
            })
        }
    }

    const handleAddExpense = (expense) => {
        setFormData({
            ...formData,
            spending_strat: [...formData.spending_strat,expense]
        })
    }

    const canAdd = formData.event_series.filter((es) => {
        return !formData.spending_strat.includes(es.investment_type)
    })

    return (
        <div className="bg-white shadow-md rounded-lg p-6 flex flex-col flex-1 gap-3 w-full h-130">
            <h1 className="text-xl font-bold">Spending Strategy</h1>

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
                    {canAdd.length >= 1 && canAdd.map((inv) => (   
                        <div className="flex flex-col h-8 p-1 hover:bg-sky-100 " key={inv.investment_type} onClick={() => handleAddExpense(inv.investment_type)}>
                            {inv.investment_type}
                            
                        </div>
                    ))}
                    {canAdd.length === 0 && <div className="flex flex-col p-1 w-70 h-8">
                            No available event series!
                        </div>}
                </div>
            </Popup>
            <div className='flex flex-col gap-3 overflow-y-scroll h-90'>
                <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
                    <SortableContext 
                    items={formData.spending_strat}
                    strategy={verticalListSortingStrategy}
                    >
                        {formData.spending_strat.map((inv,i) => <SortableItem key={inv} inv={inv} ind={i}/>)}
                    </SortableContext>
                </DndContext>
            </div>
            
        </div>
    );
}

const SortableItem = ({inv,ind}) => {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
    } = useSortable({id: inv});

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
    };

    return (
        <div className="cursor-pointer flex items-center bg-white shadow-md rounded-lg p-6 w-120 h-15 hover:bg-sky-100" ref={setNodeRef} style={style} {...attributes} {...listeners}>
            <h1 className="text-3xl font-bold mr-10">{ind+1}.</h1>
            <div className="w-100 whitespace-nowrap overflow-ellipsis overflow-hidden">{inv}</div>
            
        </div>
    );
}