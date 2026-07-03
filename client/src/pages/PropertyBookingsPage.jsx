import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import { formatCurrency, getPhotoUrl } from "../utils/place";
import {
    formatDateRange,
    pricingRows,
    statusClasses,
    statusLabel,
} from "../utils/reservation";

function getGuestName(guest) {
    return guest?.name || [guest?.firstName, guest?.lastName].filter(Boolean).join(" ") || guest?.email || "Guest";
}

function GuestAvatar({ guest }) {
    const photoUrl = getPhotoUrl(guest?.profilePhoto);
    const name = getGuestName(guest);

    if (photoUrl) {
        return <img src={photoUrl} alt={name} className="size-12 rounded-full object-cover" />;
    }

    return (
        <div className="flex size-12 items-center justify-center rounded-full bg-gray-200 font-semibold text-gray-700">
            {name.charAt(0).toUpperCase()}
        </div>
    );
}

function PropertyBookingCard({ reservation, onChanged }) {
    const photoUrl = getPhotoUrl(reservation.place?.photos?.[0]);

    async function updateStatus(action) {
        await axios.patch(`/reservations/${reservation._id}/status`, { action });
        await onChanged();
    }

    return (
        <article className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
            <div className="grid gap-5 lg:grid-cols-[180px_1fr]">
                <div className="h-40 overflow-hidden rounded-xl bg-gray-100">
                    {photoUrl ? (
                        <img src={photoUrl} alt={reservation.place?.title} className="h-full w-full object-cover" />
                    ) : (
                        <div className="flex h-full items-center justify-center text-sm text-gray-400">No photo</div>
                    )}
                </div>

                <div>
                    <div className="flex flex-wrap justify-between gap-3">
                        <div>
                            <h3 className="text-lg font-semibold">{reservation.place?.title}</h3>
                            <p className="text-sm text-gray-500">{reservation.place?.address}</p>
                        </div>
                        <span className={`h-fit rounded-full border px-3 py-1 text-xs font-semibold ${statusClasses(reservation.status)}`}>
                            {statusLabel(reservation.status)}
                        </span>
                    </div>

                    <div className="mt-4 flex items-center gap-3">
                        <GuestAvatar guest={reservation.guest} />
                        <div>
                            <p className="font-semibold">{getGuestName(reservation.guest)}</p>
                            <p className="text-sm text-gray-500">{reservation.guest?.email}</p>
                        </div>
                    </div>

                    <div className="mt-4 grid gap-4 text-sm md:grid-cols-3">
                        <div>
                            <p className="font-semibold">Dates</p>
                            <p className="text-gray-600">{formatDateRange(reservation.checkIn, reservation.checkOut)}</p>
                        </div>
                        <div>
                            <p className="font-semibold">Guests</p>
                            <p className="text-gray-600">{reservation.guests}</p>
                        </div>
                        <div>
                            <p className="font-semibold">Revenue</p>
                            <p className="text-gray-600">{formatCurrency(reservation.pricing?.total)}</p>
                        </div>
                    </div>

                    <div className="mt-4 space-y-2 text-sm">
                        {pricingRows(reservation.pricing).map((row) => (
                            <div key={row.label} className="flex justify-between gap-4">
                                <span>{row.label}</span>
                                <span>{row.value}</span>
                            </div>
                        ))}
                        <div className="flex justify-between border-t border-gray-200 pt-2 font-semibold">
                            <span>Reservation total</span>
                            <span>{formatCurrency(reservation.pricing?.total)}</span>
                        </div>
                    </div>

                    <div className="mt-5 flex flex-wrap gap-2">
                        <Link to={`/singleplace/${reservation.place?._id}`} className="rounded-full border border-gray-300 px-4 py-2 text-sm font-semibold">
                            View Property
                        </Link>
                        {reservation.status === "pending" && (
                            <>
                                <button type="button" onClick={() => updateStatus("confirm")} className="rounded-full bg-primary px-4 py-2 text-sm font-semibold text-white">
                                    Confirm
                                </button>
                                <button type="button" onClick={() => updateStatus("reject")} className="rounded-full border border-gray-300 px-4 py-2 text-sm font-semibold">
                                    Reject
                                </button>
                            </>
                        )}
                        {!["cancelled", "completed", "rejected"].includes(reservation.status) && (
                            <button type="button" onClick={() => updateStatus("cancel")} className="rounded-full border border-gray-300 px-4 py-2 text-sm font-semibold">
                                Cancel
                            </button>
                        )}
                        {reservation.status === "confirmed" && (
                            <button type="button" onClick={() => updateStatus("complete")} className="rounded-full bg-gray-900 px-4 py-2 text-sm font-semibold text-white">
                                Complete
                            </button>
                        )}
                    </div>
                </div>
            </div>
        </article>
    );
}

export default function PropertyBookingsPage() {
    const [reservations, setReservations] = useState([]);
    const [status, setStatus] = useState("loading");

    async function loadReservations() {
        setStatus("loading");

        try {
            const { data } = await axios.get("/reservations/host");
            const nextReservations = Array.isArray(data) ? data : [];
            setReservations(nextReservations);
            setStatus(nextReservations.length ? "success" : "empty");
        } catch (error) {
            console.error("Failed to load property bookings:", error);
            setReservations([]);
            setStatus("failure");
        }
    }

    useEffect(() => {
        const timeoutId = window.setTimeout(() => {
            loadReservations();
        }, 0);

        return () => window.clearTimeout(timeoutId);
    }, []);

    if (status === "loading") {
        return <p className="py-10 text-center text-gray-500">Loading property bookings...</p>;
    }

    if (status === "failure") {
        return <p className="py-10 text-center text-red-600">Could not load property bookings.</p>;
    }

    if (status === "empty") {
        return (
            <div className="mx-auto mt-10 max-w-xl text-center">
                <h1 className="text-2xl font-semibold">No property bookings yet</h1>
                <p className="mt-2 text-gray-500">Reservations for your accommodations will appear here.</p>
            </div>
        );
    }

    return (
        <div className="mx-auto mt-8 max-w-5xl px-4">
            <h1 className="text-3xl font-semibold">Property Bookings</h1>
            <div className="mt-6 space-y-4">
                {reservations.map((reservation) => (
                    <PropertyBookingCard
                        key={reservation._id}
                        reservation={reservation}
                        onChanged={loadReservations}
                    />
                ))}
            </div>
        </div>
    );
}
