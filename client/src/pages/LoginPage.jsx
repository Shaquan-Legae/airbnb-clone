import { Link, useNavigate } from "react-router-dom";
import { useState, useContext } from "react";
import axios from "axios";
import { UserContext } from "../context/UserContext";

export default function LoginPage() {
    const navigate = useNavigate();
    const { setUser } = useContext(UserContext);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');
    const [validationErrors, setValidationErrors] = useState({});
    const [isLoading, setIsLoading] = useState(false);

    function validateForm() {
        const nextErrors = {};
        if (!email.trim()) nextErrors.email = 'Email is required.';
        if (!password.trim()) nextErrors.password = 'Password is required.';
        setValidationErrors(nextErrors);
        return Object.keys(nextErrors).length === 0;
    }

    async function loginUser(e) {
        e.preventDefault();
        setError('');
        setMessage('');

        if (!validateForm()) {
            return;
        }

        setIsLoading(true);

        try {
            const response = await axios.post('/login', {
                email,
                password,
            });
            console.log('Login response:', response.data);
            if (response.data.user) {
                setUser(response.data.user);
            }
            setMessage(response.data.message || 'Login successful');
            const isSuccessfulResponse = response.status >= 200 && response.status < 300;
            if (isSuccessfulResponse) {
                navigate('/');
            }
        } catch (err) {
            console.error('Login failed:', err);
            setError(err.response?.data?.error || 'Login failed. Please try again.');
        } finally {
            setIsLoading(false);
        }
    }

    return (
        <div className="mt-4 grow flex items-center justify-around">
            <div className="mt-8">
                <h1 className="text-4xl text-center mb-4">Login</h1>
                <form className="max-w-md mx-auto mb-4" onSubmit={loginUser}>
                    <input type="email" placeholder="example@gmail.com" value={email} onChange={(e) => setEmail(e.target.value)} className="w-full rounded border border-gray-300 px-3 py-2 outline-none focus:border-gray-500 focus:ring-1 focus:ring-gray-300" />
                    {validationErrors.email && <div className="text-red-600 text-sm mt-1">{validationErrors.email}</div>}
                    <input type="password" placeholder="Password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)} />
                    {validationErrors.password && <div className="text-red-600 text-sm mt-1">{validationErrors.password}</div>}
                    <button className="primary" disabled={isLoading}>{isLoading ? 'Loading...' : 'Login'}</button>
                    {message && <div className="text-green-600 text-sm mt-2 flex items-center">{message}</div>}
                    {error && <div className="text-red-600 text-sm mt-2 flex items-center">{error}</div>}
                    <div className="text-center py-2 text-gray-500">
                        Don't have an account yet? <Link to={'/register'} className="underline text-black">Register Now</Link>
                    </div>
                </form>
            </div>
        </div>
    )
}