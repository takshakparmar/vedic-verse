/* ═══ Vedic Verse — boot ═══ */
(function () {
  const VV = window.VV;
  const veil = document.getElementById("veil");
  const statusEl = document.getElementById("veil-status");
  const barEl = document.getElementById("veil-bar-fill");
  const hintEl = document.getElementById("veil-hint");

  function setProgress(p, msg) {
    barEl.style.width = Math.round(p * 100) + "%";
    if (msg) {
      statusEl.style.opacity = 0;
      setTimeout(() => { statusEl.textContent = msg; statusEl.style.opacity = 1; }, 160);
    }
  }

  async function boot() {
    hintEl.innerHTML = "";
    statusEl.textContent = VV.t("preparing");
    VV.syncTabbar();
    try {
      await VV.loadCorpus((p, msg) => setProgress(p, msg));
      setTimeout(() => {
        veil.classList.add("hide");
        if (!VV.settings.onboarded) {
          VV.switchTab("home", true); // render behind the onboarding overlay
          VV.startOnboarding(false);
        } else {
          VV.switchTab("home", true);
        }
      }, 550);
    } catch (err) {
      setProgress(0, VV.t("archive_unreachable"));
      hintEl.innerHTML = `${VV.t("first_launch_hint")} <button id="retry-btn">${VV.t("try_again")}</button>`;
      document.getElementById("retry-btn").onclick = boot;
    }
  }

  boot();
})();
