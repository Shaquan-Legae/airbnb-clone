export default function PlaceFormSection({ title, description, children }) {
    return (
        <div className="mt-4">
            <h2 className="text-xl font-semibold">{title}</h2>
            {description && <p className="text-sm text-gray-500">{description}</p>}
            <div className="mt-2">{children}</div>
        </div>
    );
}
