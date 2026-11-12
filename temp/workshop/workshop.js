const frame = document.querySelector('#scene-frame');
const stage = document.querySelector('#stage');
const still = document.querySelector('#scene-still');
const title = document.querySelector('#view-title');
const detail = document.querySelector('#view-detail');
const shortcut = document.querySelector('.scene-link');
const panel = document.querySelector('#bench-panel');
const feedback = document.querySelector('#bench-feedback');
const tabs = [...document.querySelectorAll('[data-view-link]')];
const views = {
  quayside: { title: 'Quayside', detail: 'Dock Electrical & Repairs', next: 'door' },
  door: { title: 'Workshop door', detail: 'Customer entrance', next: 'workbench' },
  workbench: { title: 'Workbench', detail: 'Tetsuo’s instrument bench' },
};

let selected;
let scene;

function showView() {
  const hash = window.location.hash.slice(1);
  const view = Object.hasOwn(views, hash) ? hash : 'quayside';
  if (view === selected) return;
  selected = view;
  const { title: label, detail: description, next } = views[view];
  title.textContent = label;
  detail.textContent = description;
  frame.dataset.view = view;
  if (view !== 'quayside') still.src = `./assets/${view}.webp`;
  else still.src = './assets/quayside.webp';
  for (const tab of tabs) {
    if (tab.dataset.viewLink === view) tab.setAttribute('aria-current', 'true');
    else tab.removeAttribute('aria-current');
  }
  shortcut.hidden = !next;
  if (next) {
    shortcut.href = `#${next}`;
    shortcut.dataset.go = next;
    shortcut.firstElementChild.textContent = next === 'door' ? 'Workshop door' : 'See the workbench';
    shortcut.setAttribute('aria-label', next === 'door' ? 'Approach the workshop door' : 'Enter the workshop and see the workbench');
  }
  panel.hidden = view !== 'workbench' || !scene;
  scene?.show(view);
}

window.addEventListener('hashchange', showView);
showView();

for (const link of document.querySelectorAll('[data-go]')) {
  link.addEventListener('click', () => {
    if (link.classList.contains('primary') && frame.getBoundingClientRect().top > innerHeight / 3) {
      frame.scrollIntoView({ block: 'start' });
    }
  });
}

panel.addEventListener('click', (event) => {
  const control = event.target.closest('[data-kit]');
  if (control) scene?.operate(control.dataset.kit);
});

try {
  const { createWorkshop } = await import('./scene.js');
  scene = createWorkshop(stage, {
    initial: selected,
    onAction: (_type, _title, message) => { feedback.textContent = message; },
    onLoss: () => {
      scene = null;
      frame.dataset.mode = 'still';
      panel.hidden = true;
    },
  });
  frame.dataset.mode = 'live';
  panel.hidden = selected !== 'workbench';
} catch (error) {
  console.warn('The workshop is using still views.', error);
}
