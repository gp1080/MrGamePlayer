/**
 * @notice Contract addresses configuration
 * @dev Update these addresses after deployment
 * @dev Copy this file to contracts.ts and fill in actual addresses
 */

export const CONTRACTS = {
  // Token Contracts
  MGP_TOKEN: "0x0000000000000000000000000000000000000000" as `0x${string}`,
  MGP_CHIP: "0x0000000000000000000000000000000000000000" as `0x${string}`,
  MGP_PLATFORM: "0x0000000000000000000000000000000000000000" as `0x${string}`,

  // QuickSwap
  QUICKSWAP_ROUTER: "0xa5E0829CaCEd8fF2e8Cb5C5C5C5C5C5C5C5C5C5" as `0x${string}`, // Update with actual address
  QUICKSWAP_FACTORY: "0x5757371414417b8C6CAad45bAeF941aBc7d3Ab32" as `0x${string}`, // Update with actual address

  // Tokens
  POL_TOKEN: "0x0d500B1d8E8eF31E21C99d1Db9A6444d3ADf1270" as `0x${string}`, // WMATIC on Polygon
  USDC_TOKEN: "0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174" as `0x${string}`, // USDC on Polygon (optional)

  // Network
  CHAIN_ID: 137, // Polygon Mainnet
} as const;

/**
 * @notice Contract ABIs (imported from abi files)
 */
export { MGP_PLATFORM_ABI } from "../abis/MGPPlatform";
export { MGP_CHIP_ABI } from "../abis/MGPChip";

