import { UserContext } from './UserContext';
import { useState } from 'react';
import { useEffect } from 'react';
import axios from 'axios';

export default function UserContextProvider({ children }) {
    const [user, setUser] = useState(null);
    useEffect(() => {
        if (!user) {
            axios.get('/profile').then((response) => {
                setUser(response.data.user);
            });
        }
    }, []);
    return (
        <UserContext.Provider value={{ user, setUser }}>
            {children}
        </UserContext.Provider>
    );
}