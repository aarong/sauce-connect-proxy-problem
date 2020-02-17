var express = require("express");
var sauceConnectLauncher = require("sauce-connect-launcher");
var async = require("async");
var ws = require("ws");

var port = 3000;
var sauceTunnelId = "my-sauce-tunnel";

// Start webserver
console.log("Starting local web server to host the tests...\n");
var e = express();
e.use("/", express.static(__dirname + "/webroot"));
var webserver = e.listen(port, function() {
  console.log("Local web server started.\n");
});

// Print web server events to console
webserver.on("connection", function(socket) {
  socket.on("data", function(data) {
    console.log("Web server data event:");
    console.log(data.toString("utf8"));
  });
});
webserver.on("request", function(req) {
  console.log("Web server request event: " + req.originalUrl + "\n");
});
webserver.on("upgrade", function() {
  console.log("Web server upgrade event\n");
});

// Start WebSocket server
var wsServer = new ws.Server({
  server: webserver
});

// Print WebSocket server events to console
wsServer.on("connection", function(socket) {
  console.log("WebSocket connection event\n");
  socket.on("message", function(msg) {
    console.log("WebSocket message event: " + msg + "\n");
    socket.send("Ola!");
  });
});

// Start Sauce Connect proxy
console.log("Starting Sauce Connect proxy...\n");
sauceConnectLauncher(
  {
    tunnelIdentifier: sauceTunnelId,
    noSslBumpDomains: "localhost,127.0.0.1",
    verbose: true
  },
  function(err, process) {
    if (err) {
      console.log("Failed to start Sauce Connect proxy.\n");
    } else {
      console.log("Sauce Connect proxy started.\n");
    }
  }
);
