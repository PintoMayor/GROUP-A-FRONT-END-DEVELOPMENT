// CivicPulse - animations.js
// All the moving parts of the site.
//
// The idea is simple: javascript only adds and removes class names.
// The css in animations.css does the actual animating.


// ---------------------------------------------------------------
// small helpers
// ---------------------------------------------------------------

// the visitor may have asked for less motion, we respect that
function allowMotion() {
  return !window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

// phones and tablets do not have a real mouse pointer
function isTouch() {
  return window.matchMedia("(hover: none), (pointer: coarse)").matches;
}


// ---------------------------------------------------------------
// 1. SCROLL REVEAL
// An element with data-reveal is hidden by the css. When it scrolls
// near the screen we add the class is-visible and it fades in.
// ---------------------------------------------------------------

var revealItems = document.querySelectorAll("[data-reveal], [data-split]");

function showReveals() {
  for (var i = 0; i < revealItems.length; i++) {
    var item = revealItems[i];

    // already shown, nothing to do
    if (item.classList.contains("is-visible")) { continue; }

    var top = item.getBoundingClientRect().top;
    if (top < window.innerHeight * 0.9) {
      item.classList.add("is-visible");
    }
  }
}

window.addEventListener("scroll", showReveals);
window.addEventListener("resize", showReveals);


// a container with data-stagger gives each child a little more delay
var staggerGroups = document.querySelectorAll("[data-stagger]");

for (var g = 0; g < staggerGroups.length; g++) {
  var step = parseInt(staggerGroups[g].getAttribute("data-stagger"), 10) || 90;
  var children = staggerGroups[g].querySelectorAll("[data-reveal], [data-split]");

  for (var c = 0; c < children.length; c++) {
    children[c].style.transitionDelay = (c * step) + "ms";
  }
}


// ---------------------------------------------------------------
// 2. SPLIT TEXT INTO WORDS
// We put every word inside two spans. The outer one hides the
// overflow, the inner one slides up from behind it.
// ---------------------------------------------------------------

var splitItems = document.querySelectorAll("[data-split]");

for (var s = 0; s < splitItems.length; s++) {
  var element = splitItems[s];
  var mode = element.getAttribute("data-split") || "words";
  var text = element.textContent;
  var baseDelay = (parseInt(element.getAttribute("data-delay"), 10) || 0) * 90;

  element.textContent = "";
  element.classList.add("cp-split");

  if (mode === "chars") {
    element.classList.add("cp-split--chars");
  }

  var parts = text.split(" ");

  for (var w = 0; w < parts.length; w++) {
    if (!parts[w]) { continue; }

    var outer = document.createElement("span");
    outer.className = "cp-word";

    var inner = document.createElement("span");
    inner.className = "cp-word-in";

    if (mode === "chars") {
      // one span for every letter
      var letters = parts[w].split("");

      for (var l = 0; l < letters.length; l++) {
        var letter = document.createElement("span");
        letter.textContent = letters[l];
        letter.style.transitionDelay = (baseDelay + (w * 58) + (l * 42)) + "ms";
        inner.appendChild(letter);
      }
    } else {
      inner.textContent = parts[w];
      inner.style.transitionDelay = (baseDelay + (w * 58)) + "ms";
    }

    outer.appendChild(inner);
    element.appendChild(outer);
    element.appendChild(document.createTextNode(" "));
  }
}


// ---------------------------------------------------------------
// 3. COUNT UP NUMBERS
// The number counts up when it scrolls into the screen.
// ---------------------------------------------------------------

function addCommas(number) {
  var parts = String(number).split(".");
  parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  return parts.join(".");
}

function startCount(element) {
  if (element.getAttribute("data-counted")) { return; }
  element.setAttribute("data-counted", "yes");

  var target = parseFloat(element.getAttribute("data-count-to"));
  if (isNaN(target)) { return; }

  var duration = parseInt(element.getAttribute("data-count-duration"), 10) || 1800;
  var decimals = parseInt(element.getAttribute("data-count-decimals"), 10) || 0;
  var prefix = element.getAttribute("data-count-prefix") || "";
  var suffix = element.getAttribute("data-count-suffix") || "";

  // if the visitor wants less motion we just show the final number
  if (!allowMotion()) {
    element.textContent = prefix + addCommas(target.toFixed(decimals)) + suffix;
    return;
  }

  var startTime = Date.now();

  function tick() {
    var passed = Date.now() - startTime;
    var progress = Math.min(passed / duration, 1);

    // fast at the start then slow down
    var eased = 1 - Math.pow(2, -10 * progress);
    var current = target * eased;

    element.textContent = prefix + addCommas(current.toFixed(decimals)) + suffix;

    if (progress < 1) {
      window.requestAnimationFrame(tick);
    } else {
      element.textContent = prefix + addCommas(target.toFixed(decimals)) + suffix;
    }
  }

  window.requestAnimationFrame(tick);
}

var counters = document.querySelectorAll("[data-count-to]");

function checkCounters() {
  for (var i = 0; i < counters.length; i++) {
    var top = counters[i].getBoundingClientRect().top;
    if (top < window.innerHeight * 0.9) {
      startCount(counters[i]);
    }
  }
}

window.addEventListener("scroll", checkCounters);
window.addEventListener("resize", checkCounters);


// ---------------------------------------------------------------
// 4. RIPPLE ON CLICK
// We add a small circle under the mouse and the css grows it away.
// ---------------------------------------------------------------

var rippleItems = document.querySelectorAll("[data-ripple]");

for (var r = 0; r < rippleItems.length; r++) {
  rippleItems[r].addEventListener("click", function (event) {
    if (!allowMotion()) { return; }

    var button = event.currentTarget;
    var box = button.getBoundingClientRect();
    var size = Math.max(box.width, box.height);

    var drop = document.createElement("span");
    drop.className = "cp-ripple";
    if (button.getAttribute("data-ripple-dark")) {
      drop.className = drop.className + " cp-ripple--dark";
    }

    drop.style.width = size + "px";
    drop.style.height = size + "px";
    drop.style.left = (event.clientX - box.left - size / 2) + "px";
    drop.style.top = (event.clientY - box.top - size / 2) + "px";

    button.appendChild(drop);

    // take it away when the animation is over
    setTimeout(function () { drop.remove(); }, 620);
  });
}


// ---------------------------------------------------------------
// 5. MAGNETIC BUTTON
// The button drifts a little towards the mouse.
// ---------------------------------------------------------------

if (!isTouch() && allowMotion()) {
  var magneticItems = document.querySelectorAll("[data-magnetic]");

  for (var m = 0; m < magneticItems.length; m++) {
    (function (element) {
      var strength = parseFloat(element.getAttribute("data-magnetic")) || 0.25;

      element.addEventListener("pointermove", function (event) {
        var box = element.getBoundingClientRect();
        var middleX = box.left + box.width / 2;
        var middleY = box.top + box.height / 2;
        var moveX = (event.clientX - middleX) * strength;
        var moveY = (event.clientY - middleY) * strength;

        element.style.transform = "translate3d(" + moveX + "px," + moveY + "px,0)";
      });

      element.addEventListener("pointerleave", function () {
        element.style.transform = "translate3d(0,0,0)";
      });
    })(magneticItems[m]);
  }
}


// ---------------------------------------------------------------
// 6. 3D TILT CARD
// The card turns a little when the mouse moves across it.
// ---------------------------------------------------------------

if (!isTouch() && allowMotion()) {
  var tiltItems = document.querySelectorAll("[data-tilt]");

  for (var t = 0; t < tiltItems.length; t++) {
    (function (element) {
      var amount = parseFloat(element.getAttribute("data-tilt")) || 8;

      element.addEventListener("pointermove", function (event) {
        var box = element.getBoundingClientRect();
        var x = (event.clientX - box.left) / box.width;
        var y = (event.clientY - box.top) / box.height;
        var turnY = (x - 0.5) * amount * 2;
        var turnX = (0.5 - y) * amount * 2;

        element.style.transform =
          "perspective(900px) rotateX(" + turnX + "deg) rotateY(" + turnY + "deg)";
      });

      element.addEventListener("pointerleave", function () {
        element.style.transform = "perspective(900px) rotateX(0deg) rotateY(0deg)";
      });
    })(tiltItems[t]);
  }
}


// ---------------------------------------------------------------
// 7. THE GLOW THAT FOLLOWS THE MOUSE
// ---------------------------------------------------------------

if (!isTouch()) {
  var glowHosts = document.querySelectorAll("[data-glow]");

  for (var gl = 0; gl < glowHosts.length; gl++) {
    (function (host) {
      var glow = document.createElement("div");
      glow.className = "cp-glow";
      host.appendChild(glow);

      var x = 0, y = 0, targetX = 0, targetY = 0;

      function move() {
        // chase the mouse slowly for a soft effect
        x = x + (targetX - x) * 0.12;
        y = y + (targetY - y) * 0.12;

        glow.style.transform =
          "translate3d(" + x + "px," + y + "px,0) translate(-50%,-50%)";

        window.requestAnimationFrame(move);
      }
      move();

      host.addEventListener("pointermove", function (event) {
        var box = host.getBoundingClientRect();
        targetX = event.clientX - box.left;
        targetY = event.clientY - box.top;
      });
    })(glowHosts[gl]);
  }
}


// ---------------------------------------------------------------
// 8. PARALLAX
// A layer that moves slower than the page when you scroll.
// ---------------------------------------------------------------

if (allowMotion()) {
  var parallaxLayers = document.querySelectorAll("[data-parallax]");

  function moveParallax() {
    for (var i = 0; i < parallaxLayers.length; i++) {
      var layer = parallaxLayers[i];
      var speed = parseFloat(layer.getAttribute("data-parallax")) || 0.15;
      var box = layer.getBoundingClientRect();
      var middle = box.top + box.height / 2 - window.innerHeight / 2;
      var shift = -middle * speed;

      layer.style.transform = "translate3d(0," + shift.toFixed(2) + "px,0)";
    }
  }

  window.addEventListener("scroll", moveParallax);
  window.addEventListener("resize", moveParallax);
}


// ---------------------------------------------------------------
// 9. SCRAMBLE TEXT
// The letters shuffle about and then settle on the real word.
// ---------------------------------------------------------------

var scrambleItems = document.querySelectorAll("[data-scramble]");

for (var sc = 0; sc < scrambleItems.length; sc++) {
  (function (element) {
    var letters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
    var finalText = element.getAttribute("data-scramble");
    var speed = parseInt(element.getAttribute("data-scramble-speed"), 10) || 32;

    function run() {
      var position = 0;

      function step() {
        var output = "";

        for (var i = 0; i < finalText.length; i++) {
          if (i < position) {
            output += finalText.charAt(i);
          } else if (i === position) {
            output += letters.charAt(Math.floor(Math.random() * letters.length));
          } else {
            output += " ";
          }
        }

        element.textContent = output;
        position++;

        if (position <= finalText.length) {
          setTimeout(step, speed);
        } else {
          element.textContent = finalText;
        }
      }

      step();
    }

    element.addEventListener("mouseenter", run);
    element.addEventListener("focus", run);
  })(scrambleItems[sc]);
}


// ---------------------------------------------------------------
// 10. TYPEWRITER
// The text types itself out one letter at a time.
// ---------------------------------------------------------------

var typewriterItems = document.querySelectorAll("[data-typewriter]");

for (var tw = 0; tw < typewriterItems.length; tw++) {
  (function (element) {
    var fullText = element.textContent.trim();
    var speed = parseInt(element.getAttribute("data-typewriter-speed"), 10) || 55;

    element.textContent = "";

    var caret = document.createElement("span");
    caret.className = "cp-caret";
    element.appendChild(caret);

    var position = 0;

    function step() {
      element.textContent = fullText.slice(0, position);
      element.appendChild(caret);
      position++;

      if (position <= fullText.length) {
        setTimeout(step, speed);
      }
    }

    setTimeout(step, 250);
  })(typewriterItems[tw]);
}


// ---------------------------------------------------------------
// 11. THE SCROLL PROGRESS BAR
// ---------------------------------------------------------------

var progressBar = document.querySelector("[data-progress]");

function updateProgress() {
  if (!progressBar) { return; }

  var page = document.documentElement;
  var scrollable = page.scrollHeight - page.clientHeight;
  var done = 0;

  if (scrollable > 0) {
    done = page.scrollTop / scrollable;
  }

  progressBar.style.transform = "scaleX(" + done + ")";
}

window.addEventListener("scroll", updateProgress);
window.addEventListener("resize", updateProgress);


// ---------------------------------------------------------------
// 12. THE HEADER
// It changes colour when you scroll, and it shows which section
// you are currently looking at.
// ---------------------------------------------------------------

var header = document.querySelector("[data-header]");
var navLinks = document.querySelectorAll("[data-nav-link]");
var pageSections = document.querySelectorAll("section[id]");

function updateHeader() {
  if (header) {
    if (window.scrollY > 24) {
      header.classList.add("is-scrolled");
    } else {
      header.classList.remove("is-scrolled");
    }
  }

  // find the section we are in
  var current = "";

  for (var i = 0; i < pageSections.length; i++) {
    if (pageSections[i].getBoundingClientRect().top <= 140) {
      current = pageSections[i].id;
    }
  }

  // and put the line under the matching link
  for (var l = 0; l < navLinks.length; l++) {
    if (navLinks[l].getAttribute("href") === "#" + current) {
      navLinks[l].classList.add("is-active");
    } else {
      navLinks[l].classList.remove("is-active");
    }
  }
}

window.addEventListener("scroll", updateHeader);
window.addEventListener("resize", updateHeader);
updateHeader();


// the button that opens the menu on a phone
var navButton = document.querySelector("[data-nav-toggle]");
var navMenu = document.querySelector("[data-nav-links]");

if (navButton && navMenu) {
  navButton.addEventListener("click", function () {
    var isOpen = navMenu.classList.toggle("is-open");
    navButton.setAttribute("aria-expanded", isOpen ? "true" : "false");
  });

  var menuLinks = navMenu.querySelectorAll("[data-nav-link]");

  for (var ml = 0; ml < menuLinks.length; ml++) {
    menuLinks[ml].addEventListener("click", function () {
      navMenu.classList.remove("is-open");
      navButton.setAttribute("aria-expanded", "false");
    });
  }
}


// ---------------------------------------------------------------
// 13. THE CUSTOM CURSOR
// Only on a computer with a mouse, and only if the body asks for it.
// ---------------------------------------------------------------

if (!isTouch() && allowMotion() && document.body.getAttribute("data-cursor") === "on") {
  var cursorDot = document.createElement("div");
  cursorDot.className = "cp-cursor-dot";

  var cursorRing = document.createElement("div");
  cursorRing.className = "cp-cursor-ring";

  document.body.appendChild(cursorDot);
  document.body.appendChild(cursorRing);

  var mouseX = 0, mouseY = 0, ringX = 0, ringY = 0;

  document.addEventListener("pointermove", function (event) {
    mouseX = event.clientX;
    mouseY = event.clientY;

    cursorDot.style.transform =
      "translate3d(" + mouseX + "px," + mouseY + "px,0) translate(-50%,-50%)";
  });

  function follow() {
    ringX = ringX + (mouseX - ringX) * 0.16;
    ringY = ringY + (mouseY - ringY) * 0.16;

    cursorRing.style.transform =
      "translate3d(" + ringX + "px," + ringY + "px,0) translate(-50%,-50%)";

    window.requestAnimationFrame(follow);
  }
  follow();

  // the ring gets bigger when you are over something clickable
  var clickables = document.querySelectorAll("a, button, .card, input, textarea, select");

  for (var cl = 0; cl < clickables.length; cl++) {
    clickables[cl].addEventListener("mouseenter", function () {
      cursorRing.classList.add("is-hover");
    });
    clickables[cl].addEventListener("mouseleave", function () {
      cursorRing.classList.remove("is-hover");
    });
  }
}


// ---------------------------------------------------------------
// start everything
// ---------------------------------------------------------------

function startAnimations() {
  showReveals();
  checkCounters();
  updateProgress();
  updateHeader();
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", startAnimations);
} else {
  startAnimations();
}

// the small script in the head of each page checks for this, so it
// knows it is safe to hide the page content
window.cpReady = true;
