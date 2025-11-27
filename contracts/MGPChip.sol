// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/token/ERC1155/ERC1155.sol";
import "@openzeppelin/contracts/token/ERC1155/extensions/ERC1155Burnable.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/Pausable.sol";

/**
 * @title MGPChip
 * @notice ERC1155 NFT representing casino chips for Mr Game Player platform
 * @dev Each NFT (token ID #1) = exactly 1 MGP betting power
 * @dev Only the platform contract can mint and burn chips
 * @dev Chips are transferable (players can send chips to friends)
 */
contract MGPChip is ERC1155, ERC1155Burnable, Ownable, Pausable {
    /// @notice Token ID for MGP Chip
    uint256 public constant CHIP_TOKEN_ID = 1;

    /// @notice Platform contract address (only can mint/burn)
    address public platformContract;

    /// @notice Event emitted when platform contract is set
    event PlatformContractSet(address indexed platformContract);

    /**
     * @notice Constructor sets the token URI
     * @param uri Base URI for token metadata
     */
    constructor(string memory uri) ERC1155(uri) {}

    /**
     * @notice Set the platform contract address
     * @dev Can only be called by owner
     * @param _platformContract Address of the platform contract
     */
    function setPlatformContract(address _platformContract) external onlyOwner {
        require(_platformContract != address(0), "Invalid platform address");
        platformContract = _platformContract;
        emit PlatformContractSet(_platformContract);
    }

    /**
     * @notice Mint chips to a player
     * @dev Can only be called by platform contract
     * @param to Address to mint chips to
     * @param amount Number of chips to mint (1 chip = 1 MGP betting power)
     */
    function mint(address to, uint256 amount) external {
        require(msg.sender == platformContract, "MGPChip: Only platform can mint");
        require(to != address(0), "MGPChip: Cannot mint to zero address");
        require(amount > 0, "MGPChip: Amount must be greater than 0");
        
        _mint(to, CHIP_TOKEN_ID, amount, "");
    }

    /**
     * @notice Batch mint chips to a player
     * @dev Can only be called by platform contract
     * @param to Address to mint chips to
     * @param amounts Array of amounts to mint
     */
    function mintBatch(address to, uint256[] memory amounts) external {
        require(msg.sender == platformContract, "MGPChip: Only platform can mint");
        require(to != address(0), "MGPChip: Cannot mint to zero address");
        
        uint256[] memory ids = new uint256[](amounts.length);
        for (uint256 i = 0; i < amounts.length; i++) {
            ids[i] = CHIP_TOKEN_ID;
        }
        
        _mintBatch(to, ids, amounts, "");
    }

    /**
     * @notice Override burn to allow platform to burn chips
     * @dev Platform can burn chips during cash-out
     * @param account Address to burn chips from
     * @param id Token ID (must be CHIP_TOKEN_ID)
     * @param amount Number of chips to burn
     */
    function burn(address account, uint256 id, uint256 amount) public override {
        require(id == CHIP_TOKEN_ID, "MGPChip: Invalid token ID");
        require(
            msg.sender == account || 
            msg.sender == platformContract || 
            isApprovedForAll(account, msg.sender),
            "MGPChip: Not authorized to burn"
        );
        super.burn(account, id, amount);
    }

    /**
     * @notice Override burnBatch to allow platform to burn chips
     * @dev Platform can burn chips during cash-out
     * @param account Address to burn chips from
     * @param ids Array of token IDs (must be CHIP_TOKEN_ID)
     * @param amounts Array of amounts to burn
     */
    function burnBatch(address account, uint256[] memory ids, uint256[] memory amounts) public override {
        for (uint256 i = 0; i < ids.length; i++) {
            require(ids[i] == CHIP_TOKEN_ID, "MGPChip: Invalid token ID");
        }
        require(
            msg.sender == account || 
            msg.sender == platformContract || 
            isApprovedForAll(account, msg.sender),
            "MGPChip: Not authorized to burn"
        );
        super.burnBatch(account, ids, amounts);
    }

    /**
     * @notice Pause all chip transfers
     * @dev Can only be called by owner
     */
    function pause() external onlyOwner {
        _pause();
    }

    /**
     * @notice Unpause all chip transfers
     * @dev Can only be called by owner
     */
    function unpause() external onlyOwner {
        _unpause();
    }

    /**
     * @notice Override to check pause status
     */
    function _beforeTokenTransfer(
        address operator,
        address from,
        address to,
        uint256[] memory ids,
        uint256[] memory amounts,
        bytes memory data
    ) internal override whenNotPaused {
        super._beforeTokenTransfer(operator, from, to, ids, amounts, data);
    }

    /**
     * @notice Get chip balance for an address
     * @param account Address to check balance for
     * @return Balance of chips (token ID #1)
     */
    function balanceOfChips(address account) external view returns (uint256) {
        return balanceOf(account, CHIP_TOKEN_ID);
    }
}

