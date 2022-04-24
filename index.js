let http = require("http");
const fs = require("fs");
let nStatic = require("node-static");
let fileServer = new nStatic.Server("./public", { indexFile: "client.html" });
const songs = require("./songs.json");
const ini = require("ini");
const config = ini.parse(fs.readFileSync("./config.ini", "utf-8"));

console.log("NODE VERSION: " + process.versions.node);
console.log(config);

const httpServer = http
  .createServer(function (req, res) {
    res.setHeader(
      "Access-Control-Allow-Origin",
      "https://cdpn.io",
      "https://example.com"
    );

    req
      .addListener("end", function () {
        fileServer.serve(req, res);
      })
      .resume();
  })
  .listen(8080);

const options = {
  cors: {
    origin: "https://cdpn.io",
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
    "RefreshedAt: " +
    date;

  fs.writeFile("./public/data.txt", content, (err) => {
    if (err) {
      console.error(err);
      return;
    }
    console.log("Data.txt refreshed...");
  });
}

const intervalTime = 15000;
config.DATAGENERATION && setInterval(refreshDataTxt, intervalTime);
//END - Data.txt generáló rész vége

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
    const dataTXT = await fs.readFileSync("./public/data.txt", "utf8");
    const messageObject = textToObj(dataTXT);
    io.emit("file", { message: messageObject });
    console.log("File sended...");
  }
);

function textToObj(text) {
  const arr = text.split(config.SEPARATOR);
  const obj = {
    Album: arr[0],
    Picture: arr[1],
    Year: arr[2],
    Artist: arr[3],
    Title: arr[4],
    Genre: arr[5],
    RefreshedAt: arr[6]
  };
  return obj;
}
