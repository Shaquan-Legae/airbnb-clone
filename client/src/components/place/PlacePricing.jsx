import PlaceFormSection from "./PlaceFormSection";

export default function PlacePricing({ price, onPriceChange }) {
    return (
        <PlaceFormSection title="Price" description="Set a nightly price in South African Rand.">
            <div className="flex items-center gap-3">
                <span className="rounded-2xl border bg-gray-50 px-3 py-3 text-sm font-medium text-gray-700">
                    R
                </span>
                <input
                    type="number"
                    placeholder="1250"
                    value={price}
                    onChange={onPriceChange}
                    className="w-full rounded-2xl border p-3"
                />
            </div>
        </PlaceFormSection>
    );
}
