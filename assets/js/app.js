// CivicPulse - app.js
// The things that happen on the homepage: showing the reports,
// searching, filtering and voting.


// which icon to use for each category
var categoryIcon = {
  Roads: "ico--road",
  Drainage: "ico--water",
  Waste: "ico--bin",
  Streetlights: "ico--lamp",
  Safety: "ico--shield",
  Facilities: "ico--home"
};

// the colour of the badge for each status
var statusPill = {
  "New": "cp-status--new",
  "In Review": "cp-status--review",
  "In Progress": "cp-status--progress",
  "Resolved": "cp-status--fixed"
};

// the short words we put inside the badge
var statusLabel = {
  "New": "New",
  "In Review": "In review",
  "In Progress": "In progress",
  "Resolved": "Resolved"
};


// ---------------------------------------------------------------
// building one report for the list
// ---------------------------------------------------------------

function buildReport(report, position) {
  var article = document.createElement("article");
  article.className = "report";
  article.setAttribute("data-status", report.status);
  article.setAttribute("data-category", report.category);
  article.setAttribute("data-id", report.id);

  var icon = categoryIcon[report.category] || "ico--pin";
  var pill = statusPill[report.status] || "cp-status--new";
  var label = statusLabel[report.status] || report.status;

  // this is the same markup we wrote by hand in the html
  article.innerHTML =
    '<div class="report__icon"><span class="ico ' + icon + '"></span></div>' +
    "<div>" +
      "<h3></h3>" +
      '<div class="report__meta">' +
        '<span><span class="ico ico--pin ico--sm" style="color:var(--ink-300)"></span> <span class="report__where"></span></span>' +
        '<span><span class="ico ico--clock ico--sm" style="color:var(--ink-300)"></span> <span class="report__when"></span></span>' +
        '<span class="report__id"></span>' +
      "</div>" +
    "</div>" +
    '<div class="report__side">' +
      '<span class="cp-status ' + pill + '"><i class="cp-status__dot"></i>' + label + "</span>" +
      '<span class="report__votes"><span class="ico ico--thumb ico--sm"></span> ' + report.votes + "</span>" +
    "</div>";

  // we use textContent for the words the person typed, so they can
  // never be treated as html
  article.querySelector("h3").textContent = report.title;
  article.querySelector(".report__where").textContent = report.location;
  article.querySelector(".report__when").textContent = report.time;
  article.querySelector(".report__id").textContent = report.id;

  // a small animation so the list does not just appear
  article.style.animationDelay = (position * 55) + "ms";
  article.classList.add("cp-enter");

  return article;
}


// ---------------------------------------------------------------
// the list on the page
// ---------------------------------------------------------------

var reportList = document.getElementById("report-list");
var searchBox = document.getElementById("report-search");
var filterBox = document.getElementById("report-filters");
var emptyBox = document.getElementById("report-empty");

var currentFilter = "all";
var searchWord = "";
var reportItems = [];

if (reportList) {
  // draw the list again from the saved reports
  var allReports = getReports();
  var listFragment = document.createDocumentFragment();

  for (var i = 0; i < allReports.length; i++) {
    listFragment.appendChild(buildReport(allReports[i], i));
  }

  reportList.innerHTML = "";
  reportList.appendChild(listFragment);

  // remember what is on the page
  reportItems = reportList.querySelectorAll(".report");
}


// ---------------------------------------------------------------
// showing and hiding a report
// ---------------------------------------------------------------

function showReport(element, position) {
  element.hidden = false;
  element.classList.remove("is-hiding");

  // cp-enter plays a short keyframe animation, we take it off again
  // after so the element can be hovered normally
  element.style.animationDelay = (position * 55) + "ms";
  element.classList.add("cp-enter");

  setTimeout(function () {
    element.classList.remove("cp-enter");
    element.style.animationDelay = "";
  }, 700 + position * 55);
}

function hideReport(element) {
  element.classList.add("is-hiding");

  setTimeout(function () {
    element.hidden = true;
    element.classList.remove("is-hiding");
  }, 240);
}

// does this report match what the user is looking for
function reportMatches(element) {
  var rightStatus = currentFilter === "all" || element.getAttribute("data-status") === currentFilter;
  var rightWord = !searchWord || element.textContent.toLowerCase().indexOf(searchWord) > -1;

  return rightStatus && rightWord;
}

