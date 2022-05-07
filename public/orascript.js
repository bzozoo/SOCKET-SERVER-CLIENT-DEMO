function OraTemplate() {
  const date = new Date();
  const localsting = date.toLocaleTimeString();
  return `
    <span>${localsting}</span>
  `;
}

setInterval(() => {
  try {
    const timeElement = document.querySelector("#time");
    timeElement.innerHTML = OraTemplate();
  } catch (e) {
    console.warn("Time DIV does not extist still");
  }
}, 100);
