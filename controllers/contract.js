const { readContract } = require('../utils/contract');

// NOTE: Server no longer holds a private key and therefore will not sign transactions.
// The following endpoints used to perform admin actions (withdraws). Those actions
// must now be performed by an admin using a connected wallet (client-side) or by
// sending a signed transaction to a trusted service. For safety, we return a clear
// error telling clients to perform the transaction from a connected wallet.

exports.withdrawToken = async (req, res) => {
  res.status(403).json({
    error: 'Server does not hold a private key. Perform withdraw from an admin wallet via the frontend or provide a signed transaction to broadcast.'
  });
};

exports.withdrawBNB = async (req, res) => {
  res.status(403).json({
    error: 'Server does not hold a private key. Perform withdraw from an admin wallet via the frontend or provide a signed transaction to broadcast.'
  });
};
