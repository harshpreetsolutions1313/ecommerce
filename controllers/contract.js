const contract = require('../utils/contract');

// Withdraw tokens (USDT/USDC)
exports.withdrawToken = async (req, res) => {
  try {
    const { tokenAddress, amount } = req.body;
    const tx = await contract.withdrawToken(tokenAddress, ethers.utils.parseUnits(amount.toString(), 18));
    await tx.wait();
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Withdraw BNB
exports.withdrawBNB = async (req, res) => {
  try {
    const tx = await contract.withdrawBNB();
    await tx.wait();
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
