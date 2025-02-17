import { useNavigate } from "react-router";
import { useAuthStore } from "../../store/authStore";
import { useChatStore } from "../../store/chatStore";

const Topbar = () => {
    const { logout, userData } = useAuthStore();
    const { setCurrentChat } = useChatStore();
    const navigate = useNavigate();

    const handleLogout = () => {
        // Clear auth state and navigate to login page

        logout();
        setCurrentChat(null)
        navigate("/login");
    };

    return (
        <div className="w-full bg-blue-500 text-white py-3 px-5 flex items-center justify-between">
            <h1 className="text-lg font-semibold">Chat Application</h1>
            <button
                onClick={handleLogout}
                className="bg-red-500 hover:bg-red-600 text-white py-1 px-3 rounded-md"
            >
                Logout
            </button>
        </div>
    );
}

export default Topbar;