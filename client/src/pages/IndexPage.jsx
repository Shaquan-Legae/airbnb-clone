import { useEffect, useState } from "react";
import axios from "axios";

function getPhotoUrl(photo) {
    return `http://localhost:4000/uploads/${String(photo).split(/[\\/]/).pop()}`;
}

function formatPrice(price) {
    if (price === undefined || price === null || price === "") {
        return "No price set";
    }

    return `$${price}`;
}

export default function IndexPage() {
    const [places, setPlaces] = useState([]);
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        setIsLoading(true);

        axios.get("/places")
            .then(({ data }) => setPlaces(data))
            .catch((err) => {
                console.error("Failed to fetch places:", err);
            })
            .finally(() => setIsLoading(false));
    }, []);

    return (
        <div className="mx-auto max-w-6xl px-4 py-8">
            <h1 className="text-3xl font-semibold">Places to stay</h1>
            <p className="mt-2 text-gray-500">Browse the latest accommodations shared by hosts.</p>

            {isLoading && <p className="mt-8 text-center text-gray-500">Loading places...</p>}

            {!isLoading && places.length === 0 && (
                <p className="mt-8 text-center text-gray-500">No places available yet.</p>
            )}

            {!isLoading && places.length > 0 && (
                <div className="mt-8 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                    {places.map((place) => (
                        <div key={place._id} className="overflow-hidden rounded-3xl border border-gray-200 bg-white shadow-sm">
                            <img
                                src={getPhotoUrl(place.photos?.[0])}
                                alt={place.title}
                                className="h-48 w-full object-cover"
                            />
                            <div className="p-4">
                                <h2 className="font-semibold text-gray-900">{place.title}</h2>
                                <p className="mt-1 text-sm text-gray-500">{place.address}</p>
                                <p className="mt-3 text-sm text-gray-700">{formatPrice(place.price)}</p>
                                <p className="mt-1 text-sm text-gray-500">Max guests: {place.maxGuests || 1}</p>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}