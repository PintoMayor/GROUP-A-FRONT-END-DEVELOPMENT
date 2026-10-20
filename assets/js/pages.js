// CivicPulse - pages.js
// The behaviour for the three working pages:
//   report.html  - the report form
//   track.html   - tracking a report
//   admin.html   - the admin dashboard
//
// Plain javascript and DOM manipulation. No libraries.


// the colours and words we use for each status
var pillClass = {
  "New": "cp-status--new",
  "In Review": "cp-status--review",
  "In Progress": "cp-status--progress",
  "Resolved": "cp-status--fixed"
};

var pillLabel = {
  "New": "New",
  "In Review": "In review",
  "In Progress": "In progress",
  "Resolved": "Resolved"
};


// ---------------------------------------------------------------
// a small box that pops up at the bottom of the screen
// ---------------------------------------------------------------

var toastTimer = null;

function showToast(message) {
  var box = document.getElementById("toast");
  var text = document.getElementById("toast-text");
  if (!box || !text) { return; }

  text.textContent = message;
  box.classList.add("is-on");

  clearTimeout(toastTimer);
  toastTimer = setTimeout(function () {
    box.classList.remove("is-on");
  }, 2800);
}


// turn a date into words we can read, like "3 days ago"
function readableTime(value) {
  if (!value) { return ""; }

  var date = new Date(value);
  if (isNaN(date.getTime())) { return ""; }

  var seconds = Math.floor((new Date() - date) / 1000);

  if (seconds < 60) { return "Just now"; }

  if (seconds < 3600) {
    var mins = Math.floor(seconds / 60);
    return mins + (mins === 1 ? " min ago" : " mins ago");
  }

  if (seconds < 86400) {
    var hours = Math.floor(seconds / 3600);
    return hours + (hours === 1 ? " hour ago" : " hours ago");
  }

  if (seconds < 604800) {
    var days = Math.floor(seconds / 86400);
    return days + (days === 1 ? " day ago" : " days ago");
  }

  return date.toLocaleDateString("en-NG", {
    day: "numeric",
    month: "short",
    year: "numeric"
  });
}


// build one line of the history list
function buildHistoryItem(update) {
  var item = document.createElement("li");
  item.className = "timeline__item";

  var dot = document.createElement("span");
  dot.className = "timeline__dot";

  var meta = document.createElement("div");
  meta.className = "timeline__meta";

  var badge = document.createElement("span");
  badge.className = "cp-status " + (pillClass[update.status] || "cp-status--new");
  badge.innerHTML = '<i class="cp-status__dot"></i>' + (pillLabel[update.status] || update.status);

  var when = document.createElement("span");
  when.textContent = readableTime(update.time);

  var by = document.createElement("span");
  by.className = "timeline__by";
  by.textContent = update.by;

  meta.appendChild(badge);
  meta.appendChild(when);
  meta.appendChild(by);

  var note = document.createElement("p");
  note.className = "timeline__note";
  note.textContent = update.note;

  item.appendChild(dot);
  item.appendChild(meta);
  item.appendChild(note);

  return item;
}


// write the history into a list
function drawHistory(list, report) {
  list.innerHTML = "";

  for (var i = 0; i < report.updates.length; i++) {
    list.appendChild(buildHistoryItem(report.updates[i]));
  }
}


// ---------------------------------------------------------------
// 1. THE REPORT FORM
// ---------------------------------------------------------------

