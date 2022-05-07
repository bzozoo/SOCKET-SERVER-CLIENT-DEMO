const http = require("http");
const fs = require("fs");
const finalhandler = require("finalhandler");
const serveStatic = require("serve-static");
const serve = serveStatic("./public", { index: ["client.html"] });
const songs = require("./songs.json");
const ini = require("ini");
const config = ini.parse(fs.readFileSync("./config.ini", "utf-8"));
const datasourceFile = config.DATASOURCEFILE;
const port = config.SERVERPORT;
const DATANAMES = config.DATANAMES.split(", ");
const allowedServers = config.ALLOWEDHOSTSONSERVER.split(", ");
console.log("NODE VERSION: " + process.versions.node);
console.log(config);

//Initialize server
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
  .listen(port);
//Initialize server END

//Ez a rész szimulálja a Datasource file generálást. Ha más szoftver végzi ezt, erre a kódrészre nincs szükség. A consfig.ini-ben kikapcsolható. DATAGENERATION=false
function refreshDataTxt() {
  const date = new Date().toLocaleTimeString("hu-HU", {
    timeZone: "Europe/Budapest"
  });
  const random = Math.floor(Math.random() * songs.length) + 0;
  const actualSong = songs[random];

  const content =
    actualSong.Album +
    config.SEPARATOR +
    actualSong.Year +
    config.SEPARATOR +
    actualSong.Artist +
    config.SEPARATOR +
    actualSong.Title +
    config.SEPARATOR +
    actualSong.Genre +
    config.SEPARATOR +
    date +
    config.SEPARATOR +
    actualSong.Image;

  fs.writeFile(datasourceFile, content, (err) => {
    if (err) {
      console.error(err);
      return;
    }
    console.log("DataSourceFile refreshed...");
  });
}

const intervalTimeForTXT = 15000;
config.DATAGENERATION && setInterval(refreshDataTxt, intervalTimeForTXT);
//END - Datasource file generáló rész vége

//Generate data.json
fs.watchFile(
  datasourceFile,
  {
    persistent: true,
    interval: 1000
  },
  async function (data) {
    const jsonObj = await getDataJson();
    const contentstring = JSON.stringify(jsonObj);
    fs.writeFile("./public/data.json", contentstring, (err) => {
      if (err) {
        console.error(err);
        return;
      }
      console.log("Data.json refreshed...");
    });
  }
);
//EBD data.json generate

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
  console.log("Socketserver started...");
  const date = new Date();
  socket.emit("welcome", { message: "Welocome on server ::: " + date });
  const messageObject = await getDataJson();
  socket.emit("initialData", { message: messageObject });
});

fs.watchFile(
  datasourceFile,
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

//Additional-Helper functions
async function getDataJson() {
  const dataTXT = await fs.readFileSync(datasourceFile, "utf8");
  return textToObj(dataTXT);
}

function textToObj(text) {
  const data = text.split(config.SEPARATOR);
  const structure = {};
  DATANAMES.map((dataname, index) => {
    structure[dataname] = data[index];
  });

  return structure;
}
//Additional-Helper functions END
