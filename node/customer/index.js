
const { recordPurchase } = require('./purchase');

// Sample data
const customer = {
  id: 'cust123',
  name: 'John Doe',
};

const item = {
  id: 'item001',
  name: 'Laptop',
  price: 1200,
};

console.log('Starting customer purchase simulation...');

// Simulate a purchase
recordPurchase(customer, item);

console.log('Purchase simulation finished.');
