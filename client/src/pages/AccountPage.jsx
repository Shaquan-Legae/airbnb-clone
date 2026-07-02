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

export default function AccountPage() {
    const [redirect, setRedirect] = useState(null);

    const { subpage } = useParams();
    const location = useLocation();

    const { user, loading, setUser } = useContext(UserContext);
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

    return (
        <div>
            <AccountNav />

            {subpage === "profile" && (
                <div className="justify-center mt-8 text-center max-w-lg mx-auto mb-35">
                    Logged in as {user.name} ({user.email})
                    <button
                        className="primary max-w-sm mt-2"
                        onClick={logout}
                    >
                        Logout
                    </button>
                </div>
            )}

            {subpage === "places" && (
                <PlacesPage key={location.pathname} />
            )}
            <Footer />
        </div>
    );
}