function setupReportForm() {
  var form = document.getElementById("report-form");
  if (!form) { return; }

  var formCard = document.getElementById("form-card");
  var formSection = document.getElementById("form-section");
  var successSection = document.getElementById("success-section");
  var codeBox = document.getElementById("ref-code");
  var trackLink = document.getElementById("success-track");
  var newButton = document.getElementById("new-report");

  var description = document.getElementById("r-description");
  var descCount = document.getElementById("desc-count");
  var locationInput = document.getElementById("r-location");
  var landmarkInput = document.getElementById("r-landmark");
  var pinLocation = document.getElementById("pin-location");
  var pinLandmark = document.getElementById("pin-landmark");
  var photoInput = document.getElementById("r-photo");
  var photoName = document.getElementById("photo-name");
  var fileDrop = document.getElementById("file-drop");

  // the counter under the description box
  if (description && descCount) {
    description.addEventListener("input", function () {
      descCount.textContent = description.value.length;
    });
  }

  // the little pin preview
  function updatePin() {
    var where = locationInput ? locationInput.value.trim() : "";
    var near = landmarkInput ? landmarkInput.value.trim() : "";

    if (pinLocation) {
      pinLocation.textContent = where || "Your location will appear here";
    }
    if (pinLandmark) {
      pinLandmark.textContent = near || "Add a street or a landmark above";
    }
  }

  if (locationInput) { locationInput.addEventListener("input", updatePin); }
  if (landmarkInput) { landmarkInput.addEventListener("input", updatePin); }

  // show the name of the photo the person picked
  if (photoInput && photoName) {
    photoInput.addEventListener("change", function () {
      var file = photoInput.files[0];
      photoName.textContent = file ? file.name : "No file chosen yet";
    });
  }

  // highlight the photo box when a file is dragged over it
  if (fileDrop) {
    fileDrop.addEventListener("dragover", function (event) {
      event.preventDefault();
      fileDrop.classList.add("is-over");
    });

    fileDrop.addEventListener("dragleave", function () {
      fileDrop.classList.remove("is-over");
    });

    fileDrop.addEventListener("drop", function () {
      fileDrop.classList.remove("is-over");
    });
  }

  // what each field needs before we accept it
  var rules = {
    category: function (value) { return value !== ""; },
    title: function (value) { return value.trim().length >= 8; },
    location: function (value) { return value.trim().length >= 3; },
    description: function (value) { return value.trim().length >= 20; }
  };

  function getField(name) {
    return form.querySelector('[data-field="' + name + '"]');
  }

  // check one field and colour it in
  function checkField(name) {
    var input = form.querySelector('[name="' + name + '"]');
    var field = getField(name);
    if (!input || !field) { return true; }

    var isGood = rules[name](input.value);

    if (isGood) {
      field.classList.remove("field--bad");
      field.classList.add("field--good");
    } else {
      field.classList.add("field--bad");
      field.classList.remove("field--good");
    }

    return isGood;
  }

  // check a field when the person leaves it
  var fieldNames = ["category", "title", "location", "description"];

  for (var f = 0; f < fieldNames.length; f++) {
    (function (name) {
      var input = form.querySelector('[name="' + name + '"]');
      if (!input) { return; }

      input.addEventListener("blur", function () {
        checkField(name);
      });

      input.addEventListener("input", function () {
        var field = getField(name);
        if (field && field.classList.contains("field--bad")) {
          checkField(name);
        }
      });
    })(fieldNames[f]);
  }

  // when the form is sent
  form.addEventListener("submit", function (event) {
    event.preventDefault();

    var firstBad = null;

    for (var i = 0; i < fieldNames.length; i++) {
      var isGood = checkField(fieldNames[i]);

      if (!isGood && !firstBad) {
        firstBad = form.querySelector('[name="' + fieldNames[i] + '"]');
      }
    }

    if (firstBad) {
      firstBad.focus();
      showToast("Please fill in the highlighted fields.");
      return;
    }

    // save the report
    var report = addReport({
      title: form.title.value.trim(),
      category: form.category.value,
      location: form.location.value.trim(),
      landmark: form.landmark.value.trim(),
      description: form.description.value.trim(),
      reporter: "You"
    });

    // show the code
    if (codeBox) { codeBox.textContent = report.id; }
    if (trackLink) { trackLink.setAttribute("href", "track.html?ref=" + report.id); }

    if (formCard) { formCard.style.display = "none"; }
    if (formSection) { formSection.hidden = true; }
    if (successSection) { successSection.hidden = false; }

    window.scrollTo({ top: 0, behavior: "smooth" });
    showToast("Report " + report.id + " submitted");
  });

  // when the form is cleared
  form.addEventListener("reset", function () {
    setTimeout(function () {
      for (var i = 0; i < fieldNames.length; i++) {
        var field = getField(fieldNames[i]);
        if (field) {
          field.classList.remove("field--bad");
          field.classList.remove("field--good");
        }
      }

      if (descCount) { descCount.textContent = "0"; }
      if (photoName) { photoName.textContent = "No file chosen yet"; }
      updatePin();
    }, 0);
  });

  // report another problem
  if (newButton) {
    newButton.addEventListener("click", function () {
      form.reset();

      if (successSection) { successSection.hidden = true; }
      if (formSection) { formSection.hidden = false; }
      if (formCard) { formCard.style.display = ""; }

      window.scrollTo({ top: 0, behavior: "smooth" });
    });
  }
}


