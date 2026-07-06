// window.LEADERBOARD_URL is injected by the server from the LEADERBOARD_URL env var
// (see /config.js). If you forgot `-e LEADERBOARD_URL=...` on `docker run`, it's empty.
const SERVER = (window.LEADERBOARD_URL || "").replace(/\/$/, "");

const form = document.getElementById("join-form");
const nameInput = document.getElementById("name");
const gifInput = document.getElementById("gifUrl");
const submitBtn = document.getElementById("submit-btn");
const statusEl = document.getElementById("status");
const board = document.getElementById("board");
const boardEmpty = document.getElementById("board-empty");
const preview = document.getElementById("preview");
const previewWrap = document.getElementById("preview-wrap");

let myId = localStorage.getItem("dockerGameId") || null;

function setStatus(msg, kind) {
  statusEl.textContent = msg;
  statusEl.className = "status" + (kind ? " " + kind : "");
}

function escapeHtml(s) {
  return String(s).replace(/[&<>"']/g, (c) =>
    ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c])
  );
}

// Live GIF preview as you type the URL.
gifInput.addEventListener("input", () => {
  const url = gifInput.value.trim();
  if (/^https?:\/\//i.test(url)) {
    preview.src = url;
    previewWrap.hidden = false;
  } else {
    previewWrap.hidden = true;
  }
});

function ensureServer() {
  if (!SERVER) {
    setStatus(
      "No leaderboard server configured. Re-run the container with -e LEADERBOARD_URL=https://<your>.vercel.app",
      "err"
    );
    return false;
  }
  return true;
}

form.addEventListener("submit", async (e) => {
  e.preventDefault();
  if (!ensureServer()) return;

  submitBtn.disabled = true;
  setStatus("Joining…");
  try {
    const res = await fetch(`${SERVER}/api/entries`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: nameInput.value.trim(),
        gifUrl: gifInput.value.trim(),
      }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || "Something went wrong.");

    myId = data.id;
    localStorage.setItem("dockerGameId", myId);
    setStatus("You're on the board! 🎉 Go get some upvotes.", "ok");
    form.reset();
    previewWrap.hidden = true;
    refresh();
  } catch (err) {
    setStatus(err.message, "err");
  } finally {
    submitBtn.disabled = false;
  }
});

async function vote(id) {
  if (!ensureServer()) return;
  try {
    await fetch(`${SERVER}/api/vote`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    });
    refresh();
  } catch (err) {
    setStatus("Vote failed: " + err.message, "err");
  }
}
window.vote = vote;

function medal(i) {
  return i === 0 ? "🥇" : i === 1 ? "🥈" : i === 2 ? "🥉" : "#" + (i + 1);
}

function render(entries) {
  boardEmpty.hidden = entries.length > 0;
  board.innerHTML = entries
    .map((e, i) => {
      const topClass = i < 3 ? "top" + (i + 1) : "";
      const mine = e.id === myId ? " (you)" : "";
      const img = e.gifUrl
        ? `<img class="avatar" src="${escapeHtml(e.gifUrl)}" alt="" onerror="this.style.visibility='hidden'"/>`
        : `<div class="avatar"></div>`;
      return `
        <div class="row ${topClass}">
          <div class="rank">${medal(i)}</div>
          ${img}
          <div class="rname">${escapeHtml(e.name)}${mine}</div>
          <button class="vote-btn" onclick="vote('${e.id}')">▲ <b>${e.votes}</b></button>
        </div>`;
    })
    .join("");
}

async function refresh() {
  if (!SERVER) {
    ensureServer();
    return;
  }
  try {
    const res = await fetch(`${SERVER}/api/entries`, { cache: "no-store" });
    const { entries } = await res.json();
    render(entries || []);
  } catch (err) {
    // Network hiccup — keep the last board on screen.
    console.error("refresh failed", err);
  }
}

refresh();
setInterval(refresh, 3000);
