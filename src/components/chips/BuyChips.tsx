import React, { useState, useEffect } from 'react';
import { useAccount, useWriteContract, useWaitForTransactionReceipt, useReadContract } from 'wagmi';
import { parseEther, formatEther } from 'viem';
import { MGP_PLATFORM_ABI } from '../../abis/MGPPlatform';

interface BuyChipsProps {
  platformAddress: `0x${string}`;
  onSuccess?: () => void;
}

/**
 * BuyChips Component
 * @notice Allows players to buy casino chips with POL
 * @dev Shows live QuickSwap price and calculates chips received
 */
export const BuyChips: React.FC<BuyChipsProps> = ({ platformAddress, onSuccess }) => {
  const { address, isConnected } = useAccount();
  const [polAmount, setPolAmount] = useState<string>('');
  const [chipsAmount, setChipsAmount] = useState<string>('0');
  const [mgpPrice, setMgpPrice] = useState<string>('0');

  // Get MGP price from platform
  const { data: priceData } = useReadContract({
    address: platformAddress,
    abi: MGP_PLATFORM_ABI,
    functionName: 'getMGPPrice',
    watch: true,
  });

  // Buy chips transaction
  const {
    data: hash,
    writeContract,
    isPending,
    error: writeError,
  } = useWriteContract();

  const { isLoading: isConfirming, isSuccess: isConfirmed } = useWaitForTransactionReceipt({
    hash,
  });

  // Update MGP price
  useEffect(() => {
    if (priceData) {
      const price = formatEther(priceData as bigint);
      setMgpPrice(price);
    }
  }, [priceData]);

  // Calculate chips amount when POL amount changes
  useEffect(() => {
    if (polAmount && mgpPrice && parseFloat(mgpPrice) > 0) {
      try {
        const polValue = parseFloat(polAmount);
        const priceValue = parseFloat(mgpPrice);
        const chips = polValue / priceValue;
        setChipsAmount(chips.toFixed(6));
      } catch (error) {
        setChipsAmount('0');
      }
    } else {
      setChipsAmount('0');
    }
  }, [polAmount, mgpPrice]);

  const handleBuyChips = async () => {
    if (!isConnected || !polAmount || parseFloat(polAmount) <= 0) {
      return;
    }

    try {
      const amountWei = parseEther(polAmount);
      
      writeContract({
        address: platformAddress,
        abi: MGP_PLATFORM_ABI,
        functionName: 'buyChips',
        value: amountWei,
      });
    } catch (error) {
      console.error('Error buying chips:', error);
    }
  };

  const handleMax = async () => {
    // Get user's POL balance and set as max
    // For now, just show a placeholder
    setPolAmount('');
  };

  if (!isConnected) {
    return (
      <div className="buy-chips-container">
        <div className="connect-wallet-prompt">
          <p>Please connect your wallet to buy chips</p>
        </div>
      </div>
    );
  }

  return (
    <div className="buy-chips-container">
      <div className="buy-chips-card">
        <h2>Buy Casino Chips</h2>
        
        {/* Price Display */}
        <div className="price-display">
          <span className="price-label">Current MGP Price:</span>
          <span className="price-value">{mgpPrice ? `${mgpPrice} POL` : 'Loading...'}</span>
        </div>

        {/* POL Amount Input */}
        <div className="input-group">
          <label>Amount (POL)</label>
          <div className="input-with-button">
            <input
              type="number"
              value={polAmount}
              onChange={(e) => setPolAmount(e.target.value)}
              placeholder="0.0"
              min="0"
              step="0.01"
              disabled={isPending || isConfirming}
            />
            <button
              type="button"
              onClick={handleMax}
              className="max-button"
              disabled={isPending || isConfirming}
            >
              MAX
            </button>
          </div>
        </div>

        {/* Chips Amount Display */}
        <div className="chips-preview">
          <span className="chips-label">You will receive:</span>
          <span className="chips-value">{chipsAmount} Chips</span>
          <span className="chips-note">(1 Chip = 1 MGP betting power)</span>
        </div>

        {/* Buy Button */}
        <button
          onClick={handleBuyChips}
          disabled={!polAmount || parseFloat(polAmount) <= 0 || isPending || isConfirming}
          className="buy-button"
        >
          {isPending || isConfirming ? 'Processing...' : 'Buy Chips'}
        </button>

        {/* Transaction Status */}
        {writeError && (
          <div className="error-message">
            Error: {writeError.message}
          </div>
        )}

        {isConfirmed && (
          <div className="success-message">
            ✅ Chips purchased successfully!
            {onSuccess && onSuccess()}
          </div>
        )}

        {/* Info */}
        <div className="info-box">
          <p>💡 Chips are transferable NFTs. You can send them to friends!</p>
          <p>💡 Price updates live from QuickSwap</p>
        </div>
      </div>

      <style jsx>{`
        .buy-chips-container {
          display: flex;
          justify-content: center;
          padding: 2rem;
        }

        .buy-chips-card {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          border-radius: 16px;
          padding: 2rem;
          max-width: 500px;
          width: 100%;
          box-shadow: 0 10px 40px rgba(0, 0, 0, 0.2);
        }

        h2 {
          color: white;
          margin: 0 0 1.5rem 0;
          font-size: 1.75rem;
          text-align: center;
        }

        .price-display {
          background: rgba(255, 255, 255, 0.1);
          border-radius: 8px;
          padding: 1rem;
          margin-bottom: 1.5rem;
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .price-label {
          color: rgba(255, 255, 255, 0.9);
          font-size: 0.9rem;
        }

        .price-value {
          color: white;
          font-weight: bold;
          font-size: 1.1rem;
        }

        .input-group {
          margin-bottom: 1.5rem;
        }

        .input-group label {
          display: block;
          color: white;
          margin-bottom: 0.5rem;
          font-weight: 500;
        }

        .input-with-button {
          display: flex;
          gap: 0.5rem;
        }

        .input-with-button input {
          flex: 1;
          padding: 0.75rem;
          border: 2px solid rgba(255, 255, 255, 0.2);
          border-radius: 8px;
          background: rgba(255, 255, 255, 0.1);
          color: white;
          font-size: 1rem;
        }

        .input-with-button input::placeholder {
          color: rgba(255, 255, 255, 0.5);
        }

        .max-button {
          padding: 0.75rem 1.5rem;
          background: rgba(255, 255, 255, 0.2);
          border: 2px solid rgba(255, 255, 255, 0.3);
          border-radius: 8px;
          color: white;
          cursor: pointer;
          font-weight: 500;
          transition: all 0.2s;
        }

        .max-button:hover:not(:disabled) {
          background: rgba(255, 255, 255, 0.3);
        }

        .max-button:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        .chips-preview {
          background: rgba(255, 255, 255, 0.15);
          border-radius: 8px;
          padding: 1.5rem;
          margin-bottom: 1.5rem;
          text-align: center;
        }

        .chips-label {
          display: block;
          color: rgba(255, 255, 255, 0.9);
          font-size: 0.9rem;
          margin-bottom: 0.5rem;
        }

        .chips-value {
          display: block;
          color: white;
          font-size: 2rem;
          font-weight: bold;
          margin-bottom: 0.5rem;
        }

        .chips-note {
          display: block;
          color: rgba(255, 255, 255, 0.7);
          font-size: 0.85rem;
        }

        .buy-button {
          width: 100%;
          padding: 1rem;
          background: white;
          color: #667eea;
          border: none;
          border-radius: 8px;
          font-size: 1.1rem;
          font-weight: bold;
          cursor: pointer;
          transition: all 0.2s;
          margin-bottom: 1rem;
        }

        .buy-button:hover:not(:disabled) {
          transform: translateY(-2px);
          box-shadow: 0 5px 20px rgba(0, 0, 0, 0.3);
        }

        .buy-button:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }

        .error-message {
          background: rgba(255, 0, 0, 0.2);
          border: 1px solid rgba(255, 0, 0, 0.5);
          border-radius: 8px;
          padding: 1rem;
          color: white;
          margin-top: 1rem;
        }

        .success-message {
          background: rgba(0, 255, 0, 0.2);
          border: 1px solid rgba(0, 255, 0, 0.5);
          border-radius: 8px;
          padding: 1rem;
          color: white;
          margin-top: 1rem;
          text-align: center;
        }

        .info-box {
          margin-top: 1.5rem;
          padding: 1rem;
          background: rgba(255, 255, 255, 0.1);
          border-radius: 8px;
        }

        .info-box p {
          color: rgba(255, 255, 255, 0.9);
          font-size: 0.85rem;
          margin: 0.5rem 0;
        }

        .connect-wallet-prompt {
          text-align: center;
          padding: 2rem;
          color: rgba(255, 255, 255, 0.9);
        }
      `}</style>
    </div>
  );
};

