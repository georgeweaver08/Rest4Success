// Helper: parse "HH:MM" to minutes after midnight
function timeStrToMinutes(tStr) {
  if (!tStr) return null;
  const [h, m] = tStr.split(':').map(Number);
  return h * 60 + (m || 0);
}

// Helper: minutes -> human time string, supports negative (previous day)
function minutesToTimeString(mins) {
  // normalize to 0..1439 while keeping day offset
  const dayOffset = Math.floor(mins / 1440);
  let m = ((mins % 1440) + 1440) % 1440;
  const hh = Math.floor(m / 60);
  const mm = m % 60;
  const ampm = hh >= 12 ? "PM" : "AM";
  const hr12 = ((hh + 11) % 12) + 1;
  const pad = (n) => n.toString().padStart(2, '0');
  const dayText = dayOffset < 0 ? " (previous day)" : (dayOffset > 0 ? " (next day)" : "");
  return `${hr12}:${pad(mm)} ${ampm}${dayText}`;
}

function calculate() {
  const schoolStartStr = document.getElementById("schoolStart").value;
  const getReady = Number(document.getElementById("getReady").value) || 0;
  const commute = Number(document.getElementById("commute").value) || 0;
  const sleepHours = Number(document.getElementById("sleepHours").value) || 0;
  const homework = Number(document.getElementById("homework").value) || 0;
  const extracurriculars = Number(document.getElementById("extracurriculars").value) || 0;
  const otherTasks = Number(document.getElementById("otherTasks").value) || 0;

  const schoolStartMins = timeStrToMinutes(schoolStartStr);
  if (schoolStartMins === null) {
    showResult("Please enter a valid school start time.");
    return;
  }

  // All times converted to minutes for math
  const R = getReady;
  const C = commute;
  const Hs = Math.round(sleepHours * 60);
  const Hw = homework;
  const E = extracurriculars;
  const O = otherTasks;

  // Wake time (minutes after midnight)
  const wakeMins = schoolStartMins - (R + C);

  // Bedtime (minutes after midnight)
  const bedtimeMins = wakeMins - Hs;

  // Workload and availability after school (minutes)
  const workload = Hw + E + O;
  // available = minutes from school end-of-day to bedtime.
  // Simpler approach: available = 24*60 - (schoolStart + Hs + R + C)
  const available = 24*60 - (schoolStartMins + Hs + R + C);

  const feasible = workload <= available;

  // Build readable output
  let out = "";
  out += `<p><strong>Wake-up time:</strong> ${minutesToTimeString(wakeMins)}</p>`;
  out += `<p><strong>Bedtime:</strong> ${minutesToTimeString(bedtimeMins)}</p>`;
  out += `<p><strong>Desired sleep:</strong> ${sleepHours} hour(s) (${Hs} minutes)</p>`;
  out += `<p><strong>After-school workload:</strong> ${workload} minutes</p>`;
  out += `<p><strong>Available after-school time until bedtime:</strong> ${available} minutes</p>`;

  if (!feasible) {
    out += `<p style="color:#a00"><strong>Schedule overloaded:</strong> You need ${workload - available} more minute(s). Consider reducing homework/activities, shifting tasks earlier, or reducing desired sleep hours.</p>`;
  } else {
    out += `<p style="color:#0a0"><strong>Schedule fits!</strong> You have ${available - workload} spare minute(s).</p>`;
  }

  showResult(out);
}

function showResult(html) {
  document.getElementById("result").innerHTML = html;
}

// Example filler
function fillExample() {
  document.getElementById("schoolStart").value = "07:30";
  document.getElementById("getReady").value = 45;
  document.getElementById("commute").value = 15;
  document.getElementById("sleepHours").value = 8;
  document.getElementById("homework").value = 120;
  document.getElementById("extracurriculars").value = 60;
  document.getElementById("otherTasks").value = 60;
  calculate();
}

// Run an initial calculation to show example values
window.addEventListener('DOMContentLoaded', () => {
  // comment the next line out if you don't want the page to auto-calculate on load
  // fillExample();
});
