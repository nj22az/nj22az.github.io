"use strict";

const checklist = document.querySelector("#status-checklist");
const checklistDetails = document.querySelector("#status-details");
const overall = document.querySelector("#status-overall");
const count = document.querySelector("#status-count");
const activeJob = document.querySelector("#status-active-job");
const activeRender = document.querySelector("#status-active-render");
const milestones = document.querySelector("#status-milestones");
const milestoneList = document.querySelector("#status-milestone-list");
const lastVerified = document.querySelector("#status-verified");
const update = document.querySelector("#status-update");
const states = {
  verified: "Verified",
  checking: "Checking",
  "needs-work": "Needs repair",
  queued: "Queued"
};
const renderStates = {
  rendering: "Rendering",
  verifying: "Verifying",
  verified: "Verified",
  waiting: "Waiting",
  blocked: "Blocked"
};
const formatter = new Intl.DateTimeFormat("en-GB", {
  dateStyle: "medium",
  timeStyle: "short",
  timeZone: "Europe/Stockholm"
});
const wholeNumber = new Intl.NumberFormat("en-GB");
let previousPayload;
let publishedTime;
let refreshing = false;
let updateMessage;

function element(tag, className, text) {
  const node = document.createElement(tag);
  if (className) node.className = className;
  if (text !== undefined) node.textContent = text;
  return node;
}

function progressText(verified, total) {
  return `${verified} of ${total} verified`;
}

function progressBar(label, verified, total) {
  const bar = element("progress");
  bar.max = total;
  bar.value = verified;
  bar.setAttribute("aria-label", label);
  return bar;
}

function renderMeasurement(data, layout) {
  if (!data) return null;
  const {completed, total, unit, state, detail} = data;
  const label = layout === "milestone" ? data.title : data.label;
  if (typeof label !== "string" || !label.trim() || !Object.hasOwn(renderStates, state) ||
      !Number.isSafeInteger(completed) || !Number.isSafeInteger(total) || completed < 0 ||
      completed > total || (total > 0 && (typeof unit !== "string" || !unit.trim()))) return null;

  const block = element(layout === "milestone" ? "li" : "div", `status-render status-render--${layout}`);
  const heading = element("div", "status-render-heading");
  const amount = total ? `${wholeNumber.format(completed)} of ${wholeNumber.format(total)} ${unit}` : "";
  const percent = layout === "milestone" && completed > 0 && completed < total
    ? ` (${Math.floor(completed * 100 / total)}%)` : "";
  const text = [renderStates[state], amount && amount + percent].filter(Boolean).join(" · ");
  const reading = element("span", "status-render-count", text);
  reading.dataset.state = state;
  heading.append(element("strong", "status-render-title", label), reading);
  block.append(heading);
  if (total) {
    const meter = progressBar(label, completed, total);
    meter.setAttribute("aria-valuetext", amount);
    block.append(meter);
  }
  if (typeof detail === "string" && detail.trim()) block.append(element("p", "status-render-detail", detail));
  return block;
}

function renderSteps(item, key, expanded) {
  const section = element("div", "status-item-progress");
  const steps = item.steps ?? [];
  const verified = steps.filter(step => step.verified).length;
  if (!steps.length) {
    section.append(progressBar(`${item.title} verification`, Number(item.state === "verified"), 1));
    return section;
  }

  const details = element("details", "status-steps");
  details.dataset.progressKey = key;
  details.open = expanded.get(key) ?? item.state === "checking";
  const summary = element("summary", "", `${verified} of ${steps.length} steps verified`);
  summary.setAttribute("aria-label", `${item.title}, ${summary.textContent}`);
  const list = element("ul", "status-step-list");
  for (const step of steps) {
    const row = element("li", "status-step");
    const mark = element("span", "status-item-state", step.verified ? "Verified" : "Open");
    if (step.verified) mark.dataset.state = "verified";
    row.append(element("span", "", step.title), mark);
    list.append(row);
  }
  details.append(summary, list);
  section.append(progressBar(`${item.title} steps verified`, verified, steps.length), details);
  return section;
}

