export const MGP_PLATFORM_ABI = [
  {
    inputs: [],
    name: 'buyChips',
    outputs: [],
    stateMutability: 'payable',
    type: 'function',
  },
  {
    inputs: [{ internalType: 'uint256', name: 'chipsAmount', type: 'uint256' }],
    name: 'cashOutChips',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [],
    name: 'getMGPPrice',
    outputs: [{ internalType: 'uint256', name: 'price', type: 'uint256' }],
    stateMutability: 'view',
    type: 'function',
  },
] as const;

