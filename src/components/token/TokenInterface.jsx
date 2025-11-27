import React from 'react';
import { useWallet } from '../../contexts/WalletContext';
// Temporarily comment out chip components until they're properly configured
// import { BuyChips } from '../chips/BuyChips';
// import { CashOutChips } from '../chips/CashOutChips';
// import { ChipBalance } from '../chips/ChipBalance';

const TokenInterface = () => {
    const { account } = useWallet();
    
    // TODO: Update with actual deployed contract addresses
    const PLATFORM_ADDRESS = process.env.REACT_APP_PLATFORM_ADDRESS || "0x0000000000000000000000000000000000000000";
    const CHIP_ADDRESS = process.env.REACT_APP_CHIP_ADDRESS || "0x0000000000000000000000000000000000000000";

    return (
        <div style={{ color: 'white', maxWidth: '1200px', margin: '0 auto' }}>
            {/* Header */}
            <div style={{ 
                textAlign: 'center', 
                marginBottom: '40px',
                padding: '30px',
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                borderRadius: '16px'
            }}>
                <h1 style={{ 
                    fontSize: '2.5rem', 
                    marginBottom: '10px',
                    fontWeight: 'bold'
                }}>
                    🎰 MGP Token & Casino Chips
                </h1>
                <p style={{ 
                    fontSize: '1.1rem', 
                    color: 'rgba(255, 255, 255, 0.9)',
                    maxWidth: '800px',
                    margin: '0 auto'
                }}>
                    The revolutionary NFT Casino-Chip model for Mr Game Player platform
                </p>
            </div>

            {/* Token Overview */}
            <div style={{
                backgroundColor: '#2d2d2d',
                borderRadius: '12px',
                padding: '30px',
                marginBottom: '30px'
            }}>
                <h2 style={{ fontSize: '1.5rem', marginBottom: '20px' }}>📊 Token Overview</h2>
                
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '20px', marginBottom: '30px' }}>
                    <InfoCard 
                        title="Total Supply" 
                        value="100,000,000 MGP" 
                        description="Fixed forever, no minting after deployment"
                    />
                    <InfoCard 
                        title="Token Standard" 
                        value="ERC-20" 
                        description="Polygon (MATIC) blockchain"
                    />
                    <InfoCard 
                        title="Chip Standard" 
                        value="ERC-1155 NFT" 
                        description="1 Chip = 1 MGP betting power"
                    />
                    <InfoCard 
                        title="Price Discovery" 
                        value="QuickSwap" 
                        description="Live price from DEX liquidity"
                    />
                </div>

                {/* Token Allocation */}
                <div style={{ marginTop: '30px' }}>
                    <h3 style={{ fontSize: '1.2rem', marginBottom: '15px' }}>💰 Token Allocation</h3>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '15px' }}>
                        <AllocationCard percentage="30%" amount="30M MGP" label="Team & Founder" />
                        <AllocationCard percentage="30%" amount="30M MGP" label="Treasury / Company" />
                        <AllocationCard percentage="20%" amount="20M MGP" label="Liquidity & Circulating" />
                        <AllocationCard percentage="10%" amount="10M MGP" label="Community Rewards" />
                        <AllocationCard percentage="10%" amount="10M MGP" label="Strategic Partners" />
                    </div>
                </div>
            </div>

            {/* How It Works */}
            <div style={{
                backgroundColor: '#2d2d2d',
                borderRadius: '12px',
                padding: '30px',
                marginBottom: '30px'
            }}>
                <h2 style={{ fontSize: '1.5rem', marginBottom: '20px' }}>🎮 How It Works</h2>
                
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px' }}>
                    <StepCard 
                        number="1"
                        title="Buy Casino Chips"
                        description="Send POL (or USDC) to receive transferable NFT chips. Each chip equals 1 MGP betting power."
                        icon="💰"
                    />
                    <StepCard 
                        number="2"
                        title="Play Games"
                        description="Use your chips to bet in games. Winners receive chips from the pot. Platform collects 7.5% rake."
                        icon="🎮"
                    />
                    <StepCard 
                        number="3"
                        title="Cash Out"
                        description="Burn your chips to receive POL at current QuickSwap price. Chips are permanently removed."
                        icon="💸"
                    />
                    <StepCard 
                        number="4"
                        title="Transfer Chips"
                        description="Send chips to friends! Just like real casino chips, they're fully transferable NFTs."
                        icon="🎁"
                    />
                </div>
            </div>

            {/* Liquidity & Price */}
            <div style={{
                backgroundColor: '#2d2d2d',
                borderRadius: '12px',
                padding: '30px',
                marginBottom: '30px'
            }}>
                <h2 style={{ fontSize: '1.5rem', marginBottom: '20px' }}>💧 Liquidity & Price</h2>
                
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '20px' }}>
                    <InfoCard 
                        title="Initial Liquidity" 
                        value="20M MGP + POL" 
                        description="QuickSwap pair for price discovery"
                    />
                    <InfoCard 
                        title="Target Price" 
                        value="~0.10-0.12 POL/MGP" 
                        description="Starting price range"
                    />
                    <InfoCard 
                        title="Price Source" 
                        value="QuickSwap Oracle" 
                        description="Live updates from DEX"
                    />
                    <InfoCard 
                        title="Rake" 
                        value="7.5% per game" 
                        description="Minted as chips to treasury"
                    />
                </div>
            </div>

            {/* User Actions */}
            {account && (
                <div style={{ marginBottom: '30px', padding: '20px', backgroundColor: '#2d2d2d', borderRadius: '8px', textAlign: 'center' }}>
                    <p style={{ color: '#999' }}>Chip components will be available after contract deployment</p>
                </div>
            )}

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '30px', marginBottom: '30px' }}>
                <div style={{ padding: '20px', backgroundColor: '#2d2d2d', borderRadius: '8px', textAlign: 'center' }}>
                    <h2 style={{ fontSize: '1.5rem', marginBottom: '20px' }}>💰 Buy Chips</h2>
                    <p style={{ color: '#999' }}>Available after contract deployment</p>
                </div>
                
                <div style={{ padding: '20px', backgroundColor: '#2d2d2d', borderRadius: '8px', textAlign: 'center' }}>
                    <h2 style={{ fontSize: '1.5rem', marginBottom: '20px' }}>💸 Cash Out Chips</h2>
                    <p style={{ color: '#999' }}>Available after contract deployment</p>
                </div>
            </div>

            {/* Key Features */}
            <div style={{
                backgroundColor: '#2d2d2d',
                borderRadius: '12px',
                padding: '30px',
                marginBottom: '30px'
            }}>
                <h2 style={{ fontSize: '1.5rem', marginBottom: '20px' }}>✨ Key Features</h2>
                
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '15px' }}>
                    <FeatureCard 
                        icon="🔒"
                        title="Fixed Supply"
                        description="100M MGP forever - no inflation"
                    />
                    <FeatureCard 
                        icon="🎴"
                        title="NFT Chips"
                        description="Transferable ERC-1155 tokens"
                    />
                    <FeatureCard 
                        icon="📊"
                        title="Live Pricing"
                        description="Real-time QuickSwap price oracle"
                    />
                    <FeatureCard 
                        icon="⚡"
                        title="Gasless Ready"
                        description="ERC-2771 meta-transactions support"
                    />
                    <FeatureCard 
                        icon="🎯"
                        title="Transparent Rake"
                        description="7.5% on-chain, verifiable"
                    />
                    <FeatureCard 
                        icon="🔄"
                        title="Instant Exchange"
                        description="Buy/cash out instantly"
                    />
                </div>
            </div>

            {/* Security */}
            <div style={{
                backgroundColor: '#2d2d2d',
                borderRadius: '12px',
                padding: '30px'
            }}>
                <h2 style={{ fontSize: '1.5rem', marginBottom: '20px' }}>🛡️ Security</h2>
                
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '15px' }}>
                    <SecurityBadge text="ReentrancyGuard" />
                    <SecurityBadge text="Pausable" />
                    <SecurityBadge text="Ownable" />
                    <SecurityBadge text="OpenZeppelin" />
                    <SecurityBadge text="Audited Patterns" />
                    <SecurityBadge text="Checks-Effects-Interactions" />
                </div>
            </div>
        </div>
    );
};

