console.log("Client main.js");
const rootElement = document.querySelector("#root");
const socket = io();

socket.on("connect", (message) => {
  console.log("Socket connected?");
  console.log(socket.connected);
});

socket.on("welcome", ({ message }) => {
  console.log(message);
});

socket.on("initialData", ({ message }) => {
  console.log("Initial SOCKET...");
  console.log(message);
  rootElement.innerHTML = Template(message);
  doAnimations();
});

socket.on("file", ({ message }) => {
  rootElement.innerHTML = "<img src='https://i.imgur.com/AX03zYX.gif' />";
  console.log(message);
  rootElement.innerHTML = Template(message);
  doAnimations();
});

function doAnimations() {
  animate({
    element: "#animatedArtist",
    color: "red",
    speed: 300,
    edgeLeft: -10,
    edgeRight: 3
  });
  animate({
    element: "#animatedTitle",
    color: "lightblue",
    speed: 500,
    edgeLeft: -10,
    edgeRight: 3
  });
}

function Template({ Album, Image, Year, Artist, Title, Genre, RefreshedAt }) {
  return `
  <div class="container">
    <div id="containerheader" class="flexsimple">
      <div class="simplemarginright largerfont">BZOZOO RETRO RADIO</div>
      <div class="largerfont flexgrowone texttoright" id="time"></div>
    </div>
    <div id="content" class="containerinside flexcolumn">
      <div id="contentbody" class="flexsimple  flexcolumnreverse">
        <div id="datas" class="flexcolumn simplemarginright">
          <div class="simplepadding responsivefont shadow">
            <marquee>
              <span id="animatedArtist">${Artist}</span>
            </marquee>
          </div>
          <div id="animatedTitle" class="simplepadding responsivefont shadow">
            ${Title}
          </div>
          <div class="simplepadding" >
            <b>${Year}</b> © ${Album}
          </div>
          <div class="simplepadding">
            ${Genre}
          </div>
        </div>
        <div id="imagebox" class="flexsimple simplepadding">
          <img class="image" src="${Image}" />
        </div>
      </div>
      <div id="contentfooter" class="simplepadding">
        <b>Refreshed At </b> ${RefreshedAt}
      </div>
    </div>
  </div>
  <br />
  `;
}
