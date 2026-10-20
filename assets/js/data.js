// CivicPulse - data.js
// Every report on the site is kept in this one file.
//
// The list is saved in localStorage so it is still there when you come
// back to the page. If the browser will not let us use localStorage
// (private browsing for example) we just use the starting list below.


// the key we save the reports under
var SAVE_KEY = "civicpulse-reports";

// the four stages a report goes through
var STATUSES = ["New", "In Review", "In Progress", "Resolved"];

// the kinds of problem a person can report
var CATEGORIES = ["Roads", "Drainage", "Waste", "Streetlights", "Safety", "Facilities"];


// the starting reports. these are also written into the html of the
// homepage, so the page still shows real content if javascript is off.
var startReports = [
  {
    id: "CP-4821",
    title: "Drainage blocked, road flooding after every rain",
    category: "Drainage",
    location: "Market Road, Warri",
    landmark: "Beside the big market roundabout",
    description:
      "The drain at the market roundabout has been blocked with refuse for weeks. Any time it rains the whole road floods and motorcyclists have to wade through it. It is worst in the evenings.",
    status: "New",
    votes: 38,
    time: "2 hours ago",
    reporter: "Ada O.",
    created: "2026-10-18T08:40:00",
    updates: [
      { time: "2026-10-18T08:40:00", status: "New", note: "Report received and added to the public feed.", by: "CivicPulse" }
    ]
  },
  {
    id: "CP-4815",
    title: "Deep pothole on the link road near the junction",
    category: "Roads",
    location: "Yenagoa Street, Yenagoa",
    landmark: "200 metres past the junction",
    description:
      "A pothole about two feet wide and very deep sits right where cars turn off the link road. Two vehicles have lost tyres there this month. Please fill it before the rains get worse.",
    status: "In Progress",
    votes: 122,
    time: "Yesterday",
    reporter: "Emeka N.",
    created: "2026-10-16T14:20:00",
    updates: [
      { time: "2026-10-16T14:20:00", status: "New", note: "Report received and added to the public feed.", by: "CivicPulse" },
      { time: "2026-10-16T18:05:00", status: "In Review", note: "Confirmed by the ward officer. Photographs verified on site.", by: "Works Department" },
      { time: "2026-10-17T09:30:00", status: "In Progress", note: "Asphalt team scheduled for this week. The area has been marked for safety.", by: "Works Department" }
    ]
  },
  {
    id: "CP-4790",
    title: "Refuse not collected for five days at the bus stop",
    category: "Waste",
    location: "Ogun Street, Sapele",
    landmark: "The main bus stop",
    description:
      "The waste collectors have skipped our bus stop for five days running. The heap is now very high and it is starting to smell. Parents walk past it every morning with children.",
    status: "In Review",
    votes: 64,
    time: "3 days ago",
    reporter: "Blessing Y.",
    created: "2026-10-15T11:10:00",
    updates: [
      { time: "2026-10-15T11:10:00", status: "New", note: "Report received and added to the public feed.", by: "CivicPulse" },
      { time: "2026-10-16T10:00:00", status: "In Review", note: "Passed to the sanitation contractor for the Sapele route. Awaiting collection date.", by: "Sanitation Unit" }
    ]
  },
  {
    id: "CP-4702",
    title: "All four streetlights on the estate road are dark",
    category: "Streetlights",
    location: "Estate Road, Asokoro",
    landmark: "From the gate to the primary school",
    description:
      "Every streetlight on this stretch has been off for over a month. It is completely dark by 7pm and there have been two robberies near the transformer. Please help.",
    status: "Resolved",
    votes: 211,
    time: "1 week ago",
    reporter: "Tunde A.",
    created: "2026-09-28T19:45:00",
    updates: [
      { time: "2026-09-28T19:45:00", status: "New", note: "Report received and added to the public feed.", by: "CivicPulse" },
      { time: "2026-09-29T09:15:00", status: "In Review", note: "Fault confirmed by the power distribution team.", by: "Electrical Services" },
      { time: "2026-10-01T13:00:00", status: "In Progress", note: "Two faulty transformers replaced. The remaining poles are scheduled for the weekend.", by: "Electrical Services" },
      { time: "2026-10-06T16:20:00", status: "Resolved", note: "All four streetlights are back on. The community has confirmed the fix. Thank you.", by: "Electrical Services" }
    ]
  },
  {
    id: "CP-4823",
    title: "Open manhole cover on the pedestrian path",
    category: "Safety",
    location: "University Road, Benin",
    landmark: "Opposite the main gate",
    description:
      "The manhole cover is missing and the hole is open. Someone already fell in last week. It needs a cover and a warning sign right now.",
    status: "New",
    votes: 17,
    time: "4 hours ago",
    reporter: "Grace I.",
    created: "2026-10-18T10:05:00",
    updates: [
      { time: "2026-10-18T10:05:00", status: "New", note: "Report received and added to the public feed. Flagged as a safety priority.", by: "CivicPulse" }
    ]
  },
  {
    id: "CP-4688",
    title: "Community tap has been dry for two weeks",
    category: "Facilities",
    location: "Old GRA, Ibadan",
    landmark: "The community tap near the playground",
    description:
      "The community water tap that everyone in the estate depends on has been dry for two weeks. People are buying water from tankers every day, and the elderly residents cannot afford it.",
    status: "In Progress",
    votes: 89,
    time: "2 weeks ago",
    reporter: "Sade B.",
    created: "2026-10-02T07:30:00",
    updates: [
      { time: "2026-10-02T07:30:00", status: "New", note: "Report received and added to the public feed.", by: "CivicPulse" },
      { time: "2026-10-02T15:20:00", status: "In Review", note: "Water Corporation confirmed a burst main nearby. Repair crew assigned.", by: "Water Corporation" },
      { time: "2026-10-06T12:00:00", status: "In Progress", note: "The main has been replaced. The supply line to the estate tap is being flushed now.", by: "Water Corporation" }
    ]
  }
];


