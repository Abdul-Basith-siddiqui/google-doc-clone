const mongoose = require("mongoose");
const Document = require("./document");
mongoose.connect("mongodb://0.0.0.0:27017/my-google-docs");

const io = require("socket.io")(3002, {
  // io object allow us to listen to the port
  //cross origin request support - CORS allows us to make requests from one domain (url) to another , because of the server and the client are on different origin
  cors: {
    origin: "http://localhost:3000",
    methods: ["GET", "POST"],
  },
});

const defaultValue = "";

//everyTime our client connects to the server connection, this socket will respond
io.on("connection", (socket) => {
  socket.on("get-document", async (documentid) => {
    const document = await findOrCreateDocument(documentid);
    socket.join(documentid);
    socket.emit("load-document", document.data);

    socket.on("send-changes", (delta) => {
      socket.broadcast.emit("receive-changes", delta);
    });
    socket.on("save-document", async (data) => {
      await Document.findByIdAndUpdate(documentid, { data });
    });
  });
});

async function findOrCreateDocument(id) {
  if (id == null) return;
  const document = await Document.findById(id);
  if (document) return document;
  return await Document.create({ _id: id, data: defaultValue });
}
