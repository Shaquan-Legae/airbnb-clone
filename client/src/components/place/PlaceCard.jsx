import { Link } from "react-router-dom";

function getPhotoUrl(photo) {
    if (!photo) {
        return "";
    }

    const filename = String(photo).split(/[\\/]/).pop();
    return `http://localhost:4000/uploads/${filename}`;
}

function formatPrice(price) {
    if (price === undefined || price === null || price === "") {
        return "R 0 per night";
    }

    return new Intl.NumberFormat("en-ZA", {
        style: "currency",
        currency: "ZAR",
        maximumFractionDigits: 0,
    }).format(price) + " per night";
}

export default function PlaceCard({
    place,
    showDelete = false,
    onDelete,
}) {
    const photoUrl = getPhotoUrl(place.coverPhoto || place.photos?.[0]);

    return (
        <div className="relative group">
            <Link
                to={`/account/places/${place._id}`}
                className="block overflow-hidden rounded-3xl border border-gray-200 bg-white shadow-sm transition duration-200 hover:-translate-y-0.5 hover:shadow-md"
            >
                <div className="h-52 w-full overflow-hidden bg-gray-100">
                    {photoUrl ? (
                        <img
                            src={photoUrl}
                            alt={place.title}
                            className="h-full w-full object-cover"
                        />
                    ) : (
                        <div className="flex h-full items-center justify-center text-sm text-gray-400">
                            No photo available
                        </div>
                    )}
                </div>

                <div className="p-4">
                    <h3 className="font-semibold text-gray-900 line-clamp-2">
                        {place.title}
                    </h3>

                    <p
                        className="mt-2 text-sm text-gray-600"
                        style={{
                            display: "-webkit-box",
                            WebkitLineClamp: 2,
                            WebkitBoxOrient: "vertical",
                            overflow: "hidden",
                        }}
                    >
                        {place.description || "No description provided."}
                    </p>

                    <p className="mt-3 text-sm text-gray-500">
                        {place.address}
                    </p>

                    <p className="mt-4 font-medium text-gray-900">
                        {formatPrice(place.price)}
                    </p>
                </div>
            </Link>

            {showDelete && (
                <button
                    type="button"
                    onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        onDelete(place._id);
                    }}
                    className="absolute top-3 right-3 rounded-full bg-red-600 px-4 py-2 text-sm font-medium text-white opacity-0 transition-opacity duration-200 group-hover:opacity-100 hover:bg-red-700"
                >
                    Delete
                </button>
            )}
        </div>
    );
}