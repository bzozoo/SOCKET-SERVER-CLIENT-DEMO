const fs = require("fs");
const ini = require("ini");
const config = ini.parse(fs.readFileSync("./config.ini", "utf-8"));
const songs = require("./songs.json");

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

  fs.writeFile(config.DATASOURCEFILE, content, (err) => {
    if (err) {
      console.error(err);
      return;
    }
    console.log("DataSourceFile refreshed...");
  });
}

const intervalTimeForTXT = 15000;
config.DATAGENERATION && setInterval(refreshDataTxt, intervalTimeForTXT);
