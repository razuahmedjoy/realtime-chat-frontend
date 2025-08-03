import { useEffect, useRef, useState } from "react";
import { useChatStore } from "../../store/chatStore";
import axiosInstance from "../../utils/axiosInstance";
import { useAuthStore } from "../../store/authStore";
import AOS from "aos";
import "aos/dist/aos.css";
import { ReactMic } from "react-mic";
import Modal from "react-modal";
import transcriptionIcon from "../../assets/transcription.png";

import toast from "react-hot-toast";
const customStyles = {
    content: {
        top: '50%',
        left: '50%',
        right: 'auto',
        bottom: 'auto',
        marginRight: '-50%',
        transform: 'translate(-50%, -50%)',
    },
};

const transcriptionStyles = {
    marginBottom: '8px',
    fontSize: '0.8em',
    padding: '8px',
    backgroundColor: '#f5f5f5',
    borderRadius: '4px',
    color: '#333',
    maxWidth: '550px',
};

Modal.setAppElement('#root');

const ChatWindow = () => {
    const { currentChat, messages, fethChats, addMessage, clearMessages, deleteMessage } = useChatStore();
    const [newMessage, setNewMessage] = useState("");
    const [isRecording, setIsRecording] = useState(false);
    const [audioBlob, setAudioBlob] = useState(null);
    const [isTyping, setIsTyping] = useState(false); // Local user typing status
    const [otherUserTyping, setOtherUserTyping] = useState(""); // Other user's typing status
    const typingTimeoutRef = useRef(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [transcription, setTranscription] = useState({});
    const [isTranscribing, setIsTranscribing] = useState({});

    const socketRef = useRef(null);
    const { accessToken } = useAuthStore()

    // websocket
    useEffect(() => {

        if (currentChat) {
            clearMessages();

            // Fetch chat history
            axiosInstance.get(`/chat/${currentChat.chat_id}/messages/`).then((response) => {
                response.data.forEach((message) => {

                    if (message.voice_url) {
                        const audioBlob = new Blob([new Uint8Array(atob(message.voice_url).split("").map(char => char.charCodeAt(0)))], { type: 'audio/mp3' });

                        const audioUrl = URL.createObjectURL(audioBlob);
                        const newMessage = {
                            id: message.id,
                            voice_url: audioUrl,
                            sender: message.sender,
                            text: "",
                        }
                        addMessage(newMessage);
                    }
                    else {
                        addMessage(message);
                    }
                });
            });

            // Initialize WebSocket
            // const token = localStorage.getItem("access_token");  // Or wherever your token is stored
            socketRef.current = new WebSocket(`ws://127.0.0.1:8000/ws/chat/${currentChat.chat_id}/?token=${accessToken}`);




            socketRef.current.onmessage = (event) => {

                const data = JSON.parse(event.data);

                if (data.type === "message") {
                    console.log("message listener: ", data);
                    addMessage(data);
                } else if (data.type === "typing") {
                    if (data.sender !== currentChat.current_user) {
                        setOtherUserTyping(data.is_typing ? `${data.sender} is typing...` : "");
                    }
                }
                else if (data.type === "voice_message") {
                    console.log("voice listener: ", data);
                    const audioBlob = new Blob([new Uint8Array(atob(data.audio).split("").map(char => char.charCodeAt(0)))], { type: 'audio/mp3' });

                    const audioUrl = URL.createObjectURL(audioBlob);
                    const message = {
                        id: data.id,
                        voice_url: audioUrl,
                        sender: data.sender,
                        text: "",
                    }
                    addMessage(message);



                    // addMessage(data);
                }
                else if (data.type === "delete") {
                    console.log("delete listener: ", data);
                    deleteMessage(data.id);
                    if (data.sender === currentChat.current_user_id) {
                        toast.success("Message deleted successfully");
                    }
                    else {
                        toast.error("Unsent a message");
                    }

                }

            };

            return () => {
                socketRef.current.close();
            };
        }
    }, [currentChat, clearMessages]);


    const startRecording = async () => {

        // Clear previous recording
        setAudioBlob(null);
        // if recording permission is granted start recording else ask for permission and if accepted start recording
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            console.log('Microphone access granted:', stream);
            setIsRecording(true);
        } catch (err) {
            console.error('Microphone access denied:', err);
            // setError('Microphone access denied. Please enable it in your browser settings.');
        }
        // setIsRecording(true);


    };


    const stopRecording = () => {

        setIsRecording(false);
    };

    const onData = (recordedBlob) => {
        // console.log('Recording data:', recordedBlob);
    };

    const onStop = (recordedBlob) => {
        console.log('Recording stopped: ', recordedBlob);
        console.log('Recording stopped: ', recordedBlob.blob);
        setAudioBlob(recordedBlob);
    };

    const handleModalClose = () => {
        setIsModalOpen(false);
        setIsRecording(false);
        // setAudioBlob(null);
    };

    const [showMenu, setShowMenu] = useState(false);  // To handle which message's menu is shown

    const toggleMenu = (index) => {
        // Toggle visibility of the dropdown menu
        setShowMenu(showMenu === index ? null : index);
    };




    const sendVoiceMessage = () => {


        const reader = new FileReader();
        reader.readAsDataURL(audioBlob.blob);

        reader.onloadend = () => {
            const base64Audio = reader.result.split(",")[1]; // Extract base64 content

            // Send the audio in base64 format through WebSocket
            socketRef.current.send(JSON.stringify({ type: "voice", voice: base64Audio, sender: currentChat.current_user_id, recipient: currentChat.participants[1] }));
        };



        // setAudioBlob(null);
        setIsModalOpen(false);

    };




    const handleTyping = () => {
        if (!isTyping) {
            setIsTyping(true);
            socketRef.current.send(JSON.stringify({ type: "typing", is_typing: true }));
        }

        // Reset typing status after a delay
        clearTimeout(typingTimeoutRef.current);
        typingTimeoutRef.current = setTimeout(() => {
            setIsTyping(false);
            socketRef.current.send(JSON.stringify({ type: "typing", is_typing: false }));
        }, 2000);
    };

    const sendMessage = () => {

        if (socketRef.current && newMessage.trim()) {

            const messageData = { type: "message", message: newMessage, voice_message: null, recipient: currentChat.participants[1] };
            // console.log(messageData);
            socketRef.current.send(JSON.stringify(messageData));
            setNewMessage("");

            // scroll to bottom
            const chatWindow = document.querySelector(".ChatWindow");
            if (chatWindow) {
                chatWindow.scrollTop = chatWindow.scrollHeight;
            }


        }
    };

    const handleDeleteMessage = (messageId) => {

        if (socketRef.current) {
            socketRef.current.send(JSON.stringify({ type: "delete", message_id: messageId, sender: currentChat.current_user_id }));
            console.log(messageId);
            setShowMenu(null);  // Close the menu after deleting the message
        }
    };

    const handleAutoReply = async () => {
        try {
            // Check if there are messages to process
            if (messages.length === 0) {
                toast.error("No messages available for auto reply");
                return;
            }

            // Get the last 5 messages from the current chat
            const lastMessages = messages.slice(-5);
            
            // Process messages to include both text and audio
            const processedMessages = [];
            
            for (const msg of lastMessages) {
                if (msg.text && msg.text.trim() !== "") {
                    // Text message
                    processedMessages.push({
                        text: msg.text,
                        sender: msg.sender,
                        timestamp: msg.timestamp,
                        type: 'text'
                    });
                } else if (msg.voice_url) {
                    // Audio message - transcribe it
                    try {
                        const response = await fetch(msg.voice_url);
                        const audioBlob = await response.blob();
                        
                        const reader = new FileReader();
                        reader.readAsDataURL(audioBlob);
                        
                        const transcribedText = await new Promise((resolve, reject) => {
                            reader.onloadend = async () => {
                                try {
                                    const base64Audio = reader.result.split(',')[1];
                                    const result = await axiosInstance.post('/chat/transcribe/', {
                                        audio: base64Audio
                                    });
                                    resolve(result.data.transcription);
                                } catch (error) {
                                    reject(error);
                                }
                            };
                        });
                        
                        processedMessages.push({
                            text: transcribedText,
                            sender: msg.sender,
                            timestamp: msg.timestamp,
                            type: 'audio_transcribed'
                        });
                    } catch (error) {
                        console.error('Failed to transcribe audio message:', error);
                        // Skip this audio message if transcription fails
                    }
                }
            }

            if (processedMessages.length === 0) {
                toast.error("No text or transcribable audio messages available for auto reply");
                return;
            }

            toast.loading("Generating auto reply...");

            // Send to backend for GPT processing
            const response = await axiosInstance.post('/chat/auto-reply/', {
                messages: processedMessages,
                chat_id: currentChat.chat_id,
                recipient: currentChat.participants[1]
            });

            toast.dismiss();

            if (response.data.success) {
                // Fill the generated reply into the message input box
                setNewMessage(response.data.reply_text);
                toast.success("Auto reply generated and sent!");
                
                // Automatically send the message after a short delay
                setTimeout(() => {
                    sendMessage();
                }, 500);
            } else {
                toast.error("Failed to generate auto reply");
            }
        } catch (error) {
            toast.dismiss();
            console.error('Auto reply error:', error);
            toast.error('Failed to generate auto reply');
        }
    };

    const handleTranscribe = async (messageId, audioUrl) => {
        // If transcription already exists, remove it (toggle off)
        if (transcription[messageId]) {
            setTranscription(prev => {
                const newTranscription = { ...prev };
                delete newTranscription[messageId];
                return newTranscription;
            });
            return;
        }

        try {
            setIsTranscribing(prev => ({ ...prev, [messageId]: true }));

            // Fetch the audio file
            const response = await fetch(audioUrl);
            const audioBlob = await response.blob();

            // Convert to base64
            const reader = new FileReader();
            reader.readAsDataURL(audioBlob);
            reader.onloadend = async () => {
                const base64Audio = reader.result.split(',')[1];

                // Send to backend for transcription
                const result = await axiosInstance.post('/chat/transcribe/', {
                    audio: base64Audio
                });

                setTranscription(prev => ({
                    ...prev,
                    [messageId]: result.data.transcription
                }));
                setIsTranscribing(prev => ({ ...prev, [messageId]: false }));
            };
        } catch (error) {
            console.error('Transcription error:', error);
            toast.error('Failed to transcribe audio');
            setIsTranscribing(prev => ({ ...prev, [messageId]: false }));
        }
    };

    const toggleTranscription = (messageId, audioUrl) => {
        handleTranscribe(messageId, audioUrl);
    };

    // if messages are loaded, scroll to bottom
    useEffect(() => {
        const chatWindow = document.querySelector(".ChatWindow");
        if (chatWindow) {
            chatWindow.scrollTop = chatWindow.scrollHeight
        }
    }, [messages]);

    const handleKeyUp = (e) => {
        if (e.key === "Enter") {
            sendMessage();
        }
    };

    useEffect(() => {
        AOS.init();
        AOS.refresh();
    }, [])

    return (
        <div className=" bg-teal-50 h-full px-4 pt-2 mb-2 relative">
            {currentChat ? (
                <div className="flex flex-col h-full ">
                    <div className="flex flex-col overflow-y-auto h-[85%] pb-5 ChatWindow px-4">
                        {messages.map((msg, index) => {
                            if (msg.text) {


                                return ((
                                    <div key={index} className={`flex items-center peer gap-x-2 ${msg.sender === currentChat.current_user_id && 'ms-auto'} `}>
                                        {
                                            msg.sender === currentChat.current_user_id && (
                                                <div
                                                    className="flex items-center relative"
                                                >

                                                    <svg onClick={() => toggleMenu(index)} width="16px" height="16px" viewBox="0 0 16 16" xmlns="http://www.w3.org/2000/svg" fill="#000000" className="bi bi-three-dots-vertical cursor-pointer">
                                                        <path d="M9.5 13a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0zm0-5a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0zm0-5a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0z" />
                                                    </svg>

                                                    {showMenu === index && (
                                                        <div
                                                            className="absolute bg-white shadow-md rounded-lg p-2 mt-2 top-5 z-50"
                                                        >
                                                            <button
                                                                onClick={() => handleDeleteMessage(msg.id)}
                                                                className="text-red-500"
                                                            >
                                                                Delete
                                                            </button>
                                                            <button
                                                                onClick={() => handleTranscribe(msg.id, msg.voice_url)}
                                                                className="text-blue-500"
                                                            >
                                                                {isTranscribing[msg.id] ? 'Transcribing...' :
                                                                    transcription[msg.id] ? 'Show Transcription' : 'Transcribe'}
                                                            </button>
                                                        </div>
                                                    )}

                                                </div>
                                            )
                                        }
                                        <div



                                            className={`p-2 w-fit max-w-[550px] ${msg.sender === currentChat.current_user_id ? "bg-purple-700 text-white ms-auto rounded-l-xl rounded-tr-xl" : "bg-blue-500 text-white rounded-r-xl rounded-tl-xl"
                                                } mb-2 cursor-pointer`}
                                        >
                                            <p>{msg.text} </p>
                                        </div>


                                    </div>
                                ))

                            }
                            else if (msg.voice_url) {
                                return (
                                    <div key={index} className={`flex flex-col peer gap-x-2 ${msg.sender === currentChat.current_user_id && 'ms-auto'} `}>

                                        <div

                                            className={`w-fit max-w-[550px] flex items-center ${msg.sender === currentChat.current_user_id ? " text-white ms-auto rounded-l-lg rounded-tr-lg" : " text-white rounded-r-lg rounded-tl-lg"
                                                } mb-2`}
                                        >
                                            <div className={`flex items-center peer gap-x-2 ${msg.sender === currentChat.current_user_id && 'ms-auto'} `}>
                                                {/* Transcription Icon - Available for all voice messages */}
                                                <img src={transcriptionIcon}
                                                    onClick={() => toggleTranscription(msg.id, msg.voice_url)}
                                                    width="16px"
                                                    height="16px"
                                                    className="hover:scale-110 transition-transform w-4 h-4 cursor-pointer"
                                                    title={isTranscribing[msg.id] ? 'Transcribing...' : transcription[msg.id] ? 'Hide Transcription' : 'Show Transcription'}
                                                    alt="transcription" />

                                                {
                                                    msg.sender === currentChat.current_user_id && (
                                                        <div
                                                            className="flex items-center relative gap-2 flex-shrink-0"
                                                        >
                                                            <svg onClick={() => toggleMenu(index)} width="16px" height="16px" viewBox="0 0 16 16" xmlns="http://www.w3.org/2000/svg" fill="#000000" className="bi bi-three-dots-vertical cursor-pointer">
                                                                <path d="M9.5 13a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0zm0-5a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0zm0-5a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0z" />
                                                            </svg>

                                                            {showMenu === index && (
                                                                <div
                                                                    className="absolute bg-white shadow-md rounded-lg p-2 mt-2 top-5 z-50"
                                                                >
                                                                    <button
                                                                        onClick={() => handleDeleteMessage(msg.id)}
                                                                        className="text-red-500"
                                                                    >
                                                                        Delete
                                                                    </button>
                                                                </div>
                                                            )}

                                                        </div>
                                                    )
                                                }
                                            </div>

                                            <audio
                                                controls

                                            >
                                                <source src={msg.voice_url} type="audio/webm" />
                                                Your browser does not support the audio element.
                                            </audio>

                                        </div>

                                        {/* Show transcription if available */}
                                        {transcription[msg.id] && (
                                            <div style={transcriptionStyles} className={`w-fit ${msg.sender === currentChat.current_user_id ? "ms-auto" : ""}`}>
                                                {transcription[msg.id]}
                                            </div>
                                        )}
                                    </div>
                                );
                            }


                        })}


                        {otherUserTyping && (
                            <div className="text-sm text-gray-500">{otherUserTyping}</div>
                        )}
                    </div>


                    {/* input message box */}

                    <div className="flex w-full p-0 h-auto px-5 ">
                        <input
                            type="text"
                            value={newMessage}
                            onKeyDown={handleTyping}
                            onKeyUp={handleKeyUp}
                            onChange={(e) => setNewMessage(e.target.value)}
                            className="flex-1 p-3 border rounded-md"
                        />
                        <button
                            onClick={sendMessage}
                            className="bg-blue-500 text-white py-1 px-4 rounded-md ml-2"
                        >
                            Send
                        </button>
                        <button onClick={() => setIsModalOpen(true)} className="bg-green-500 text-white py-1 px-4 rounded-md ml-2">
                            Record
                        </button>
                        <button onClick={handleAutoReply} className="bg-yellow-500 text-white py-1 px-4 rounded-md ml-2">
                            Auto Reply
                        </button>
                    </div>

                    {/* modal for voice recording */}
                    <Modal style={customStyles} isOpen={isModalOpen} onRequestClose={handleModalClose}>
                        <h2>Record Voice Message</h2>
                        <ReactMic
                            record={isRecording}
                            className="frequencyBars my-4"
                            visualSetting="frequencyBars"
                            onStop={onStop}
                            onData={onData}
                            mimeType="audio/webm"
                            strokeColor="#ffd900"
                            backgroundColor="#3b72e9"
                            noiseSuppression={true}

                        />
                        <button onClick={startRecording} disabled={isRecording} className="bg-blue-500 text-white py-1 px-4 rounded-md">
                            {isRecording ? "Recording..." : "Start Recording"}
                        </button>
                        <button onClick={stopRecording} disabled={!isRecording} className="bg-red-500 text-white py-1 px-4 rounded-md ml-2">
                            Stop
                        </button>
                        <button
                            onClick={sendVoiceMessage}
                            disabled={!audioBlob}
                            className="bg-green-500 text-white py-1 px-4 rounded-md ml-2"
                        >
                            Send Voice Message
                        </button>
                    </Modal>
                </div>
            ) : (
                <p className="text-center text-gray-500">Select a chat to start messaging.</p>
            )}


        </div>
    );
}


export default ChatWindow;