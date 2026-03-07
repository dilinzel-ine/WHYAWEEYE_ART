/* ═══════════════════════════════════════════════
     NAME TICKER
  ═══════════════════════════════════════════════ */
const tickerSection = document.createElement("section");
tickerSection.classList.add("name-slider-body");
tickerSection.setAttribute("aria-hidden", "true");

tickerSection.innerHTML = `
  <div class="slider" style="--width: 55px; --height: 55px; --time: 9s; --quantity: 9">
    <div class="list">
      <div class="item" style="--index: 1"><p>W</p></div>
      <div class="item" style="--index: 2"><p>H</p></div>
      <div class="item" style="--index: 3"><p>Y</p></div>
      <div class="item" style="--index: 4"><p>A</p></div>
      <div class="item" style="--index: 5"><p>W</p></div>
      <div class="item" style="--index: 6"><p>E</p></div>
      <div class="item" style="--index: 7"><p>E</p></div>
      <div class="item" style="--index: 8"><p>Y</p></div>
      <div class="item" style="--index: 9"><p>E</p></div>
    </div>
  </div>
`;

// inserts it where you place the script tag
document.currentScript.insertAdjacentElement("beforebegin", tickerSection);
