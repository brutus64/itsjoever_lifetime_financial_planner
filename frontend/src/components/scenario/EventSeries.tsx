const EventSeries = ({ formData,setFormData }:any) => {
    return (
        <div className="flex flex-col gap-4 m-10">
            <div className="bg-white shadow-md rounded-lg p-6 flex flex-col gap-3 w-200">
                <h1 className="text-2xl font-bold">Event Series</h1>
                <p>An event series represents a sequence of annual events. Event series are categorized into four types: income, expense, invest, or rebalance. These events will last for a specified amount of years.</p>
            </div>
            <div className="flex flex-col gap-10">
                <div className="bg-white shadow-md rounded-lg p-6 flex justify-center flex-0 gap-3 w-fit">
                    <img src='add.png' className="w-7 h-7"/>
                    <p className="text-lg">Add an Event Series</p>
                </div>
                <div className="bg-white shadow-md rounded-lg p-6 flex flex-col flex-0 gap-3 w-fit">
                    <div>test</div>
                    <div>test</div>
                    <div>test</div>
                    <div>test</div>
                    <div>test</div>
                </div>
            </div>
        </div>
    )
}

export default EventSeries;