function applyFilters() {
  var shown = 0;

  for (var i = 0; i < reportItems.length; i++) {
    var element = reportItems[i];

    if (reportMatches(element)) {
      if (element.hidden) {
        showReport(element, shown);
      } else {
        element.hidden = false;
        element.classList.remove("is-hiding");
      }
      shown++;
    } else if (!element.hidden) {
      hideReport(element);
    }
  }

  if (emptyBox) { emptyBox.hidden = shown !== 0; }
}


// ---------------------------------------------------------------
// the search box
// ---------------------------------------------------------------

if (searchBox) {
  var typingTimer = null;

  searchBox.addEventListener("input", function (event) {
    searchWord = event.target.value.trim().toLowerCase();

    // we wait a moment so it does not redraw the list on every letter
    clearTimeout(typingTimer);
    typingTimer = setTimeout(applyFilters, 160);
  });
}


// ---------------------------------------------------------------
// the status buttons
// ---------------------------------------------------------------

if (filterBox) {
  filterBox.addEventListener("click", function (event) {
    var button = event.target.closest(".filter");
    if (!button) { return; }

    // remove the highlight from the old button
    var buttons = filterBox.querySelectorAll(".filter");
    for (var i = 0; i < buttons.length; i++) {
      buttons[i].classList.remove("is-active");
    }

    button.classList.add("is-active");
    currentFilter = button.getAttribute("data-filter");
    applyFilters();

    // a small bounce on the button you pressed
    button.classList.add("cp-pop");
    setTimeout(function () { button.classList.remove("cp-pop"); }, 380);
  });
}


// ---------------------------------------------------------------
// voting
// ---------------------------------------------------------------

for (var v = 0; v < reportItems.length; v++) {
  (function (element) {
    var votes = element.querySelector(".report__votes");
    if (!votes) { return; }

    votes.addEventListener("click", function () {
      var number = parseInt(votes.textContent.trim(), 10);
      if (isNaN(number)) { number = 0; }
      number = number + 1;

      votes.innerHTML = '<span class="ico ico--thumb ico--sm"></span> ' + number;

      // remember the vote so it is still there next time
      addVote(element.getAttribute("data-id"));

      votes.classList.add("cp-pop");
      setTimeout(function () { votes.classList.remove("cp-pop"); }, 380);
    });
  })(reportItems[v]);
}


// ---------------------------------------------------------------
// the small tracker under the toolbar
// ---------------------------------------------------------------

var quickInput = document.getElementById("quick-track");
var quickLink = document.getElementById("quick-track-link");

if (quickInput && quickLink) {
  quickInput.addEventListener("input", function () {
    var code = quickInput.value.trim();

    if (code) {
      quickLink.setAttribute("href", "track.html?ref=" + encodeURIComponent(code));
    } else {
      quickLink.setAttribute("href", "track.html");
    }
  });

  quickInput.addEventListener("keydown", function (event) {
    if (event.key === "Enter") {
      event.preventDefault();
      quickLink.click();
    }
  });
}


// ---------------------------------------------------------------
// smooth scrolling that stops under the fixed header
// ---------------------------------------------------------------

document.addEventListener("click", function (event) {
  var link = event.target.closest('a[href^="#"]');
  if (!link) { return; }

  var targetId = link.getAttribute("href");
  if (!targetId || targetId === "#") { return; }

  var target = document.querySelector(targetId);
  if (!target) { return; }

  event.preventDefault();

  var header = document.querySelector("[data-header]");
  var gap = (header ? header.offsetHeight : 70) + 16;
  var top = target.getBoundingClientRect().top + window.pageYOffset - gap;

  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
    window.scrollTo(0, top);
  } else {
    window.scrollTo({ top: top, behavior: "smooth" });
  }
});


// ---------------------------------------------------------------
// a small bounce on the badge in the hero
// ---------------------------------------------------------------

var heroPill = document.querySelector(".hero .pill");
if (heroPill) {
  heroPill.classList.add("cp-anim-bounce");
  setTimeout(function () { heroPill.classList.remove("cp-anim-bounce"); }, 800);
}
