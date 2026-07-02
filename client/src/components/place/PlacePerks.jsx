import {
    WifiIcon,
    TvIcon,
    HeartIcon,
    TruckIcon,
    KeyIcon,
    HomeIcon,
    FireIcon,
    SunIcon,
    SparklesIcon,
    BoltIcon,
    BuildingOffice2Icon,
} from "@heroicons/react/24/outline";
import PlaceFormSection from "./PlaceFormSection";

const perkOptions = [
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
];

export default function PlacePerks({ perks, onPerkChange }) {
    return (
        <PlaceFormSection title="Perks" description="Select all the perks of your place.">
            <div className="mt-2 grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
                {perkOptions.map(({ name, icon: Icon, label }) => (
                    <label
                        key={name}
                        className="flex cursor-pointer items-center gap-3 rounded-2xl border p-4 transition hover:bg-gray-50"
                    >
                        <input
                            type="checkbox"
                            name={name}
                            checked={perks.includes(name)}
                            className="h-5 w-5"
                            onChange={(ev) => onPerkChange(name, ev.target.checked)}
                        />
                        <Icon className="h-6 w-6" />
                        <span>{label}</span>
                    </label>
                ))}
            </div>
        </PlaceFormSection>
    );
}
