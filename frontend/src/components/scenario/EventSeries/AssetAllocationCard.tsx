const AssetAllocationCard = ({ investment }) => {
    return (
        <div className="bg-white shadow-md rounded-lg p-4 flex flex-col w-full ">            
            <h1 className="text-md">{investment.investment_type} | {investment.tax_status}</h1>
            <h2 className="text-sm">${investment.value}</h2>
        </div>
    );
}

export default AssetAllocationCard;