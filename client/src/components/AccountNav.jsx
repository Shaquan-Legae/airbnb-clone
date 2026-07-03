import { useContext } from "react";
import { Link } from "react-router-dom";
import { useParams } from "react-router-dom";
import { UserContext } from "../context/UserContext";



export default function AccountNav() {
    const { subpage } = useParams();
    const { user } = useContext(UserContext);
    const currentSubpage = subpage || "profile";
    const isHost = user?.role === "host";
    const isGuest = user?.role === "guest";

    function linkClasses(type) {
        let classes = "inline-flex gap-2 py-2 px-6 ";

        if (type === currentSubpage) {
            classes += "bg-primary text-white rounded-full";
        } else {
            classes += "bg-gray-200 text-black rounded-full";
        }

        return classes;
    }

    return (
        <nav className="w-full flex flex-wrap justify-center mt-8 gap-2">
            <Link
                className={linkClasses("profile")}
                to="/account/profile"
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
                        d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z"
                    />
                </svg>
                My Profile
            </Link>

            <Link
                className={linkClasses("bookings")}
                to="/account/bookings"
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
                        d="M8.25 6.75h12M8.25 12h12m-12 5.25h12M3.75 6.75h.007v.008H3.75V6.75Zm.375 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0ZM3.75 12h.007v.008H3.75V12Zm.375 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm-.375 5.25h.007v.008H3.75v-.008Zm.375 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Z"
                    />
                </svg>
                My Bookings
            </Link>

            {isHost && (
                <Link
                    className={linkClasses("places")}
                    to="/account/places"
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
                            d="M8.25 21v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21m0 0h4.5V3.545M12.75 21h7.5V10.75M2.25 21h1.5m18 0h-18M2.25 9l4.5-1.636M18.75 3l-1.5.545m0 6.205 3 1m1.5.5-1.5-.5M6.75 7.364V3h-3v18m3-13.636 10.5-3.819"
                        />
                    </svg>
                    My Accommodations
                </Link>
            )}

            {isHost && (
                <Link
                    className={linkClasses("property-bookings")}
                    to="/account/property-bookings"
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
                            d="M6.75 3v2.25M17.25 3v2.25M3.75 8.25h16.5M5.25 21h13.5A1.5 1.5 0 0 0 20.25 19.5V6.75a1.5 1.5 0 0 0-1.5-1.5H5.25a1.5 1.5 0 0 0-1.5 1.5V19.5A1.5 1.5 0 0 0 5.25 21Z"
                        />
                    </svg>
                    Property Bookings
                </Link>
            )}

            {isGuest && (
                <Link
                    className={linkClasses("become-host")}
                    to="/account/become-host"
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
                            d="M8.25 21v-4.875c0-.621.504-1.125 1.125-1.125h5.25c.621 0 1.125.504 1.125 1.125V21m-7.5 0h7.5m-7.5 0H3.375a.375.375 0 0 1-.375-.375V10.5m12.75 10.5h4.875a.375.375 0 0 0 .375-.375V10.5m-18 0 9-7.5 9 7.5m-15.75 0h13.5"
                        />
                    </svg>
                    Become a Host
                </Link>
            )}
        </nav>
    )
}
