import { useState, useEffect } from 'react';
import axiosInstance from '../utils/axiosInstance';

const useChats = () => {
    const [chats, setChats] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const fetchChats = async () => {
        try {
            const response = await axiosInstance.get(`/chat/chats/`);
            setChats(response.data);
        } catch (err) {
            setError(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {


        fetchChats();
    }, []);

    return { chats, fetchChats, loading, error };
};

export default useChats;