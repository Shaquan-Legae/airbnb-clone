import { Link, useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import {
    WifiIcon,
    TvIcon,
    HeartIcon,
    TruckIcon,
    KeyIcon,
    HomeIcon,
    FireIcon,
    SunIcon,
    SparklesIcon,
    BoltIcon,
    BuildingOffice2Icon
} from "@heroicons/react/24/outline";
import PhotosUploader from "../components/PhotosUploader";
import axios from "axios";
import { Navigate } from "react-router-dom";

function getPhotoUrl(photo) {
    return `http://localhost:4000/uploads/${String(photo).split(/[\\/]/).pop()}`;
}

function formatPrice(price) {
    if (price === undefined || price === null || price === "") {
        return "No price set";
    }

    return `$${price}`;
}

export default function PlacesPage() {
    const { action } = useParams();

    const [title, setTitle] = useState("");
    const [address, setAddress] = useState("");
    const [description, setDescription] = useState("");
    const [perks, setPerks] = useState([]);
    const [extraInfo, setExtraInfo] = useState("");
    const [checkIn, setCheckIn] = useState("");
    const [checkOut, setCheckOut] = useState("");
    const [maxGuests, setMaxGuests] = useState(1);
    const [price, setPrice] = useState("");
    const [addedPhotos, setAddedPhotos] = useState([]);
    const [redirect, setRedirect] = useState('');
    const [places, setPlaces] = useState([]);
    const [isLoadingPlaces, setIsLoadingPlaces] = useState(false);
    const [isLoadingPlace, setIsLoadingPlace] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [formError, setFormError] = useState("");
    const [placesError, setPlacesError] = useState("");

    const isFormMode = action === "new" || Boolean(action);

    function inputHeader(text, description) {
        return (
            <div className="mt-4">
                <h2 className="text-xl font-semibold">{text}</h2>
                {description && (
                    <p className="text-gray-500 text-sm">{description}</p>
                )}
            </div>
        );
    }

    useEffect(() => {
        if (!action) {
            setIsLoadingPlaces(true);
            setPlacesError("");

            axios.get("/user-places")
                .then(({ data }) => {
                    setPlaces(data);
                })
                .catch((err) => {
                    console.error("Failed to fetch places:", err);
                    setPlacesError("Could not load your places right now.");
                })
                .finally(() => {
                    setIsLoadingPlaces(false);
                });

            return;
        }

        if (action === "new") {
            setTitle("");
            setAddress("");
            setDescription("");
            setPerks([]);
            setExtraInfo("");
            setCheckIn("");
            setCheckOut("");
            setMaxGuests(1);
            setPrice("");
            setAddedPhotos([]);
            setFormError("");
            return;
        }

        setIsLoadingPlace(true);
        setFormError("");

        axios.get(`/places/${action}`)
            .then(({ data }) => {
                setTitle(data.title || data.name || "");
                setAddress(data.address || "");
                setAddedPhotos(data.photos || []);
                setDescription(data.description || "");
                setPerks(data.perks || []);
                setExtraInfo(data.extraInfo || "");
                setCheckIn(data.checkIn || "");
                setCheckOut(data.checkOut || "");
                setMaxGuests(data.maxGuests || 1);
                setPrice(data.price ?? "");
            })
            .catch((err) => {
                console.error("Failed to fetch place:", err);
                setFormError("Could not load this place right now.");
            })
            .finally(() => {
                setIsLoadingPlace(false);
            });
    }, [action]);

    async function savePlace(ev) {
        ev.preventDefault();

        if (isSubmitting) {
            return;
        }

        setIsSubmitting(true);
        setFormError("");

        const placeData = {
            title,
            address,
            photos: addedPhotos,
            description,
            perks,
            extraInfo,
            checkIn,
            checkOut,
            maxGuests: Number(maxGuests),
            price: price === "" ? undefined : Number(price),
        };

        try {
            if (action && action !== "new") {
                await axios.put(`/places/${action}`, placeData);
            } else {
                await axios.post('/places', placeData);
            }

            setRedirect('/account/places');
        } catch (err) {
            console.error("Save place failed:", err);
            setFormError(err.response?.data?.error || "Could not save this place. Please try again.");
        } finally {
            setIsSubmitting(false);
        }
    }

    if (redirect) {
        return <Navigate to={redirect} />;
    }

    return (
        <div>
            {!action && (
                <div className="text-center">
                    <Link
                        to="/account/places/new"
                        className="bg-primary text-white py-2 px-6 rounded-full inline-flex items-center gap-2 mt-5"
                    >
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            fill="none"
                            viewBox="0 0 24 24"
                            strokeWidth={1.5}
                            stroke="currentColor"
                            className="size-6"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                d="M12 4.5v15m7.5-7.5h-15"
                            />
                        </svg>
                        Add New Place
                    </Link>
                </div>
            )}

            {!action && (
                <div className="max-w-4xl mx-auto mt-8 px-4">
                    {isLoadingPlaces && <p className="text-center text-gray-500">Loading your places...</p>}

                    {!isLoadingPlaces && placesError && (
                        <p className="text-center text-red-600">{placesError}</p>
                    )}

                    {!isLoadingPlaces && !placesError && places.length === 0 && (
                        <p className="text-center text-gray-500">You have not added any places yet.</p>
                    )}

                    {!isLoadingPlaces && !placesError && places.length > 0 && (
                        <div className="grid gap-4 md:grid-cols-2">
                            {places.map((place) => (
                                <Link
                                    key={place._id}
                                    to={`/account/places/${place._id}`}
                                    className="overflow-hidden rounded-3xl border border-gray-200 bg-white shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
                                >
                                    <img
                                        src={getPhotoUrl(place.photos?.[0])}
                                        alt={place.title}
                                        className="h-40 w-full object-cover"
                                    />
                                    <div className="p-4">
                                        <h3 className="font-semibold text-gray-900">{place.title}</h3>
                                        <p className="mt-1 text-sm text-gray-500">{place.address}</p>
                                        <p className="mt-3 font-medium text-gray-900">{formatPrice(place.price)}</p>
                                    </div>
                                </Link>
                            ))}
                        </div>
                    )}
                </div>
            )}

            {isFormMode && (
                <div className="max-w-4xl mx-auto">
                    {isLoadingPlace && (
                        <p className="py-8 text-center text-gray-500">Loading place details...</p>
                    )}

                    {!isLoadingPlace && (
                        <form onSubmit={savePlace} className="space-y-8">
                            {inputHeader(
                                "Title",
                                "Title for your place. Should be short and catchy."
                            )}
                        <input
                            type="text"
                            placeholder="Title"
                            value={title}
                                onChange={(ev) => setTitle(ev.target.value)}
                            className="w-full p-3 border rounded-2xl"
                        />

                            {inputHeader(
                                "Address",
                                "Address of this place."
                            )}
                        <input
                            type="text"
                            placeholder="Address"
                            value={address}
                                onChange={(ev) => setAddress(ev.target.value)}
                            className="w-full p-3 border rounded-2xl"
                        />

                            {inputHeader(
                                "Photos",
                                "Add photos using a URL or upload them."
                            )}

                            <PhotosUploader
                                photos={addedPhotos}
                                setPhotos={setAddedPhotos}
                            />

                            {inputHeader(
                                "Description",
                                "Describe your place."
                            )}
                        <textarea
                            value={description}
                                onChange={(ev) => setDescription(ev.target.value)}
                            className="w-full p-3 border rounded-2xl h-32"
                            placeholder="Describe your amazing place..."
                        />

                            {inputHeader(
                                "Perks",
                                "Select all the perks of your place."
                            )}

                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mt-2">
                            {[
                                { name: "wifi", icon: WifiIcon, label: "WiFi" },
                                { name: "tv", icon: TvIcon, label: "TV" },
                                { name: "pets", icon: HeartIcon, label: "Pets Allowed" },
                                { name: "free_parking", icon: TruckIcon, label: "Free Parking" },
                                { name: "private_entrance", icon: KeyIcon, label: "Private Entrance" },
                                { name: "kitchen", icon: HomeIcon, label: "Kitchen" },
                                { name: "air_conditioning", icon: BoltIcon, label: "Air Conditioning" },
                                { name: "heating", icon: FireIcon, label: "Heating" },
                                { name: "pool", icon: SunIcon, label: "Pool" },
                                { name: "hot_tub", icon: SparklesIcon, label: "Hot Tub" },
                                { name: "gym", icon: BuildingOffice2Icon, label: "Gym" },
                            ].map(({ name, icon: Icon, label }) => (
                                <label
                                    key={name}
                                    className="border p-4 rounded-2xl flex items-center gap-3 cursor-pointer hover:bg-gray-50 transition"
                                >
                                    <input
                                        type="checkbox"
                                        name={name}
                                        checked={perks.includes(name)}
                                        className="w-5 h-5"
                                        onChange={(ev) => {
                                            setPerks((prev) => {
                                                if (ev.target.checked) {
                                                    return prev.includes(name) ? prev : [...prev, name];
                                                }

                                                return prev.filter((perk) => perk !== name);
                                            });
                                        }}
                                    />
                                    <Icon className="w-6 h-6" />
                                    <span>{label}</span>
                                </label>
                            ))}
                        </div>

                            {inputHeader(
                                "Extra Info",
                                "House rules, check-in instructions or anything guests should know."
                            )}

                        <textarea
                            value={extraInfo}
                                onChange={(ev) => setExtraInfo(ev.target.value)}
                            className="w-full p-3 border rounded-2xl h-32"
                            placeholder="Additional information..."
                        />

                            {inputHeader(
                                "Check-in & Check-out Times",
                                "Set check-in time, check-out time and maximum number of guests."
                            )}

                            <div className="grid sm:grid-cols-4 gap-4">
                            <div>
                                <input
                                    type="text"
                                    placeholder="14:00"
                                    value={checkIn}
                                        onChange={(ev) => setCheckIn(ev.target.value)}
                                    className="w-full p-3 border rounded-2xl"
                                />
                                    <p className="text-xs text-gray-500 mt-1">
                                        Check-in time
                                    </p>
                            </div>

                            <div>
                                <input
                                    type="text"
                                    placeholder="11:00"
                                    value={checkOut}
                                        onChange={(ev) => setCheckOut(ev.target.value)}
                                    className="w-full p-3 border rounded-2xl"
                                />
                                    <p className="text-xs text-gray-500 mt-1">
                                        Check-out time
                                    </p>
                            </div>

                            <div>
                                <input
                                    type="number"
                                    placeholder="4"
                                    value={maxGuests}
                                        onChange={(ev) => setMaxGuests(ev.target.value)}
                                        className="w-full p-3 border rounded-2xl"
                                    />
                                    <p className="text-xs text-gray-500 mt-1">
                                        Max guests
                                    </p>
                                </div>

                                <div>
                                    <input
                                        type="number"
                                        placeholder="100"
                                        value={price}
                                        onChange={(ev) => setPrice(ev.target.value)}
                                    className="w-full p-3 border rounded-2xl"
                                />
                                    <p className="text-xs text-gray-500 mt-1">
                                        Price
                                    </p>
                                </div>
                        </div>

                            {formError && (
                                <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                                    {formError}
                                </div>
                            )}

                        <button
                            type="submit"
                                disabled={isSubmitting}
                                className="bg-primary text-white w-full rounded-2xl py-3 text-lg font-medium hover:bg-primary/90 transition disabled:cursor-not-allowed disabled:opacity-70"
                        >
                                {isSubmitting ? "Saving..." : "Save"}
                        </button>
                    </form>
                    )}
                </div>
            )}
        </div>
    );
}
