const http = require("http");
const EventEmitter = require("events");
const url = require("url");

const event = new EventEmitter();

const eventCount = {
  "user-login": 0,
  "user-logout": 0,
  "user-purchase": 0,
  "profile-update": 0
};

event.on("user-login", (username) => {
  eventCount["user-login"]++;
  console.log("LOGIN: " + username + " logged in");
});

event.on("user-logout", (username) => {
  eventCount["user-logout"]++;
  console.log("LOGOUT: " + username + " logged out");
});

event.on("user-purchase", (username, item) => {
  eventCount["user-purchase"]++;
  console.log("PURCHASE: " + username + " bought " + item);
});

event.on("profile-update", (username) => {
  eventCount["profile-update"]++;
  console.log("PROFILE UPDATE: " + username + " updated profile");
});

event.on("summary", () => {
  console.log("EVENT SUMMARY");
  console.log(eventCount);
});

const htmlPage = `
<!DOCTYPE html>
<html>
<head>
  <title>User Activity Dashboard</title>
  <style>
    body {
      font-family: Arial, sans-serif;
      background: #f4f4f4;
      text-align: center;
      padding: 20px;
    }

    .container {
      max-width: 600px;
      margin: auto;
      background: white;
      padding: 20px;
      border-radius: 10px;
      box-shadow: 0 0 10px rgba(0,0,0,0.1);
    }

    h1 {
      color: #333;
    }

    .btn {
      padding: 10px 15px;
      margin: 5px;
      border: none;
      border-radius: 5px;
      cursor: pointer;
      color: white;
      font-size: 14px;
    }

    .login { background: #28a745; }
    .logout { background: #dc3545; }
    .purchase { background: #007bff; }
    .update { background: #ffc107; color: black; }
    .summary { background: #6f42c1; }

    #output {
      margin-top: 20px;
      padding: 10px;
      background: #e9ecef;
      border-radius: 5px;
      min-height: 50px;
      white-space: pre-line;
    }
  </style>
</head>
<body>

<div class="container">
  <h1>User Activity Dashboard</h1>
  <p>Click buttons to trigger server events</p>

  <button class="btn login" onclick="trigger('login')">User Login</button>
  <button class="btn logout" onclick="trigger('logout')">User Logout</button>
  <button class="btn purchase" onclick="trigger('purchase')">Buy Item</button>
  <button class="btn update" onclick="trigger('update')">Update Profile</button>
  <button class="btn summary" onclick="trigger('summary')">View Summary</button>

  <h3>Server Response:</h3>
  <div id="output">Waiting for action...</div>
</div>

<script>
function trigger(type){
  fetch('/event?type=' + type)
    .then(res => res.text())
    .then(data => document.getElementById("output").innerText = data);
}
</script>

</body>
</html>
`;

const server = http.createServer((req, res) => {
  const parsedUrl = url.parse(req.url, true);

  if (parsedUrl.pathname === "/") {
    res.writeHead(200, { "Content-Type": "text/html" });
    res.end(htmlPage);
  } 
  else if (parsedUrl.pathname === "/event") {

    const type = parsedUrl.query.type;
    let response = "";

    switch (type) {
      case "login":
        event.emit("user-login", "Nishan");
        response = "User logged in successfully ✅";
        break;

      case "logout":
        event.emit("user-logout", "Nishan");
        response = "User logged out successfully ❌";
        break;

      case "purchase":
        event.emit("user-purchase", "Nishan", "Headphones");
        response = "Purchase completed 🎧";
        break;

      case "update":
        event.emit("profile-update", "Nishan");
        response = "Profile updated ✏️";
        break;

      case "summary":
        event.emit("summary");
        response =
          "Login Count: " + eventCount["user-login"] + "\n" +
          "Logout Count: " + eventCount["user-logout"] + "\n" +
          "Purchase Count: " + eventCount["user-purchase"] + "\n" +
          "Profile Updates: " + eventCount["profile-update"];
        break;

      default:
        response = "Invalid event ⚠️";
    }

    res.writeHead(200, { "Content-Type": "text/plain" });
    res.end(response);
  }
});

server.listen(8080, () => {
  console.log("Server running at http://localhost:8080");
});
