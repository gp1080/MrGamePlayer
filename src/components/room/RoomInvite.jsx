import React, { useState } from 'react';
import { useWallet } from '../../contexts/WalletContext';
import { useWebSocket } from '../../contexts/WebSocketContext';

const RoomInvite = ({ roomId, onClose }) => {
    const { account } = useWallet();
    const { sendGameAction } = useWebSocket();
    const [inviteMessage, setInviteMessage] = useState('');
    const [copied, setCopied] = useState(false);
    const [shareMethod, setShareMethod] = useState('link');

    // Generate shareable room link
    const roomLink = `${window.location.origin}/room/${roomId}`;
    
    // Generate invitation message
    const defaultMessage = `🎮 Join my game room!\n\nRoom ID: ${roomId}\nLink: ${roomLink}\n\nLet's play some games together! 🚀`;

    const handleCopyLink = async () => {
        try {
            await navigator.clipboard.writeText(roomLink);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        } catch (err) {
            console.error('Failed to copy: ', err);
        }
    };

    const handleCopyMessage = async () => {
        try {
            await navigator.clipboard.writeText(inviteMessage || defaultMessage);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        } catch (err) {
            console.error('Failed to copy: ', err);
        }
    };

    const handleSocialShare = (platform) => {
        const url = encodeURIComponent(roomLink);
        const text = encodeURIComponent(inviteMessage || defaultMessage);
        
        const shareUrls = {
            twitter: `https://twitter.com/intent/tweet?text=${text}&url=${url}`,
            facebook: `https://www.facebook.com/sharer/sharer.php?u=${url}`,
            whatsapp: `https://wa.me/?text=${text}%20${url}`,
            telegram: `https://t.me/share/url?url=${url}&text=${text}`,
            discord: `https://discord.com/channels/@me` // Discord doesn't have direct share, but opens app
        };

        if (shareUrls[platform]) {
            window.open(shareUrls[platform], '_blank', 'width=600,height=400');
        }
    };

    const handleEmailInvite = () => {
        const subject = encodeURIComponent('🎮 Game Room Invitation');
        const body = encodeURIComponent(inviteMessage || defaultMessage);
        window.location.href = `mailto:?subject=${subject}&body=${body}`;
    };

    const generateQRCode = () => {
        // Simple QR code generation using a service
        const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(roomLink)}`;
        return qrUrl;
    };

    return (
        <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.8)',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            zIndex: 1000
        }}>
            <div style={{
                backgroundColor: '#2d2d2d',
                borderRadius: '16px',
                padding: '30px',
                maxWidth: '600px',
                width: '90%',
                maxHeight: '80vh',
                overflowY: 'auto',
                color: 'white'
            }}>
                <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginBottom: '20px'
                }}>
                    <h2 style={{ margin: 0, fontSize: '24px' }}>
                        🎮 Invite Players
                    </h2>
                    <button
                        onClick={onClose}
                        style={{
                            background: 'none',
                            border: 'none',
                            color: '#999',
                            fontSize: '24px',
                            cursor: 'pointer'
                        }}
                    >
                        ×
                    </button>
                </div>

                {/* Room Info */}
                <div style={{
                    backgroundColor: '#1a1a1a',
                    borderRadius: '8px',
                    padding: '15px',
                    marginBottom: '20px',
                    textAlign: 'center'
                }}>
                    <div style={{ fontSize: '18px', fontWeight: 'bold', marginBottom: '5px' }}>
                        Room ID: {roomId}
                    </div>
                    <div style={{ color: '#999', fontSize: '14px' }}>
                        Share this with friends to invite them to your game session
                    </div>
                </div>

                {/* Share Method Selection */}
                <div style={{ marginBottom: '20px' }}>
                    <label style={{ display: 'block', marginBottom: '10px', fontWeight: 'bold' }}>
                        Share Method:
                    </label>
                    <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                        {['link', 'message', 'qr'].map(method => (
                            <button
                                key={method}
                                onClick={() => setShareMethod(method)}
                                style={{
                                    backgroundColor: shareMethod === method ? '#4CAF50' : '#333',
                                    color: 'white',
                                    border: 'none',
                                    padding: '8px 16px',
                                    borderRadius: '4px',
                                    cursor: 'pointer',
                                    textTransform: 'capitalize'
                                }}
                            >
                                {method === 'qr' ? 'QR Code' : method}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Link Sharing */}
                {shareMethod === 'link' && (
                    <div style={{ marginBottom: '20px' }}>
                        <label style={{ display: 'block', marginBottom: '10px', fontWeight: 'bold' }}>
                            Room Link:
                        </label>
                        <div style={{ display: 'flex', gap: '10px' }}>
                            <input
                                type="text"
                                value={roomLink}
                                readOnly
                                style={{
                                    flex: 1,
                                    padding: '10px',
                                    backgroundColor: '#1a1a1a',
                                    border: '1px solid #333',
                                    borderRadius: '4px',
                                    color: 'white',
                                    fontSize: '14px'
                                }}
                            />
                            <button
                                onClick={handleCopyLink}
                                style={{
                                    backgroundColor: copied ? '#4CAF50' : '#2196F3',
                                    color: 'white',
                                    border: 'none',
                                    padding: '10px 15px',
                                    borderRadius: '4px',
                                    cursor: 'pointer',
                                    whiteSpace: 'nowrap'
                                }}
                            >
                                {copied ? '✓ Copied!' : 'Copy Link'}
                            </button>
                        </div>
                    </div>
                )}

                {/* Message Sharing */}
                {shareMethod === 'message' && (
                    <div style={{ marginBottom: '20px' }}>
                        <label style={{ display: 'block', marginBottom: '10px', fontWeight: 'bold' }}>
                            Customize Invitation Message:
                        </label>
                        <textarea
                            value={inviteMessage}
                            onChange={(e) => setInviteMessage(e.target.value)}
                            placeholder={defaultMessage}
                            style={{
                                width: '100%',
                                height: '120px',
                                padding: '10px',
                                backgroundColor: '#1a1a1a',
                                border: '1px solid #333',
                                borderRadius: '4px',
                                color: 'white',
                                fontSize: '14px',
                                resize: 'vertical',
                                fontFamily: 'inherit'
                            }}
                        />
                        <div style={{ marginTop: '10px', display: 'flex', gap: '10px' }}>
                            <button
                                onClick={handleCopyMessage}
                                style={{
                                    backgroundColor: copied ? '#4CAF50' : '#2196F3',
                                    color: 'white',
                                    border: 'none',
                                    padding: '8px 16px',
                                    borderRadius: '4px',
                                    cursor: 'pointer'
                                }}
                            >
                                {copied ? '✓ Copied!' : 'Copy Message'}
                            </button>
                            <button
                                onClick={handleEmailInvite}
                                style={{
                                    backgroundColor: '#FF9800',
                                    color: 'white',
                                    border: 'none',
                                    padding: '8px 16px',
                                    borderRadius: '4px',
                                    cursor: 'pointer'
                                }}
                            >
                                📧 Email Invite
                            </button>
                        </div>
                    </div>
                )}

                {/* QR Code */}
                {shareMethod === 'qr' && (
                    <div style={{ textAlign: 'center', marginBottom: '20px' }}>
                        <div style={{
                            backgroundColor: 'white',
                            padding: '20px',
                            borderRadius: '8px',
                            display: 'inline-block',
                            marginBottom: '15px'
                        }}>
                            <img
                                src={generateQRCode()}
                                alt="Room QR Code"
                                style={{ display: 'block' }}
                            />
                        </div>
                        <div style={{ color: '#999', fontSize: '14px' }}>
                            Scan this QR code to join the room
                        </div>
                    </div>
                )}

                {/* Social Media Sharing */}
                <div style={{ marginBottom: '20px' }}>
                    <label style={{ display: 'block', marginBottom: '10px', fontWeight: 'bold' }}>
                        Share on Social Media:
                    </label>
                    <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                        <button
                            onClick={() => handleSocialShare('twitter')}
                            style={{
                                backgroundColor: '#1DA1F2',
                                color: 'white',
                                border: 'none',
                                padding: '8px 16px',
                                borderRadius: '4px',
                                cursor: 'pointer'
                            }}
                        >
                            🐦 Twitter
                        </button>
                        <button
                            onClick={() => handleSocialShare('facebook')}
                            style={{
                                backgroundColor: '#4267B2',
                                color: 'white',
                                border: 'none',
                                padding: '8px 16px',
                                borderRadius: '4px',
                                cursor: 'pointer'
                            }}
                        >
                            📘 Facebook
                        </button>
                        <button
                            onClick={() => handleSocialShare('whatsapp')}
                            style={{
                                backgroundColor: '#25D366',
                                color: 'white',
                                border: 'none',
                                padding: '8px 16px',
                                borderRadius: '4px',
                                cursor: 'pointer'
                            }}
                        >
                            📱 WhatsApp
                        </button>
                        <button
                            onClick={() => handleSocialShare('telegram')}
                            style={{
                                backgroundColor: '#0088cc',
                                color: 'white',
                                border: 'none',
                                padding: '8px 16px',
                                borderRadius: '4px',
                                cursor: 'pointer'
                            }}
                        >
                            ✈️ Telegram
                        </button>
                    </div>
                </div>

                {/* Quick Actions */}
                <div style={{
                    borderTop: '1px solid #333',
                    paddingTop: '20px',
                    textAlign: 'center'
                }}>
                    <div style={{ color: '#999', fontSize: '14px', marginBottom: '10px' }}>
                        Quick Actions:
                    </div>
                    <div style={{ display: 'flex', gap: '10px', justifyContent: 'center' }}>
                        <button
                            onClick={() => navigator.share && navigator.share({
                                title: 'Game Room Invitation',
                                text: inviteMessage || defaultMessage,
                                url: roomLink
                            })}
                            style={{
                                backgroundColor: '#4CAF50',
                                color: 'white',
                                border: 'none',
                                padding: '10px 20px',
                                borderRadius: '4px',
                                cursor: 'pointer'
                            }}
                        >
                            📤 Native Share
                        </button>
                        <button
                            onClick={() => window.open(roomLink, '_blank')}
                            style={{
                                backgroundColor: '#2196F3',
                                color: 'white',
                                border: 'none',
                                padding: '10px 20px',
                                borderRadius: '4px',
                                cursor: 'pointer'
                            }}
                        >
                            🔗 Open Room
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default RoomInvite;