// ---------------------------------------------------------------
// saving and loading
// ---------------------------------------------------------------

function loadReports() {
  var saved = null;

  try {
    saved = window.localStorage.getItem(SAVE_KEY);
  } catch (error) {
    // the browser would not let us use localStorage
    saved = null;
  }

  if (!saved) { return startReports.slice(); }

  try {
    var list = JSON.parse(saved);
    if (list && list.length) { return list; }
  } catch (error) {
    // the saved text was not valid json
  }

  return startReports.slice();
}

function saveReports(list) {
  try {
    window.localStorage.setItem(SAVE_KEY, JSON.stringify(list));
  } catch (error) {
    // we could not save, but the site still works for this visit
  }
}


// ---------------------------------------------------------------
// the functions the other pages use
// ---------------------------------------------------------------

// every report, newest one first
function getReports() {
  var list = loadReports();

  list.sort(function (a, b) {
    return new Date(b.created) - new Date(a.created);
  });

  return list;
}

// find one report using its code, for example CP-4821
function findReport(code) {
  if (!code) { return null; }

  var wanted = String(code).trim().toUpperCase();
  var list = getReports();

  for (var i = 0; i < list.length; i++) {
    if (list[i].id.toUpperCase() === wanted) {
      return list[i];
    }
  }

  return null;
}

// make a code that is not being used yet
function makeNewCode() {
  var list = getReports();
  var highest = 4800;

  for (var i = 0; i < list.length; i++) {
    var number = parseInt(String(list[i].id).replace("CP-", ""), 10);
    if (!isNaN(number) && number > highest) {
      highest = number;
    }
  }

  return "CP-" + (highest + 1);
}

// add a new report and return it
function addReport(details) {
  var list = getReports();
  var now = new Date();

  var report = {
    id: makeNewCode(),
    title: details.title,
    category: details.category,
    location: details.location,
    landmark: details.landmark || "",
    description: details.description,
    status: "New",
    votes: 1,
    time: "Just now",
    reporter: details.reporter || "You",
    created: now.toISOString(),
    updates: [
      {
        time: now.toISOString(),
        status: "New",
        note: "Report received and added to the public feed.",
        by: "CivicPulse"
      }
    ]
  };

  list.unshift(report);
  saveReports(list);

  return report;
}

// change the status of a report and write it in its history
function changeStatus(code, status, note, by) {
  var list = getReports();
  var wanted = String(code).trim().toUpperCase();
  var found = null;

  for (var i = 0; i < list.length; i++) {
    if (list[i].id.toUpperCase() === wanted) {
      found = list[i];
      found.status = status;
      found.updates.push({
        time: new Date().toISOString(),
        status: status,
        note: note,
        by: by || "Works Department"
      });
      break;
    }
  }

  if (found) { saveReports(list); }
  return found;
}

// add a note to a report without changing the status
function addNote(code, note, by) {
  var list = getReports();
  var wanted = String(code).trim().toUpperCase();
  var found = null;

  for (var i = 0; i < list.length; i++) {
    if (list[i].id.toUpperCase() === wanted) {
      found = list[i];
      found.updates.push({
        time: new Date().toISOString(),
        status: found.status,
        note: note,
        by: by || "Works Department"
      });
      break;
    }
  }

  if (found) { saveReports(list); }
  return found;
}

// one more person supports the report
function addVote(code) {
  var list = getReports();
  var wanted = String(code).trim().toUpperCase();
  var found = null;

  for (var i = 0; i < list.length; i++) {
    if (list[i].id.toUpperCase() === wanted) {
      found = list[i];
      found.votes = (found.votes || 0) + 1;
      break;
    }
  }

  if (found) { saveReports(list); }
  return found;
}

// how many reports are in each status
function countStatuses() {
  var list = getReports();
  var counts = { "New": 0, "In Review": 0, "In Progress": 0, "Resolved": 0 };

  for (var i = 0; i < list.length; i++) {
    if (counts[list[i].status] === undefined) {
      counts[list[i].status] = 0;
    }
    counts[list[i].status]++;
  }

  counts.Total = list.length;
  return counts;
}

// put everything back to the way it started
function resetReports() {
  saveReports(startReports.slice());
  return getReports();
}
