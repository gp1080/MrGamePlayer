import React, { useState, useEffect, useRef } from 'react';
import { useWebSocket } from '../../contexts/WebSocketContext';
import { useWallet } from '../../contexts/WalletContext';

const EMOJI_LIST = {
    '😊': ':smile:',
    '👍': ':thumbsup:',
    '❤️': ':heart:',
    '🎮': ':game:',
    '🏆': ':trophy:',
    '🚀': ':rocket:',
    '😂': ':joy:',
    '🎯': ':dart:'
};

const GameChat = ({ roomId }) => {
    const { account } = useWallet();
    const { sendGameAction } = useWebSocket();
    // eslint-disable-next-line no-unused-vars
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState('');
    const [showEmojis, setShowEmojis] = useState(false);
    const [isTyping, setIsTyping] = useState(false);
    // eslint-disable-next-line no-unused-vars
    const [typingUsers, setTypingUsers] = useState([]);
    const chatEndRef = useRef(null);
    const fileInputRef = useRef(null);
    const typingTimeoutRef = useRef(null);

    useEffect(() => {
        chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    // Handle typing indicator
    const handleTyping = () => {
        if (!isTyping) {
            setIsTyping(true);
            sendGameAction({
                type: 'TYPING_START',
                roomId,
                sender: account
            });
        }

        // Clear existing timeout
        if (typingTimeoutRef.current) {
            clearTimeout(typingTimeoutRef.current);
        }

        // Set new timeout
        typingTimeoutRef.current = setTimeout(() => {
            setIsTyping(false);
            sendGameAction({
                type: 'TYPING_END',
                roomId,
                sender: account
            });
        }, 2000);
    };

    const handleSendMessage = (e) => {
        e.preventDefault();
        if (!newMessage.trim()) return;

        const messageData = {
            type: 'CHAT_MESSAGE',
            roomId,
            data: {
                sender: account,
                content: newMessage.trim(),
                timestamp: Date.now(),
                messageType: 'text'
            }
        };

        sendGameAction(messageData);
        setNewMessage('');
        setShowEmojis(false);
    };

    const handleEmojiClick = (emoji) => {
        setNewMessage(prev => prev + emoji);
        setShowEmojis(false);
    };

    const handleFileUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        // Check file size (max 5MB)
        if (file.size > 5 * 1024 * 1024) {
            alert('File size must be less than 5MB');
            return;
        }

        try {
            const base64 = await convertFileToBase64(file);
            const messageData = {
                type: 'CHAT_MESSAGE',
                roomId,
                data: {
                    sender: account,
                    content: base64,
                    fileName: file.name,
                    fileType: file.type,
                    timestamp: Date.now(),
                    messageType: 'file'
                }
            };

            sendGameAction(messageData);
        } catch (error) {
            console.error('Error uploading file:', error);
            alert('Error uploading file');
        }
    };

    const convertFileToBase64 = (file) => {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => resolve(reader.result);
            reader.onerror = reject;
            reader.readAsDataURL(file);
        });
    };

    return (
        <div style={{
            backgroundColor: '#2d2d2d',
            borderRadius: '8px',
            overflow: 'hidden',
            display: 'flex',
            flexDirection: 'column',
            height: '400px'
        }}>
            {/* Chat Header */}
            <div style={{
                padding: '15px',
                borderBottom: '1px solid #3d3d3d',
                backgroundColor: '#1a1a1a'
            }}>
                <h3 style={{ color: 'white', margin: 0 }}>Game Chat</h3>
                {typingUsers.length > 0 && (
                    <div style={{ 
                        fontSize: '12px',
                        color: '#999',
                        marginTop: '5px'
                    }}>
                        {typingUsers.join(', ')} typing...
                    </div>
                )}
            </div>

            {/* Chat Messages */}
            <div style={{
                flex: 1,
                overflowY: 'auto',
                padding: '15px',
                display: 'flex',
                flexDirection: 'column',
                gap: '10px'
            }}>
                {messages.map((msg, index) => (
                    <ChatMessage 
                        key={index}
                        message={msg}
                        isOwn={msg.sender === account}
                    />
                ))}
                <div ref={chatEndRef} />
            </div>

            {/* Emoji Picker */}
            {showEmojis && (
                <div style={{
                    padding: '10px',
                    backgroundColor: '#1a1a1a',
                    borderTop: '1px solid #3d3d3d',
                    display: 'flex',
                    flexWrap: 'wrap',
                    gap: '5px'
                }}>
                    {Object.keys(EMOJI_LIST).map(emoji => (
                        <button
                            key={emoji}
                            onClick={() => handleEmojiClick(emoji)}
                            style={{
                                border: 'none',
                                background: 'none',
                                cursor: 'pointer',
                                fontSize: '20px',
                                padding: '5px'
                            }}
                        >
                            {emoji}
                        </button>
                    ))}
                </div>
            )}

            {/* Message Input */}
            <form 
                onSubmit={handleSendMessage}
                style={{
                    borderTop: '1px solid #3d3d3d',
                    padding: '10px',
                    backgroundColor: '#1a1a1a'
                }}
            >
                <div style={{
                    display: 'flex',
                    gap: '10px',
                    alignItems: 'center'
                }}>
                    <button
                        type="button"
                        onClick={() => setShowEmojis(!showEmojis)}
                        style={{
                            backgroundColor: '#3d3d3d',
                            border: 'none',
                            padding: '8px',
                            borderRadius: '4px',
                            cursor: 'pointer',
                            color: 'white'
                        }}
                    >
                        😊
                    </button>
                    <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        style={{
                            backgroundColor: '#3d3d3d',
                            border: 'none',
                            padding: '8px',
                            borderRadius: '4px',
                            cursor: 'pointer',
                            color: 'white'
                        }}
                    >
                        📎
                    </button>
                    <input
                        type="file"
                        ref={fileInputRef}
                        onChange={handleFileUpload}
                        style={{ display: 'none' }}
                        accept="image/*,.pdf,.doc,.docx"
                    />
                    <input
                        type="text"
                        value={newMessage}
                        onChange={(e) => {
                            setNewMessage(e.target.value);
                            handleTyping();
                        }}
                        placeholder="Type a message..."
                        style={{
                            flex: 1,
                            backgroundColor: '#2d2d2d',
                            border: 'none',
                            padding: '8px 12px',
                            borderRadius: '4px',
                            color: 'white'
                        }}
                    />
                    <button
                        type="submit"
                        style={{
                            backgroundColor: '#4CAF50',
                            color: 'white',
                            border: 'none',
                            padding: '8px 16px',
                            borderRadius: '4px',
                            cursor: 'pointer'
                        }}
                    >
                        Send
                    </button>
                </div>
            </form>
        </div>
    );
};

