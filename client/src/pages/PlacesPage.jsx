import { Link, useParams } from "react-router-dom";
import {
    WifiIcon, TvIcon, HeartIcon, TruckIcon, KeyIcon, HomeIcon,
    FireIcon, SunIcon, SparklesIcon, BoltIcon, BuildingOffice2Icon
} from "@heroicons/react/24/outline";

export default function PlacesPage() {
    const { action } = useParams();
    const [title, setTitle] = useState('');
    const [address, setAddress] = useState('');
    const [photos, setAddedPhotos] = useState([]);
    const [photoLink, setphotoLink] = useState('');
    const [description, setDescription] = useState('');
    const [perks, setPerks] = useState([]);
    const [extraInfo, setExtraInfo] = useState('');
    const [checkIn, setCheckIn] = useState('');
    const [checkOut, setCheckOut] = useState('');
    const [maxGuests, setMaxGuests] = useState(1);

    return (
        <div>

            {action !== 'new' && (
                <div className="text-center">
                    <Link
                        className="bg-primary text-white py-2 px-6 rounded-full inline-flex gap-2 mt-5"
                        to={'/account/places/new'}
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-6">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                        </svg>

                        Add New Place
                    </Link>
                </div>
            )}

            {action === 'new' && (
                <div>
                    <form action="" className="">
                        <h2 className="text-xl mt-4">Title</h2>
                        <input type="text" placeholder="Title" />
                        <h2 className="text-xl mt-4">Address</h2>
                        <input type="text" placeholder="address" />
                        <h2 className="text-xl mt-4">Photos</h2>

                        <div className="flex gap-2">
                            <input type="text" placeholder="Photo URL" />
                            <button className="bg-gray-200 px-4 rounded-2xl" type="button">Add&nbsp;Photo</button>
                        </div>
                        <div className="mt-2 grid grid-cols-3 md:grid-cols-4 lg:grid-cols6">
                            <button className="border bg-transparent rounded-2xl p-8 text-xl text-gray-600 flex justify-center gap-1" type="button">
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-7">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 16.5V9.75m0 0 3 3m-3-3-3 3M6.75 19.5a4.5 4.5 0 0 1-1.41-8.775 5.25 5.25 0 0 1 10.233-2.33 3 3 0 0 1 3.758 3.848A3.752 3.752 0 0 1 18 19.5H6.75Z" />
                                </svg>

                                Upload
                            </button>
                        </div>

                        <h2 className="text-xl mt-4">Description</h2>
                        <textarea />
                        <h2 className="text-xl mt-4">Perks</h2>
                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mt-2">

                            <label className="border p-4 rounded-2xl flex items-center gap-2 cursor-pointer hover:bg-gray-100 transition">
                                <input type="checkbox" name="wifi" />
                                <WifiIcon className="w-6 h-6" />
                                <span>WiFi</span>
                            </label>

                            <label className="border p-4 rounded-2xl flex items-center gap-2 cursor-pointer hover:bg-gray-100 transition">
                                <input type="checkbox" name="tv" />
                                <TvIcon className="w-6 h-6" />
                                <span>TV</span>
                            </label>

                            <label className="border p-4 rounded-2xl flex items-center gap-2 cursor-pointer hover:bg-gray-100 transition">
                                <input type="checkbox" name="pets" />
                                <HeartIcon className="w-6 h-6" />
                                <span>Pets Allowed</span>
                            </label>

                            <label className="border p-4 rounded-2xl flex items-center gap-2 cursor-pointer hover:bg-gray-100 transition">
                                <input type="checkbox" name="free_parking" />
                                <TruckIcon className="w-6 h-6" />
                                <span>Free Parking</span>
                            </label>

                            <label className="border p-4 rounded-2xl flex items-center gap-2 cursor-pointer hover:bg-gray-100 transition">
                                <input type="checkbox" name="private_entrance" />
                                <KeyIcon className="w-6 h-6" />
                                <span>Private Entrance</span>
                            </label>

                            <label className="border p-4 rounded-2xl flex items-center gap-2 cursor-pointer hover:bg-gray-100 transition">
                                <input type="checkbox" name="kitchen" />
                                <HomeIcon className="w-6 h-6" />
                                <span>Kitchen</span>
                            </label>

                            <label className="border p-4 rounded-2xl flex items-center gap-2 cursor-pointer hover:bg-gray-100 transition">
                                <input type="checkbox" name="air_conditioning" />
                                <BoltIcon className="w-6 h-6" />
                                <span>Air Conditioning</span>
                            </label>

                            <label className="border p-4 rounded-2xl flex items-center gap-2 cursor-pointer hover:bg-gray-100 transition">
                                <input type="checkbox" name="heating" />
                                <FireIcon className="w-6 h-6" />
                                <span>Heating</span>
                            </label>

                            <label className="border p-4 rounded-2xl flex items-center gap-2 cursor-pointer hover:bg-gray-100 transition">
                                <input type="checkbox" name="pool" />
                                <SunIcon className="w-6 h-6" />
                                <span>Pool</span>
                            </label>

                            <label className="border p-4 rounded-2xl flex items-center gap-2 cursor-pointer hover:bg-gray-100 transition">
                                <input type="checkbox" name="hot_tub" />
                                <SparklesIcon className="w-6 h-6" />
                                <span>Hot Tub</span>
                            </label>

                            <label className="border p-4 rounded-2xl flex items-center gap-2 cursor-pointer hover:bg-gray-100 transition">
                                <input type="checkbox" name="gym" />
                                <BuildingOffice2Icon className="w-6 h-6" />
                                <span>Gym</span>
                            </label>

                        </div>

                        <h2 className="text-xl mt-4 -mb-1">Extra Info</h2>
                        <textarea />

                        <h2 className="text-xl mt-4">Check-in & Check-out Times</h2>
                        <div className="grid sm:grid-cols-3 gap-4 mt-2">
                            <div>
                                <input type="text" placeholder="Check-in Time" />
                            </div>
                            <div>
                                <input type="text" placeholder="Check-out Time" />
                            </div>
                            <div>
                                <input type="text" placeholder="Max Guests" />
                            </div>
                        </div>
                    </form>
                </div>
            )}
        </div>
    );
}