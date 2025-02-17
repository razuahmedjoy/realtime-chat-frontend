import { useState } from "react";
import { useNavigate } from "react-router";
import axiosInstance from "../../utils/axiosInstance";
import { useAuthStore } from "../../store/authStore";

export default function Login() {
    const [credentials, setCredentials] = useState({ username: "", password: "" });
    const setAuth = useAuthStore((state) => state.setAuth);
    const navigate = useNavigate();

    const handleLogin = async (e) => {
        e.preventDefault();
        try {
            const response = await axiosInstance.post("auth/login/", credentials);
            setAuth(response.data);
            navigate("/chat");
        } catch (error) {
            alert("Invalid credentials, please try again.");
        }
    };

    return (
        <div className="flex items-center justify-center min-h-screen bg-gray-100">
            <form
                onSubmit={handleLogin}
                className="bg-white shadow-lg rounded-lg p-8 max-w-md w-full"
            >
                <h2 className="text-2xl font-bold text-gray-800 mb-6">Login</h2>

                <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Username
                    </label>
                    <input
                        type="text"
                        placeholder="Enter your username"
                        value={credentials.username}
                        onChange={(e) => setCredentials({ ...credentials, username: e.target.value })}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring focus:ring-blue-300 focus:border-blue-500"
                    />
                </div>

                <div className="mb-6">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Password
                    </label>
                    <input
                        type="password"
                        placeholder="Enter your password"
                        value={credentials.password}
                        onChange={(e) => setCredentials({ ...credentials, password: e.target.value })}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring focus:ring-blue-300 focus:border-blue-500"
                    />
                </div>

                <button
                    type="submit"
                    className="w-full bg-blue-500 text-white font-semibold py-2 rounded-lg hover:bg-blue-600 transition"
                >
                    Login
                </button>

                <p className="text-sm text-center text-gray-600 mt-4">
                    Don't have an account?{" "}
                    <button
                        type="button"
                        onClick={() => navigate("/register")}
                        className="text-blue-500 hover:underline"
                    >
                        Register
                    </button>
                </p>
            </form>
        </div>
    );
}
