import React, { useEffect, useState } from 'react';
import { useChatStore } from '../../store/chatStore';
import axiosInstance from '../../utils/axiosInstance';
import useChats from '../../hooks/useChats';
import { useAuthStore } from '../../store/authStore';

const Sidebar = () => {
    const [searchTerm, setSearchTerm] = useState("");
    const [searchResults, setSearchResults] = useState([]);
    const { chats, setChats, fetchChats, currentChat, setCurrentChat } = useChatStore();

    const { userData } = useAuthStore();


    const searchUsers = async () => {
        if (!searchTerm) return;
        try {
            const response = await axiosInstance.get(`/chat/search_users/?email=${searchTerm}`);
            // console.log(response);
            setSearchResults(response.data);
        } catch (error) {
            console.error("Error searching users:", error);
        }
    };

    const startChat = async (userId) => {
        try {
            const response = await axiosInstance.post("/chat/start_chat/", { user_id: userId });
            const chat = response.data;
            setChats([...chats, chat]);
            setCurrentChat(chat);
            setSearchResults([]);
            setSearchTerm("");
        } catch (error) {
            console.error("Error starting chat:", error);
        }
    };
    useEffect(() => {
        fetchChats()
    }, [])

    // console.log(currentChat)
    return (


        <div className="w-1/5 bg-slate-200 shadow-lg flex flex-col" >

            <div className="w-full bg-gray-100 p-4">
                <h2 className="text-lg font-semibold mb-4">Chats</h2>

                <div>
                    <input
                        type="text"
                        placeholder="Search by email"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full p-2 border rounded-md mb-2"
                    />
                    {searchResults.length > 0 && (
                        <div className="my-4">
                            <h3 className="text-sm font-semibold mb-2">Search Results:</h3>
                            <ul>
                                {searchResults.map((user) => (
                                    <li
                                        key={user.id}
                                        className="p-2 cursor-pointer hover:bg-gray-200 rounded-md"
                                        onClick={() => startChat(user.id)}
                                    >
                                        {user.email}
                                    </li>
                                ))}
                            </ul>
                        </div>
                    )}
                    <button
                        onClick={searchUsers}
                        className="w-full bg-blue-500 text-white py-1 rounded-md"
                    >
                        Search
                    </button>
                </div>


            </div>

            <ul className="mb-6 p-4">
                {chats?.length > 0 && chats.map((chat, index) => (
                    <li
                        key={index}
                        className={`p-2 cursor-pointer  rounded-md border-b border-b-gray-300 ${chat.chat_id === currentChat?.chat_id ? "bg-blue-500 text-white" : "hover:bg-slate-300"}`}
                        onClick={() => setCurrentChat(chat)}
                    >
                        {chat?.other_user[0]}
                    </li>
                ))}
            </ul>


            {/* design a bottom card where current user name,email and update profile link should visible */}
            <div className="mt-auto p-4 bg-gray-100 border-t border-t-gray-300">
                <p className="text-sm mb-1">username: {userData?.username}</p>
                <p className="text-sm mb-1">Email: {userData?.email}</p>
                <a href="/update-profile" className="text-blue-500 text-sm underline">
                    Update Profile
                </a>
            </div>
        </div >

    );
};

export default Sidebar;