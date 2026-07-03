import { useContext, useState } from "react";
import { UserContext } from "../context/UserContext";
import {
    Navigate,
    useParams,
    useNavigate,
    useLocation,
} from "react-router-dom";
import axios from "axios";
import PlacesPage from "./PlacesPage";
import Footer from "../components/Footer";
import AccountNav from "../components/AccountNav";
import BecomeHostPage from "./BecomeHostPage";
import BookingsPage from "./BookingsPage";
import PropertyBookingsPage from "./PropertyBookingsPage";
import PhotosUploader from "../components/PhotosUploader";

function splitName(name = "") {
    const parts = String(name).trim().split(/\s+/).filter(Boolean);
    return {
        firstName: parts[0] || "",
        lastName: parts.slice(1).join(" "),
    };
}

function FieldError({ message }) {
    if (!message) return null;
    return <p className="mt-1 text-sm text-red-600">{message}</p>;
}

function ProfilePanel({ user, setUser, refreshUser, onLogout }) {
    const fallbackName = splitName(user.name);
    const [formData, setFormData] = useState({
        firstName: user.firstName || fallbackName.firstName,
        lastName: user.lastName || fallbackName.lastName,
        email: user.email || "",
        phone: user.phone || "",
        country: user.country || "",
        city: user.city || "",
        bio: user.bio || "",
    });
    const [profilePhotos, setProfilePhotos] = useState(user.profilePhoto ? [user.profilePhoto] : []);
    const [errors, setErrors] = useState({});
    const [message, setMessage] = useState("");
    const [formError, setFormError] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);

    function updateField(name, value) {
        setFormData((prev) => ({ ...prev, [name]: value }));
        setErrors((prev) => ({ ...prev, [name]: "" }));
        setMessage("");
        setFormError("");
    }

    function validateForm() {
        const nextErrors = {};
        const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        const phonePattern = /^[+\d][\d\s().-]{6,}$/;

        if (!formData.firstName.trim()) nextErrors.firstName = "First name is required.";
        if (!formData.lastName.trim()) nextErrors.lastName = "Last name is required.";
        if (!formData.email.trim()) {
            nextErrors.email = "Email is required.";
        } else if (!emailPattern.test(formData.email.trim())) {
            nextErrors.email = "Enter a valid email address.";
        }
        if (formData.phone.trim() && !phonePattern.test(formData.phone.trim())) {
            nextErrors.phone = "Enter a valid phone number.";
        }

        return nextErrors;
    }

    async function saveProfile(ev) {
        ev.preventDefault();

        const nextErrors = validateForm();
        setErrors(nextErrors);
        setFormError("");
        setMessage("");

        if (Object.keys(nextErrors).length > 0) {
            return;
        }

        setIsSubmitting(true);

        try {
            const { data } = await axios.put("/profile", {
                ...formData,
                profilePhoto: profilePhotos[0] || "",
            });

            if (data.user) {
                setUser(data.user);
            }

            await refreshUser();
            setMessage(data.message || "Profile updated successfully.");
        } catch (error) {
            if (error.response?.data?.errors) {
                setErrors(error.response.data.errors);
            }

            setFormError(error.response?.data?.error || "Could not update profile.");
        } finally {
            setIsSubmitting(false);
        }
    }

    return (
        <div className="mx-auto mt-8 max-w-4xl px-4">
            <div className="mb-8">
                <h1 className="text-3xl font-semibold">Personal Information</h1>
                <p className="mt-2 text-gray-500">Logged in as {user.name} ({user.email})</p>
            </div>

            <form onSubmit={saveProfile} className="space-y-8">
                <section>
                    <h2 className="text-xl font-semibold">Profile picture</h2>
                    <p className="text-sm text-gray-500">Upload one clear profile photo.</p>
                    <PhotosUploader
                        photos={profilePhotos}
                        setPhotos={(updater) => {
                            setProfilePhotos((prev) => {
                                const nextPhotos = typeof updater === "function" ? updater(prev) : updater;
                                return nextPhotos.slice(0, 1);
                            });
                        }}
                    />
                </section>

                <section>
                    <h2 className="text-xl font-semibold">About you</h2>
                    <div className="mt-2 grid gap-4 md:grid-cols-2">
                        <label>
                            <span className="text-sm font-medium text-gray-700">First name</span>
                            <input type="text" value={formData.firstName} onChange={(ev) => updateField("firstName", ev.target.value)} />
                            <FieldError message={errors.firstName} />
                        </label>
                        <label>
                            <span className="text-sm font-medium text-gray-700">Last name</span>
                            <input type="text" value={formData.lastName} onChange={(ev) => updateField("lastName", ev.target.value)} />
                            <FieldError message={errors.lastName} />
                        </label>
                        <label>
                            <span className="text-sm font-medium text-gray-700">Email</span>
                            <input type="email" value={formData.email} onChange={(ev) => updateField("email", ev.target.value)} />
                            <FieldError message={errors.email} />
                        </label>
                        <label>
                            <span className="text-sm font-medium text-gray-700">Phone</span>
                            <input type="text" value={formData.phone} onChange={(ev) => updateField("phone", ev.target.value)} />
                            <FieldError message={errors.phone} />
                        </label>
                        <label>
                            <span className="text-sm font-medium text-gray-700">Country</span>
                            <input type="text" value={formData.country} onChange={(ev) => updateField("country", ev.target.value)} />
                        </label>
                        <label>
                            <span className="text-sm font-medium text-gray-700">City</span>
                            <input type="text" value={formData.city} onChange={(ev) => updateField("city", ev.target.value)} />
                        </label>
                    </div>
                    <label className="mt-4 block">
                        <span className="text-sm font-medium text-gray-700">Bio</span>
                        <textarea
                            value={formData.bio}
                            onChange={(ev) => updateField("bio", ev.target.value)}
                            className="mt-1 h-32 w-full rounded-2xl border border-gray-300 bg-white px-3 py-2 outline-none transition focus:border-gray-500 focus:ring-1 focus:ring-gray-300"
                        />
                    </label>
                </section>

                {message && (
                    <div className="rounded-2xl border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">
                        {message}
                    </div>
                )}
                {formError && (
                    <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                        {formError}
                    </div>
                )}

                <div className="flex flex-wrap gap-3">
                    <button type="submit" disabled={isSubmitting} className="rounded-2xl bg-primary px-6 py-3 font-semibold text-white">
                        {isSubmitting ? "Saving..." : "Save Profile"}
                    </button>
                    <button type="button" className="rounded-2xl border border-gray-300 px-6 py-3 font-semibold" onClick={onLogout}>
                        Logout
                    </button>
                </div>
            </form>
        </div>
    );
}

