import { useEffect, useMemo, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import axios from "axios";
import { formatCurrency, getPhotoUrl } from "../utils/place";

function getRating(index) {
    return (4.82 + (index % 8) * 0.02).toFixed(index % 5 === 0 ? 1 : 2);
}

function getSectionTitle(index, location) {
    if (location) {
        return index === 0 ? `Available next month in ${location}` : `More stays near ${location}`;
    }

    if (index === 0) return "Available next month in Durban";
    if (index === 1) return "Stay in Sandton";
    return "More stays nearby";
}

function chunkPlaces(places) {
    const chunks = [];

    for (let index = 0; index < places.length; index += 6) {
        chunks.push(places.slice(index, index + 6));
    }

    return chunks;
}

function ListingCard({ place, index }) {
    const photoUrl = getPhotoUrl(place.photos?.[0]);
    const rating = getRating(index);

    return (
        <Link
            to={`/singleplace/${place._id}`}
            className="group block min-w-[204px] max-w-[204px] sm:min-w-[204px] sm:max-w-[204px]"
        >
            <div className="relative aspect-[1.06/1] overflow-hidden rounded-2xl bg-gray-100">
                {photoUrl ? (
                    <img
                        src={photoUrl}
                        alt={place.title}
                        className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
                    />
                ) : (
                    <div className="flex h-full items-center justify-center px-4 text-center text-sm text-gray-400">
                        No photo available
                    </div>
                )}

                {index % 3 !== 0 && (
                    <span className="absolute left-3 top-3 rounded-full bg-white px-3 py-1 text-xs font-medium shadow">
                        Guest favorite
                    </span>
                )}

                <span className="absolute right-3 top-3 rounded-full text-white drop-shadow transition group-hover:scale-105">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="rgba(0,0,0,0.28)" viewBox="0 0 24 24" strokeWidth="1.8" stroke="currentColor" className="size-7">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.936 0-3.6 1.126-4.312 2.733-.712-1.607-2.376-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12Z" />
                    </svg>
                </span>
            </div>

            <div className="mt-2">
                <h3 className="truncate text-sm font-semibold text-gray-950">
                    {place.title}
                </h3>
                <p className="truncate text-sm text-gray-600">
                    {formatCurrency(place.price)} ZAR for 2 nights · ★ {rating}
                </p>
            </div>
        </Link>
    );
}

function SectionControls() {
    return (
        <div className="flex items-center gap-2">
            <button
                type="button"
                aria-label="Previous listings"
                className="rounded-full bg-gray-100 p-2 text-gray-300"
            >
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.8" stroke="currentColor" className="size-4">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5 8.25 12l7.5-7.5" />
                </svg>
            </button>
            <button
                type="button"
                aria-label="Next listings"
                className="rounded-full bg-gray-100 p-2 text-gray-800"
            >
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.8" stroke="currentColor" className="size-4">
                    <path strokeLinecap="round" strokeLinejoin="round" d="m8.25 4.5 7.5 7.5-7.5 7.5" />
                </svg>
            </button>
        </div>
    );
}

export default function ListingsPage() {
    const [searchParams] = useSearchParams();
    const [places, setPlaces] = useState([]);
    const [status, setStatus] = useState("loading");

    const location = searchParams.get("location") || "";
    const guests = searchParams.get("guests") || "";
    const date = searchParams.get("date") || "";

    useEffect(() => {
        let isMounted = true;

        async function loadListings() {
            setStatus("loading");

            try {
                const { data } = await axios.get("/listings", {
                    params: {
                        location: location || undefined,
                        guests: guests || undefined,
                        date: date || undefined,
                    },
                });

                if (!isMounted) return;

                const nextPlaces = Array.isArray(data) ? data : [];
                setPlaces(nextPlaces);
                setStatus(nextPlaces.length ? "success" : "empty");
            } catch (error) {
                console.error("Failed to load listings:", error);

                if (isMounted) {
                    setPlaces([]);
                    setStatus("failure");
                }
            }
        }

        loadListings();

        return () => {
            isMounted = false;
        };
    }, [date, guests, location]);

    const sections = useMemo(() => chunkPlaces(places), [places]);

    return (
        <main className="-mx-4 mt-0 sm:-mx-9">
            <div className="px-4 py-2 sm:px-9">
                {status === "loading" && (
                    <div className="grid gap-4 pt-10 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-6">
                        {Array.from({ length: 12 }).map((_, index) => (
                            <div key={index} className="animate-pulse">
                                <div className="aspect-[1.06/1] rounded-2xl bg-gray-200"></div>
                                <div className="mt-3 h-4 w-3/4 rounded bg-gray-200"></div>
                                <div className="mt-2 h-4 w-1/2 rounded bg-gray-100"></div>
                            </div>
                        ))}
                    </div>
                )}

                {status === "failure" && (
                    <div className="mx-auto max-w-xl py-24 text-center">
                        <h1 className="text-2xl font-semibold text-gray-950">
                            Could not load listings
                        </h1>
                        <p className="mt-2 text-gray-500">
                            Please check that the API server is running and try again.
                        </p>
                    </div>
                )}

                {status === "empty" && (
                    <div className="mx-auto max-w-xl py-24 text-center">
                        <h1 className="text-2xl font-semibold text-gray-950">
                            No stays found
                        </h1>
                        <p className="mt-2 text-gray-500">
                            Try a different destination or guest count.
                        </p>
                    </div>
                )}

                {status === "success" && (
                    <div className="space-y-14">
                        {sections.map((section, sectionIndex) => (
                            <section key={sectionIndex}>
                                <div className="mb-4 flex items-center justify-between gap-4">
                                    <div className="flex min-w-0 items-center gap-2">
                                        <h1 className="truncate text-xl font-semibold text-gray-950 sm:text-2xl">
                                            {getSectionTitle(sectionIndex, location)}
                                        </h1>
                                        <span className="rounded-full bg-gray-100 p-1 text-gray-800">
                                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.8" stroke="currentColor" className="size-4">
                                                <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3" />
                                            </svg>
                                        </span>
                                    </div>
                                    <SectionControls />
                                </div>

                                <div className="flex gap-3 overflow-x-auto pb-2 sm:gap-4">
                                    {section.map((place, index) => (
                                        <ListingCard
                                            key={place._id}
                                            place={place}
                                            index={sectionIndex * 6 + index}
                                        />
                                    ))}
                                </div>
                            </section>
                        ))}
                    </div>
                )}
            </div>
        </main>
    );
}
