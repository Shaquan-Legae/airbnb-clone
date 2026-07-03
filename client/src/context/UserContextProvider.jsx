import axios from 'axios';
import { UserContext } from "./UserContext";
import { useState, useEffect } from 'react';

export default function UserContextProvider({ children }) {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    async function fetchProfile() {
        try {
            const { data } = await axios.get('/profile', { withCredentials: true });
            const userData = data?.user || null;
            if (userData) {
                userData.role = userData.role ?? "guest";
            }
            setUser(userData);
        } catch (err) {
            console.error('Failed to fetch profile:', err);
            setUser(null);
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        let isMounted = true;

        const loadProfile = async () => {
            if (!isMounted) {
                return;
            }

            await fetchProfile();
        };

        loadProfile();

        return () => {
            isMounted = false;
        };
    }, []);

    return (
        <UserContext.Provider value={{ user, setUser, loading, refreshUser: fetchProfile }}>
            {children}
        </UserContext.Provider>
    );
}