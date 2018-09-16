require("dotenv").config();
var app = require("express")();
var http = require("http").Server(app);
var io = require("socket.io")(http);
var Client = require("ssh2").Client;

var conn = new Client();

const clientCreds = {
  host: process.env.SSH_HOST,
  port: process.env.SSH_PORT,
  username: process.env.SSH_USER,
  password: process.env.SSH_PASS
};

var outputmsg = "";

var sshshell = null;

io.on("connection", socket => {
  console.log("a user connected");
  socket.on("disconnect", () => {
    console.log("user disconnected");
  });
  socket.on("clientcmd", msg => {
    // outputmsg = "";
    // console.log("message: " + msg);
    sshshell.write(`${msg}\n`);
  });
});

conn
  .on("ready", () => {
    console.log("Client :: ready");

    conn.shell(function(err, stream) {
      if (err) throw err;

      sshshell = stream;

      sshshell
        .on("close", function() {
          console.log("Stream :: close");
          conn.end();
        })
        .on("data", function(data) {
          //   outputmsg += data;
          //   console.log("STDOUT: " + outputmsg);
          io.emit("sshresponse", `${data}`);
        })
        .stderr.on("data", function(data) {
          //   outputmsg += data;
          // console.log("STDERR: " + outputmsg);
          io.emit("sshresponse", `${data}`);
        });

      sshshell.write("ls\n");
    });
  })
  .connect(clientCreds);

/**
 * HTTP SERVER.
 */
app.get("/", (req, res) => {
  res.sendFile(__dirname + "/index.html");
});

http.listen(3000, () => {
  console.log("listening on *:3000");
});
