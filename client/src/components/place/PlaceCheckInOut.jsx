import PlaceFormSection from "./PlaceFormSection";

export default function PlaceCheckInOut({
    checkIn,
    checkOut,
    maxGuests,
    onCheckInChange,
    onCheckOutChange,
    onMaxGuestsChange,
}) {
    return (
        <PlaceFormSection
            title="Check-in & Check-out Times"
            description="Set check-in time, check-out time and maximum number of guests."
        >
            <div className="grid gap-4 sm:grid-cols-4">
                <div>
                    <input
                        type="text"
                        placeholder="14:00"
                        value={checkIn}
                        onChange={onCheckInChange}
                        className="w-full rounded-2xl border p-3"
                    />
                    <p className="mt-1 text-xs text-gray-500">Check-in time</p>
                </div>

                <div>
                    <input
                        type="text"
                        placeholder="11:00"
                        value={checkOut}
                        onChange={onCheckOutChange}
                        className="w-full rounded-2xl border p-3"
                    />
                    <p className="mt-1 text-xs text-gray-500">Check-out time</p>
                </div>

                <div>
                    <input
                        type="number"
                        placeholder="4"
                        value={maxGuests}
                        onChange={onMaxGuestsChange}
                        className="w-full rounded-2xl border p-3"
                    />
                    <p className="mt-1 text-xs text-gray-500">Max guests</p>
                </div>

            </div>
        </PlaceFormSection>
    );
}
