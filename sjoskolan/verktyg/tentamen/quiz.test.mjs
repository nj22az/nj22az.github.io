import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import vm from 'node:vm';
import test from 'node:test';

const source = readFileSync(new URL('./ovningstentamen.gs', import.meta.url), 'utf8');
const root = new URL('../../', import.meta.url);

function runtime(failAt = 0) {
  const env = {forms: [], store: new Map(), locks: 0, multipleChoiceCount: 0};
  class Item {
    constructor(type) { this.type = type; this.points = 0; }
    setTitle(v) { this.title = v; return this; }
    setHelpText(v) { this.help = v; return this; }
    setRequired(v) { this.required = v; return this; }
    setPoints(v) { this.points = v; return this; }
    createChoice(text, correct) { return {text, correct}; }
    setChoices(v) { this.choices = v; return this; }
    setChoiceValues(v) { this.choices = v.map(text => ({text})); return this; }
    setFeedbackForCorrect(v) { this.correctFeedback = v; return this; }
    setFeedbackForIncorrect(v) { this.incorrectFeedback = v; return this; }
    setGeneralFeedback(v) { this.generalFeedback = v; return this; }
  }
  class Form {
    constructor(title, published) { this.title = title; this.published = published; this.items = []; this.id = String(env.forms.length + 1); }
    setAcceptingResponses(v) { this.acceptingResponses = v; return this; }
    setIsQuiz(v) { this.quiz = v; return this; }
    setDescription(v) { this.description = v; return this; }
    setProgressBar(v) { this.progressBar = v; return this; }
    setShuffleQuestions(v) { this.shuffleQuestions = v; return this; }
    setCollectEmail(v) { this.collectEmail = v; return this; }
    setLimitOneResponsePerUser(v) { this.limitOneResponse = v; return this; }
    setAllowResponseEdits(v) { this.allowEdits = v; return this; }
    setPublishingSummary(v) { this.publicSummary = v; return this; }
    setShowLinkToRespondAgain(v) { this.repeat = v; return this; }
    setConfirmationMessage(v) { this.confirmation = v; return this; }
    getId() { return this.id; }
    getEditUrl() { return `https://docs.google.com/forms/d/test-${this.id}/edit`; }
    add(type) { assert.equal(this.quiz, true); const item = new Item(type); this.items.push(item); return item; }
    addSectionHeaderItem() { return this.add('header'); }
    addPageBreakItem() { return this.add('page'); }
    addTextItem() { return this.add('text'); }
    addParagraphTextItem() { return this.add('paragraph'); }
    addMultipleChoiceItem() {
      if (++env.multipleChoiceCount === failAt) throw new Error('Simulated Forms failure');
      return this.add('choice');
    }
  }
  const context = vm.createContext({
    console: {log() {}},
    LockService: {getUserLock: () => ({waitLock() { env.locks++; }, releaseLock() { env.locks--; }})},
    PropertiesService: {getUserProperties: () => ({getProperty: k => env.store.get(k), setProperty(k, v) { env.store.set(k, v); }})},
    FormApp: {
      create(title, published) { const form = new Form(title, published); env.forms.push(form); return form; },
      openById(id) { return env.forms.find(f => f.id === id); },
      createFeedback() { return {setText(v) { this.text = v; return this; }, addLink(v) { this.link = v; return this; }, build() { return {text: this.text, link: this.link}; }}; }
    }
  });
  vm.runInContext(source, context, {filename: 'ovningstentamen.gs'});
  env.create = () => vm.runInContext('skapaOvningstentamen()', context);
  env.tasks = vm.runInContext('UPPGIFTER', context);
  return env;
}

test('twelve canonical scenarios become 48 scored questions, 60 points and an unpublished draft', () => {
  const env = runtime();
  const info = env.create();
  const form = env.forms[0];
  assert.equal(form.published, false);
  assert.equal(form.acceptingResponses, false);
  assert.equal(form.collectEmail, false);
  assert.equal(form.publicSummary, false);
  assert.equal(form.allowEdits, false);
  assert.equal(form.shuffleQuestions, false);
  assert.equal(form.items.filter(i => i.points > 0).length, 48);
  assert.equal(form.items.reduce((n, i) => n + i.points, 0), 60);
  assert.equal(form.items.filter(i => i.type === 'choice' && i.points === 1).length, 36);
  assert.equal(form.items.filter(i => i.type === 'paragraph' && i.points === 2).length, 12);
  assert.equal(form.items.filter(i => i.type === 'page').length, 7);
  assert.equal(info.maxpoang, 60);
  assert.equal(env.locks, 0);
  for (const task of env.tasks) {
    const canonical = JSON.parse(readFileSync(new URL(`innehall/ovningar/${task.id}.json`, root), 'utf8'));
    assert.equal(task.revision, canonical.revision);
    for (const q of task.fragor) {
      const item = form.items.find(i => i.title.startsWith(`${task.nummer}.${q.id} `));
      assert.equal(item.choices.length, 4);
      assert.equal(item.choices.filter(c => c.correct).length, 1);
      assert.equal(item.choices.find(c => c.correct).text, q.alternativ[q.ratt], 'shuffling must preserve the answer key');
      assert.equal(item.correctFeedback.text, task.losning);
      assert.equal(item.incorrectFeedback.text, task.losning);
    }
    assert.ok(!form.items.some(i => (i.help || '').includes(task.losning)), 'solution must not appear before responding');
    const written = form.items.find(i => i.title.startsWith(`${task.nummer}.d `));
    assert.ok(written.generalFeedback.text.includes(task.losning));
    assert.equal(task.kriterier.length, 2);
  }
});

test('rerunning returns the existing form and preserves teacher edits and responses', () => {
  const env = runtime();
  const first = env.create();
  const form = env.forms[0];
  form.items[0].title = 'Teacher edit';
  form.responses = ['existing submission'];
  const count = form.items.length;
  const second = env.create();
  assert.equal(second.redigera, first.redigera);
  assert.equal(env.forms.length, 1);
  assert.equal(form.items.length, count);
  assert.equal(form.items[0].title, 'Teacher edit');
  assert.deepEqual(form.responses, ['existing submission']);
  assert.equal(env.locks, 0);
});

test('an interrupted build stays closed and a retry does not duplicate or overwrite it', () => {
  const env = runtime(5);
  assert.throws(env.create, /Simulated Forms failure/);
  const count = env.forms[0].items.length;
  assert.throws(env.create, /tidigare bygge avbröts.*test-1\/edit/);
  assert.equal(env.forms.length, 1);
  assert.equal(env.forms[0].items.length, count);
  assert.equal(env.forms[0].published, false);
  assert.equal(env.locks, 0);
});

test('the public practice-exam page preserves question anchors and links PDFs without inline solutions', () => {
  const html = readFileSync(new URL('tentamen.html', root), 'utf8');
  assert.doesNotMatch(html, /class="facit"|Visa lösning|<details/);
  assert.match(html, /href="tentamen\/ovningstentamen\.pdf" download/);
  assert.match(html, /href="tentamen\/ovningstentamen-facit\.pdf" download/);
  for (let n = 1; n <= 12; n++) assert.match(html, new RegExp(`id="tenta-${n}"`));
  for (const task of runtime().tasks) assert.ok(!html.includes(task.losning));
});
