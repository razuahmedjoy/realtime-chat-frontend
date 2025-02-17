import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router";
import Topbar from "../shared/Topbar";
import Sidebar from "../shared/Sidebar";
import ChatWindow from "./ChatWindow";

const Chat = () => {



    return (
        <div className="flex h-screen bg-gray-100">
            <Sidebar />
            {/* Chat Area */}

            <div className="flex-1 flex flex-col">

                <Topbar />

                <ChatWindow />
            </div>

        </div>
    );
};

export default Chat;
