import { useContext, useState } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import axios from "axios";
import { UserContext } from "../context/UserContext";
import PlaceFormSection from "../components/place/PlaceFormSection";

const initialErrors = {};

function validateForm(formData) {
    const errors = {};
    const phonePattern = /^[+\d][\d\s().-]{6,}$/;

    if (!formData.fullName.trim()) errors.fullName = "Full name is required.";
    if (!formData.phone.trim()) {
        errors.phone = "Phone number is required.";
    } else if (!phonePattern.test(formData.phone.trim())) {
        errors.phone = "Enter a valid phone number.";
    }
    if (!formData.country.trim()) errors.country = "Country is required.";
    if (!formData.city.trim()) errors.city = "City is required.";
    if (!formData.governmentId.trim()) {
        errors.governmentId = "Government ID number is required.";
    }
    if (!formData.bio.trim()) {
        errors.bio = "Short host bio is required.";
    } else if (formData.bio.trim().length < 40) {
        errors.bio = "Bio must be at least 40 characters.";
    }
    if (formData.experience === "") {
        errors.experience = "Years hosting experience is required.";
    } else if (Number.isNaN(Number(formData.experience))) {
        errors.experience = "Experience must be a number.";
    } else if (Number(formData.experience) < 0) {
        errors.experience = "Experience cannot be negative.";
    }
    if (!formData.emergencyContact.trim()) {
        errors.emergencyContact = "Emergency contact is required.";
    }
    if (!formData.acceptTerms) {
        errors.acceptTerms = "You must accept the host terms.";
    }

    return errors;
}

function FieldError({ message }) {
    if (!message) return null;

    return <p className="mt-1 text-sm text-red-600">{message}</p>;
}

