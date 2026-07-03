import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import { formatCurrency, getPhotoUrl } from "../utils/place";
import {
    calculateReservationPricing,
    formatDateRange,
    pricingRows,
    statusClasses,
    statusLabel,
} from "../utils/reservation";

function bucketReservation(reservation) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (["cancelled", "rejected"].includes(reservation.status)) return "cancelled";
    if (reservation.status === "completed" || new Date(reservation.checkOut) < today) return "completed";
    if (new Date(reservation.checkIn) <= today && new Date(reservation.checkOut) >= today) return "current";
    return "upcoming";
}

function ReservationEditor({ reservation, onSaved, onCancel }) {
    const [checkIn, setCheckIn] = useState(reservation.checkIn?.slice(0, 10) || "");
    const [checkOut, setCheckOut] = useState(reservation.checkOut?.slice(0, 10) || "");
    const [guests, setGuests] = useState(String(reservation.guests || 1));
    const [errors, setErrors] = useState({});
    const [formError, setFormError] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const pricing = calculateReservationPricing(reservation.place?.price, checkIn, checkOut);

    async function saveReservation(ev) {
        ev.preventDefault();
        setIsSubmitting(true);
        setErrors({});
        setFormError("");

        try {
            await axios.put(`/reservations/${reservation._id}`, {
                checkIn,
                checkOut,
                guests: Number(guests),
            });
            await onSaved();
        } catch (error) {
            if (error.response?.data?.errors) {
                setErrors(error.response.data.errors);
            }

            setFormError(
                error.response?.data?.error ||
                "Could not update this reservation.",
            );
        } finally {
            setIsSubmitting(false);
        }
    }

    return (
        <form onSubmit={saveReservation} className="mt-4 rounded-2xl border border-gray-200 bg-gray-50 p-4">
            <div className="grid gap-3 sm:grid-cols-3">
                <label className="text-sm font-medium">
                    Check-in
                    <input type="date" value={checkIn} onChange={(ev) => setCheckIn(ev.target.value)} />
                    {errors.checkIn && <p className="text-xs text-red-600">{errors.checkIn}</p>}
                </label>
                <label className="text-sm font-medium">
                    Check-out
                    <input type="date" value={checkOut} onChange={(ev) => setCheckOut(ev.target.value)} />
                    {errors.checkOut && <p className="text-xs text-red-600">{errors.checkOut}</p>}
                </label>
                <label className="text-sm font-medium">
                    Guests
                    <input type="number" min="1" value={guests} onChange={(ev) => setGuests(ev.target.value)} />
                    {errors.guests && <p className="text-xs text-red-600">{errors.guests}</p>}
                </label>
            </div>

            <div className="mt-4 space-y-2 text-sm">
                {pricingRows(pricing).map((row) => (
                    <div key={row.label} className="flex justify-between">
                        <span>{row.label}</span>
                        <span>{row.value}</span>
                    </div>
                ))}
                <div className="flex justify-between border-t border-gray-200 pt-2 font-semibold">
                    <span>Total</span>
                    <span>{formatCurrency(pricing.total)}</span>
                </div>
            </div>

            {formError && <p className="mt-3 text-sm text-red-600">{formError}</p>}

            <div className="mt-4 flex flex-wrap gap-2">
                <button type="submit" disabled={isSubmitting} className="rounded-full bg-primary px-5 py-2 text-sm font-semibold text-white">
                    {isSubmitting ? "Saving..." : "Save changes"}
                </button>
                <button type="button" onClick={onCancel} className="rounded-full border border-gray-300 px-5 py-2 text-sm font-semibold">
                    Cancel edit
                </button>
            </div>
        </form>
    );
}

