import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import vm from 'node:vm';
import React, { act } from 'react';
import { createRoot } from 'react-dom/client';
import { JSDOM } from 'jsdom';

async function harness() {
  const dom = new JSDOM('<div id="root"></div>');
  globalThis.window = dom.window;
  globalThis.document = dom.window.document;
  globalThis.IS_REACT_ACT_ENVIRONMENT = true;
  const context = vm.createContext({ console });
  const source = new vm.SourceTextModule(await readFile('src/pages/user/feed/useFeedPosts.js', 'utf8'), { context });
  await source.link(name => {
    const values = name === 'react' ? React : { default: {} };
    return new vm.SyntheticModule(Object.keys(values), function () {
      for (const [key, value] of Object.entries(values)) this.setExport(key, value);
    }, { context });
  });
  await source.evaluate();
  const requests = [];
  const client = { get(url, { params }) {
    return new Promise(resolve => requests.push({ url, params, resolve }));
  } };
  const root = createRoot(document.getElementById('root'));
  let state;
  function Probe({ type }) { state = source.namespace.useFeedPosts(type, client); return null; }
  return {
    requests,
    get state() { return state; },
    render: type => act(async () => root.render(React.createElement(Probe, { type }))),
    resolve: (index, posts, total = posts.length) => act(async () => requests[index].resolve({ data: { posts, total } })),
    close: async () => { await act(async () => root.unmount()); dom.window.close(); }
  };
}

test('feed sends the selected type, loads once, and ignores an older filter response', async () => {
  const h = await harness();
  try {
    await h.render('all');
    assert.equal(h.requests.length, 1);
    assert.equal(h.requests[0].params.type, undefined);
    const outdatedReload = h.state.fetchPosts;
    await h.render('question');
    assert.equal(h.requests[1].url, '/posts');
    assert.equal(h.requests[1].params.type, 'question');
    assert.equal(h.requests[1].params.page, 1);
    await h.resolve(1, [{ _id: 'question' }], 1);
    await h.resolve(0, [{ _id: 'outdated' }], 100);
    assert.equal(h.state.posts[0]._id, 'question');
    assert.equal(h.state.total, 1);
    assert.equal(h.state.hasMore, false);
    assert.equal(h.state.loading, false);
    await h.render('question');
    assert.equal(h.requests.length, 2);
    await act(async () => outdatedReload(1, true));
    assert.equal(h.requests.length, 2);
  } finally { await h.close(); }
});

test('pagination preserves type, blocks duplicate clicks and resets for a new filter', async () => {
  const h = await harness();
  try {
    await h.render('tip');
    await h.resolve(0, [{ _id: 'first' }], 16);
    await act(async () => { h.state.handleLoadMore(); h.state.handleLoadMore(); });
    assert.equal(h.requests.length, 2);
    assert.equal(h.requests[1].params.type, 'tip');
    assert.equal(h.requests[1].params.page, 2);
    await h.resolve(1, [{ _id: 'second' }], 16);
    assert.equal(h.state.posts.length, 2);
    assert.equal(h.state.hasMore, false);
    await h.render('all');
    assert.equal(h.state.posts.length, 0);
    assert.equal(h.state.total, 0);
    assert.equal(h.requests[2].params.page, 1);
    assert.equal(h.requests[2].params.type, undefined);
    await h.resolve(2, [], 0);
  } finally { await h.close(); }
});

test('a stale response cannot clear the current filter loading state', async () => {
  const h = await harness();
  try {
    await h.render('all');
    await h.render('tip');
    await h.resolve(0, [{ _id: 'stale' }]);
    assert.equal(h.state.loading, true);
    assert.equal(h.state.posts.length, 0);
    await h.resolve(1, [{ _id: 'tip' }]);
    assert.equal(h.state.loading, false);
  } finally { await h.close(); }
});
