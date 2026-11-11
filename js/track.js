/* ================= TRACKING: loads only after a visitor taps Accept =================
   Meta events: PageView, ViewContent (portfolio seen), Contact (WhatsApp tap), Lead (form sent).
   GA4 events: page_view, view_portfolio, whatsapp_click, generate_lead.
   Names, numbers and emails are never sent. autoConfig is off so Meta cannot read the form.
   On any host but the live one, events only go to the console, so testing can't pollute the data. */
var META_PIXEL_ID = "2054364772104868";   // Zee's "shortlet" pixel (ad account 447676694667122), same as www.zeerealtyhq.com
var GA4_ID = "G-0EFHXTFFYQ";              // Zee Realty Websites, on zeerealtyhq@gmail.com
var LIVE_HOST = "own.zeerealtyhq.com";
(function(){
  var KEY = "zee-cookie-choice", on = false, live = location.hostname === LIVE_HOST;
  var src = new URLSearchParams(location.search).get("src") || new URLSearchParams(location.search).get("utm_source") || "direct";
  var EVENTS = {
    view_portfolio: ["ViewContent"], whatsapp_click: ["Contact"], generate_lead: ["Lead"]
  };
  function read(){ try { return localStorage.getItem(KEY); } catch(e){ return null; } }
  function save(v){ try { localStorage.setItem(KEY, v); } catch(e){} }
  function load(url){ var s = document.createElement("script"); s.async = true; s.src = url; document.head.appendChild(s); }
  function start(){
    if (on) return; on = true;
    if (!live){ console.log("[track] consent given, test host: not loading tags"); return; }
    if (META_PIXEL_ID){
      var f = window.fbq = function(){ f.callMethod ? f.callMethod.apply(f, arguments) : f.queue.push(arguments); };
      if (!window._fbq) window._fbq = f; f.push = f; f.loaded = true; f.version = "2.0"; f.queue = [];
      load("https://connect.facebook.net/en_US/fbevents.js");
      fbq("set", "autoConfig", false, META_PIXEL_ID);
      fbq("init", META_PIXEL_ID);
      fbq("track", "PageView");
    }
    if (GA4_ID){
      window.dataLayer = window.dataLayer || [];
      window.gtag = function(){ dataLayer.push(arguments); };
      load("https://www.googletagmanager.com/gtag/js?id=" + GA4_ID);
      gtag("js", new Date());
      gtag("config", GA4_ID, {source_ref: src});
    }
  }
  window.zeeTrack = function(name){
    if (!on) return;
    var meta = EVENTS[name] && EVENTS[name][0];
    if (!live){ console.log("[track]", name, "| meta:", meta, "| src:", src); return; }
    if (window.fbq && meta) fbq("track", meta, {content_name: "Curated Shortlet Portfolio", source_ref: src});
    if (window.gtag) gtag("event", name, {source_ref: src});
  };
  document.addEventListener("click", function(e){
    var a = e.target.closest && e.target.closest('a[href*="wa.me"]');
    if (a) zeeTrack("whatsapp_click");
  }, true);
  document.addEventListener("DOMContentLoaded", function(){
    var bar = document.getElementById("ck");
    function choose(v){ save(v); bar.hidden = true; if (v === "yes") start(); else if (on) location.reload(); }
    document.getElementById("ckYes").onclick = function(){ choose("yes"); };
    document.getElementById("ckNo").onclick = function(){ choose("no"); };
    document.getElementById("ckOpen").onclick = function(){ bar.hidden = false; };
    var c = read();
    if (c === "yes") start(); else if (c !== "no") bar.hidden = false;
    var seen = false, sec = document.getElementById("portfolio");
    if (sec && "IntersectionObserver" in window) new IntersectionObserver(function(en, io){
      if (en[0].isIntersecting && on && !seen){ seen = true; zeeTrack("view_portfolio"); io.disconnect(); }
    }, {threshold: .2}).observe(sec);
  });
})();