export default function BecomeHostPage() {
    const { user, loading, setUser, refreshUser } = useContext(UserContext);
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        fullName: user?.name || "",
        phone: "",
        country: "",
        city: "",
        governmentId: "",
        bio: "",
        experience: "",
        emergencyContact: "",
        acceptTerms: false,
    });
    const [errors, setErrors] = useState(initialErrors);
    const [formError, setFormError] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);

    if (loading) {
        return <div className="py-12 text-center text-gray-500">Loading...</div>;
    }

    if (!user) {
        return <Navigate to="/login" replace />;
    }

    if (user.role === "host") {
        return <Navigate to="/account/places" replace />;
    }

    function updateField(name, value) {
        setFormData((prev) => ({
            ...prev,
            [name]: value,
        }));

        setErrors((prev) => ({
            ...prev,
            [name]: "",
        }));
    }

    async function submitOnboarding(ev) {
        ev.preventDefault();

        const nextErrors = validateForm(formData);
        setErrors(nextErrors);
        setFormError("");

        if (Object.keys(nextErrors).length > 0) {
            return;
        }

        setIsSubmitting(true);

        try {
            const { data } = await axios.post("/become-host", {
                ...formData,
                experience: Number(formData.experience),
            });

            if (data.user) {
                setUser(data.user);
            }

            await refreshUser();

            navigate("/account/places", {
                replace: true,
                state: {
                    message: data.message || "Welcome! Your account is now a Host account.",
                },
            });
        } catch (error) {
            const responseErrors = error.response?.data?.errors;

            if (responseErrors) {
                setErrors(responseErrors);
            }

            setFormError(
                error.response?.data?.error ||
                "Could not complete host onboarding. Please try again."
            );
        } finally {
            setIsSubmitting(false);
        }
    }

    return (
        <div className="mx-auto mt-8 max-w-4xl px-4">
            <div className="mb-8">
                <h1 className="text-3xl font-semibold text-gray-900">
                    Become a Host
                </h1>
                <p className="mt-2 text-gray-500">
                    Tell us a little about yourself so guests know who will be welcoming them.
                </p>
            </div>

            <form onSubmit={submitOnboarding} className="space-y-8">
                <PlaceFormSection
                    title="Host Details"
                    description="Use the same account you already have. This information helps support safe hosting."
                >
                    <div className="grid gap-4 md:grid-cols-2">
                        <label>
                            <span className="text-sm font-medium text-gray-700">Full Name</span>
                            <input
                                type="text"
                                value={formData.fullName}
                                onChange={(ev) => updateField("fullName", ev.target.value)}
                                placeholder="Your legal name"
                            />
                            <FieldError message={errors.fullName} />
                        </label>

                        <label>
                            <span className="text-sm font-medium text-gray-700">Phone Number</span>
                            <input
                                type="text"
                                value={formData.phone}
                                onChange={(ev) => updateField("phone", ev.target.value)}
                                placeholder="+27 82 123 4567"
                            />
                            <FieldError message={errors.phone} />
                        </label>

                        <label>
                            <span className="text-sm font-medium text-gray-700">Country</span>
                            <input
                                type="text"
                                value={formData.country}
                                onChange={(ev) => updateField("country", ev.target.value)}
                                placeholder="South Africa"
                            />
                            <FieldError message={errors.country} />
                        </label>

                        <label>
                            <span className="text-sm font-medium text-gray-700">City</span>
                            <input
                                type="text"
                                value={formData.city}
                                onChange={(ev) => updateField("city", ev.target.value)}
                                placeholder="Durban"
                            />
                            <FieldError message={errors.city} />
                        </label>

                        <label>
                            <span className="text-sm font-medium text-gray-700">Government ID Number</span>
                            <input
                                type="text"
                                value={formData.governmentId}
                                onChange={(ev) => updateField("governmentId", ev.target.value)}
                                placeholder="ID or passport number"
                            />
                            <FieldError message={errors.governmentId} />
                        </label>

                        <label>
                            <span className="text-sm font-medium text-gray-700">Years Hosting Experience</span>
                            <input
                                type="number"
                                min="0"
                                value={formData.experience}
                                onChange={(ev) => updateField("experience", ev.target.value)}
                                placeholder="0"
                            />
                            <FieldError message={errors.experience} />
                        </label>
                    </div>
                </PlaceFormSection>

                <PlaceFormSection
                    title="About Your Hosting"
                    description="Share a short introduction guests can trust."
                >
                    <label>
                        <span className="text-sm font-medium text-gray-700">Short Host Bio</span>
                        <textarea
                            value={formData.bio}
                            onChange={(ev) => updateField("bio", ev.target.value)}
                            className="mt-1 h-32 w-full rounded-2xl border border-gray-300 bg-white px-3 py-2 outline-none transition focus:border-gray-500 focus:ring-1 focus:ring-gray-300"
                            placeholder="Tell guests about your hosting style, local knowledge, and what makes your stay welcoming."
                        />
                        <FieldError message={errors.bio} />
                    </label>

                    <label className="mt-4 block">
                        <span className="text-sm font-medium text-gray-700">Emergency Contact</span>
                        <input
                            type="text"
                            value={formData.emergencyContact}
                            onChange={(ev) => updateField("emergencyContact", ev.target.value)}
                            placeholder="Name and phone number"
                        />
                        <FieldError message={errors.emergencyContact} />
                    </label>
                </PlaceFormSection>

                <div className="rounded-2xl border border-gray-200 bg-white p-4">
                    <label className="flex items-start gap-3">
                        <input
                            type="checkbox"
                            checked={formData.acceptTerms}
                            onChange={(ev) => updateField("acceptTerms", ev.target.checked)}
                            className="mt-1 h-4 w-4 rounded border-gray-300 accent-primary"
                        />
                        <span className="text-sm text-gray-700">
                            I confirm this information is accurate and accept the host terms.
                        </span>
                    </label>
                    <FieldError message={errors.acceptTerms} />
                </div>

                {formError && (
                    <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                        {formError}
                    </div>
                )}

                <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full rounded-2xl bg-primary py-3 text-lg font-medium text-white transition hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-70"
                >
                    {isSubmitting ? "Submitting..." : "Become a Host"}
                </button>
            </form>
        </div>
    );
}
