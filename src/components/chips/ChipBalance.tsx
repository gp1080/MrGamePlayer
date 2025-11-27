import React from 'react';
import { useChips } from '../../hooks/useChips';

/**
 * ChipBalance Component
 * @notice Displays user's current chip balance
 */
export const ChipBalance: React.FC = () => {
  const { chipBalance, isConnected, refetchBalance } = useChips();

  if (!isConnected) {
    return (
      <div className="chip-balance">
        <span className="chip-label">Chips:</span>
        <span className="chip-value">--</span>
      </div>
    );
  }

  return (
    <div className="chip-balance" onClick={() => refetchBalance()}>
      <span className="chip-label">Chips:</span>
      <span className="chip-value">{parseFloat(chipBalance).toFixed(2)}</span>
      <style jsx>{`
        .chip-balance {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.5rem 1rem;
          background: rgba(255, 255, 255, 0.1);
          border-radius: 8px;
          cursor: pointer;
          transition: all 0.2s;
        }

        .chip-balance:hover {
          background: rgba(255, 255, 255, 0.15);
        }

        .chip-label {
          color: rgba(255, 255, 255, 0.9);
          font-size: 0.9rem;
        }

        .chip-value {
          color: white;
          font-weight: bold;
          font-size: 1.1rem;
        }
      `}</style>
    </div>
  );
};

