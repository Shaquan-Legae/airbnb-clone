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
    const [places, setPlaces] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        document.title = "Airbnb";
        async function loadPlaces() {
            try {
                const { data } = await axios.get("/listings");
                setPlaces(data);
            } catch (err) {
                console.error("Failed to load places:", err);
            } finally {
                setIsLoading(false);
            }
        }

        loadPlaces();
    }, []);

    return (

        <div className="max-w-7xl mx-auto px-4 py-8">
            <HeroSection />
            <div className="text-center">
                <h1 className="text-3xl font-semibold text-gray-900">
                    Places to stay
                </h1>

                <p className="mt-2 text-gray-500">
                    Browse the latest accommodations shared by hosts.
                </p>

                {isLoading && (
                    <div className="py-20 text-center text-gray-500">
                        Loading places...
                    </div>
                )}

                {!isLoading && places.length === 0 && (
                    <div className="py-20 text-center text-gray-500">
                        No places available yet.
                    </div>
                )}
            </div>

            {!isLoading && places.length > 0 && (
                <div className="mt-10 grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                    {places.slice(0, 4).map((place) => (
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
