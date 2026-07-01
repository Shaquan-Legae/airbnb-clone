import axios from 'axios';
import { UserContext } from "./UserContext";
import { useState, useEffect } from 'react';

export default function UserContextProvider({ children }) {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        let isMounted = true;

        axios.get('/profile', { withCredentials: true })
            .then((response) => {
                if (isMounted) {
                    setUser(response.data.user);
                }
            })
            .catch(() => {
                if (isMounted) {
                    setUser(null);
                }
            })
            .finally(() => {
                if (isMounted) {
                    setLoading(false);
                }
            });

        return () => {
            isMounted = false;
        };
    }, []);

    return (
        <UserContext.Provider value={{ user, setUser, loading }}>
            {children}
        </UserContext.Provider>
    );
}