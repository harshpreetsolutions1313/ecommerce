this is the backend code and we have to intergrate it with the frontend. I can provide you my smart contract code as well. You can figure out we have developed till now and now we are looking to integrate this with the frontend. you have to make a frontend project from where a user will be able to purchase the listed products using USDT and USDCs.Right now, we have made mock USDTs and USDCs. we have deployed the contract on testnet

here's the contract

// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";

contract EcommercePayment is Ownable, ReentrancyGuard {
    // Struct to store order details
    struct Order {
        address buyer;
        uint256 amount;
        bool paid;
        string productId;
    }

    // Mapping to store orders by orderId
    mapping(uint256 => Order) private orders;
    uint256 private orderCount;

    // Addresses of USDT and USDC tokens on BSC (replace with mock token addresses for testing)
    address public usdtToken;
    address public usdcToken;

    // Events
    event PaymentReceived(
        uint256 indexed orderId,
        address indexed buyer,
        address token,
        uint256 amount,
        string productId
    );

    event TokensWithdrawn(address token, uint256 amount);
    event BNBWithdrawn(uint256 amount);
    
    // Add this event to your contract
    event OrderCreated(
        uint256 indexed orderId,
        address indexed buyer,
        string productId,
        uint256 amount
    );

    // Constructor
    constructor(
        address initialOwner,
        address _usdtToken,
        address _usdcToken
    ) Ownable(initialOwner) {
        require(_usdtToken != address(0), "USDT token address cannot be zero");
        require(_usdcToken != address(0), "USDC token address cannot be zero");
        usdtToken = _usdtToken;
        usdcToken = _usdcToken;
    }

    // Function to create a new order (called by your backend)
    function createOrder(
        address _buyer,
        string memory _productId,
        uint256 _amount
    ) external onlyOwner returns (uint256) {
        require(_amount > 0, "Amount must be greater than zero");
        orderCount++;
        orders[orderCount] = Order({
            buyer: _buyer,
            amount: _amount,
            paid: false,
            productId: _productId
        });
        emit OrderCreated(orderCount, _buyer, _productId, _amount);
        return orderCount;
    }

    // Function for the buyer to pay for an order (USDT or USDC)
    function payForOrder(
        uint256 _orderId,
        address _token,
        uint256 _amount
    ) external nonReentrant {
        Order storage order = orders[_orderId];
        require(!order.paid, "Order already paid");
        require(order.buyer == msg.sender, "Not the buyer");
        require(_amount == order.amount, "Incorrect amount");
        require(_amount > 0, "Amount must be greater than zero");
        require(
            _token == usdtToken || _token == usdcToken,
            "Unsupported token"
        );

        // Transfer the tokens from the buyer to this contract
        IERC20 token = IERC20(_token);
        token.transferFrom(msg.sender, address(this), _amount);

        // Mark the order as paid
        order.paid = true;

        // Emit event
        emit PaymentReceived(
            _orderId,
            msg.sender,
            _token,
            _amount,
            order.productId
        );
    }

    // Function to check if an order is paid
    function isOrderPaid(uint256 _orderId) external view returns (bool) {
        return orders[_orderId].paid;
    }

    // Function to get order details
    function getOrder(
        uint256 _orderId
    )
        external
        view
        returns (
            address buyer,
            uint256 amount,
            bool paid,
            string memory productId
        )
    {
        Order memory order = orders[_orderId];
        return (order.buyer, order.amount, order.paid, order.productId);
    }

    // Function to withdraw ERC20 tokens (USDT/USDC) from the contract
    function withdrawToken(
        address _token,
        uint256 _amount
    ) external nonReentrant onlyOwner {
        require(
            _token == usdtToken || _token == usdcToken,
            "Unsupported token"
        );
        require(_amount > 0, "Amount must be greater than zero");
        IERC20 token = IERC20(_token);
        token.transfer(owner(), _amount);
        emit TokensWithdrawn(_token, _amount);
    }

    // Function to withdraw BNB from the contract
    function withdrawBNB() external nonReentrant onlyOwner {
        uint256 amount = address(this).balance;
        require(amount > 0, "No BNB to withdraw");
        payable(owner()).transfer(amount);
        emit BNBWithdrawn(amount);
    }

    // Fallback function to receive BNB (optional)
    receive() external payable {}
}

and let's build a frontend project