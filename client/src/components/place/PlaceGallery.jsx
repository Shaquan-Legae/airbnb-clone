import PhotosUploader from "../PhotosUploader";
import PlaceFormSection from "./PlaceFormSection";

export default function PlaceGallery({ addedPhotos, setAddedPhotos }) {
    return (
        <PlaceFormSection title="Photos" description="Add photos using a URL or upload them.">
            <PhotosUploader photos={addedPhotos} setPhotos={setAddedPhotos} />
        </PlaceFormSection>
    );
}
