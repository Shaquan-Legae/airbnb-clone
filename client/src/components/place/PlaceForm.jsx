import PlaceBasicInfo from "./PlaceBasicInfo";
import PlaceDescription from "./PlaceDescription";
import PlaceGallery from "./PlaceGallery";
import PlacePerks from "./PlacePerks";
import PlaceCheckInOut from "./PlaceCheckInOut";
import PlacePricing from "./PlacePricing";

export default function PlaceForm({
    title,
    address,
    description,
    perks,
    extraInfo,
    checkIn,
    checkOut,
    maxGuests,
    price,
    addedPhotos,
    setAddedPhotos,
    onTitleChange,
    onAddressChange,
    onDescriptionChange,
    onPerkChange,
    onExtraInfoChange,
    onCheckInChange,
    onCheckOutChange,
    onMaxGuestsChange,
    onPriceChange,
    formError,
    isSubmitting,
    onSubmit,
}) {
    return (
        <form onSubmit={onSubmit} className="space-y-8">
            <PlaceBasicInfo
                title={title}
                address={address}
                onTitleChange={onTitleChange}
                onAddressChange={onAddressChange}
            />

            <PlaceGallery addedPhotos={addedPhotos} setAddedPhotos={setAddedPhotos} />

            <PlaceDescription description={description} onDescriptionChange={onDescriptionChange} />

            <PlacePerks perks={perks} onPerkChange={onPerkChange} />

            <div className="mt-4">
                <h2 className="text-xl font-semibold">Extra Info</h2>
                <p className="text-sm text-gray-500">House rules, check-in instructions or anything guests should know.</p>
                <textarea
                    value={extraInfo}
                    onChange={onExtraInfoChange}
                    className="mt-2 h-32 w-full rounded-2xl border p-3"
                    placeholder="Additional information..."
                />
            </div>

            <PlaceCheckInOut
                checkIn={checkIn}
                checkOut={checkOut}
                maxGuests={maxGuests}
                onCheckInChange={onCheckInChange}
                onCheckOutChange={onCheckOutChange}
                onMaxGuestsChange={onMaxGuestsChange}
            />

            <PlacePricing price={price} onPriceChange={onPriceChange} />

            {formError && (
                <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                    {formError}
                </div>
            )}

            <button
                type="submit"
                disabled={isSubmitting}
                className="w-full rounded-2xl bg-primary py-3 text-lg font-medium text-white transition hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-70"
            >
                {isSubmitting ? "Saving..." : "Save"}
            </button>
        </form>
    );
}
