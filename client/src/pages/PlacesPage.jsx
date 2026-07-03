import { Link, Navigate, useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import axios from "axios";
import PlaceForm from "../components/place/PlaceForm";
import PlaceLoading from "../components/place/PlaceLoading";
import PlaceError from "../components/place/PlaceError";
import PlaceList from "../components/place/PlaceList";

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

    const [redirect, setRedirect] = useState("");

    const [places, setPlaces] = useState([]);
    const [placesState, setPlacesState] = useState("loading");

    const [isLoadingPlace, setIsLoadingPlace] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [formError, setFormError] = useState("");

    const isFormMode = action === "new" || Boolean(action);

    async function loadPlaces(showLoading = true) {
        if (showLoading) {
            await Promise.resolve();
            setPlacesState("loading");
        }

        try {
            const { data } = await axios.get("/places");
            const nextPlaces = Array.isArray(data) ? data : [];

            setPlaces(nextPlaces);
            setPlacesState(nextPlaces.length ? "success" : "empty");
        } catch (err) {
            console.error("Failed to fetch places:", err);
            setPlaces([]);
            setPlacesState("failure");
        }
    }

    async function deletePlace(id) {
        const confirmed = window.confirm(
            "Are you sure you want to delete this accommodation?"
        );

        if (!confirmed) return;

        try {
            const { status } = await axios.delete(`/places/${id}`);

            if (status !== 200) {
                throw new Error("Delete failed");
            }

            setPlaces((prev) => prev.filter((place) => place._id !== id));
            await loadPlaces(false);
        } catch (err) {
            console.error("Delete failed:", err);
            alert("Could not delete place.");
        }
    }

    useEffect(() => {
        document.title = "My Accommodations • Airbnb";
        let isMounted = true;

        const timeoutId = window.setTimeout(() => {
            if (!action) {
                loadPlaces();
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

            async function fetchPlace() {
                setIsLoadingPlace(true);
                setFormError("");

                try {
                    const { data } = await axios.get(`/places/${action}`);

                    if (!isMounted) return;

                    setTitle(data.title || "");
                    setAddress(data.address || "");
                    setAddedPhotos(data.photos || []);
                    setDescription(data.description || "");
                    setPerks(data.perks || []);
                    setExtraInfo(data.extraInfo || "");
                    setCheckIn(data.checkIn || "");
                    setCheckOut(data.checkOut || "");
                    setMaxGuests(data.maxGuests || 1);
                    setPrice(data.price ?? "");
                } catch (err) {
                    console.error(err);

                    if (isMounted) {
                        setFormError("Could not load this place.");
                    }
                } finally {
                    if (isMounted) {
                        setIsLoadingPlace(false);
                    }
                }
            }

            fetchPlace();
        }, 0);

        return () => {
            isMounted = false;
            window.clearTimeout(timeoutId);
        };
    }, [action]);

    function handlePerkChange(name, checked) {
        setPerks(prev => {
            if (checked) {
                return prev.includes(name) ? prev : [...prev, name];
            }

            return prev.filter(perk => perk !== name);
        });
    }

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

                await loadPlaces();

                setRedirect("/account/places");
                return;
            }

            await axios.post("/places", placeData);

            await loadPlaces();

            setRedirect("/account/places");
        } catch (err) {
            console.error("Save place failed:", err);
            setFormError(
                err.response?.data?.error ||
                "Could not save this place. Please try again."
            );
        } finally {
            setIsSubmitting(false);
        }
    }

    if (redirect) {
        return <Navigate to={redirect} replace />;
    }

    return (
        <div>
            <div className="text-center">
                <Link
                    to="/account/places/new"
                    className="mt-5 inline-flex items-center gap-2 rounded-full bg-primary px-6 py-2 text-white"
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

            {!action && (
                <div className="mx-auto mt-8 max-w-4xl px-4">
                    {placesState === "loading" && (
                        <PlaceLoading message="Loading your places..." />
                    )}

                    {placesState === "failure" && (
                        <PlaceError message="Could not load your places." />
                    )}

                    {(placesState === "success" ||
                        placesState === "empty") && (
                            <PlaceList
                                places={places}
                                showDelete={true}
                                onDelete={deletePlace}
                            />
                        )}
                </div>
            )}

            {isFormMode && (
                <div className="mx-auto max-w-4xl">
                    {isLoadingPlace ? (
                        <PlaceLoading message="Loading place..." />
                    ) : (
                        <PlaceForm
                            title={title}
                            address={address}
                            description={description}
                            perks={perks}
                            extraInfo={extraInfo}
                            checkIn={checkIn}
                            checkOut={checkOut}
                            maxGuests={maxGuests}
                            price={price}
                            addedPhotos={addedPhotos}
                            setAddedPhotos={setAddedPhotos}
                            onTitleChange={(e) => setTitle(e.target.value)}
                            onAddressChange={(e) => setAddress(e.target.value)}
                            onDescriptionChange={(e) => setDescription(e.target.value)}
                            onPerkChange={handlePerkChange}
                            onExtraInfoChange={(e) => setExtraInfo(e.target.value)}
                            onCheckInChange={(e) => setCheckIn(e.target.value)}
                            onCheckOutChange={(e) => setCheckOut(e.target.value)}
                            onMaxGuestsChange={(e) => setMaxGuests(e.target.value)}
                            onPriceChange={(e) => setPrice(e.target.value)}
                            formError={formError}
                            isSubmitting={isSubmitting}
                            onSubmit={savePlace}
                        />
                    )}
                </div>
            )}
        </div>
    );
}
