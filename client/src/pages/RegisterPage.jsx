import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";
import axios from "axios";

export default function RegisterPage() {
    const navigate = useNavigate();
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');
    const [validationErrors, setValidationErrors] = useState({});
    const [isLoading, setIsLoading] = useState(false);

    function validateForm() {
        const nextErrors = {};
        if (!name.trim()) nextErrors.name = 'Name is required.';
        if (!email.trim()) nextErrors.email = 'Email is required.';
        if (!password.trim()) nextErrors.password = 'Password is required.';
        setValidationErrors(nextErrors);
        return Object.keys(nextErrors).length === 0;
    }

    async function registerUser(e) {
        e.preventDefault();
        setError('');
        setMessage('');

        if (!validateForm()) {
            return;
        }

        setIsLoading(true);

        try {
            const response = await axios.post('/register', {
                name,
                email,
                password,
            });
            console.log('Registration response:', response.data);
            setMessage(response.data.message || 'Registration successful');
            navigate('/login');
        } catch (err) {
            console.error('Registration failed:', err);
            setError(err.response?.data?.error || 'Registration failed. Please try again.');
        } finally {
            setIsLoading(false);
        }
    }

    return (
        <div className="mt-4 grow flex items-center justify-around">
            <div className="mt-8">
                <h1 className="text-4xl text-center mb-4">Register</h1>
                <form className="max-w-md mx-auto mb-4" onSubmit={registerUser}>
                    <input type="text" placeholder="Name"
                        value={name}
                        onChange={(e) => setName(e.target.value)} />
                    {validationErrors.name && <div className="text-red-600 text-sm mt-1">{validationErrors.name}</div>}
                    <input type="email" placeholder="example@gmail.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)} />
                    {validationErrors.email && <div className="text-red-600 text-sm mt-1">{validationErrors.email}</div>}
                    <input type="password" placeholder="Password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)} />
                    {validationErrors.password && <div className="text-red-600 text-sm mt-1">{validationErrors.password}</div>}
                    <button className="primary" disabled={isLoading}>{isLoading ? 'Loading...' : 'Register'}</button>
                    {message && <div className="text-green-600 text-sm mt-2">{message}</div>}
                    {error && <div className="text-red-600 text-sm mt-2">{error}</div>}
                    <div className="text-center py-2 text-gray-500">
                        Already have an account? <Link to={'/login'} className="underline text-black">Login Now</Link>
                    </div>
                </form>
            </div>
        </div>
    )
}