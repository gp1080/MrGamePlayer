import { useAccount, useReadContract, useWriteContract, useWaitForTransactionReceipt } from 'wagmi';
import { parseEther, formatEther } from 'viem';
import { MGP_CHIP_ABI } from '../abis/MGPChip';
import { MGP_PLATFORM_ABI } from '../abis/MGPPlatform';
import { CONTRACTS } from '../config/contracts';

/**
 * Custom hook for managing MGP Chips
 * @notice Provides easy access to chip balance, buying, and cashing out
 */
export function useChips() {
  const { address, isConnected } = useAccount();

  // Get chip balance
  const { data: chipBalance, refetch: refetchBalance } = useReadContract({
    address: CONTRACTS.MGP_CHIP,
    abi: MGP_CHIP_ABI,
    functionName: 'balanceOfChips',
    args: address ? [address] : undefined,
    query: {
      enabled: isConnected,
    },
  });

  // Get MGP price from platform
  const { data: mgpPrice, refetch: refetchPrice } = useReadContract({
    address: CONTRACTS.MGP_PLATFORM,
    abi: MGP_PLATFORM_ABI,
    functionName: 'getMGPPrice',
    query: {
      refetchInterval: 30000, // Refetch every 30 seconds
    },
  });

  // Buy chips transaction
  const {
    writeContract: buyChips,
    data: buyHash,
    isPending: isBuying,
    error: buyError,
  } = useWriteContract();

  const {
    isLoading: isBuyConfirming,
    isSuccess: isBuySuccess,
  } = useWaitForTransactionReceipt({
    hash: buyHash,
  });

  // Cash out chips transaction
  const {
    writeContract: cashOutChips,
    data: cashOutHash,
    isPending: isCashingOut,
    error: cashOutError,
  } = useWriteContract();

  const {
    isLoading: isCashOutConfirming,
    isSuccess: isCashOutSuccess,
  } = useWaitForTransactionReceipt({
    hash: cashOutHash,
  });

  /**
   * Buy chips with POL
   * @param polAmount Amount of POL to spend (as string, e.g., "1.0")
   */
  const buy = async (polAmount: string) => {
    if (!isConnected || !polAmount || parseFloat(polAmount) <= 0) {
      throw new Error('Invalid amount or wallet not connected');
    }

    try {
      buyChips({
        address: CONTRACTS.MGP_PLATFORM,
        abi: MGP_PLATFORM_ABI,
        functionName: 'buyChips',
        value: parseEther(polAmount),
      });
    } catch (error) {
      console.error('Error buying chips:', error);
      throw error;
    }
  };

  /**
   * Cash out chips for POL
   * @param chipsAmount Amount of chips to cash out (as string, e.g., "10.0")
   */
  const cashOut = async (chipsAmount: string) => {
    if (!isConnected || !chipsAmount || parseFloat(chipsAmount) <= 0) {
      throw new Error('Invalid amount or wallet not connected');
    }

    try {
      cashOutChips({
        address: CONTRACTS.MGP_PLATFORM,
        abi: MGP_PLATFORM_ABI,
        functionName: 'cashOutChips',
        args: [parseEther(chipsAmount)],
      });
    } catch (error) {
      console.error('Error cashing out chips:', error);
      throw error;
    }
  };

  /**
   * Calculate chips received for POL amount
   * @param polAmount Amount of POL
   * @returns Number of chips
   */
  const calculateChipsForPol = (polAmount: string): string => {
    if (!mgpPrice || !polAmount || parseFloat(polAmount) <= 0) {
      return '0';
    }

    try {
      const polValue = parseFloat(polAmount);
      const priceValue = parseFloat(formatEther(mgpPrice as bigint));
      const chips = polValue / priceValue;
      return chips.toFixed(6);
    } catch (error) {
      return '0';
    }
  };

  /**
   * Calculate POL received for chips amount
   * @param chipsAmount Amount of chips
   * @returns Amount of POL
   */
  const calculatePolForChips = (chipsAmount: string): string => {
    if (!mgpPrice || !chipsAmount || parseFloat(chipsAmount) <= 0) {
      return '0';
    }

    try {
      const chipsValue = parseFloat(chipsAmount);
      const priceValue = parseFloat(formatEther(mgpPrice as bigint));
      const pol = chipsValue * priceValue;
      return pol.toFixed(6);
    } catch (error) {
      return '0';
    }
  };

  return {
    // Balance
    chipBalance: chipBalance ? formatEther(chipBalance as bigint) : '0',
    refetchBalance,

    // Price
    mgpPrice: mgpPrice ? formatEther(mgpPrice as bigint) : '0',
    refetchPrice,

    // Buy chips
    buyChips: buy,
    isBuying: isBuying || isBuyConfirming,
    isBuySuccess,
    buyError,
    buyHash,

    // Cash out chips
    cashOutChips: cashOut,
    isCashingOut: isCashingOut || isCashOutConfirming,
    isCashOutSuccess,
    cashOutError,
    cashOutHash,

    // Calculations
    calculateChipsForPol,
    calculatePolForChips,

    // Status
    isConnected,
  };
}

