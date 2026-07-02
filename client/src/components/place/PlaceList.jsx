import PlaceCard from "./PlaceCard";

export default function PlaceList({
    places,
    showDelete = false,
    onDelete,
}) {
    if (places.length === 0) {
        return (
            <p className="text-center text-gray-500">
                You have not added any places yet.
            </p>
        );
    }

    return (
        <div className="grid gap-4 md:grid-cols-2">
            {places.map((place) => (
                <PlaceCard
                    key={place._id}
                    place={place}
                    showDelete={showDelete}
                    onDelete={onDelete}
                />
            ))}
        </div>
    );
}