export default function AccountPage() {
    const [redirect, setRedirect] = useState(null);

    const { subpage } = useParams();
    const location = useLocation();
    const activeSubpage = subpage || "profile";

    const { user, loading, setUser, refreshUser } = useContext(UserContext);
    const navigate = useNavigate();

    async function logout() {
        try {
            await axios.post("/logout");
            setUser(null);
            navigate("/login");
            setRedirect("/");
        } catch (err) {
            console.error("Logout failed:", err);
        }
    }

    if (loading) {
        return "Loading";
    }

    if (!loading && !user && !redirect) {
        return <Navigate to="/login" />;
    }

    if (redirect) {
        return <Navigate to={redirect} />;
    }

    if (activeSubpage === "places" && user.role !== "host") {
        return <Navigate to="/account/profile" replace />;
    }

    if (activeSubpage === "property-bookings" && user.role !== "host") {
        return <Navigate to="/account/profile" replace />;
    }

    if (activeSubpage === "become-host" && user.role === "host") {
        return <Navigate to="/account/places" replace />;
    }

    return (
        <div>
            <AccountNav />

            {location.state?.message && (
                <div className="mx-auto mt-6 max-w-4xl rounded-2xl border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">
                    {location.state.message}
                </div>
            )}

            {activeSubpage === "profile" && (
                <ProfilePanel
                    user={user}
                    setUser={setUser}
                    refreshUser={refreshUser}
                    onLogout={logout}
                />
            )}

            {activeSubpage === "bookings" && (
                <BookingsPage />
            )}

            {activeSubpage === "places" && (
                <PlacesPage key={location.pathname} />
            )}

            {activeSubpage === "property-bookings" && (
                <PropertyBookingsPage />
            )}

            {activeSubpage === "become-host" && (
                <BecomeHostPage />
            )}
            <Footer />
        </div>
    );
}
