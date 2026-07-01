import { Link, useParams } from "react-router-dom";
import { useState } from "react";
import {
    WifiIcon, TvIcon, HeartIcon, TruckIcon, KeyIcon, HomeIcon,
    FireIcon, SunIcon, SparklesIcon, BoltIcon, BuildingOffice2Icon
} from "@heroicons/react/24/outline";

export default function PlacesPage() {
    const { action } = useParams();

    const [title, setTitle] = useState('');
    const [address, setAddress] = useState('');
    const [photoLink, setPhotoLink] = useState('');
    const [description, setDescription] = useState('');
    const [extraInfo, setExtraInfo] = useState('');
    const [checkIn, setCheckIn] = useState('');
    const [checkOut, setCheckOut] = useState('');
    const [maxGuests, setMaxGuests] = useState(1);

    function inputHeader(text, description) {
        return (
            <div className="mt-4">
                <h2 className="text-xl font-semibold">{text}</h2>
                {description && <p className="text-gray-500 text-sm">{description}</p>}
            </div>
        );
    }

    return (
        <div>
            {action !== 'new' && (
                <div className="text-center">
                    <Link
                        className="bg-primary text-white py-2 px-6 rounded-full inline-flex items-center gap-2 mt-5"
                        to="/account/places/new"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-6">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                        </svg>
                        Add New Place
                    </Link>
                </div>
            )}

            {action === 'new' && (
                <div className="max-w-4xl mx-auto">
                    <form className="space-y-8">
                        {inputHeader('Title', 'Title for your place. Should be short and catchy.')}
                        <input
                            type="text"
                            placeholder="Title"
                            value={title}
                            onChange={ev => setTitle(ev.target.value)}
                            className="w-full p-3 border rounded-2xl"
                        />

                        {inputHeader('Address', 'Address of this place.')}
                        <input
                            type="text"
                            placeholder="Address"
                            value={address}
                            onChange={ev => setAddress(ev.target.value)}
                            className="w-full p-3 border rounded-2xl"
                        />

                        {inputHeader('Photos', 'Add photos using a URL or upload them.')}
                        <div className="flex gap-2">
                            <input
                                type="text"
                                placeholder="Photo URL"
                                value={photoLink}
                                onChange={ev => setPhotoLink(ev.target.value)}
                                className="flex-1 p-3 border rounded-2xl"
                            />
                            <button
                                type="button"
                                className="bg-gray-200 px-6 rounded-2xl hover:bg-gray-300 transition"
                            >
                                Add Photo
                            </button>
                        </div>

                        <div className="grid grid-cols-3 justify-center items-center md:grid-cols-4 lg:grid-cols-6 gap-4">
                            <button
                                type="button"
                                className="border-2 border-dashed border-gray-300 hover:border-gray-400 p-8 rounded-2xl flex flex-col items-center gap-2 text-gray-600 hover:text-gray-800 transition"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-8">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 16.5V9.75m0 0 3 3m-3-3-3 3M6.75 19.5a4.5 4.5 0 0 1-1.41-8.775 5.25 5.25 0 0 1 10.233-2.33 3 3 0 0 1 3.758 3.848A3.752 3.752 0 0 1 18 19.5H6.75Z" />
                                </svg>
                                <span className="text-sm">Upload</span>
                            </button>
                        </div>

                        {inputHeader('Description', 'Describe your place.')}
                        <textarea
                            value={description}
                            onChange={ev => setDescription(ev.target.value)}
                            className="w-full p-3 border rounded-2xl h-32"
                            placeholder="Describe your amazing place..."
                        />

                        {inputHeader('Perks', 'Select all the perks of your place.')}
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
                                    <input type="checkbox" name={name} className="w-5 h-5" />
                                    <Icon className="w-6 h-6" />
                                    <span>{label}</span>
                                </label>
                            ))}
                        </div>

                        {inputHeader('Extra Info', 'House rules, check-in instructions or anything guests should know.')}
                        <textarea
                            value={extraInfo}
                            onChange={ev => setExtraInfo(ev.target.value)}
                            className="w-full p-3 border rounded-2xl h-32"
                            placeholder="Additional information..."
                        />

                        {inputHeader('Check-in & Check-out Times', 'Set check-in time, check-out time and maximum number of guests.')}
                        <div className="grid sm:grid-cols-3 gap-4">
                            <div>
                                <input
                                    type="text"
                                    placeholder="14:00"
                                    value={checkIn}
                                    onChange={ev => setCheckIn(ev.target.value)}
                                    className="w-full p-3 border rounded-2xl"
                                />
                                <p className="text-xs text-gray-500 mt-1">Check-in time</p>
                            </div>
                            <div>
                                <input
                                    type="text"
                                    placeholder="11:00"
                                    value={checkOut}
                                    onChange={ev => setCheckOut(ev.target.value)}
                                    className="w-full p-3 border rounded-2xl"
                                />
                                <p className="text-xs text-gray-500 mt-1">Check-out time</p>
                            </div>
                            <div>
                                <input
                                    type="number"
                                    placeholder="4"
                                    value={maxGuests}
                                    onChange={ev => setMaxGuests(ev.target.value)}
                                    className="w-full p-3 border rounded-2xl"
                                />
                                <p className="text-xs text-gray-500 mt-1">Max guests</p>
                            </div>
                        </div>

                        <button
                            type="submit"
                            className="bg-primary text-white w-full rounded-2xl py-3 text-lg font-medium mt-2 hover:bg-primary/90 transition"
                        >
                            Save
                        </button>
                    </form>
                </div>
            )}
        </div>
    );
}
