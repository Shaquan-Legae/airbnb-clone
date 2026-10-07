import { getApiBaseUrl } from "./apiConfig";

export function getPhotoUrl(photo) {
    if (!photo) {
        return "";
    }

    const filename = String(photo).split(/[\\/]/).pop();
    const apiBaseUrl = getApiBaseUrl();
    return `${apiBaseUrl}/uploads/${filename}`;
}

export function formatCurrency(price) {
    if (price === undefined || price === null || price === "") {
        return "R 0";
    }

    return new Intl.NumberFormat("en-ZA", {
        style: "currency",
        currency: "ZAR",
        maximumFractionDigits: 0,
    }).format(Number(price));
}

export function formatNightlyPrice(price) {
    return `${formatCurrency(price)} per night`;
}
