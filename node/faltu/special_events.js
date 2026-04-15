
const EventEmitter = require('events');

class MyEmitter extends EventEmitter {}

const myEmitter = new MyEmitter();

// --- newListener Event ---
// This is emitted before a new listener is added.
myEmitter.on('newListener', (event, listener) => {
  console.log(`A new listener was added for the '${event}' event.`);
});

// --- removeListener Event ---
// This is emitted after a listener is removed.
myEmitter.on('removeListener', (event, listener) => {
  console.log(`A listener was removed from the '${event}' event.`);
});

// --- error Event ---
// If you don't listen for this, your app will crash if an 'error' is emitted.
myEmitter.on('error', (err) => {
  console.error('An error occurred:', err.message);
});

// --- Demonstration ---

// 1. Add a listener for a custom event called 'my_event'
const myListener = () => {
  console.log('my_event was fired!');
};
myEmitter.on('my_event', myListener);

// 2. Fire the custom event
myEmitter.emit('my_event');

// 3. Remove the listener
myEmitter.removeListener('my_event', myListener);

// 4. Emit an error
myEmitter.emit('error', new Error('This is a demonstration error.'));

console.log('\nNotice the order of the output. The "newListener" and "removeListener" events are fired automatically.');
console.log('If the "error" event listener were commented out, the program would crash.');
