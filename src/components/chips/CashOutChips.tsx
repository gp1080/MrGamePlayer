import React, { useState, useEffect } from 'react';
import { useAccount, useWriteContract, useWaitForTransactionReceipt, useReadContract } from 'wagmi';
import { parseEther, formatEther } from 'viem';
import { MGP_PLATFORM_ABI } from '../../abis/MGPPlatform';
import { MGP_CHIP_ABI } from '../../abis/MGPChip';

interface CashOutChipsProps {
  platformAddress: `0x${string}`;
  chipAddress: `0x${string}`;
  onSuccess?: () => void;
}

/**
 * CashOutChips Component
 * @notice Allows players to cash out chips for POL
 * @dev Burns chips and receives POL at current MGP price
 */
export const CashOutChips: React.FC<CashOutChipsProps> = ({ platformAddress, chipAddress, onSuccess }) => {
  const { address, isConnected } = useAccount();
  const [chipsAmount, setChipsAmount] = useState<string>('');
  const [polAmount, setPolAmount] = useState<string>('0');
  const [mgpPrice, setMgpPrice] = useState<string>('0');

  // Get user's chip balance
  const { data: chipBalance } = useReadContract({
    address: chipAddress,
    abi: MGP_CHIP_ABI,
    functionName: 'balanceOfChips',
    args: address ? [address] : undefined,
    watch: true,
  });

  // Get MGP price from platform
  const { data: priceData } = useReadContract({
    address: platformAddress,
    abi: MGP_PLATFORM_ABI,
    functionName: 'getMGPPrice',
    watch: true,
  });

  // Cash out transaction
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

  // Calculate POL amount when chips amount changes
  useEffect(() => {
    if (chipsAmount && mgpPrice && parseFloat(mgpPrice) > 0) {
      try {
        const chipsValue = parseFloat(chipsAmount);
        const priceValue = parseFloat(mgpPrice);
        const pol = chipsValue * priceValue;
        setPolAmount(pol.toFixed(6));
      } catch (error) {
        setPolAmount('0');
      }
    } else {
      setPolAmount('0');
    }
  }, [chipsAmount, mgpPrice]);

  const handleCashOut = async () => {
    if (!isConnected || !chipsAmount || parseFloat(chipsAmount) <= 0) {
      return;
    }

    try {
      const amountWei = parseEther(chipsAmount);
      
      writeContract({
        address: platformAddress,
        abi: MGP_PLATFORM_ABI,
        functionName: 'cashOutChips',
        args: [amountWei],
      });
    } catch (error) {
      console.error('Error cashing out chips:', error);
    }
  };

  const handleMax = () => {
    if (chipBalance) {
      const balance = formatEther(chipBalance as bigint);
      setChipsAmount(balance);
    }
  };

  if (!isConnected) {
    return (
      <div className="cash-out-container">
        <div className="connect-wallet-prompt">
          <p>Please connect your wallet to cash out chips</p>
        </div>
      </div>
    );
  }

  const balanceDisplay = chipBalance ? formatEther(chipBalance as bigint) : '0';

  return (
    <div className="cash-out-container">
      <div className="cash-out-card">
        <h2>Cash Out Chips</h2>
        
        {/* Balance Display */}
        <div className="balance-display">
          <span className="balance-label">Your Chips:</span>
          <span className="balance-value">{balanceDisplay} Chips</span>
        </div>

        {/* Price Display */}
        <div className="price-display">
          <span className="price-label">Current MGP Price:</span>
          <span className="price-value">{mgpPrice ? `${mgpPrice} POL` : 'Loading...'}</span>
        </div>

        {/* Chips Amount Input */}
        <div className="input-group">
          <label>Amount (Chips)</label>
          <div className="input-with-button">
            <input
              type="number"
              value={chipsAmount}
              onChange={(e) => setChipsAmount(e.target.value)}
              placeholder="0.0"
              min="0"
              step="0.01"
              max={balanceDisplay}
              disabled={isPending || isConfirming}
            />
            <button
              type="button"
              onClick={handleMax}
              className="max-button"
              disabled={isPending || isConfirming || parseFloat(balanceDisplay) === 0}
            >
              MAX
            </button>
          </div>
        </div>

        {/* POL Amount Display */}
        <div className="pol-preview">
          <span className="pol-label">You will receive:</span>
          <span className="pol-value">{polAmount} POL</span>
        </div>

        {/* Cash Out Button */}
        <button
          onClick={handleCashOut}
          disabled={
            !chipsAmount || 
            parseFloat(chipsAmount) <= 0 || 
            parseFloat(chipsAmount) > parseFloat(balanceDisplay) ||
            isPending || 
            isConfirming
          }
          className="cash-out-button"
        >
          {isPending || isConfirming ? 'Processing...' : 'Cash Out'}
        </button>

        {/* Transaction Status */}
        {writeError && (
          <div className="error-message">
            Error: {writeError.message}
          </div>
        )}

        {isConfirmed && (
          <div className="success-message">
            ✅ Chips cashed out successfully!
            {onSuccess && onSuccess()}
          </div>
        )}

        {/* Info */}
        <div className="info-box">
          <p>💡 Cashing out burns your chips and returns POL</p>
          <p>💡 Price updates live from QuickSwap</p>
          <p>💡 Chips are permanently removed when cashed out</p>
        </div>
      </div>

      <style jsx>{`
        .cash-out-container {
          display: flex;
          justify-content: center;
          padding: 2rem;
        }

        .cash-out-card {
          background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
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

        .balance-display {
          background: rgba(255, 255, 255, 0.15);
          border-radius: 8px;
          padding: 1rem;
          margin-bottom: 1rem;
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .balance-label {
          color: rgba(255, 255, 255, 0.9);
          font-size: 0.9rem;
        }

        .balance-value {
          color: white;
          font-weight: bold;
          font-size: 1.2rem;
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

        .pol-preview {
          background: rgba(255, 255, 255, 0.15);
          border-radius: 8px;
          padding: 1.5rem;
          margin-bottom: 1.5rem;
          text-align: center;
        }

        .pol-label {
          display: block;
          color: rgba(255, 255, 255, 0.9);
          font-size: 0.9rem;
          margin-bottom: 0.5rem;
        }

        .pol-value {
          display: block;
          color: white;
          font-size: 2rem;
          font-weight: bold;
        }

        .cash-out-button {
          width: 100%;
          padding: 1rem;
          background: white;
          color: #f5576c;
          border: none;
          border-radius: 8px;
          font-size: 1.1rem;
          font-weight: bold;
          cursor: pointer;
          transition: all 0.2s;
          margin-bottom: 1rem;
        }

        .cash-out-button:hover:not(:disabled) {
          transform: translateY(-2px);
          box-shadow: 0 5px 20px rgba(0, 0, 0, 0.3);
        }

        .cash-out-button:disabled {
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

