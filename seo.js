(() => {
  const eventName = "wokeesub_cta_click";

  if (typeof window.gtag !== "function") {
    window.dataLayer = window.dataLayer || [];
    window.gtag = function gtag() { window.dataLayer.push(arguments); };
    window.gtag("js", new Date());
    window.gtag("config", "G-LCFJTKZE09", {
      allow_google_signals: false,
      allow_ad_personalization_signals: false,
      page_location: window.location.origin + window.location.pathname,
    });
    const analytics = document.createElement("script");
    analytics.async = true;
    analytics.src = "https://www.googletagmanager.com/gtag/js?id=G-LCFJTKZE09";
    document.head.appendChild(analytics);
  }

  document.addEventListener("click", (event) => {
    const link = event.target.closest?.('a[href^="https://wokeesub.com"]');
    if (!link) return;
    const details = {
      link_url: link.href,
      link_text: (link.textContent || "").trim().slice(0, 100),
      page_path: window.location.pathname,
    };
    if (typeof window.gtag === "function") window.gtag("event", eventName, details);
    else {
      window.dataLayer = window.dataLayer || [];
      window.dataLayer.push({ event: eventName, ...details });
    }
  });
})();
