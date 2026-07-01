import { Link } from "react-router-dom";
import { useState } from "react";
import axios from "axios";

export default function RegisterPage() {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');

    async function registerUser(e) {
        e.preventDefault();
        setError('');
        setMessage('');

        try {
            const response = await axios.post('/register', {
                name,
                email,
                password,
            });
            console.log('Registration response:', response.data);
            setMessage(response.data.message || 'Registration successful');
        } catch (err) {
            console.error('Registration failed:', err);
            setError(err.response?.data?.error || 'Registration failed. Please try again.');
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
                    <input type="email" placeholder="example@gmail.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)} />
                    <input type="password" placeholder="Password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)} />
                    <button className="primary">Register</button>
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