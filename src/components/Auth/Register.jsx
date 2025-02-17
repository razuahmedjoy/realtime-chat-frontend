import { useState } from "react";
import { useNavigate } from "react-router";
import axiosInstance from "../../utils/axiosInstance";

export default function Register() {
  const [details, setDetails] = useState({ username: "", email: "", password: "" });
  const navigate = useNavigate();

  const handleRegister = async (e) => {
    e.preventDefault();
    try {
      await axiosInstance.post("auth/register/", details);
      console.log("User registered successfully");
      navigate("/");
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <form
        onSubmit={handleRegister}
        className="bg-white shadow-lg rounded-lg p-8 max-w-md w-full"
      >
        <h2 className="text-2xl font-bold text-gray-800 mb-6">Register</h2>

        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Username
          </label>
          <input
            type="text"
            placeholder="Enter your username"
            value={details.username}
            onChange={(e) => setDetails({ ...details, username: e.target.value })}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring focus:ring-green-300 focus:border-green-500"
          />
        </div>

        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Email
          </label>
          <input
            type="email"
            placeholder="Enter your email"
            value={details.email}
            onChange={(e) => setDetails({ ...details, email: e.target.value })}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring focus:ring-green-300 focus:border-green-500"
          />
        </div>

        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Password
          </label>
          <input
            type="password"
            placeholder="Enter your password"
            value={details.password}
            onChange={(e) => setDetails({ ...details, password: e.target.value })}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring focus:ring-green-300 focus:border-green-500"
          />
        </div>

        <button
          type="submit"
          className="w-full bg-green-500 text-white font-semibold py-2 rounded-lg hover:bg-green-600 transition"
        >
          Register
        </button>

        <p className="text-sm text-center text-gray-600 mt-4">
          Already have an account?{" "}
          <button
            type="button"
            onClick={() => navigate("/")}
            className="text-green-500 hover:underline"
          >
            Login
          </button>
        </p>
      </form>
    </div>
  );
}
