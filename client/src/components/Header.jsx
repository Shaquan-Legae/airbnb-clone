import { useContext, useEffect, useRef, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import axios from "axios";
import { UserContext } from "../context/UserContext";
import { getPhotoUrl } from "../utils/place";

function HeaderSearch({ search }) {
    const navigate = useNavigate();
    const query = new URLSearchParams(search);

    const [where, setWhere] = useState(query.get("location") || "");
    const [date, setDate] = useState(query.get("date") || "");
    const [guests, setGuests] = useState(query.get("guests") || "");

    function submitSearch(ev) {
        ev.preventDefault();

        const nextQuery = new URLSearchParams();

        if (where.trim()) nextQuery.set("location", where.trim());
        if (date) nextQuery.set("date", date);
        if (guests) nextQuery.set("guests", guests);

        const nextSearch = nextQuery.toString();
        navigate(`/listings${nextSearch ? `?${nextSearch}` : ""}`);
    }

    return (
        <form
            onSubmit={submitSearch}
            className="order-3 flex w-full items-center rounded-full border border-gray-300 bg-white px-3 py-2 shadow-md shadow-gray-200 sm:order-none sm:max-w-xl"
        >
            <div className="hidden pl-2 pr-3 text-primary sm:block">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="size-6">
                    <path strokeLinecap="round" strokeLinejoin="round" d="m2.25 12 8.954-8.955a1.126 1.126 0 0 1 1.592 0L21.75 12M4.5 9.75V20.25h5.25v-6h4.5v6H19.5V9.75" />
                </svg>
            </div>
            <label className="min-w-0 flex-1 px-2">
                <span className="sr-only">Where</span>
                <input
                    type="search"
                    value={where}
                    onChange={(ev) => setWhere(ev.target.value)}
                    placeholder="Anywhere"
                    className="w-full border-0 bg-transparent text-sm font-semibold outline-none placeholder:text-gray-900"
                />
            </label>
            <div className="h-7 border-l border-gray-300"></div>
            <label className="hidden min-w-0 flex-1 px-3 md:block">
                <span className="sr-only">Check in</span>
                <input
                    type="date"
                    value={date}
                    onChange={(ev) => setDate(ev.target.value)}
                    className="w-full border-0 bg-transparent text-sm font-semibold outline-none"
                />
            </label>
            <div className="hidden h-7 border-l border-gray-300 md:block"></div>
            <label className="min-w-0 flex-1 px-3">
                <span className="sr-only">Guests</span>
                <input
                    type="search"
                    inputMode="numeric"
                    value={guests}
                    onChange={(ev) => setGuests(ev.target.value.replace(/\D/g, ""))}
                    placeholder="Add guests"
                    className="w-full border-0 bg-transparent text-sm font-semibold outline-none placeholder:text-gray-900"
                />
            </label>
            <button
                type="submit"
                aria-label="Search"
                className="ml-1 rounded-full bg-primary p-3 text-white transition hover:bg-rose-700"
            >
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="h-5 w-5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" />
                </svg>
            </button>
        </form>
    );
}

export default function Header() {
    const { user, setUser } = useContext(UserContext);
    const location = useLocation();
    const navigate = useNavigate();
    const menuRef = useRef(null);
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const isGuest = user?.role === "guest";
    const isHost = user?.role === "host";
    const profilePhotoUrl = getPhotoUrl(user?.profilePhoto);
    const profileLabel = user?.name || user?.email || "Profile";

    useEffect(() => {
        function handleClickOutside(ev) {
            if (menuRef.current && !menuRef.current.contains(ev.target)) {
                setIsMenuOpen(false);
            }
        }

        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    async function logout() {
        await axios.post("/logout");
        setUser(null);
        setIsMenuOpen(false);
        navigate("/login");
    }

    function goToProfileFlow() {
        navigate(user ? "/account/profile" : "/login");
    }

    return (
        <header className="flex flex-col gap-4 border-b border-gray-200 pb-4 sm:flex-row sm:items-center sm:justify-between">
            <Link to="/" className="flex items-center gap-2">
                <svg xmlns="http://www.w3.org/2000/svg" width={48} height={48} fill="#FF5A5F" viewBox="0 0 24 24">
                    <path d="M12.001 16.709c-1.013-1.271-1.609-2.386-1.808-3.34-.197-.769-.12-1.385.218-1.848.357-.532.89-.791 1.589-.791s1.231.259 1.589.796c.335.458.419 1.075.215 1.848-.218.974-.813 2.087-1.808 3.341zm7.196.855c-.14.934-.775 1.708-1.65 2.085-1.687.734-3.359-.437-4.789-2.026 2.365-2.961 2.803-5.268 1.787-6.758-.596-.855-1.449-1.271-2.544-1.271-2.206 0-3.419 1.867-2.942 4.034.276 1.173 1.013 2.506 2.186 3.996-.735.813-1.432 1.391-2.047 1.748-.478.258-.934.418-1.37.456-2.008.299-3.582-1.647-2.867-3.656.1-.259.297-.734.634-1.471l.019-.039c1.097-2.382 2.43-5.088 3.961-8.09l.039-.1.435-.836c.338-.616.477-.892 1.014-1.231.258-.157.576-.235.934-.235.715 0 1.271.418 1.511.753.118.18.259.419.436.716l.419.815.06.119c1.53 3.001 2.863 5.702 3.955 8.089l.02.019.401.915.237.573c.183.459.221.915.16 1.393zm.913-1.791c-.139-.438-.378-.953-.675-1.569v-.022a263 263 0 0 0-3.976-8.128l-.084-.121C14.486 4.109 13.849 3.014 12 3.014c-1.827 0-2.604 1.27-3.397 2.922l-.061.119c-1.251 2.426-2.564 5.128-3.975 8.13v.039l-.418.914c-.158.378-.237.575-.259.636C2.878 18.556 4.964 21 7.489 21c.021 0 .099 0 .198-.021h.278c1.313-.159 2.664-.993 4.035-2.485 1.371 1.49 2.725 2.326 4.033 2.485h.279c.1.021.18.021.2.021 2.525.002 4.61-2.444 3.598-5.227" />
                </svg>
                <span className="font-bold text-xl text-primary">airbnb</span>
            </Link>

            <HeaderSearch key={location.search} search={location.search} />

            <div className="relative flex items-center gap-2 self-start sm:self-auto" ref={menuRef}>
                {(!user || isGuest) && (
                    <Link
                        to={user ? "/account/become-host" : "/login"}
                        className="hidden rounded-full px-3 py-2 text-sm font-semibold hover:bg-gray-100 md:inline-flex"
                    >
                        Become a Host
                    </Link>
                )}

                <button
                    type="button"
                    aria-label="Language and profile"
                    onClick={goToProfileFlow}
                    className="hidden rounded-full p-2 text-gray-800 hover:bg-gray-100 md:inline-flex"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="size-5"><path strokeLinecap="round" strokeLinejoin="round" d="M12 21a9 9 0 1 0 0-18m0 18a9 9 0 1 1 0-18m0 18c2.5-2.467 3.75-5.467 3.75-9S14.5 5.467 12 3m0 18c-2.5-2.467-3.75-5.467-3.75-9S9.5 5.467 12 3m-7.5 9h15" /></svg>
                </button>

                <button
                    type="button"
                    aria-label="Open profile menu"
                    onClick={() => setIsMenuOpen((prev) => !prev)}
                    className="menu flex items-center gap-3 rounded-full border border-gray-200 bg-white px-3 py-2 shadow-sm transition hover:shadow-md"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="size-6"><path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" /></svg>
                    {profilePhotoUrl ? (
                        <img src={profilePhotoUrl} alt={profileLabel} className="size-8 rounded-full object-cover" />
                    ) : (
                        <span className="flex size-8 items-center justify-center rounded-full bg-gray-900 text-sm font-semibold text-white">
                            {profileLabel.charAt(0).toUpperCase()}
                        </span>
                    )}
                </button>

                {isMenuOpen && (
                    <div className="absolute right-0 top-12 z-40 w-64 overflow-hidden rounded-2xl border border-gray-200 bg-white py-2 text-sm shadow-xl">
                        {!user && (
                            <>
                                <Link onClick={() => setIsMenuOpen(false)} to="/login" className="block px-4 py-3 font-semibold hover:bg-gray-50">
                                    Login
                                </Link>
                                <Link onClick={() => setIsMenuOpen(false)} to="/register" className="block px-4 py-3 hover:bg-gray-50">
                                    Sign up
                                </Link>
                                <Link onClick={() => setIsMenuOpen(false)} to="/login" className="block border-t border-gray-100 px-4 py-3 hover:bg-gray-50">
                                    Become a Host
                                </Link>
                            </>
                        )}

                        {user && (
                            <>
                                <Link onClick={() => setIsMenuOpen(false)} to="/account/profile" className="block px-4 py-3 font-semibold hover:bg-gray-50">
                                    My Profile
                                </Link>
                                <Link onClick={() => setIsMenuOpen(false)} to="/account/bookings" className="block px-4 py-3 hover:bg-gray-50">
                                    My Bookings
                                </Link>
                                {isGuest && (
                                    <Link onClick={() => setIsMenuOpen(false)} to="/account/become-host" className="block px-4 py-3 hover:bg-gray-50">
                                        Become a Host
                                    </Link>
                                )}
                                {isHost && (
                                    <>
                                        <Link onClick={() => setIsMenuOpen(false)} to="/account/places" className="block px-4 py-3 hover:bg-gray-50">
                                            My Accommodations
                                        </Link>
                                        <Link onClick={() => setIsMenuOpen(false)} to="/account/property-bookings" className="block px-4 py-3 hover:bg-gray-50">
                                            Property Bookings
                                        </Link>
                                    </>
                                )}
                                <button type="button" onClick={logout} className="block w-full border-t border-gray-100 px-4 py-3 text-left hover:bg-gray-50">
                                    Logout
                                </button>
                            </>
                        )}
                    </div>
                )}
            </div>
        </header>
    );
}
