import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import vm from 'node:vm';
import React, { act } from 'react';
import { createRoot } from 'react-dom/client';
import { JSDOM } from 'jsdom';

test('changing lessons cancels the previous speech session', async () => {
  const dom = new JSDOM('<div id="root"></div>', { url: 'https://example.invalid' });
  const previous = {
    window: globalThis.window,
    document: globalThis.document,
    localStorage: globalThis.localStorage,
    SpeechSynthesisUtterance: globalThis.SpeechSynthesisUtterance,
  };
  globalThis.window = dom.window;
  globalThis.document = dom.window.document;
  globalThis.localStorage = dom.window.localStorage;
  globalThis.IS_REACT_ACT_ENVIRONMENT = true;
  const spoken = [];
  let cancelled = 0;
  dom.window.speechSynthesis = {
    speaking: false,
    getVoices: () => [{ name: 'Turkish', lang: 'tr-TR' }],
    addEventListener: () => {},
    removeEventListener: () => {},
    speak: utterance => spoken.push(utterance),
    cancel: () => { cancelled++; },
  };
  globalThis.SpeechSynthesisUtterance = class {
    constructor(text) { this.text = text; }
  };
  const context = vm.createContext({ window: dom.window, localStorage: dom.window.localStorage, SpeechSynthesisUtterance: globalThis.SpeechSynthesisUtterance });
  const source = new vm.SourceTextModule(await readFile('src/pages/user/lessons/useLessonReader.js', 'utf8'), { context });
  await source.link(name => {
    const values = name === 'react' ? React : {
      stripMarkdownForSpeech: text => text,
      chunkSpeechText: text => [text, 'next chunk'],
      getVoiceKey: voice => voice.name,
      sortVoices: voices => voices,
    };
    return new vm.SyntheticModule(Object.keys(values), function () {
      for (const [key, value] of Object.entries(values)) this.setExport(key, value);
    }, { context });
  });
  await source.evaluate();
  const root = createRoot(dom.window.document.getElementById('root'));
  let reader;
  const first = { _id: 'one', name: 'First', content: 'Text' };
  const second = { _id: 'two', name: 'Second', content: 'Text' };
  function Probe({ lesson }) {
    reader = source.namespace.useLessonReader({ selectedLesson: lesson, proStatus: false });
    return null;
  }
  try {
    await act(async () => root.render(React.createElement(Probe, { lesson: first })));
    await act(async () => reader.handleToggleLessonReading());
    assert.equal(spoken.length, 1);
    assert.equal(reader.isReadingLesson, true);
    await act(async () => root.render(React.createElement(Probe, { lesson: second })));
    assert.equal(reader.isReadingLesson, false);
    const before = spoken.length;
    spoken[0].onend();
    assert.equal(spoken.length, before);
    assert.ok(cancelled >= 2);
  } finally {
    await act(async () => root.unmount());
    dom.window.close();
    for (const [key, value] of Object.entries(previous)) globalThis[key] = value;
  }
});
