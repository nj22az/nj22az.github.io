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

function renderGroup(group, expanded) {
  const verified = group.items.filter(item => item.state === "verified").length;
  const details = element("details", "status-group");
  details.dataset.group = group.id;
  details.open = expanded ?? true;
  const heading = element("span", "status-group-heading");
  heading.append(element("span", "status-group-title", group.title),
                 element("span", "status-count", progressText(verified, group.items.length)));
  const summary = element("summary");
  summary.append(heading);
  const bar = element("progress");
  bar.max = group.items.length;
  bar.value = verified;
  bar.setAttribute("aria-label", `${group.title} verified items`);
  const items = element("ul", "status-items");
  for (const item of group.items) {
    const row = element("li", "status-item");
    const title = element("div", "status-item-heading");
    const state = element("span", "status-item-state", states[item.state]);
    state.dataset.state = item.state;
    title.append(element("strong", "", item.title), state);
    row.append(title, element("p", "", item.detail));
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
  const expanded = new Map([...checklist.querySelectorAll("details")].map(node => [node.dataset.group, node.open]));
  const focusedGroup = document.activeElement?.closest("details.status-group")?.dataset.group;
  const allItems = data.groups.flatMap(group => group.items);
  const verified = allItems.filter(item => item.state === "verified").length;
  overall.max = allItems.length;
  overall.value = verified;
  overall.hidden = false;
  count.textContent = `${verified} of ${allItems.length} milestones verified`;
  checklist.replaceChildren(...data.groups.map(group => renderGroup(group, expanded.get(group.id))));
  checklist.setAttribute("aria-busy", "false");
  if (focusedGroup) {
    [...checklist.children].find(node => node.dataset.group === focusedGroup)?.querySelector("summary").focus({preventScroll: true});
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
