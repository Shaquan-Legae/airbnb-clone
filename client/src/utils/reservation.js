import { formatCurrency } from "./place";

export function toDateOnly(value) {
    if (!value) return null;
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return null;
    date.setHours(0, 0, 0, 0);
    return date;
}

export function calculateNights(checkInValue, checkOutValue) {
    const checkIn = toDateOnly(checkInValue);
    const checkOut = toDateOnly(checkOutValue);

    if (!checkIn || !checkOut || checkOut <= checkIn) {
        return 0;
    }

    return Math.round((checkOut - checkIn) / (1000 * 60 * 60 * 24));
}

export function calculateReservationPricing(price, checkIn, checkOut) {
    const nightlyPrice = Number(price || 0);
    const nights = calculateNights(checkIn, checkOut);
    const subtotal = Math.round(nightlyPrice * nights);
    const weeklyDiscount = nights >= 7 ? Math.round(subtotal * 0.1) : 0;
    const cleaningFee = nights > 0 ? Math.round(nightlyPrice * 0.15) : 0;
    const taxableBase = subtotal - weeklyDiscount + cleaningFee;
    const serviceFee = nights > 0 ? Math.round(taxableBase * 0.14) : 0;
    const taxes = nights > 0 ? Math.round((taxableBase + serviceFee) * 0.08) : 0;

    return {
        nightlyPrice,
        nights,
        subtotal,
        weeklyDiscount,
        cleaningFee,
        serviceFee,
        taxes,
        total: taxableBase + serviceFee + taxes,
    };
}

export function formatDate(value) {
    if (!value) return "";

    return new Intl.DateTimeFormat("en-ZA", {
        day: "numeric",
        month: "short",
        year: "numeric",
    }).format(new Date(value));
}

export function formatDateRange(checkIn, checkOut) {
    return `${formatDate(checkIn)} - ${formatDate(checkOut)}`;
}

export function statusLabel(status) {
    const labels = {
        pending: "Pending",
        confirmed: "Confirmed",
        cancelled: "Cancelled",
        completed: "Completed",
        rejected: "Rejected",
    };

    return labels[status] || status;
}

export function statusClasses(status) {
    const classes = {
        pending: "bg-yellow-50 text-yellow-800 border-yellow-200",
        confirmed: "bg-green-50 text-green-800 border-green-200",
        cancelled: "bg-gray-100 text-gray-700 border-gray-200",
        completed: "bg-blue-50 text-blue-800 border-blue-200",
        rejected: "bg-red-50 text-red-700 border-red-200",
    };

    return classes[status] || classes.pending;
}

export function pricingRows(pricing) {
    if (!pricing) return [];

    return [
        {
            label: `${formatCurrency(pricing.nightlyPrice)} x ${pricing.nights} night${pricing.nights === 1 ? "" : "s"}`,
            value: formatCurrency(pricing.subtotal),
        },
        ...(pricing.weeklyDiscount > 0
            ? [{ label: "Weekly discount", value: `-${formatCurrency(pricing.weeklyDiscount)}` }]
            : []),
        { label: "Cleaning fee", value: formatCurrency(pricing.cleaningFee) },
        { label: "Service fee", value: formatCurrency(pricing.serviceFee) },
        { label: "Occupancy taxes", value: formatCurrency(pricing.taxes) },
    ];
}
