import { useContext, useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import { formatCurrency, getPhotoUrl } from "../utils/place";
import {
    calculateReservationPricing,
    formatDateRange,
    pricingRows,
} from "../utils/reservation";
import { UserContext } from "../context/UserContext";

const amenityLabels = {
    wifi: "Wifi",
    kitchen: "Kitchen",
    parking: "Free parking",
    tv: "HDTV with standard cable",
    pets: "Pets allowed",
    entrance: "Private entrance",
    radio: "Carbon monoxide alarm",
};

const fallbackAmenities = [
    "Kitchen",
    "Wifi",
    "Dedicated workspace",
    "Free parking on premises",
    "HDTV with standard cable",
    "Elevator",
    "Portable air conditioning",
    "Carbon monoxide alarm",
];

const reviews = [
    {
        name: "Viren",
        location: "Pretoria, South Africa",
        text: "The apartment is neat and tidy with a lovely view. It is centrally located and feels calm after a busy day.",
    },
    {
        name: "Nelrophie",
        location: "Kimberley, South Africa",
        text: "An amazing stay from start to finish. The host was clear, comfortable, and exactly as advertised.",
    },
    {
        name: "Nathan",
        location: "London, United Kingdom",
        text: "The place looked even better than the photos. It was easy to check in and the area felt convenient.",
    },
    {
        name: "Kelvin",
        location: "Johannesburg, South Africa",
        text: "Clean, cozy, and well located. A small suggestion, but otherwise a very good stay.",
    },
];

function getAmenities(perks) {
    if (!Array.isArray(perks) || perks.length === 0) {
        return fallbackAmenities;
    }

    return perks.map((perk) => amenityLabels[perk] || perk);
}

function getHostName(place) {
    return place.owner?.name || place.owner?.email || "Host";
}

function getUserPhoto(user) {
    return getPhotoUrl(user?.profilePhoto);
}

function getInitial(name) {
    return String(name || "H").trim().charAt(0).toUpperCase();
}

function PhotoTile({ photo, title, className = "" }) {
    const photoUrl = getPhotoUrl(photo);

    return (
        <div className={`overflow-hidden bg-gray-100 ${className}`}>
            {photoUrl ? (
                <img
                    src={photoUrl}
                    alt={title}
                    className="h-full w-full object-cover"
                />
            ) : (
                <div className="flex h-full items-center justify-center text-sm text-gray-400">
                    No photo available
                </div>
            )}
        </div>
    );
}

function IconText({ label }) {
    return (
        <div className="flex items-center gap-4 py-2 text-sm text-gray-800">
            <span className="flex size-8 items-center justify-center text-gray-700">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="size-6">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904 9 18.75l-.813-2.846a4.5 4.5 0 0 0-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 0 0 3.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 0 0 3.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 0 0-3.09 3.09ZM18.259 8.715 18 9.75l-.259-1.035a3.375 3.375 0 0 0-2.456-2.456L14.25 6l1.035-.259a3.375 3.375 0 0 0 2.456-2.456L18 2.25l.259 1.035a3.375 3.375 0 0 0 2.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 0 0-2.456 2.456Z" />
                </svg>
            </span>
            <span>{label}</span>
        </div>
    );
}

function CalendarPreview({ unavailableRanges = [] }) {
    const visibleUnavailable = unavailableRanges.slice(0, 3);

    return (
        <div className="rounded-2xl border border-gray-200 bg-white p-4">
            <h3 className="text-sm font-semibold">Unavailable dates</h3>
            {visibleUnavailable.length === 0 ? (
                <p className="mt-2 text-sm text-gray-500">No unavailable dates yet.</p>
            ) : (
                <ul className="mt-3 space-y-2 text-sm text-gray-700">
                    {visibleUnavailable.map((reservation) => (
                        <li key={reservation._id} className="rounded-lg bg-gray-50 px-3 py-2">
                            {formatDateRange(reservation.checkIn, reservation.checkOut)}
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
}

function datesOverlapUnavailable(checkIn, checkOut, unavailableRanges) {
    if (!checkIn || !checkOut) return false;

    const nextCheckIn = new Date(checkIn);
    const nextCheckOut = new Date(checkOut);

    return unavailableRanges.some((reservation) => (
        nextCheckIn < new Date(reservation.checkOut) &&
        nextCheckOut > new Date(reservation.checkIn)
    ));
}

function BookingCard({ place, unavailableRanges, onReservationCreated }) {
    const navigate = useNavigate();
    const { user } = useContext(UserContext);
    const [checkIn, setCheckIn] = useState("");
    const [checkOut, setCheckOut] = useState("");
    const [guests, setGuests] = useState("1");
    const [errors, setErrors] = useState({});
    const [formError, setFormError] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const pricing = calculateReservationPricing(place.price, checkIn, checkOut);
    const today = new Date().toISOString().split("T")[0];

    function validateBooking() {
        const nextErrors = {};

        if (!checkIn) nextErrors.checkIn = "Choose a check-in date.";
        if (!checkOut) nextErrors.checkOut = "Choose a check-out date.";
        if (checkIn && checkOut && new Date(checkOut) <= new Date(checkIn)) {
            nextErrors.checkOut = "Check-out must be after check-in.";
        }
        if (checkIn && checkIn < today) {
            nextErrors.checkIn = "Check-in cannot be in the past.";
        }
        if (datesOverlapUnavailable(checkIn, checkOut, unavailableRanges)) {
            nextErrors.checkIn = "These dates overlap an existing reservation.";
        }
        if (!guests || Number(guests) < 1) {
            nextErrors.guests = "Choose at least 1 guest.";
        }

        return nextErrors;
    }

    async function reservePlace() {
        if (!user) {
            navigate("/login");
            return;
        }

        const nextErrors = validateBooking();
        setErrors(nextErrors);
        setFormError("");

        if (Object.keys(nextErrors).length > 0) {
            return;
        }

        setIsSubmitting(true);

        try {
            await axios.post("/reservations", {
                placeId: place._id,
                checkIn,
                checkOut,
                guests: Number(guests),
            });

            await onReservationCreated();
            navigate("/account/bookings", {
                state: { message: "Reservation created and added to My Bookings." },
            });
        } catch (error) {
            if (error.response?.data?.errors) {
                setErrors(error.response.data.errors);
            }

            setFormError(
                error.response?.data?.error ||
                "Could not reserve this place. Please try again.",
            );
        } finally {
            setIsSubmitting(false);
        }
    }

    return (
        <aside className="rounded-2xl border border-gray-200 bg-white p-5 shadow-xl shadow-gray-200/70">
            <div className="mb-4">
                <span className="text-xl font-semibold">
                    {formatCurrency(place.price)}
                </span>
                <span className="text-sm text-gray-600"> per night</span>
            </div>

            <div className="overflow-hidden rounded-xl border border-gray-300">
                <div className="grid grid-cols-2 border-b border-gray-300">
                    <label className="p-3 text-[10px] font-bold uppercase">
                        Check-in
                        <input
                            type="date"
                            value={checkIn}
                            onChange={(ev) => setCheckIn(ev.target.value)}
                            min={today}
                            className="mt-1 block w-full border-0 p-0 text-xs font-normal outline-none"
                        />
                    </label>
                    <label className="border-l border-gray-300 p-3 text-[10px] font-bold uppercase">
                        Checkout
                        <input
                            type="date"
                            value={checkOut}
                            onChange={(ev) => setCheckOut(ev.target.value)}
                            min={checkIn || today}
                            className="mt-1 block w-full border-0 p-0 text-xs font-normal outline-none"
                        />
                    </label>
                </div>
                <label className="block p-3 text-[10px] font-bold uppercase">
                    Guests
                    <select
                        value={guests}
                        onChange={(ev) => setGuests(ev.target.value)}
                        className="mt-1 block w-full border-0 bg-white p-0 text-sm font-normal outline-none"
                    >
                        {Array.from({ length: place.maxGuests || 1 }, (_, index) => index + 1).map((guestCount) => (
                            <option key={guestCount} value={guestCount}>
                                {guestCount} guest{guestCount > 1 ? "s" : ""}
                            </option>
                        ))}
                    </select>
                </label>
            </div>

            {(errors.checkIn || errors.checkOut || errors.guests) && (
                <div className="mt-3 space-y-1 text-sm text-red-600">
                    {errors.checkIn && <p>{errors.checkIn}</p>}
                    {errors.checkOut && <p>{errors.checkOut}</p>}
                    {errors.guests && <p>{errors.guests}</p>}
                </div>
            )}

            <button
                type="button"
                onClick={reservePlace}
                disabled={isSubmitting}
                className="mt-4 w-full rounded-lg bg-primary py-3 font-semibold text-white transition hover:bg-rose-700"
            >
                {isSubmitting ? "Reserving..." : "Reserve"}
            </button>

            <p className="mt-3 text-center text-sm text-gray-500">
                You won't be charged yet
            </p>

            <div className="mt-5 space-y-3 text-sm">
                {pricingRows(pricing).map((row) => (
                    <div key={row.label} className="flex justify-between gap-4">
                        <span className="underline">{row.label}</span>
                        <span>{row.value}</span>
                    </div>
                ))}
                <div className="flex justify-between border-t border-gray-200 pt-4 font-semibold">
                    <span>Total</span>
                    <span>{formatCurrency(pricing.total)}</span>
                </div>
            </div>

            {formError && (
                <div className="mt-4 rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
                    {formError}
                </div>
            )}
        </aside>
    );
}

export default function SinglePlacePage() {
    const { id } = useParams();
    const [place, setPlace] = useState(null);
    const [nearbyPlaces, setNearbyPlaces] = useState([]);
    const [unavailableRanges, setUnavailableRanges] = useState([]);
    const [status, setStatus] = useState("loading");
    const [showAllPhotos, setShowAllPhotos] = useState(false);

    async function loadUnavailableRanges() {
        const { data } = await axios.get(`/reservations/unavailable/${id}`);
        setUnavailableRanges(Array.isArray(data) ? data : []);
    }

    useEffect(() => {
        let isMounted = true;

        async function loadPlace() {
            setStatus("loading");

            try {
                const [{ data: placeData }, { data: listingsData }, { data: unavailableData }] = await Promise.all([
                    axios.get(`/listings/${id}`),
                    axios.get("/listings"),
                    axios.get(`/reservations/unavailable/${id}`),
                ]);

                if (!isMounted) return;

                setPlace(placeData);
                setUnavailableRanges(Array.isArray(unavailableData) ? unavailableData : []);
                setNearbyPlaces(
                    Array.isArray(listingsData)
                        ? listingsData.filter((listing) => listing._id !== id).slice(0, 6)
                        : [],
                );
                setStatus("success");
            } catch (error) {
                console.error("Failed to load listing:", error);

                if (isMounted) {
                    setStatus(error.response?.status === 404 || error.response?.status === 400 ? "not-found" : "failure");
                }
            }
        }

        loadPlace();

        return () => {
            isMounted = false;
        };
    }, [id]);

    const photos = useMemo(() => place?.photos || [], [place]);
    const amenities = useMemo(() => getAmenities(place?.perks), [place]);

    if (status === "loading") {
        return (
            <main className="mx-auto w-full max-w-6xl py-8">
                <div className="h-8 w-2/3 animate-pulse rounded bg-gray-200"></div>
                <div className="mt-5 grid h-[360px] animate-pulse gap-2 rounded-2xl bg-gray-100 md:grid-cols-4"></div>
            </main>
        );
    }

    if (status === "not-found" || status === "failure") {
        return (
            <main className="mx-auto max-w-xl py-24 text-center">
                <h1 className="text-2xl font-semibold text-gray-950">
                    {status === "not-found" ? "Listing not found" : "Could not load this listing"}
                </h1>
                <p className="mt-2 text-gray-500">
                    {status === "not-found"
                        ? "The place may have been removed or the link is incorrect."
                        : "Please check that the API server is running and try again."}
                </p>
                <Link
                    to="/listings"
                    className="mt-6 inline-flex rounded-lg bg-primary px-5 py-3 font-semibold text-white"
                >
                    Browse listings
                </Link>
            </main>
        );
    }

    const hostName = getHostName(place);

    if (showAllPhotos) {
        return (
            <main className="fixed inset-0 z-50 overflow-y-auto bg-white p-6">
                <div className="mx-auto max-w-5xl">
                    <button
                        type="button"
                        onClick={() => setShowAllPhotos(false)}
                        className="mb-6 inline-flex items-center gap-2 rounded-full border border-gray-300 px-4 py-2 text-sm font-semibold"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.8" stroke="currentColor" className="size-4">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5 3 12m0 0 7.5-7.5M3 12h18" />
                        </svg>
                        Back
                    </button>
                    <div className="grid gap-4">
                        {(photos.length ? photos : [null]).map((photo, index) => (
                            <PhotoTile
                                key={`${photo || "empty"}-${index}`}
                                photo={photo}
                                title={place.title}
                                className="aspect-[4/3] rounded-xl"
                            />
                        ))}
                    </div>
                </div>
            </main>
        );
    }

    return (
        <main className="mx-auto w-full max-w-6xl py-6">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <h1 className="text-xl font-semibold text-gray-950 sm:text-2xl">
                    {place.title}
                </h1>
                <div className="flex gap-4 text-sm font-semibold">
                    <button type="button" className="inline-flex items-center gap-2 underline">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.6" stroke="currentColor" className="size-4">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M7.217 10.907a2.25 2.25 0 1 0 0 2.186m0-2.186c.18.324.283.696.283 1.093s-.103.77-.283 1.093m0-2.186 9.566-5.314m-9.566 7.5 9.566 5.314m0 0a2.25 2.25 0 1 0 .934-4.217 2.25 2.25 0 0 0-.934 4.217Zm0-12.814a2.25 2.25 0 1 0 .934 4.217 2.25 2.25 0 0 0-.934-4.217Z" />
                        </svg>
                        Share
                    </button>
                    <button type="button" className="inline-flex items-center gap-2 underline">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.6" stroke="currentColor" className="size-4">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.936 0-3.6 1.126-4.312 2.733-.712-1.607-2.376-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12Z" />
                        </svg>
                        Save
                    </button>
                </div>
            </div>

            <section className="relative mt-5 grid h-[260px] overflow-hidden rounded-2xl md:h-[360px] md:grid-cols-4 md:grid-rows-2 md:gap-2">
                <PhotoTile
                    photo={photos[0]}
                    title={place.title}
                    className="md:col-span-2 md:row-span-2"
                />
                {[1, 2, 3, 4].map((photoIndex) => (
                    <PhotoTile
                        key={photoIndex}
                        photo={photos[photoIndex]}
                        title={place.title}
                        className="hidden md:block"
                    />
                ))}
                <button
                    type="button"
                    onClick={() => setShowAllPhotos(true)}
                    className="absolute bottom-4 right-4 rounded-lg border border-gray-900 bg-white px-4 py-2 text-sm font-semibold shadow"
                >
                    Show all photos
                </button>
            </section>

            <div className="grid gap-12 py-8 lg:grid-cols-[1fr_360px]">
                <div>
                    <section className="border-b border-gray-200 pb-6">
                        <h2 className="text-xl font-semibold">
                            Entire condo in {place.address || "South Africa"}
                        </h2>
                        <p className="mt-1 text-sm text-gray-700">
                            {place.maxGuests || 1} guests · 3 bedrooms · 3 beds · 4 baths
                        </p>
                        <p className="mt-1 text-sm font-semibold">
                            ★ 4.88 · 69 reviews
                        </p>
                    </section>

                    <section className="flex items-center gap-4 border-b border-gray-200 py-6">
                        {getUserPhoto(place.owner) ? (
                            <img
                                src={getUserPhoto(place.owner)}
                                alt={hostName}
                                className="size-12 rounded-full object-cover"
                            />
                        ) : (
                            <div className="flex size-12 items-center justify-center rounded-full bg-gradient-to-br from-rose-500 to-purple-700 text-lg font-semibold text-white">
                                {getInitial(hostName)}
                            </div>
                        )}
                        <div>
                            <h2 className="font-semibold">Hosted by {hostName}</h2>
                            <p className="text-sm text-gray-500">
                                {place.owner?.hostProfile?.experience ?? 1} year{Number(place.owner?.hostProfile?.experience) === 1 ? "" : "s"} hosting
                            </p>
                        </div>
                    </section>

                    <section className="space-y-5 border-b border-gray-200 py-6">
                        <IconText label="Dive right in" />
                        <IconText label="Great restaurants nearby" />
                        <IconText label="Dedicated workspace" />
                    </section>

                    <section className="border-b border-gray-200 py-6">
                        <p className="whitespace-pre-line text-sm leading-6 text-gray-800">
                            {place.description}
                        </p>
                        {place.extraInfo && (
                            <p className="mt-5 whitespace-pre-line text-sm leading-6 text-gray-800">
                                {place.extraInfo}
                            </p>
                        )}
                    </section>

                    <section className="border-b border-gray-200 py-8">
                        <h2 className="text-xl font-semibold">What this place offers</h2>
                        <div className="mt-5 grid gap-x-12 gap-y-3 sm:grid-cols-2">
                            {amenities.slice(0, 8).map((amenity) => (
                                <IconText key={amenity} label={amenity} />
                            ))}
                        </div>
                        <button
                            type="button"
                            className="mt-6 rounded-lg border border-gray-900 px-5 py-3 text-sm font-semibold"
                        >
                            Show all amenities
                        </button>
                    </section>

                    <section className="border-b border-gray-200 py-8">
                        <h2 className="text-xl font-semibold">2 nights in Durban</h2>
                        <p className="mt-1 text-sm text-gray-500">
                            Aug 21, 2026 - Aug 23, 2026
                        </p>
                        <div className="mt-8">
                            <CalendarPreview unavailableRanges={unavailableRanges} />
                        </div>
                    </section>

                    <section className="border-b border-gray-200 py-8">
                        <h2 className="text-xl font-semibold">★ 4.88 · 69 reviews</h2>
                        <div className="mt-6 grid gap-6 sm:grid-cols-2">
                            {reviews.map((review) => (
                                <article key={review.name}>
                                    <div className="flex items-center gap-3">
                                        <div className="flex size-10 items-center justify-center rounded-full bg-gray-200 font-semibold">
                                            {getInitial(review.name)}
                                        </div>
                                        <div>
                                            <h3 className="text-sm font-semibold">{review.name}</h3>
                                            <p className="text-xs text-gray-500">{review.location}</p>
                                        </div>
                                    </div>
                                    <p className="mt-3 text-sm leading-6 text-gray-700">
                                        {review.text}
                                    </p>
                                </article>
                            ))}
                        </div>
                        <button
                            type="button"
                            className="mt-8 rounded-lg border border-gray-900 px-5 py-3 text-sm font-semibold"
                        >
                            Show all 69 reviews
                        </button>
                    </section>

                    <section className="border-b border-gray-200 py-8">
                        <h2 className="text-xl font-semibold">Where you'll be</h2>
                        <p className="mt-2 text-sm text-gray-600">{place.address}</p>
                        <div className="mt-5 flex h-80 items-center justify-center rounded-2xl bg-gray-200 text-sm text-gray-500">
                            Map preview
                        </div>
                    </section>

                    <section className="border-b border-gray-200 py-8">
                        <h2 className="text-xl font-semibold">Meet your host</h2>
                        <div className="mt-5 grid gap-8 sm:grid-cols-[280px_1fr]">
                            <div className="rounded-2xl border border-gray-100 bg-white p-6 text-center shadow-lg shadow-gray-200/70">
                                {getUserPhoto(place.owner) ? (
                                    <img
                                        src={getUserPhoto(place.owner)}
                                        alt={hostName}
                                        className="mx-auto size-20 rounded-full object-cover"
                                    />
                                ) : (
                                    <div className="mx-auto flex size-20 items-center justify-center rounded-full bg-gradient-to-br from-rose-500 to-purple-700 text-3xl font-semibold text-white">
                                        {getInitial(hostName)}
                                    </div>
                                )}
                                <h3 className="mt-3 text-2xl font-semibold">{hostName}</h3>
                                <p className="text-sm text-gray-500">Host</p>
                            </div>
                            <div className="text-sm leading-6 text-gray-700">
                                <h3 className="font-semibold text-gray-950">Host details</h3>
                                <p className="mt-2">Response rate: 97%</p>
                                <p>Responds within an hour</p>
                                <button
                                    type="button"
                                    className="mt-5 rounded-lg border border-gray-900 px-5 py-3 text-sm font-semibold"
                                >
                                    Message host
                                </button>
                            </div>
                        </div>
                    </section>
                </div>

                <div className="lg:sticky lg:top-6 lg:self-start">
                    <div className="mb-4 rounded-xl border border-gray-100 bg-white p-4 text-sm shadow">
                        <span className="mr-1 inline-flex text-primary">
                            <svg xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 24 24" className="size-3">
                                <path d="M12 3.75 20.25 12 12 20.25 3.75 12 12 3.75Z" />
                            </svg>
                        </span>
                        Prices include all fees
                    </div>
                    <BookingCard
                        place={place}
                        unavailableRanges={unavailableRanges}
                        onReservationCreated={loadUnavailableRanges}
                    />
                    <button type="button" className="mx-auto mt-5 block text-sm text-gray-600 underline">
                        Report this listing
                    </button>
                </div>
            </div>

            <section className="border-b border-gray-200 py-8">
                <h2 className="text-xl font-semibold">More stays nearby</h2>
                <div className="mt-5 flex gap-4 overflow-x-auto pb-3">
                    {nearbyPlaces.map((nearbyPlace) => {
                        const photoUrl = getPhotoUrl(nearbyPlace.photos?.[0]);

                        return (
                            <Link
                                key={nearbyPlace._id}
                                to={`/singleplace/${nearbyPlace._id}`}
                                className="block min-w-[170px] max-w-[170px]"
                            >
                                <div className="aspect-square overflow-hidden rounded-lg bg-gray-200">
                                    {photoUrl && (
                                        <img
                                            src={photoUrl}
                                            alt={nearbyPlace.title}
                                            className="h-full w-full object-cover"
                                        />
                                    )}
                                </div>
                                <h3 className="mt-2 truncate text-xs font-semibold">
                                    {nearbyPlace.title}
                                </h3>
                                <p className="truncate text-xs text-gray-500">
                                    {formatCurrency(nearbyPlace.price)} · ★ 4.86
                                </p>
                            </Link>
                        );
                    })}
                </div>
            </section>
        </main>
    );
}
