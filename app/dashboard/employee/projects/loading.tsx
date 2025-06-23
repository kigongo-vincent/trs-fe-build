export default function Loading() {
    return (
        <div className="p-6">
            <div className="animate-pulse space-y-4">
                <div className="h-8 bg-gray-200 rounded w-1/3 mb-4" />
                {[...Array(3)].map((_, i) => (
                    <div key={i} className="h-16 bg-gray-200 rounded" />
                ))}
            </div>
        </div>
    );
} 