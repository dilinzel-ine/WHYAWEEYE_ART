document.addEventListener("DOMContentLoaded", () => {
  // footer.js — at the top, before the canvas code
  document.querySelector("footer").innerHTML = `
        <!-- Full-footer looping video -->
      <div class="video-overlay"></div>
      <video
        class="video-bg"
        id="bgVideo"
        autoplay
        muted
        loop
        playsinline
        poster="/images/abstract-vibrant-bg.webp">
        <source src="/images/bgvid-2.mp4" type="video/mp4" />
      </video>

      <!-- ── TWO PRIMARY COLUMNS ── -->
      <div class="footer-body">
        <!-- LEFT COLUMN -->
        <div class="left-col">
          <!-- A) TOP: solid black + small label + video-through-text brand -->

          <!-- B) BOTTOM: no background — pure video shows through, nothing overlaid -->
          <div class="left-bottom"></div>
          <div class="left-top">
            <div class="left-top-content">
              <span class="section-label">[Hello, There]</span>
              <a href="https://buymeacoffee.com/why25"  target="_blank" 
  rel="noopener noreferrer"
  aria-label="Visit my buymeacoffee page (opens in new tab)" class="small-label">BUYMEABOOK <span>↴</span></a>
              <!-- Canvas: @WHY / A25 with live video composited through the letters -->
              <canvas id="heroCanvas"></canvas>
              <!-- element 3 -->
              <!-- element 4 -->
            </div>
          </div>
        </div>

        <!-- RIGHT COLUMN — full-height solid black -->
        <div class="right-col">
          <span class="section-label">[Currently Reading]</span>

          <!-- Book animation — unchanged -->
          <div class="book-card">
            <div class="book v3">
              <div class="book-inner">
                <div class="book-spine"></div>
                <div class="book-face">
                  <img
                    src="https://i.postimg.cc/DzRQyGwX/58784475.jpg"
                    alt="Book cover"
                    referrerpolicy="no-referrer"
                  />
                </div>
                <!-- <div class="book-pages"></div> -->
              </div>
            </div>
            <div class="book-meta">
              <div class="book-title">
                Tomorrow, and Tomorrow,<br />and Tomorrow
              </div>
              <div class="book-author">Gabrielle Zevin</div>
            </div>
            <a href="#" class="book-link">View on Goodreads ↗</a>
          </div>

          <!-- Connect + Contact directly below book details -->
          <div class="right-links">
            <div class="link-group">
              <div class="link-group-title">Connect</div>
              <a href="https://whyaweeyesocials.vercel.app/" class="nav-link">Behance</a>
              <a href="https://whyaweeyesocials.vercel.app/" class="nav-link">Instagram</a>
            </div>
            <div class="link-group">
              <div class="link-group-title">Contact</div>
              <a href="/cdn-cgi/l/email-protection#d1" class="nav-link"
                >Email</a
              >
              <a href="#" class="nav-link">Telegram</a>
            </div>
          </div>
        </div>
      </div>

      <!-- ── BOTTOM ROW ── -->
      <div class="footer-bottom">
        <!-- Left: transparent bg — video visible, copyright uses blend-mode -->
        <div class="bottom-left">
          <span class="footer-copy"
            >© 2026 WHYAWEEYE. ALL RIGHTS RESERVED.</span
          >
        </div>

        <!-- Right: continues black column, normal colour text -->
        <div class="bottom-right">
          <span class="footer-tagline">
            Powered by good vibes &amp; really good playlists<br />
            Made with 🩶
          </span>
        </div>
      </div>
    
`;

  // then your canvas code below
  // ─── VIDEO-IN-TEXT via Canvas ───
  // @WHY / A25 in the solid-black top-left section.
  // The live video is composited through the letterforms so the
  // background video is visible only inside the text shapes.
  const canvas = document.getElementById("heroCanvas");
  const ctx = canvas.getContext("2d");
  const video = document.getElementById("bgVideo");

  const LINES = ["@WHY", "     -25"];
  const FONT_VW = 0.12;
  const LINE_HEIGHT = 0.8;

  function getFontSize() {
    return Math.min(Math.max(window.innerWidth * FONT_VW, 120), 280);
  }

  function resizeCanvas() {
    const fs = getFontSize();
    ctx.font = `${fs}px 'Bebas Neue', sans-serif`;
    const maxW = Math.max(...LINES.map((l) => ctx.measureText(l).width)) + 20;
    const totalH = fs * LINE_HEIGHT * LINES.length + fs * 0.22;
    canvas.width = maxW;
    canvas.height = totalH;
    canvas.style.width = maxW + "px";
    canvas.style.height = totalH + "px";
  }

  function drawFrame() {
    const fs = getFontSize();
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // 1. Draw white text — these pixels become the mask
    ctx.font = `${fs}px 'Bebas Neue', sans-serif`;
    ctx.textBaseline = "alphabetic";
    ctx.fillStyle = "#fff";
    LINES.forEach((line, i) => {
      ctx.fillText(line, 0, fs * LINE_HEIGHT * (i + 1) - fs * 0.06);
    });

    // 2. Paint video only where the text pixels exist
    ctx.globalCompositeOperation = "source-in";
    try {
      const cRect = canvas.getBoundingClientRect();
      const fRect = canvas.closest("footer").getBoundingClientRect();
      const vw = video.videoWidth || 1280;
      const vh = video.videoHeight || 720;
      const fw = fRect.width;
      const fh = fRect.height;
      const scale = Math.max(fw / vw, fh / vh);
      const sw = vw * scale;
      const sh = vh * scale;
      const ox = (fw - sw) / 2;
      const oy = (fh - sh) / 2;
      ctx.drawImage(
        video,
        0,
        0,
        vw,
        vh,
        ox - (cRect.left - fRect.left),
        oy - (cRect.top - fRect.top),
        sw,
        sh,
      );
    } catch (e) {
      ctx.fillStyle = "#00AEEF";
      ctx.fillRect(0, 0, canvas.width, canvas.height);
    }
    ctx.globalCompositeOperation = "source-over";
    requestAnimationFrame(drawFrame);
  }

  document.fonts.ready.then(() => {
    resizeCanvas();
    video.addEventListener("loadeddata", () =>
      requestAnimationFrame(drawFrame),
    );
    requestAnimationFrame(drawFrame);
  });

  window.addEventListener("resize", resizeCanvas);
});
