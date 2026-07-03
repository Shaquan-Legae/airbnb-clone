export function getPhotoUrl(photo) {
    if (!photo) {
        return "";
    }

    const filename = String(photo).split(/[\\/]/).pop();
    return `https://airbnb-clone-backend-r26p.onrender.com/uploads/${filename}`;
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
