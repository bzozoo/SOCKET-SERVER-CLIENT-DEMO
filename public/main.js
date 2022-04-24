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

socket.on("file", ({ message }) => {
  console.log(message);
  rootElement.innerHTML = Template(message);
});

async function fetchData() {
  const res = await fetch("./data.json");
  const data = await res.json();
  console.log("Initial fetch...");
  console.log(data);
  return data;
}

async function init() {
  const data = await fetchData();
  rootElement.innerHTML = Template(data);
}

function Template({ Album, Picture, Year, Artist, Title, Genre, RefreshedAt }) {
  return `
  <div style="max-width:500px;margin:0.8rem;font-family:sans-serif;background:#EBA669;width:max-content;padding:1rem;box-shadow: 5px 5px 17px #888888;">
  <h4>BZOZOO RETRO RADIO</h4>
  
  <div style="display:flex;flex-direction:column;background:antiquewhite;width:max-content;max-width:inherit;">
    <div style="display:flex">
      <div style="display:flex;flex-direction:column;margin-right:0.8rem;">
        <div style="padding:0.7rem"><b>Album </b> ${Album}</div>
        <div style="padding:0.7rem"><b>Year </b> ${Year}</div>
        <div style="padding:0.7rem"><b>Artist </b> ${Artist}</div>
        <div style="padding:0.7rem"><b>Title </b> ${Title}</div>
        <div style="padding:0.7rem"><b>Genre </b> ${Genre}</div>
      </div>
      <div style="display:flex;padding:0.5rem;">
        <img src="${Picture}" width="200px" height="200px" />
      </div>
    </div>
    <div style="padding:0.7rem"><b>Refreshed At </b> ${RefreshedAt}</div>
  </div>
  </div>
  <br />
  `;
}

init();
