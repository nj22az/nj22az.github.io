"use strict";

const checklist = document.querySelector("#status-checklist");
const overall = document.querySelector("#status-overall");
const count = document.querySelector("#status-count");
const update = document.querySelector("#status-update");
const states = {
  verified: "Verified",
  checking: "Checking",
  "needs-work": "Needs repair",
  queued: "Queued"
};
const formatter = new Intl.DateTimeFormat("en-GB", {
  dateStyle: "medium",
  timeStyle: "short",
  timeZone: "Europe/Stockholm"
});
let previousPayload;
let publishedTime;
let refreshing = false;

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
    row.append(title, element("p", "", item.detail), renderSteps(item, `item:${group.id}:${item.title}`, expanded));
    items.append(row);
  }
  details.append(summary, bar, items);
  return details;
}

function showUpdatedAt() {
  const time = element("time", "", formatter.format(new Date(publishedTime)));
  time.dateTime = publishedTime;
  update.replaceChildren("Updated ", time, " Stockholm time. This page refreshes every minute.");
}

function render(data) {
  const detailSelector = "details[data-progress-key]";
  const expanded = new Map([...checklist.querySelectorAll(detailSelector)].map(node => [node.dataset.progressKey, node.open]));
  const focusedKey = document.activeElement?.closest(detailSelector)?.dataset.progressKey;
  const allItems = data.groups.flatMap(group => group.items);
  const verified = allItems.filter(item => item.state === "verified").length;
  overall.max = allItems.length;
  overall.value = verified;
  overall.hidden = false;
  count.textContent = `${verified} of ${allItems.length} milestones verified`;
  checklist.replaceChildren(...data.groups.map(group => renderGroup(group, expanded)));
  checklist.setAttribute("aria-busy", "false");
  if (focusedKey) {
    [...checklist.querySelectorAll(detailSelector)].find(node => node.dataset.progressKey === focusedKey)
      ?.querySelector("summary").focus({preventScroll: true});
  }
  publishedTime = data.updatedAt;
  showUpdatedAt();
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
    } else if (update.dataset.retry === "true") {
      showUpdatedAt();
    }
    delete update.dataset.retry;
  } catch {
    update.dataset.retry = "true";
    update.textContent = publishedTime
      ? `Showing the update from ${formatter.format(new Date(publishedTime))} Stockholm time. Reconnecting…`
      : "The checklist is temporarily unavailable. This page will retry in a minute.";
    checklist.setAttribute("aria-busy", "false");
  } finally {
    refreshing = false;
  }
}

refresh();
window.setInterval(() => { if (!document.hidden) refresh(); }, 60_000);
document.addEventListener("visibilitychange", () => { if (!document.hidden) refresh(); });