function ReservationCard({ reservation, onChanged }) {
    const [isEditing, setIsEditing] = useState(false);
    const photoUrl = getPhotoUrl(reservation.place?.photos?.[0]);
    const canEdit = !["cancelled", "completed", "rejected"].includes(reservation.status);
    const canDelete = reservation.status !== "completed";

    async function updateStatus(action) {
        await axios.patch(`/reservations/${reservation._id}/status`, { action });
        await onChanged();
    }

    async function deleteReservation() {
        const confirmed = window.confirm("Delete this reservation?");
        if (!confirmed) return;

        await axios.delete(`/reservations/${reservation._id}`);
        await onChanged();
    }

    return (
        <article className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
            <div className="grid gap-4 md:grid-cols-[220px_1fr]">
                <div className="h-56 bg-gray-100 md:h-full">
                    {photoUrl ? (
                        <img src={photoUrl} alt={reservation.place?.title} className="h-full w-full object-cover" />
                    ) : (
                        <div className="flex h-full items-center justify-center text-sm text-gray-400">No photo</div>
                    )}
                </div>

                <div className="p-5">
                    <div className="flex flex-wrap items-start justify-between gap-3">
                        <div>
                            <h3 className="text-lg font-semibold">{reservation.place?.title}</h3>
                            <p className="text-sm text-gray-500">{reservation.place?.address}</p>
                        </div>
                        <span className={`rounded-full border px-3 py-1 text-xs font-semibold ${statusClasses(reservation.status)}`}>
                            {statusLabel(reservation.status)}
                        </span>
                    </div>

                    <p className="mt-3 text-sm">{formatDateRange(reservation.checkIn, reservation.checkOut)}</p>
                    <p className="text-sm text-gray-600">{reservation.guests} guest{reservation.guests === 1 ? "" : "s"}</p>

                    <div className="mt-4 space-y-2 text-sm">
                        {pricingRows(reservation.pricing).map((row) => (
                            <div key={row.label} className="flex justify-between gap-4">
                                <span>{row.label}</span>
                                <span>{row.value}</span>
                            </div>
                        ))}
                        <div className="flex justify-between border-t border-gray-200 pt-2 font-semibold">
                            <span>Total</span>
                            <span>{formatCurrency(reservation.pricing?.total)}</span>
                        </div>
                    </div>

                    <div className="mt-5 flex flex-wrap gap-2">
                        <Link to={`/singleplace/${reservation.place?._id}`} className="rounded-full border border-gray-300 px-4 py-2 text-sm font-semibold">
                            View Property
                        </Link>
                        {canEdit && (
                            <button type="button" onClick={() => setIsEditing(true)} className="rounded-full border border-gray-300 px-4 py-2 text-sm font-semibold">
                                Edit Reservation
                            </button>
                        )}
                        {canEdit && (
                            <button type="button" onClick={() => updateStatus("cancel")} className="rounded-full border border-gray-300 px-4 py-2 text-sm font-semibold">
                                Cancel Reservation
                            </button>
                        )}
                        {canDelete && (
                            <button type="button" onClick={deleteReservation} className="rounded-full bg-gray-900 px-4 py-2 text-sm font-semibold text-white">
                                Delete Reservation
                            </button>
                        )}
                    </div>

                    {isEditing && (
                        <ReservationEditor
                            reservation={reservation}
                            onSaved={async () => {
                                setIsEditing(false);
                                await onChanged();
                            }}
                            onCancel={() => setIsEditing(false)}
                        />
                    )}
                </div>
            </div>
        </article>
    );
}

export default function BookingsPage() {
    const [reservations, setReservations] = useState([]);
    const [status, setStatus] = useState("loading");
    const [error, setError] = useState("");

    async function loadReservations() {
        setStatus("loading");
        setError("");

        try {
            const { data } = await axios.get("/reservations/my");
            const nextReservations = Array.isArray(data) ? data : [];
            setReservations(nextReservations);
            setStatus(nextReservations.length ? "success" : "empty");
        } catch (err) {
            console.error("Failed to load bookings:", err);
            setReservations([]);
            setError("Could not load your bookings.");
            setStatus("failure");
        }
    }

    useEffect(() => {
        document.title = "Trips • Airbnb";
        const timeoutId = window.setTimeout(() => {
            loadReservations();
        }, 0);

        return () => window.clearTimeout(timeoutId);
    }, []);

    const groupedReservations = useMemo(() => {
        const groups = {
            upcoming: [],
            current: [],
            completed: [],
            cancelled: [],
        };

        reservations.forEach((reservation) => {
            groups[bucketReservation(reservation)].push(reservation);
        });

        return groups;
    }, [reservations]);

    if (status === "loading") {
        return <p className="py-10 text-center text-gray-500">Loading your bookings...</p>;
    }

    if (status === "failure") {
        return <p className="py-10 text-center text-red-600">{error}</p>;
    }

    if (status === "empty") {
        return (
            <div className="mx-auto mt-10 max-w-xl text-center">
                <h1 className="text-2xl font-semibold">No trips booked yet</h1>
                <p className="mt-2 text-gray-500">When you reserve a stay, it will appear here.</p>
                <Link to="/listings" className="mt-5 inline-flex rounded-full bg-primary px-5 py-2 font-semibold text-white">
                    Browse listings
                </Link>
            </div>
        );
    }

    return (
        <div className="mx-auto mt-8 max-w-5xl px-4">
            <h1 className="text-3xl font-semibold">Trips</h1>
            <div className="mt-6 space-y-10">
                {[
                    ["upcoming", "Upcoming"],
                    ["current", "Current"],
                    ["completed", "Completed"],
                    ["cancelled", "Cancelled"],
                ].map(([key, title]) => (
                    <section key={key}>
                        <h2 className="text-xl font-semibold">{title}</h2>
                        {groupedReservations[key].length === 0 ? (
                            <p className="mt-3 rounded-2xl border border-dashed border-gray-200 p-5 text-sm text-gray-500">
                                No {title.toLowerCase()} reservations.
                            </p>
                        ) : (
                            <div className="mt-4 space-y-4">
                                {groupedReservations[key].map((reservation) => (
                                    <ReservationCard
                                        key={reservation._id}
                                        reservation={reservation}
                                        onChanged={loadReservations}
                                    />
                                ))}
                            </div>
                        )}
                    </section>
                ))}
            </div>
        </div>
    );
}