// Helper Components
const InfoCard = ({ title, value, description }) => (
    <div style={{
        backgroundColor: '#3d3d3d',
        padding: '20px',
        borderRadius: '8px',
        border: '1px solid #555'
    }}>
        <div style={{ fontSize: '0.9rem', color: '#999', marginBottom: '8px' }}>{title}</div>
        <div style={{ fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '5px' }}>{value}</div>
        <div style={{ fontSize: '0.85rem', color: '#aaa' }}>{description}</div>
    </div>
);

const AllocationCard = ({ percentage, amount, label }) => (
    <div style={{
        backgroundColor: '#3d3d3d',
        padding: '15px',
        borderRadius: '8px',
        textAlign: 'center',
        border: '2px solid #667eea'
    }}>
        <div style={{ fontSize: '1.2rem', fontWeight: 'bold', color: '#667eea', marginBottom: '5px' }}>
            {percentage}
        </div>
        <div style={{ fontSize: '1rem', marginBottom: '5px' }}>{amount}</div>
        <div style={{ fontSize: '0.85rem', color: '#999' }}>{label}</div>
    </div>
);

const StepCard = ({ number, title, description, icon }) => (
    <div style={{
        backgroundColor: '#3d3d3d',
        padding: '20px',
        borderRadius: '8px',
        border: '1px solid #555'
    }}>
        <div style={{ fontSize: '2rem', marginBottom: '10px' }}>{icon}</div>
        <div style={{ 
            display: 'inline-block',
            backgroundColor: '#667eea',
            color: 'white',
            borderRadius: '50%',
            width: '30px',
            height: '30px',
            lineHeight: '30px',
            textAlign: 'center',
            fontWeight: 'bold',
            marginBottom: '10px'
        }}>
            {number}
        </div>
        <h3 style={{ fontSize: '1.1rem', marginBottom: '10px' }}>{title}</h3>
        <p style={{ fontSize: '0.9rem', color: '#aaa', lineHeight: '1.5' }}>{description}</p>
    </div>
);

const FeatureCard = ({ icon, title, description }) => (
    <div style={{
        backgroundColor: '#3d3d3d',
        padding: '15px',
        borderRadius: '8px',
        border: '1px solid #555'
    }}>
        <div style={{ fontSize: '1.5rem', marginBottom: '8px' }}>{icon}</div>
        <div style={{ fontSize: '1rem', fontWeight: 'bold', marginBottom: '5px' }}>{title}</div>
        <div style={{ fontSize: '0.85rem', color: '#aaa' }}>{description}</div>
    </div>
);

const SecurityBadge = ({ text }) => (
    <div style={{
        backgroundColor: '#1a5f1a',
        color: '#4ade80',
        padding: '10px 15px',
        borderRadius: '6px',
        textAlign: 'center',
        fontWeight: '500',
        fontSize: '0.9rem'
    }}>
        ✓ {text}
    </div>
);

export default TokenInterface;
