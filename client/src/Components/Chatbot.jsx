import React, { useState, useEffect, useRef } from 'react';
import { IoChatbubbleEllipsesSharp, IoSend } from 'react-icons/io5'; // Using react-icons for chat icon
import './Chatbot.css'; // For chatbot specific styling
import api from "../Api/api";

function Chatbot() {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState([]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const messagesEndRef = useRef(null);

    const toggleChatbot = () => {
        setIsOpen(!isOpen);
    };

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const handleSend = async () => {
        if (input.trim() === '') return;

        const userMessage = { type: 'user', text: input };
        setMessages((prevMessages) => [...prevMessages, userMessage]);
        setInput('');
        setIsLoading(true);

        try {
            const chatHistoryForLLM = messages.map(msg => ({
                type: msg.type,
                text: msg.text
            }));

            const res = await api.post("/chat", {
                message: input,
                chatHistory: chatHistoryForLLM
            });

            const data = res.data;

            const botReply = {
                type: 'bot',
                text: data.reply || "Sorry, I didn't understand that.",
            };

            // Append related courses (if any)
            if (Array.isArray(data.courses) && data.courses.length > 0) {
                botReply.text += `\n\nRecommended Courses:\n` + data.courses.map(course => `• ${course.title}`).join('\n');
            }

            setMessages((prevMessages) => [...prevMessages, botReply]);

        } catch (error) {
            console.error("Error sending message:", error.message || error);
            setMessages((prevMessages) => [...prevMessages, {
                type: 'bot',
                text: '⚠️ Oops! Something went wrong. Please try again.'
            }]);
        } finally {
            setIsLoading(false);
        }
    };


    const handleKeyPress = (e) => {
        if (e.key === 'Enter') {
            handleSend();
        }
    };

    return (
        <div className="chatbot-container">
            <div className="chatbot-toggle-button" onClick={toggleChatbot}>
                <IoChatbubbleEllipsesSharp size={30} />
            </div>

            {isOpen && (
                <div className="chatbot-window">
                    <div className="chatbot-header">
                        <h3> E-learning Chatbot</h3>
                        <button className="close-button" onClick={toggleChatbot}>X</button>
                    </div>
                    <div className="chatbot-messages">
                        {messages.length === 0 && (
                            <div className="welcome-message">
                                <p>Hi there! How can I assist you today?</p>
                            </div>
                        )}
                        {messages.map((msg, index) => (
                            <div key={index} className={`message ${msg.type}`}>
                                <p>{msg.text}</p>
                            </div>
                        ))}
                        {isLoading && (
                            <div className="message bot loading">
                                <p>...</p>
                            </div>
                        )}
                        <div ref={messagesEndRef} />
                    </div>
                    <div className="chatbot-input-area">
                        <input
                            type="text"
                            placeholder="Type your question..."
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            onKeyPress={handleKeyPress}
                            disabled={isLoading}
                        />
                        <button onClick={handleSend} disabled={isLoading}>
                            <IoSend />
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}

export default Chatbot;