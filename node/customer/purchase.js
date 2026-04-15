
const { logEvent } = require('./logging');

/**
 * Records a customer purchase and logs the event.
 * @param {object} customer - The customer object.
 * @param {object} item - The item being purchased.
 */
function recordPurchase(customer, item) {
  if (!customer || !item) {
    console.error('Customer and item must be provided.');
    return;
  }

  console.log(`Processing purchase for ${customer.name}...`);
  
  // Simulate purchase logic (e.g., charging a credit card, updating inventory)
  const purchaseDetails = {
    customerId: customer.id,
    itemName: item.name,
    price: item.price,
    timestamp: new Date().toISOString(),
  };

  // Log the purchase event
  const logMessage = `Purchase recorded: Customer '${customer.name}' (ID: ${customer.id}) purchased '${item.name}' for $${item.price}.`;
  logEvent(logMessage);

  console.log('Purchase successfully recorded.');
  return purchaseDetails;
}

module.exports = { recordPurchase };
