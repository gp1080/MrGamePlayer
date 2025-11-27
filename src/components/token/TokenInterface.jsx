import React from 'react';
import { useWallet } from '../../contexts/WalletContext';

const TokenInterface = () => {
    // const { account } = useWallet(); // Will be used when chip components are enabled

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
                    🎮 MGP Token - Gaming Infrastructure
                </h1>
                <p style={{ 
                    fontSize: '1.1rem', 
                    color: 'rgba(255, 255, 255, 0.9)',
                    maxWidth: '800px',
                    margin: '0 auto'
                }}>
                    The decentralized gaming infrastructure token powering the Mr Game Player platform
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
                        title="Gaming Chips" 
                        value="ERC-1155 NFT" 
                        description="1 Gaming Chip = 1 MGP power"
                    />
                    <InfoCard 
                        title="Price Discovery" 
                        value="QuickSwap DEX" 
                        description="Live price from decentralized exchange"
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
                <h2 style={{ fontSize: '1.5rem', marginBottom: '20px' }}>🎮 How MGP Works</h2>
                
                <div style={{ marginBottom: '30px', padding: '20px', backgroundColor: '#3d3d3d', borderRadius: '8px' }}>
                    <p style={{ fontSize: '1rem', lineHeight: '1.6', color: '#ddd', marginBottom: '15px' }}>
                        <strong>MGP (Mr Game Player Token)</strong> is a <strong>gaming infrastructure token</strong> designed to power 
                        decentralized gaming experiences. The token serves as the foundation for a <strong>payment infrastructure</strong> 
                        that enables seamless, transparent, and secure transactions within the gaming ecosystem.
                    </p>
                    <p style={{ fontSize: '1rem', lineHeight: '1.6', color: '#ddd', marginBottom: '15px' }}>
                        The platform uses an innovative <strong>MGPc (MGP Chip) model</strong> - transferable ERC-1155 NFTs that represent 
                        gaming power. Each <strong>MGPc equals exactly 1 MGP</strong> of value, functioning as a digital payment instrument 
                        for participating in skill-based gaming competitions.
                    </p>
                    <p style={{ fontSize: '1rem', lineHeight: '1.6', color: '#ddd' }}>
                        <strong>How MGPc Works as Payment Infrastructure:</strong> Players convert POL or USDC into MGPc chips at live 
                        QuickSwap prices. These chips are then used as the payment method for entering games, with winners receiving chips 
                        from the prize pool. Players can redeem chips back to POL anytime, or transfer them to other players, creating a 
                        flexible and decentralized payment system for gaming.
                    </p>
                </div>
                
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px' }}>
                    <StepCard 
                        number="1"
                        title="Acquire Gaming Chips"
                        description="Convert POL (or USDC) into transferable NFT gaming chips. Each chip represents 1 MGP of gaming power for participating in games."
                        icon="💰"
                    />
                    <StepCard 
                        number="2"
                        title="Participate in Games"
                        description="Use your gaming chips to enter skill-based gaming competitions. Winners receive chips from the prize pool. Platform collects 7.5% infrastructure fee."
                        icon="🎮"
                    />
                    <StepCard 
                        number="3"
                        title="Redeem Chips"
                        description="Convert your gaming chips back to POL at current market price from QuickSwap. Chips are permanently removed when redeemed."
                        icon="💸"
                    />
                    <StepCard 
                        number="4"
                        title="Transfer Gaming Power"
                        description="Send gaming chips to friends or other players! Gaming chips are fully transferable NFTs, enabling flexible gaming power management."
                        icon="🎁"
                    />
                </div>
            </div>

            {/* Payment Infrastructure */}
            <div style={{
                backgroundColor: '#2d2d2d',
                borderRadius: '12px',
                padding: '30px',
                marginBottom: '30px'
            }}>
                <h2 style={{ fontSize: '1.5rem', marginBottom: '20px' }}>💳 Payment Infrastructure</h2>
                
                <div style={{ marginBottom: '25px', padding: '20px', backgroundColor: '#3d3d3d', borderRadius: '8px' }}>
                    <h3 style={{ fontSize: '1.2rem', marginBottom: '15px', color: '#667eea' }}>MGPc (MGP Chips) - The Payment System</h3>
                    <p style={{ fontSize: '0.95rem', lineHeight: '1.6', color: '#ddd', marginBottom: '15px' }}>
                        <strong>MGPc</strong> (MGP Chips) are ERC-1155 NFTs that function as the primary payment infrastructure for the platform. 
                        Each chip represents exactly 1 MGP of value, creating a standardized, transferable, and transparent payment system.
                    </p>
                    <ul style={{ paddingLeft: '20px', color: '#ddd', lineHeight: '1.8' }}>
                        <li><strong>1 MGPc = 1 MGP:</strong> Fixed exchange rate ensures predictable value</li>
                        <li><strong>Instant Conversion:</strong> Convert POL/USDC → MGPc instantly at live QuickSwap prices</li>
                        <li><strong>Transferable:</strong> Send MGPc to any wallet address, enabling peer-to-peer payments</li>
                        <li><strong>Redeemable:</strong> Convert MGPc back to POL anytime at current market price</li>
                        <li><strong>On-Chain:</strong> All transactions are transparent and verifiable on Polygon blockchain</li>
                    </ul>
                </div>
                
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px' }}>
                    <PurposeCard 
                        icon="💸"
                        title="Payment Method"
                        description="MGPc chips serve as the primary payment method for entering games and competitions"
                    />
                    <PurposeCard 
                        icon="⚡"
                        title="Instant Transactions"
                        description="Fast, low-cost transactions on Polygon blockchain with instant settlement"
                    />
                    <PurposeCard 
                        icon="🔒"
                        title="Secure & Transparent"
                        description="All payments are secured by smart contracts and visible on-chain"
                    />
                    <PurposeCard 
                        icon="🌐"
                        title="Global Access"
                        description="No geographic restrictions - anyone can acquire and use MGPc chips"
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
                <h2 style={{ fontSize: '1.5rem', marginBottom: '20px' }}>💧 Liquidity & Price Mechanism</h2>
                
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '20px' }}>
                    <InfoCard 
                        title="Initial Liquidity" 
                        value="20M MGP + POL" 
                        description="QuickSwap DEX pair for price discovery"
                    />
                    <InfoCard 
                        title="Target Price" 
                        value="~0.10-0.12 POL/MGP" 
                        description="Starting price range"
                    />
                    <InfoCard 
                        title="Price Source" 
                        value="QuickSwap Oracle" 
                        description="Real-time price updates from DEX"
                    />
                    <InfoCard 
                        title="Infrastructure Fee" 
                        value="7.5% per game" 
                        description="Platform operations and development"
                    />
                </div>
            </div>

            {/* Token Economics */}
            <div style={{
                backgroundColor: '#2d2d2d',
                borderRadius: '12px',
                padding: '30px',
                marginBottom: '30px'
            }}>
                <h2 style={{ fontSize: '1.5rem', marginBottom: '20px' }}>📈 Token Economics</h2>
                
                <div style={{ marginBottom: '20px', padding: '20px', backgroundColor: '#3d3d3d', borderRadius: '8px' }}>
                    <h3 style={{ fontSize: '1.1rem', marginBottom: '15px', color: '#667eea' }}>Fixed Supply Model</h3>
                    <p style={{ fontSize: '0.95rem', lineHeight: '1.6', color: '#ddd', marginBottom: '15px' }}>
                        MGP has a <strong>fixed supply of 100 million tokens</strong>, ensuring no inflation. 
                        The token is pre-allocated at deployment with clear distribution:
                    </p>
                    <ul style={{ paddingLeft: '20px', color: '#ddd', lineHeight: '1.8' }}>
                        <li><strong>30% Team & Founder:</strong> Long-term development and platform growth</li>
                        <li><strong>30% Treasury:</strong> Platform operations and infrastructure maintenance</li>
                        <li><strong>20% Liquidity:</strong> DEX liquidity for price discovery and trading</li>
                        <li><strong>10% Community:</strong> Rewards for active players and contributors</li>
                        <li><strong>10% Partners:</strong> Strategic partnerships and ecosystem development</li>
                    </ul>
                </div>

                <div style={{ padding: '20px', backgroundColor: '#3d3d3d', borderRadius: '8px' }}>
                    <h3 style={{ fontSize: '1.1rem', marginBottom: '15px', color: '#667eea' }}>Gaming Chip Model</h3>
                    <p style={{ fontSize: '0.95rem', lineHeight: '1.6', color: '#ddd' }}>
                        Players acquire <strong>Gaming Chips</strong> (ERC-1155 NFTs) by converting POL or USDC. 
                        These chips represent gaming power and can be used to participate in games, transferred to other players, 
                        or redeemed back to POL. The platform collects a <strong>7.5% infrastructure fee</strong> on each game, 
                        which is minted as gaming chips to the treasury wallet to support ongoing platform development.
                    </p>
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
                        description="100M MGP forever - no inflation, ensuring long-term value"
                    />
                    <FeatureCard 
                        icon="🎴"
                        title="NFT Gaming Chips"
                        description="Transferable ERC-1155 tokens representing gaming power"
                    />
                    <FeatureCard 
                        icon="📊"
                        title="Live Pricing"
                        description="Real-time QuickSwap DEX price oracle integration"
                    />
                    <FeatureCard 
                        icon="⚡"
                        title="Instant Exchange"
                        description="Convert chips to POL instantly via platform"
                    />
                    <FeatureCard 
                        icon="🎯"
                        title="Transparent Fees"
                        description="7.5% infrastructure fee, fully on-chain and verifiable"
                    />
                    <FeatureCard 
                        icon="🌐"
                        title="Decentralized"
                        description="Built on Polygon blockchain for global accessibility"
                    />
                </div>
            </div>

            {/* Use Cases */}
            <div style={{
                backgroundColor: '#2d2d2d',
                borderRadius: '12px',
                padding: '30px',
                marginBottom: '30px'
            }}>
                <h2 style={{ fontSize: '1.5rem', marginBottom: '20px' }}>🎯 Use Cases</h2>
                
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px' }}>
                    <UseCaseCard 
                        title="Skill-Based Gaming"
                        description="Enter competitive gaming sessions where skill determines winners. No minimum bet required - play with any amount of gaming chips."
                    />
                    <UseCaseCard 
                        title="Prize Distribution"
                        description="Winners receive gaming chips from the prize pool. Fair, transparent, and instant distribution via smart contracts."
                    />
                    <UseCaseCard 
                        title="Gaming Power Transfer"
                        description="Send gaming chips to friends or other players. Enable collaborative gaming experiences and flexible power management."
                    />
                    <UseCaseCard 
                        title="Liquidity & Trading"
                        description="Convert gaming chips to POL anytime via QuickSwap integration. Full liquidity and price discovery through DEX."
                    />
                </div>
            </div>

            {/* Security */}
            <div style={{
                backgroundColor: '#2d2d2d',
                borderRadius: '12px',
                padding: '30px'
            }}>
                <h2 style={{ fontSize: '1.5rem', marginBottom: '20px' }}>🛡️ Security & Trust</h2>
                
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

const PurposeCard = ({ icon, title, description }) => (
    <div style={{
        backgroundColor: '#3d3d3d',
        padding: '20px',
        borderRadius: '8px',
        border: '1px solid #555'
    }}>
        <div style={{ fontSize: '2rem', marginBottom: '10px' }}>{icon}</div>
        <h3 style={{ fontSize: '1.1rem', marginBottom: '10px', fontWeight: 'bold' }}>{title}</h3>
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

const UseCaseCard = ({ title, description }) => (
    <div style={{
        backgroundColor: '#3d3d3d',
        padding: '20px',
        borderRadius: '8px',
        border: '1px solid #555'
    }}>
        <h3 style={{ fontSize: '1.1rem', marginBottom: '10px', fontWeight: 'bold', color: '#667eea' }}>{title}</h3>
        <p style={{ fontSize: '0.9rem', color: '#aaa', lineHeight: '1.5' }}>{description}</p>
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
