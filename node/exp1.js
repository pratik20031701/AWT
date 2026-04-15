const http = require("http");

const server = http.createServer((req, res) => {

  res.writeHead(200, { "Content-Type": "text/html" });

  res.end(`
    <!DOCTYPE html>
    <html>
    <head>
      <title>Simple Node Server</title>
    </head>
    <body>
      <h1>Hello from Node.js Server </h1>
      <p>This HTML is being served from Node.js.</p>
      <button onclick="alert('Button Clicked!')">Click Me</button>
    </body>
    </html>
  `);
});

server.listen(3000, () => {
  console.log("Server running at http://localhost:3000");
});
