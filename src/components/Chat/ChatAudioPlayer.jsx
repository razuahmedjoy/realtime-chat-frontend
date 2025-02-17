import React, { useEffect, useState } from "react";

const ChatAudioPlayer = ({ websocketUrl, messageId }) => {
    const [audioUrl, setAudioUrl] = useState(null);
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        const ws = new WebSocket(websocketUrl);

        ws.onopen = () => {
            console.log("WebSocket connected");
            ws.send(JSON.stringify({ type: "stream_audio", message_id: messageId }));
            setIsLoading(true);
        };

        ws.onmessage = (event) => {
            const data = JSON.parse(event.data);

            if (data.type === "audio_message") {
                const audioData = Uint8Array.from(
                    data.audio_data.match(/.{1,2}/g).map((byte) => parseInt(byte, 16))
                );

                // Create a Blob from the audio data
                const blob = new Blob([audioData], { type: "audio/mpeg" });
                const url = URL.createObjectURL(blob);

                setAudioUrl(url);
                setIsLoading(false);
            }
        };

        ws.onclose = () => {
            console.log("WebSocket disconnected");
        };

        ws.onerror = (error) => {
            console.error("WebSocket error:", error);
        };

        return () => {
            ws.close();
            if (audioUrl) {
                URL.revokeObjectURL(audioUrl); // Clean up the URL object
            }
        };
    }, [websocketUrl, messageId, audioUrl]);

    return (
        <div>
            {isLoading && <p>Loading audio...</p>}
            {audioUrl && (
                <audio controls>
                    <source src={audioUrl} type="audio/mpeg" />
                    Your browser does not support the audio element.
                </audio>
            )}
        </div>
    );
};

export default ChatAudioPlayer;