const ChatMessage = ({ message, isOwn }) => {
    const renderContent = () => {
        if (message.messageType === 'file') {
            if (message.fileType.startsWith('image/')) {
                return (
                    <img 
                        src={message.content}
                        alt={message.fileName}
                        style={{
                            maxWidth: '200px',
                            maxHeight: '200px',
                            borderRadius: '4px'
                        }}
                    />
                );
            }
            return (
                <a 
                    href={message.content}
                    download={message.fileName}
                    style={{
                        color: '#4CAF50',
                        textDecoration: 'none',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '5px'
                    }}
                >
                    📎 {message.fileName}
                </a>
            );
        }
        return message.content;
    };

    return (
        <div style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: isOwn ? 'flex-end' : 'flex-start'
        }}>
            <div style={{
                backgroundColor: isOwn ? '#4CAF50' : '#3d3d3d',
                padding: '8px 12px',
                borderRadius: '12px',
                maxWidth: '80%'
            }}>
                <div style={{
                    fontSize: '12px',
                    color: '#999',
                    marginBottom: '4px'
                }}>
                    {isOwn ? 'You' : `${message.sender.slice(0, 6)}...${message.sender.slice(-4)}`}
                </div>
                <div style={{ color: 'white' }}>
                    {renderContent()}
                </div>
            </div>
            <div style={{
                fontSize: '10px',
                color: '#666',
                marginTop: '2px'
            }}>
                {new Date(message.timestamp).toLocaleTimeString()}
            </div>
        </div>
    );
};

export default GameChat; 