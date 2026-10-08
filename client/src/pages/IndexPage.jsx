import { useEffect, useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import Footer from "../components/Footer";
import ExperiencesSection from "../components/home/ExperienceSections";
import HeroSection from "../components/home/HeroSection";
import InspirationCards from "../components/home/InspirationCards";
import ShopAirbnb from "../components/home/ShopAirbnb";
import { formatNightlyPrice, getPhotoUrl } from "../utils/place";

export default function IndexPage() {
    const [allPlaces, setAllPlaces] = useState([]);
    const [displayedPlaces, setDisplayedPlaces] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isFading, setIsFading] = useState(false);
    const [isHovered, setIsHovered] = useState(false);

    function pickRandomThree(list, current = []) {
        if (!list || list.length === 0) return [];
        if (list.length <= 3) return [...list];

        // Ensure we pick 3 items, prioritizing different ones from current display
        const pool = [...list].sort(() => 0.5 - Math.random());
        return pool.slice(0, 3);
    }

    function shuffleDisplayed(list = allPlaces) {
        if (!list || list.length === 0) return;
        setIsFading(true);
        setTimeout(() => {
            setDisplayedPlaces((prev) => pickRandomThree(list, prev));
            setIsFading(false);
        }, 200);
    }

    useEffect(() => {
        document.title = "Airbnb";
        async function loadPlaces() {
            try {
                const { data } = await axios.get("/listings");
                setAllPlaces(data);
                setDisplayedPlaces(pickRandomThree(data));
            } catch (err) {
                console.error("Failed to load places:", err);
            } finally {
                setIsLoading(false);
            }
        }

        loadPlaces();
    }, []);

    // Randomly change displayed cards every 8 seconds (paused when user is hovering)
    useEffect(() => {
        if (allPlaces.length <= 3 || isHovered) return;

        const interval = setInterval(() => {
            shuffleDisplayed(allPlaces);
        }, 8000);

        return () => clearInterval(interval);
    }, [allPlaces, isHovered]);

    return (
        <div className="max-w-7xl mx-auto px-4 py-8">
            <HeroSection />
            <div className="text-center">
                <div className="flex items-center justify-center gap-3">
                    <h1 className="text-3xl font-semibold text-gray-900">
                        Places to stay
                    </h1>
                    {allPlaces.length > 3 && (
                        <button
                            type="button"
                            onClick={() => shuffleDisplayed(allPlaces)}
                            title="Discover different stays"
                            className="inline-flex items-center gap-1.5 rounded-full border border-gray-200 bg-white px-3 py-1 text-xs font-medium text-gray-600 shadow-sm transition hover:border-gray-300 hover:bg-gray-50 active:scale-95"
                        >
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                fill="none"
                                viewBox="0 0 24 24"
                                strokeWidth={2}
                                stroke="currentColor"
                                className="h-3.5 w-3.5 text-primary"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0 3.181 3.183a8.25 8.25 0 0 0 13.803-3.7M4.031 9.865a8.25 8.25 0 0 1 13.803-3.7l3.181 3.182m0-4.991v4.99"
                                />
                            </svg>
                            Shuffle
                        </button>
                    )}
                </div>

                <p className="mt-2 text-gray-500">
                    Browse a curated selection of featured accommodations.
                </p>

                {isLoading && (
                    <div className="py-20 text-center text-gray-500">
                        Loading places...
                    </div>
                )}

                {!isLoading && displayedPlaces.length === 0 && (
                    <div className="py-20 text-center text-gray-500">
                        No places available yet.
                    </div>
                )}
            </div>

            {!isLoading && displayedPlaces.length > 0 && (
                <div
                    onMouseEnter={() => setIsHovered(true)}
                    onMouseLeave={() => setIsHovered(false)}
                    className={`mt-10 grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3 transition-opacity duration-200 ${
                        isFading ? "opacity-0" : "opacity-100"
                    }`}
                >
                    {displayedPlaces.slice(0, 3).map((place) => (
                        <Link
                            key={place._id}
                            to={`/singleplace/${place._id}`}
                            className="group"
                        >
                            <div className="overflow-hidden rounded-3xl bg-white shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl">
                                <div className="aspect-square overflow-hidden bg-gray-100">
                                    <img
                                        src={getPhotoUrl(
                                            place.coverPhoto ||
                                            place.photos?.[0]
                                        )}
                                        alt={place.title}
                                        className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
                                    />
                                </div>

                                <div className="p-4">
                                    <h2 className="truncate text-lg font-semibold text-gray-900">
                                        {place.title}
                                    </h2>

                                    <p className="mt-1 truncate text-sm text-gray-500">
                                        {place.address}
                                    </p>

                                    <p className="mt-2 line-clamp-2 text-sm text-gray-600">
                                        {place.description}
                                    </p>

                                    <div className="mt-4 flex items-center justify-between">
                                        <span className="font-semibold text-primary">
                                            {formatNightlyPrice(place.price)}
                                        </span>

                                        <span className="text-sm text-gray-500">
                                            {place.maxGuests || 1} Guests
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </Link>
                    ))}
                </div>
            )}
            <InspirationCards />
            <ExperiencesSection />
            <ShopAirbnb />
            <Footer />
        </div>
    );
}
