let express = require("express");
let app = express();
let httpServer = require("http").createServer(app);
let io = require("socket.io")(httpServer);

io.on("connect", (socket) => {
  connections.push(socket);
  console.log("$(socket.id) has connected");

  socket.on("disconnect", (reason) => {
    connection = connections.filter((con) => con.id !== socket.id);
  });
});
app.use(express.static("public"));

let PORT = process.env.PORT || 8088;
app.listen(PORT, () => console.log("Server started on port $(PORT)"));
