import { useContext } from "react";
import { Link } from "react-router-dom";
import { UserContext } from "../context/UserContext";

export default function Header() {
    const { user } = useContext(UserContext);

    return (
        <header className="flex justify-between items-center">
            <Link to="/" className="flex items-center gap-2">
                <svg xmlns="http://www.w3.org/2000/svg" width={48} height={48} fill="#FF5A5F" viewBox="0 0 24 24">
                    <path d="M12.001 16.709c-1.013-1.271-1.609-2.386-1.808-3.34-.197-.769-.12-1.385.218-1.848.357-.532.89-.791 1.589-.791s1.231.259 1.589.796c.335.458.419 1.075.215 1.848-.218.974-.813 2.087-1.808 3.341zm7.196.855c-.14.934-.775 1.708-1.65 2.085-1.687.734-3.359-.437-4.789-2.026 2.365-2.961 2.803-5.268 1.787-6.758-.596-.855-1.449-1.271-2.544-1.271-2.206 0-3.419 1.867-2.942 4.034.276 1.173 1.013 2.506 2.186 3.996-.735.813-1.432 1.391-2.047 1.748-.478.258-.934.418-1.37.456-2.008.299-3.582-1.647-2.867-3.656.1-.259.297-.734.634-1.471l.019-.039c1.097-2.382 2.43-5.088 3.961-8.09l.039-.1.435-.836c.338-.616.477-.892 1.014-1.231.258-.157.576-.235.934-.235.715 0 1.271.418 1.511.753.118.18.259.419.436.716l.419.815.06.119c1.53 3.001 2.863 5.702 3.955 8.089l.02.019.401.915.237.573c.183.459.221.915.16 1.393zm.913-1.791c-.139-.438-.378-.953-.675-1.569v-.022a263 263 0 0 0-3.976-8.128l-.084-.121C14.486 4.109 13.849 3.014 12 3.014c-1.827 0-2.604 1.27-3.397 2.922l-.061.119c-1.251 2.426-2.564 5.128-3.975 8.13v.039l-.418.914c-.158.378-.237.575-.259.636C2.878 18.556 4.964 21 7.489 21c.021 0 .099 0 .198-.021h.278c1.313-.159 2.664-.993 4.035-2.485 1.371 1.49 2.725 2.326 4.033 2.485h.279c.1.021.18.021.2.021 2.525.002 4.61-2.444 3.598-5.227" />
                </svg>
                <span className="font-bold text-xl text-primary">Airbnb</span>
            </Link>

            <div className="flex border border-gray-300 rounded-full py-2 px-2 mt-2 shadow-md shadow-gray-300">
                <Link to="" className="flex items-center">
                    <div className="px-5"><div className="text-xs font-bold">Where</div><input type="search" placeholder="Search destinations" className="text-sm text-gray-500 focus:outline-none" /></div>
                    <div className="h-8 border-l border-gray-300"></div>
                    <div className="px-5"><div className="text-xs font-bold">Check in</div><input type="date" className="text-sm text-gray-500 focus: outline-none" placeholder="Add dates" /></div>
                    <div className="h-8 border-l border-gray-300"></div>
                    <div className="px-3"><div className="text-xs font-bold">Who</div><input type="search" placeholder="Add guests" className="text-sm text-gray-500 focus: outline-none" /></div>
                    <button type="button" className="ml-2 rounded-full bg-primary p-3 text-white">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="h-5 w-5">
                            <path strokeLinecap="round" strokeLinejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" />
                        </svg>
                    </button>
                </Link>
            </div>

            <Link to={user ? "/account/profile" : "/login"} className="menu flex items-center border border-gray-300 rounded-full py-2 px-4 shadow-md shadow-gray-300 gap-2.5">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="size-6"><path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" /></svg>
                <div className="bg-gray-500 text-white rounded-full border border-gray-500 p-1"><svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="w-4 h-4"><path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z" /></svg></div>
                <span className="text-sm font-medium">{user ? user.name || user.email || "" : ""}</span>
            </Link>
        </header>
    );
}