// ---------------------------------------------------------------
// 2. THE TRACKING PAGE
// ---------------------------------------------------------------

function setupTracker() {
  var input = document.getElementById("track-input");
  var button = document.getElementById("track-button");
  var result = document.getElementById("track-result");
  var missing = document.getElementById("track-missing");
  if (!input || !result) { return; }

  var steps = document.querySelectorAll("#stepper .step");
  var fill = document.getElementById("stepper-fill");
  var history = document.getElementById("track-timeline");
  var voteButton = document.getElementById("track-vote");
  var voteCount = document.getElementById("track-votes");

  var currentReport = null;

  function showNotFound(code) {
    result.hidden = true;
    missing.hidden = false;

    var text = document.getElementById("track-missing-text");
    if (text && code) {
      text.textContent = 'We could not find "' + code + '". Check the code and try again. It looks like: CP-4821';
    }
  }

  // move the four dots along to the current status
  function drawSteps(status) {
    var order = ["New", "In Review", "In Progress", "Resolved"];
    var position = order.indexOf(status);
    if (position < 0) { position = 0; }

    for (var i = 0; i < steps.length; i++) {
      steps[i].classList.remove("is-done");
      steps[i].classList.remove("is-current");

      if (i < position) { steps[i].classList.add("is-done"); }
      if (i === position) {
        steps[i].classList.add("is-done");
        steps[i].classList.add("is-current");
      }
    }

    // the green line grows to the right
    if (fill) {
      fill.style.width = "0%";
      setTimeout(function () {
        fill.style.width = (position * 22) + "%";
      }, 60);
    }
  }

  // show the report
  function showReport(report) {
    currentReport = report;

    document.getElementById("track-id").textContent = report.id;
    document.getElementById("track-title").textContent = report.title;
    document.getElementById("track-location").textContent = report.location;
    document.getElementById("track-time").textContent = report.time;
    document.getElementById("track-category").textContent = report.category;
    document.getElementById("track-description").textContent = report.description;

    var badge = document.getElementById("track-status");
    badge.className = "cp-status " + (pillClass[report.status] || "cp-status--new");
    badge.innerHTML = '<i class="cp-status__dot"></i>' + (pillLabel[report.status] || report.status);

    if (voteCount) { voteCount.textContent = report.votes; }

    drawSteps(report.status);
    drawHistory(history, report);

    missing.hidden = true;
    result.hidden = false;
  }

  // look for a report using its code
  function lookUp(code) {
    var clean = String(code || "").trim();

    if (!clean) {
      showNotFound("");
      return;
    }

    var report = findReport(clean);

    if (!report) {
      showNotFound(clean.toUpperCase());
      return;
    }

    showReport(report);
    result.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  if (button) {
    button.addEventListener("click", function () {
      lookUp(input.value);
    });
  }

  input.addEventListener("keydown", function (event) {
    if (event.key === "Enter") {
      event.preventDefault();
      lookUp(input.value);
    }
  });

  // the sample codes under the search box
  var samples = document.querySelectorAll("[data-sample]");
  for (var s = 0; s < samples.length; s++) {
    samples[s].addEventListener("click", function () {
      input.value = this.getAttribute("data-sample");
      lookUp(input.value);
    });
  }

  // support the report you are looking at
  if (voteButton) {
    voteButton.addEventListener("click", function () {
      if (!currentReport) { return; }

      var updated = addVote(currentReport.id);
      if (updated && voteCount) { voteCount.textContent = updated.votes; }

      voteButton.classList.add("cp-pop");
      setTimeout(function () { voteButton.classList.remove("cp-pop"); }, 380);

      showToast("Your support has been added");
    });
  }

  // the small numbers at the top of the page
  var headTotal = document.getElementById("head-total");
  var headFixed = document.getElementById("head-fixed");

  if (headTotal) {
    var counts = countStatuses();
    headTotal.textContent = counts.Total;
    if (headFixed) { headFixed.textContent = counts.Resolved; }
  }

  // if the page was opened with ?ref=CP-4821 we open it straight away
  var match = window.location.search.match(/ref=([^&]+)/);
  if (match) {
    input.value = decodeURIComponent(match[1]);
    lookUp(input.value);
  }
}


// ---------------------------------------------------------------
// 3. THE ADMIN DASHBOARD
// ---------------------------------------------------------------

function setupAdmin() {
  var queue = document.getElementById("admin-queue");
  if (!queue) { return; }

  var emptyState = document.getElementById("admin-empty");
  var detail = document.getElementById("admin-detail");
  var search = document.getElementById("admin-search");
  var filters = document.getElementById("admin-filters");
  var queueCount = document.getElementById("queue-count");
  var history = document.getElementById("d-timeline");
  var reply = document.getElementById("d-reply");
  var replyButton = document.getElementById("d-reply-button");
  var statusButtons = document.getElementById("status-actions");

  var chosenReport = null;
  var currentFilter = "all";
  var searchWord = "";

  // the numbers at the top
  function drawStats() {
    var counts = countStatuses();

    document.getElementById("stat-new").textContent = counts["New"] || 0;
    document.getElementById("stat-review").textContent = counts["In Review"] || 0;
    document.getElementById("stat-progress").textContent = counts["In Progress"] || 0;
    document.getElementById("stat-fixed").textContent = counts.Resolved || 0;
    document.getElementById("stat-total").textContent = counts.Total || 0;
  }

  // one report in the queue
  function buildQueueItem(report) {
    var item = document.createElement("li");

    var button = document.createElement("button");
    button.className = "queue__item";
    button.setAttribute("type", "button");
    button.setAttribute("data-id", report.id);

    if (chosenReport && chosenReport.id === report.id) {
      button.classList.add("is-active");
    }

    var title = document.createElement("h3");
    title.textContent = report.title;

    var meta = document.createElement("div");
    meta.className = "queue__meta";

    var badge = document.createElement("span");
    badge.className = "cp-status " + (pillClass[report.status] || "cp-status--new");
    badge.innerHTML = '<i class="cp-status__dot"></i>' + (pillLabel[report.status] || report.status);

    var where = document.createElement("span");
    where.textContent = report.location;

    var code = document.createElement("span");
    code.className = "report__id";
    code.textContent = report.id;

    meta.appendChild(badge);
    meta.appendChild(where);
    meta.appendChild(code);

    button.appendChild(title);
    button.appendChild(meta);

    item.appendChild(button);
    return item;
  }

  // the whole queue
  function drawQueue() {
    var list = getReports();
    var fragment = document.createDocumentFragment();
    var shown = 0;

    for (var i = 0; i < list.length; i++) {
      var report = list[i];

      var rightStatus = currentFilter === "all" || report.status === currentFilter;
      var rightWord = !searchWord ||
        (report.title + " " + report.location + " " + report.id).toLowerCase().indexOf(searchWord) > -1;

      if (rightStatus && rightWord) {
        fragment.appendChild(buildQueueItem(report));
        shown++;
      }
    }

    queue.innerHTML = "";
    queue.appendChild(fragment);

    if (queueCount) { queueCount.textContent = shown; }
  }

  // the panel on the right
  function drawDetail(report) {
    chosenReport = report;

    document.getElementById("d-id").textContent = report.id;
    document.getElementById("d-title").textContent = report.title;
    document.getElementById("d-location").textContent = report.location;
    document.getElementById("d-time").textContent = report.time;
    document.getElementById("d-category").textContent = report.category;
    document.getElementById("d-votes").textContent = report.votes;
    document.getElementById("d-description").textContent = report.description;

    var badge = document.getElementById("d-status");
    badge.className = "cp-status " + (pillClass[report.status] || "cp-status--new");
    badge.innerHTML = '<i class="cp-status__dot"></i>' + (pillLabel[report.status] || report.status);

    // light up the button of the status it is on now
    var buttons = statusButtons.querySelectorAll(".status-btn");
    for (var i = 0; i < buttons.length; i++) {
      var isOn = buttons[i].getAttribute("data-status") === report.status;
      if (isOn) {
        buttons[i].classList.add("is-on");
        buttons[i].classList.add("is-current");
      } else {
        buttons[i].classList.remove("is-on");
        buttons[i].classList.remove("is-current");
      }
    }

    drawHistory(history, report);

    emptyState.hidden = true;
    detail.hidden = false;
  }

  // clicking a report opens it
  queue.addEventListener("click", function (event) {
    var button = event.target.closest(".queue__item");
    if (!button) { return; }

    var report = findReport(button.getAttribute("data-id"));
    if (!report) { return; }

    drawQueue();
    drawDetail(report);
  });

  // searching inside the queue
  if (search) {
    search.addEventListener("input", function () {
      searchWord = search.value.trim().toLowerCase();
      drawQueue();
    });
  }

  // filtering the queue
  if (filters) {
    filters.addEventListener("click", function (event) {
      var button = event.target.closest(".filter");
      if (!button) { return; }

      var buttons = filters.querySelectorAll(".filter");
      for (var i = 0; i < buttons.length; i++) {
        buttons[i].classList.remove("is-active");
      }
      button.classList.add("is-active");

      currentFilter = button.getAttribute("data-filter");
      drawQueue();
    });
  }

  // changing the status
  if (statusButtons) {
    statusButtons.addEventListener("click", function (event) {
      var button = event.target.closest(".status-btn");
      if (!button || !chosenReport) { return; }

      var nextStatus = button.getAttribute("data-status");

      if (nextStatus === chosenReport.status) {
        showToast("That report is already " + pillLabel[nextStatus].toLowerCase());
        return;
      }

      // if the person wrote a reply we use it as the note
      var note = reply.value.trim();
      if (!note) {
        note = "Status updated to " + pillLabel[nextStatus].toLowerCase() + ".";
      }

      var updated = changeStatus(chosenReport.id, nextStatus, note, "Works Department");
      if (!updated) { return; }

      reply.value = "";

      drawStats();
      drawQueue();
      drawDetail(updated);

      showToast("Moved to " + pillLabel[nextStatus]);
    });
  }

  // posting a reply
  if (replyButton) {
    replyButton.addEventListener("click", function () {
      if (!chosenReport) { return; }

      var note = reply.value.trim();

      if (!note) {
        showToast("Write a response first.");
        if (reply) { reply.focus(); }
        return;
      }

      var updated = addNote(chosenReport.id, note, "Works Department");
      if (!updated) { return; }

      reply.value = "";

      drawQueue();
      drawDetail(updated);

      showToast("Response published");
    });
  }

  // first paint
  drawStats();
  drawQueue();

  // open the first report so the panel is not empty
  var firstReport = getReports()[0];
  if (firstReport) { drawDetail(firstReport); }
}


// ---------------------------------------------------------------
// start the page we are on
// ---------------------------------------------------------------

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", function () {
    setupReportForm();
    setupTracker();
    setupAdmin();
  });
} else {
  setupReportForm();
  setupTracker();
  setupAdmin();
}
