export default function Loading() {
    return (
        <div className="p-6 max-w-xl mx-auto">
            <div className="animate-pulse space-y-4">
                <div className="h-8 bg-gray-200 rounded w-1/2 mb-2" />
                <div className="h-4 bg-gray-200 rounded mb-4" />
                <div className="h-10 bg-gray-200 rounded mb-2" />
                <div className="h-10 bg-gray-200 rounded w-1/3" />
            </div>
        </div>
    );
} 