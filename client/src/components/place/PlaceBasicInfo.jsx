import PlaceFormSection from "./PlaceFormSection";

export default function PlaceBasicInfo({ title, address, onTitleChange, onAddressChange }) {
    return (
        <>
            <PlaceFormSection
                title="Title"
                description="Title for your place. Should be short and catchy."
            >
                <input
                    type="text"
                    placeholder="Title"
                    value={title}
                    onChange={onTitleChange}
                    className="w-full rounded-2xl border p-3"
                />
            </PlaceFormSection>

            <PlaceFormSection title="Address" description="Address of this place.">
                <input
                    type="text"
                    placeholder="Address"
                    value={address}
                    onChange={onAddressChange}
                    className="w-full rounded-2xl border p-3"
                />
            </PlaceFormSection>
        </>
    );
}
