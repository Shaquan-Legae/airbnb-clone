import { useEffect, useRef, useState } from "react";
import axios from "axios";
import {
    CloudArrowUpIcon,
    XMarkIcon,
} from "@heroicons/react/24/outline";

export default function PhotosUploader({ photos, setPhotos }) {
    const [photoLink, setPhotoLink] = useState("");
    const [isDragging, setIsDragging] = useState(false);
    const [isUploading, setIsUploading] = useState(false);
    const [uploadMessage, setUploadMessage] = useState("");
    const [uploadMessageType, setUploadMessageType] = useState("success");
    const uploadMessageTimeoutRef = useRef(null);

    useEffect(() => {
        return () => {
            if (uploadMessageTimeoutRef.current) {
                clearTimeout(uploadMessageTimeoutRef.current);
            }
        };
    }, []);

    function getFilename(photo) {
        return String(photo).split(/[\\/]/).pop();
    }

    function normalizeUploadedPhotos(uploadedPhotos) {
        return (Array.isArray(uploadedPhotos) ? uploadedPhotos : [uploadedPhotos])
            .filter(Boolean)
            .map(getFilename);
    }

    function showUploadMessage(message, type = "success") {
        if (uploadMessageTimeoutRef.current) {
            clearTimeout(uploadMessageTimeoutRef.current);
        }

        setUploadMessage(message);
        setUploadMessageType(type);

        uploadMessageTimeoutRef.current = setTimeout(() => {
            setUploadMessage("");
            uploadMessageTimeoutRef.current = null;
        }, 5000);
    }

    async function addPhotoByLink() {
        const link = photoLink.trim();

        if (!link) {
            showUploadMessage("Please enter a photo URL before adding.", "error");
            return;
        }

        try {
            setIsUploading(true);
            const { data } = await axios.post(
                "/upload-by-link",
                { link }
            );

            const newPhotos = normalizeUploadedPhotos(data);
            setPhotos((prev) => [...prev, ...newPhotos]);
            setPhotoLink("");
            showUploadMessage("Photo added successfully.");
        } catch (err) {
            console.error(err);
            showUploadMessage("Could not add that photo. Please check the URL and try again.", "error");
        } finally {
            setIsUploading(false);
        }
    }

    async function uploadFiles(files) {
        if (!files?.length) return;

        const data = new FormData();

        for (let i = 0; i < files.length; i++) {
            data.append("photos", files[i]);
        }

        try {
            setIsUploading(true);
            const { data: filenames } = await axios.post(
                "/upload",
                data,
                {
                    headers: {
                        "Content-Type": "multipart/form-data",
                    },
                }
            );

            const newPhotos = normalizeUploadedPhotos(filenames);
            setPhotos((prev) => [...prev, ...newPhotos]);
        } catch (err) {
            console.error(err);
        } finally {
            setIsUploading(false);
        }
    }

    function uploadPhoto(ev) {
        uploadFiles(ev.target.files);
        ev.target.value = "";
    }

    function handleDrop(ev) {
        ev.preventDefault();
        setIsDragging(false);
        uploadFiles(ev.dataTransfer.files);
    }

    function removePhoto(photoIndexToRemove) {
        setPhotos((prev) => prev.filter((_, index) => index !== photoIndexToRemove));
    }

    function setPhotoAsCover(photoIndexToMove) {
        setPhotos((prev) => {
            const selectedPhoto = prev[photoIndexToMove];

            if (!selectedPhoto) {
                return prev;
            }

            return [
                selectedPhoto,
                ...prev.filter((_, index) => index !== photoIndexToMove),
            ];
        });
    }

    return (
        <>
            <div className="flex gap-2 mt-4">
                <input
                    type="text"
                    value={photoLink}
                    onChange={(ev) => setPhotoLink(ev.target.value)}
                    placeholder="Add using a link"
                    className="flex-1"
                />
                <button
                    type="button"
                    onClick={addPhotoByLink}
                    disabled={isUploading}
                    className="shrink-0 rounded-2xl bg-gray-200 px-4 text-gray-700 transition hover:bg-gray-300 disabled:cursor-not-allowed disabled:opacity-60"
                >
                    Add Photo
                </button>
            </div>

            {uploadMessage && (
                <p
                    className={`mt-2 text-sm ${uploadMessageType === "error"
                        ? "text-red-600"
                        : "text-green-600"
                        }`}
                >
                    {uploadMessage}
                </p>
            )}

            <div className="flex justify-center mt-4">
                <label
                    onDragOver={(ev) => {
                        ev.preventDefault();
                        setIsDragging(true);
                    }}
                    onDragLeave={() => setIsDragging(false)}
                    onDrop={handleDrop}
                    className={`w-full min-h-48 border-2 border-dashed rounded-2xl flex flex-col items-center justify-center gap-2 bg-white p-6 text-center cursor-pointer transition ${isDragging
                        ? "border-primary bg-primary/5 text-primary shadow-sm"
                        : "border-gray-300 text-gray-600 hover:border-primary hover:bg-gray-50 hover:text-gray-800"
                        }`}
                >
                    <input
                        type="file"
                        multiple
                        className="hidden"
                        onChange={uploadPhoto}
                    />

                    <CloudArrowUpIcon className="h-10 w-10" />

                    <span className="text-sm font-medium">
                        {isUploading
                            ? "Uploading..."
                            : isDragging
                                ? "Drop photos here"
                                : "Upload photos"}
                    </span>

                    <span className="text-xs text-gray-400">
                        Click to select or drag images here
                    </span>
                </label>
            </div>

            {photos.length > 0 ? (
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mt-4">
                    {photos.map((photo, index) => (
                        <div
                            key={`${getFilename(photo)}-${index}`}
                            className="group relative aspect-square overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm transition duration-300 ease-out animate-[fadeIn_250ms_ease-out] hover:-translate-y-0.5 hover:shadow-md"
                        >
                            <img
                                src={`https://airbnb-clone-backend-r26p.onrender.com/uploads/${getFilename(photo)}`}
                                alt=""
                                className="h-full w-full object-cover transition duration-300 ease-out group-hover:scale-105"
                            />

                            {index === 0 && (
                                <span className="absolute left-2 top-2 rounded-full bg-white/95 px-3 py-1 text-xs font-semibold text-gray-800 shadow-sm">
                                    Cover Photo
                                </span>
                            )}

                            {index !== 0 && (
                                <button
                                    type="button"
                                    onClick={() => setPhotoAsCover(index)}
                                    className="absolute bottom-2 left-2 rounded-full bg-white/95 px-3 py-1 text-xs font-semibold text-gray-800 shadow-sm transition hover:bg-primary hover:text-white"
                                >
                                    Set as Cover
                                </button>
                            )}

                            <button
                                type="button"
                                onClick={() => removePhoto(index)}
                                aria-label="Remove photo"
                                className="absolute right-2 top-2 inline-flex h-8 w-8 items-center justify-center rounded-full bg-white/95 text-gray-700 shadow-sm transition hover:bg-primary hover:text-white"
                            >
                                <XMarkIcon className="h-5 w-5" />
                            </button>
                        </div>
                    ))}
                </div>
            ) : (
                <div className="mt-4 rounded-2xl border border-dashed border-gray-200 bg-white py-8 text-center text-sm text-gray-500">
                    No photos uploaded yet.
                </div>
            )}
        </>
    );
}