function renderGroup(group, expanded) {
  const verified = group.items.filter(item => item.state === "verified").length;
  const details = element("details", "status-group");
  details.dataset.group = group.id;
  details.dataset.progressKey = `group:${group.id}`;
  details.open = expanded.get(details.dataset.progressKey) ?? true;
  const heading = element("span", "status-group-heading");
  heading.append(element("span", "status-group-title", group.title),
                 element("span", "status-count", progressText(verified, group.items.length)));
  const summary = element("summary");
  summary.append(heading);
  const bar = progressBar(`${group.title} verified milestones`, verified, group.items.length);
  const items = element("ul", "status-items");
  for (const item of group.items) {
    const row = element("li", "status-item");
    const title = element("div", "status-item-heading");
    const state = element("span", "status-item-state", states[item.state]);
    state.dataset.state = item.state;
    title.append(element("strong", "", item.title), state);
    row.append(title, element("p", "", item.detail));
    const measured = renderMeasurement(item.progress, "item");
    if (measured) row.append(measured);
    row.append(renderSteps(item, `item:${group.id}:${item.title}`, expanded));
    items.append(row);
  }
  details.append(summary, bar, items);
  return details;
}

function showUpdatedAt(retrying = false) {
  const timestamp = Date.parse(publishedTime);
  const stale = Number.isFinite(timestamp) && Date.now() - timestamp > 10 * 60_000;
  const message = `${publishedTime}|${stale}|${retrying}`;
  if (message === updateMessage) return;
  updateMessage = message;
  if (!Number.isFinite(timestamp)) {
    update.textContent = retrying ? "Status is temporarily unavailable. Checking again in a minute."
      : "Publication time is unavailable.";
    return;
  }
  const time = element("time", "", formatter.format(timestamp));
  time.dateTime = publishedTime;
  update.replaceChildren("Last published ", time, " Stockholm time.");
  if (stale) update.append(" ", element("strong", "", "This snapshot is over 10 minutes old."));
  if (retrying) update.append(" Could not check for a newer snapshot.");
}

function showLastVerified(value) {
  lastVerified.hidden = !Number.isFinite(Date.parse(value));
  if (lastVerified.hidden) return;
  const time = element("time", "", formatter.format(new Date(value)));
  time.dateTime = value;
  lastVerified.replaceChildren("Last verified ", time, " Stockholm time.");
}

function render(data) {
  const detailSelector = "details[data-progress-key]";
  const expanded = new Map([...checklist.querySelectorAll(detailSelector)].map(node => [node.dataset.progressKey, node.open]));
  const focusedKey = document.activeElement?.closest(detailSelector)?.dataset.progressKey;
  const groups = data.groups ?? [];
  const allItems = groups.flatMap(group => group.items);
  const verified = allItems.filter(item => item.state === "verified").length;
  overall.max = Math.max(1, allItems.length);
  overall.value = verified;
  count.textContent = `${verified} of ${allItems.length} checklist items verified`;
  checklistDetails.hidden = !allItems.length;
  const measured = renderMeasurement(data.activeRender, "active");
  activeRender.replaceChildren(...(measured ? [measured] : []));
  activeJob.hidden = !measured;
  const rows = (data.milestones ?? []).map(row => renderMeasurement(row, "milestone")).filter(Boolean);
  milestoneList.replaceChildren(...rows);
  milestones.hidden = !rows.length;
  showLastVerified(data.lastVerifiedAt);
  checklist.replaceChildren(...groups.map(group => renderGroup(group, expanded)));
  checklist.setAttribute("aria-busy", "false");
  if (focusedKey) {
    [...checklist.querySelectorAll(detailSelector)].find(node => node.dataset.progressKey === focusedKey)
      ?.querySelector("summary").focus({preventScroll: true});
  }
  publishedTime = data.updatedAt;
}

async function refresh() {
  if (refreshing) return;
  refreshing = true;
  try {
    const url = new URL("film-status.json", document.baseURI);
    url.searchParams.set("minute", String(Math.floor(Date.now() / 60_000)));
    const response = await fetch(url, {cache: "no-store"});
    if (!response.ok) throw new Error("Status unavailable");
    const payload = await response.text();
    if (payload !== previousPayload) {
      render(JSON.parse(payload));
      previousPayload = payload;
    }
    showUpdatedAt();
  } catch {
    showUpdatedAt(true);
    checklist.setAttribute("aria-busy", "false");
  } finally {
    refreshing = false;
  }
}

refresh();
window.setInterval(() => { if (!document.hidden) refresh(); }, 60_000);
document.addEventListener("visibilitychange", () => { if (!document.hidden) refresh(); });
