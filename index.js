const http = require("http");
const fs = require("fs");
const finalhandler = require("finalhandler");
const serveStatic = require("serve-static");
const serve = serveStatic("./public", { index: ["client.html"] });
const songs = require("./songs.json");
const ini = require("ini");
const config = ini.parse(fs.readFileSync("./config.ini", "utf-8"));
const DATANAMES = config.DATANAMES.split(", ");
const allowedServers = config.ALLOWEDHOSTSONSERVER.split(", ");
console.log("NODE VERSION: " + process.versions.node);
console.log(config);

const httpServer = http
  .createServer(function (req, res) {
    const origin = req.headers.origin;
    if (allowedServers.includes(origin)) {
      res.setHeader("Access-Control-Allow-Origin", origin);
    }

    req
      .addListener("end", function () {
        serve(req, res, finalhandler(req, res));
        //fileServer.serve(req, res);
      })
      .resume();
  })
  .listen(8080);

const options = {
  cors: {
    origin: allowedServers,
    methods: ["GET", "POST"],
    allowedHeaders: ["my-custom-header"],
    credentials: true
  }
};
const io = require("socket.io")(httpServer, options);

//Ez a rész szimulálja a data.txt generálást. Ha más szoftver végzi ezt, erre a kódrészre nincs szükség. A consfig.ini-ben kikapcsolható. DATAGENERATION=false
function refreshDataTxt() {
  const date = new Date().toLocaleTimeString("hu-HU", {
    timeZone: "Europe/Budapest"
  });
  const random = Math.floor(Math.random() * songs.length) + 0;
  const actualSong = songs[random];

  const content =
    actualSong.Album +
    config.SEPARATOR +
    actualSong.Picture +
    config.SEPARATOR +
    actualSong.Year +
    config.SEPARATOR +
    actualSong.Artist +
    config.SEPARATOR +
    actualSong.Title +
    config.SEPARATOR +
    actualSong.Genre +
    config.SEPARATOR +
    date;

  fs.writeFile("./public/data.txt", content, (err) => {
    if (err) {
      console.error(err);
      return;
    }
    console.log("Data.txt refreshed...");
  });
}

const intervalTimeForTXT = 15000;
config.DATAGENERATION && setInterval(refreshDataTxt, intervalTimeForTXT);
//END - Data.txt generáló rész vége

//Generate data.json
async function generateDataJson() {
  const content = await await getDataJson();
  const contentstring = JSON.stringify(content);
  fs.writeFile("./public/data.json", contentstring, (err) => {
    if (err) {
      console.error(err);
      return;
    }
    console.log("Data.json refreshed...");
  });
}

const intervalTimeForJSON = 5000;
setInterval(generateDataJson, intervalTimeForJSON);
//EBD data.json generate

io.on("connection", (socket) => {
  console.log("Socketserver started...");
  const date = new Date();
  socket.emit("welcome", { message: "Welocome ::: " + date });
});

fs.watchFile(
  "./public/data.txt",
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

function textToObj(text) {
  const data = text.split(config.SEPARATOR);
  const structure = {};
  DATANAMES.map((dataname, index) => {
    structure[dataname] = data[index];
  });

  return structure;
}

async function getDataJson() {
  const dataTXT = await fs.readFileSync("./public/data.txt", "utf8");
  return textToObj(dataTXT);
}
