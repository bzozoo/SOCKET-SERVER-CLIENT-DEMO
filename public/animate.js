function animate({ element, color, speed, edgeLeft, edgeRight }) {
  console.log("Animation start on elemment...");
  console.log(document.querySelector(element));
  const stringForAnimation = document.querySelector(element).innerText;
  document.querySelector(element).innerHTML = "";

  function TemplateFor(character) {
    return ` <div class="inline" style="display:inline-block;margin:-0.1rem;">${character}</div>`;
  }

  stringForAnimation.split("").map((character) => {
    document.querySelector(element).innerHTML += TemplateFor(character);
  });
  const elementSpans = [...document.querySelectorAll(element + " .inline")];

  function loop(i, orientation) {
    setTimeout(() => {
      elementSpans.map((elementSpan) => {
        elementSpan.style.color = "";
      });
      try {
        elementSpans[i].style.color = color;
      } catch (e) {}

      orientation =
        elementSpans.length + edgeRight <= i
          ? "B"
          : i <= edgeLeft
          ? "F"
          : orientation;
      const newI =
        i < elementSpans.length + edgeRight && orientation === "F"
          ? i + 1
          : i - 1;
      loop(newI, orientation);
    }, speed);
  }
  loop(0, "F");
}
