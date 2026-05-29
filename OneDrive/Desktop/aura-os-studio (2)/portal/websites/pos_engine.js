/**
 * Aura POS Engine (The /mo Firewall & SOV Gateway)
 * This sits between Bill's free website and the checkout.
 */

const stripeAPI = require('./stripe_gateway_placeholder'); // Real Fiat
const sovLedger = require('./sov_ledger.json'); // Internal SOV

function processCheckout(transaction) {
  const { businessId, amount, currency, customerId, hasPremiumSubscription } = transaction;

  if (currency === "FIAT" || currency === "CAD" || currency === "USD") {
    // FIREWALL: Check if Bill paid his /mo fee
    if (!hasPremiumSubscription) {
      return {
        status: "DENIED",
        reason: "Business is on Free Tier. Must upgrade to /mo to accept Fiat.",
        action_required: "PROMPT_UPGRADE"
      };
    }
    // Success: Process real credit card
    return stripeAPI.charge(amount, currency, customerId);
  }

  if (currency === "SOV") {
    // SOV Economy: Always free to process! Snowball effect!
    return processSOVTransaction(customerId, businessId, amount);
  }

  return { status: "ERROR", reason: "Invalid Currency" };
}

function processSOVTransaction(fromWallet, toWallet, amount) {
  // Logic to move SOV from Customer -> Business
  return { status: "SUCCESS", transaction_id: "SOV_" + Math.random().toString(36).substr(2, 9) };
}

module.exports = { processCheckout };
