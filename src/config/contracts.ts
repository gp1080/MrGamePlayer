/**
 * @notice Contract addresses configuration
 * @dev Contract addresses deployed on Polygon Amoy Testnet
 */

export const CONTRACTS = {
  // Token Contracts (Polygon Amoy Testnet)
  MGP_TOKEN: "0xEAd93e3039c84E51B9A9B254c2366184bA15d51E" as `0x${string}`,
  MGP_CHIP: "0xCA48fB24467FFf81f3CCB7C70c840843aa41A99c" as `0x${string}`,
  MGP_PLATFORM: "0x74e3BC98a89332115Da302c269cF462b538cEe9c" as `0x${string}`,

  // QuickSwap (Temporary - using deployer address until router is available)
  QUICKSWAP_ROUTER: "0xB7365DC18a2386ce68724cc76c0c22731455B509" as `0x${string}`, // Temporary deployer address
  QUICKSWAP_FACTORY: "0x5757371414417b8C6CAad45bAeF941aBc7d3Ab32" as `0x${string}`, // Placeholder

  // Tokens (Polygon Amoy Testnet)
  POL_TOKEN: "0x9c3c9283d3e44854697cd22d3faa240cfb032889" as `0x${string}`, // WMATIC on Amoy
  USDC_TOKEN: "0x0000000000000000000000000000000000000000" as `0x${string}`, // Not deployed yet

  // Network
  CHAIN_ID: 80002, // Polygon Amoy Testnet
} as const;

/**
 * @notice Contract ABIs (imported from abi files)
 */
export { MGP_PLATFORM_ABI } from "../abis/MGPPlatform";
export { MGP_CHIP_ABI } from "../abis/MGPChip";

