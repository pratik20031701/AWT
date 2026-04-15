// Import the events module
const EventEmitter = require('events');

// Create an EventEmitter object
class MyEmitter extends EventEmitter {}
const myEmitter = new MyEmitter();

// Example 1: Basic event listening and emitting
console.log('--- Example 1: Basic event ---');

// Register a listener for the 'greet' event
myEmitter.on('greet', () => {
  console.log('Hello, world!');
});

// Emit the 'greet' event
myEmitter.emit('greet');


// Example 2: Passing arguments to the listener
console.log('\n--- Example 2: Passing arguments ---');

myEmitter.on('message', (msg) => {
  console.log(`Message received: ${msg}`);
});

myEmitter.emit('message', 'This is a test message.');


// Example 3: Using 'once' to listen for an event only once
console.log('\n--- Example 3: Listening once ---');

let counter = 0;
myEmitter.once('increment', () => {
  console.log('This will only be logged once.');
  counter++;
});

myEmitter.emit('increment');
myEmitter.emit('increment'); // This will not trigger the listener
console.log(`Counter is: ${counter}`);


// Example 4: Error handling
console.log('\n--- Example 4: Error handling ---');

myEmitter.on('error', (err) => {
  console.error('Whoops! There was an error:', err.message);
});

myEmitter.emit('error', new Error('Something went wrong'));


// Example 5: Multiple listeners for the same event
console.log('\n--- Example 5: Multiple listeners ---');

myEmitter.on('multi', () => {
  console.log('Listener 1');
});

myEmitter.on('multi', () => {
  console.log('Listener 2');
});

myEmitter.emit('multi');


// Example 6: Removing a listener
console.log('\n--- Example 6: Removing a listener ---');

const listenerToRemove = () => {
  console.log('This listener will be removed.');
};

myEmitter.on('remove', listenerToRemove);
myEmitter.emit('remove');

myEmitter.removeListener('remove', listenerToRemove);
myEmitter.emit('remove'); // This will not trigger the listener


// Example 7: Asynchronous event
console.log('\n--- Example 7: Asynchronous event ---');

myEmitter.on('async', (data) => {
  setImmediate(() => {
    console.log('Async event processed:', data);
  });
});

myEmitter.emit('async', 'Some async data');
console.log('This will be logged before the async event is processed.');
