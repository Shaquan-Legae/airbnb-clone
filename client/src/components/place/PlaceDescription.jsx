import PlaceFormSection from "./PlaceFormSection";

export default function PlaceDescription({ description, onDescriptionChange }) {
    return (
        <PlaceFormSection title="Description" description="Describe your place.">
            <textarea
                value={description}
                onChange={onDescriptionChange}
                className="h-32 w-full rounded-2xl border p-3"
                placeholder="Describe your amazing place..."
            />
        </PlaceFormSection>
    );
}
