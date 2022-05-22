const http = require("http");
const fs = require("fs");
const ini = require("ini");
const config = ini.parse(fs.readFileSync("./config.ini", "utf-8"));

const allowedServers =
  config.ALLOWEDHOSTSONSERVER?.split(", ") ||
  String(config.ALLOWEDHOSTSONSERVER);

console.log("NODE VERSION: " + process.versions.node);
console.log(config);
console.log("Allowed servers: " + allowedServers);

//Initialize server
const httpServer = http
  .createServer(function (req, res) {
    res.statusCode = 200;
    res.setHeader("Content-Type", "text/plain");
    res.end("WELCOME ON SOCKET SERVER...");
  })
  .listen(config.SERVERPORT);
//Initialize server END

//Socket Server
const options = {
  cors: {
    origin: allowedServers,
    methods: ["GET", "POST"],
    allowedHeaders: ["my-custom-header"],
    credentials: true
  }
};
const io = require("socket.io")(httpServer, options);

io.on("connection", async (socket) => {
  console.log("Client connected...");
  console.log({
    host: socket.handshake.headers.host,
    referer: socket.handshake.headers.referer,
    origin: socket.handshake.headers.origin
  });
  const date = new Date();
  socket.emit("welcome", { message: "Welocome on server ::: " + date });
  const messageObject = await getDataJson();
  socket.emit("initialData", { message: messageObject });
});

fs.watchFile(
  config.DATASOURCEFILE,
  {
    persistent: true,
    interval: 1000
  },
  async function (data) {
    const messageObject = await getDataJson();
    io.emit("file", { message: messageObject });
    console.log("File sended...");
  }
);

//Socket Server END

//Ez a rész szimulálja a Datasource file generálást. Ha más szoftver végzi ezt, erre a kódrészre nincs szükség. A consfig.ini-ben kikapcsolható. DATAGENERATION=false
config.DATAGENERATION && require("./demodata-generator");
//END - Datasource file generáló rész vége

//Additional-Helper functions
async function getDataJson() {
  const dataTXT = await fs.readFileSync(config.DATASOURCEFILE, "utf8");
  return textToObj(dataTXT);
}

function textToObj(text) {
  const data = text.split(config.SEPARATOR);
  const DATANAMES = config.DATANAMES.split(", ");
  const structure = {};
  DATANAMES.map((dataname, index) => {
    structure[dataname] = data[index];
  });
  console.log(structure);
  return structure;
}
//Additional-Helper functions END
