import { test } from 'node:test'
import { webcrypto } from 'node:crypto'
import { Buffer } from 'node:buffer'
import assert from 'node:assert/strict'
import vm from 'node:vm'
import { readFile } from 'node:fs/promises'
import axios from 'axios'
import { create } from 'zustand'

function storage(initial = {}) {
  const values = new Map(Object.entries(initial))
  return { getItem: key => values.get(key) ?? null, setItem: (key, value) => values.set(key, String(value)), removeItem: key => values.delete(key) }
}
async function harness({ legacyToken = null, transport = async () => ({ status: 200, data: {} }) } = {}) {
  const localStorage = storage({ user: JSON.stringify({ role: 'admin' }) })
  const sessionStorage = storage(legacyToken ? { token: legacyToken } : {})
  const context = vm.createContext({ URL, crypto: webcrypto, console, localStorage, sessionStorage, navigator: {}, document: { documentElement: { removeAttribute() {}, setAttribute() {} } }, window: { location: { pathname: '/admin' } }, atob, setTimeout, clearTimeout })
  const modules = new Map()
  const paths = { api: 'src/api/index.js', session: 'src/api/session.js', store: 'src/store/authStore.js', outbox: 'src/services/resultOutbox.js' }
  for (const [name, path] of Object.entries(paths)) {
    modules.set(name, new vm.SourceTextModule(await readFile(path, 'utf8'), { context, identifier: name, initializeImportMeta: meta => { meta.env = { VITE_API_URL: 'https://test.invalid/api' } } }))
  }
  const stub = (name, exports) => {
    const module = new vm.SyntheticModule(Object.keys(exports), function () { for (const [key, value] of Object.entries(exports)) this.setExport(key, value) }, { context, identifier: name })
    modules.set(name, module)
    return module
  }
  stub('axios', { default: axios })
  stub('zustand', { create })
  stub('firebase/auth', { signOut: async () => {} })
  stub('../config/firebase', { auth: {} })
  stub('../services/webPushService', { registerWebPushToken: async () => {} })
  await modules.get('api').link(specifier => {
    if (specifier === '../store/authStore') return modules.get('store')
    if (specifier === '../services/resultOutbox') return modules.get('outbox')
    if (specifier === '../api') return modules.get('api')
    if (specifier === './session' || specifier === '../api/session') return modules.get('session')
    if (!modules.has(specifier)) throw new Error(`Unexpected dependency: ${specifier}`)
    return modules.get(specifier)
  })
  await modules.get('api').evaluate()
  const exports = modules.get('api').namespace
  const api = exports.default
  const store = modules.get('store').namespace.default
  const session = modules.get('session').namespace
  api.defaults.adapter = async config => {
    const result = await transport(config)
    const response = { ...result, config, headers: {}, statusText: '' }
    if (result.status >= 400) throw new axios.AxiosError('Test response', axios.AxiosError.ERR_BAD_RESPONSE, config, null, response)
    return response
  }
  return { ...exports, api, store, session, localStorage, sessionStorage, outbox: modules.get('outbox').namespace }
}
const payload = { id: 'user-id', email: 'user@example.com', role: 'user' }
const fakeAccess = `header.${Buffer.from(JSON.stringify({ sid: 'session-id' })).toString('base64url')}.signature`

test('reopening uses HttpOnly-cookie refresh then backend profile, ignores forged local admin', async () => {
  let refreshed = 0
  const h = await harness({ transport: async config => {
    if (config.url === '/auth/refresh-token') { refreshed++; assert.equal(JSON.parse(config.data).sessionTransport, 'cookie'); return { status: 200, data: { token: fakeAccess } } }
    if (config.url === '/auth/me') return { status: 200, data: { user: payload } }
    return { status: 200, data: { _csrf: 'csrf-value' } }
  } })
  assert.equal(h.store.getState().user, null)
  await h.bootstrapSession()
  assert.equal(h.store.getState().user.role, 'user')
  assert.equal(h.store.getState().initialized, true)
  assert.equal(refreshed, 1)
  assert.equal(h.sessionStorage.getItem('token'), null)
  assert.equal(h.localStorage.getItem('token'), null)
  assert.equal(h.localStorage.getItem('user'), null)
})
test('expired access and concurrent 401 responses share one rotation', async () => {
  let rotations = 0
  const h = await harness({ transport: async config => {
    if (config.url === '/auth/csrf') return { status: 200, data: { _csrf: 'csrf-value' } }
    if (config.url === '/auth/refresh-token') { rotations++; await new Promise(resolve => setTimeout(resolve, 15)); return { status: 200, data: { token: 'fresh' } } }
    return config.headers.Authorization === 'Bearer expired' ? { status: 401, data: {} } : { status: 200, data: { ok: true } }
  } })
  h.session.setAccessToken('expired')
  const results = await Promise.all([h.api.get('/one'), h.api.get('/two')])
  assert.ok(results.every(result => result.status === 200))
  assert.equal(rotations, 1)
  assert.equal(h.session.getAccessToken(), 'fresh')
})
test('invalid refresh clears UI and storage; temporary failure preserves session for retry', async () => {
  for (const status of [401, 503]) {
    const h = await harness({ transport: async config => config.url === '/auth/csrf' ? { status: 200, data: {} } : { status: config.url === '/auth/refresh-token' ? status : 401, data: {} } })
    h.session.setAccessToken('expired')
    h.store.setState({ user: payload, token: 'expired' })
    await assert.rejects(h.api.get('/auth/me'))
    assert.equal(h.session.getAccessToken(), status === 401 ? null : 'expired')
  }
})
test('logout reaches server before clearing state, and failed revocation is visible', async () => {
  for (const status of [200, 503]) {
    let requested = false
    const h = await harness({ transport: async config => {
      if (config.url === '/auth/logout') { requested = true; return { status, data: {} } }
      return { status: 200, data: { _csrf: 'csrf-value' } }
    } })
    h.session.setAccessToken('valid')
    h.store.setState({ user: payload, token: 'valid' })
    assert.equal(await h.store.getState().logout(), status === 200)
    assert.ok(requested)
    assert.equal(h.session.getAccessToken(), status === 200 ? null : 'valid')
    if (status === 503) assert.ok(h.store.getState().logoutError)
  }
})
test('logout during refresh cannot restore the previous session', async () => {
  let release
  const pending = new Promise(resolve => { release = resolve })
  let started
  const notified = new Promise(resolve => { started = resolve })
  const h = await harness({ transport: async config => {
    if (config.url === '/auth/refresh-token') { started(); await pending; return { status: 200, data: { token: 'unexpected' } } }
    return { status: 200, data: {} }
  } })
  const refreshing = h.refreshSession()
  await notified
  h.store.getState().clearSession()
  release()
  await assert.rejects(refreshing)
  assert.equal(h.session.getAccessToken(), null)
})
test('credentials endpoints never send a prior bearer token or auto-refresh wrong-password errors', async () => {
  let requests = 0
  const h = await harness({ transport: async config => {
    requests++
    assert.equal(config.url, '/auth/login')
    assert.equal(config.headers.Authorization, undefined)
    return { status: 401, data: {} }
  } })
  h.session.setAccessToken('old')
  await assert.rejects(h.api.post('/auth/login', { email: 'user@example.com', password: 'wrong' }))
  assert.equal(requests, 1)
})


test('errors exposed to UI logging exclude passwords, access and refresh credentials', async () => {
  const h = await harness({ transport: async () => ({ status: 401, data: { error: 'invalid credentials' } }) })
  let error
  try { await h.api.post('/auth/login', { email: 'user@example.com', password: 'do-not-log-password', refreshToken: 'do-not-log-refresh' }) } catch (caught) { error = caught }
  const serialized = JSON.stringify(error)
  assert.ok(!serialized.includes('do-not-log-password'))
  assert.ok(!serialized.includes('do-not-log-refresh'))
  assert.equal(error.response.status, 401)
})

test('failed guest uploads remain account-bound and retry without losing results', async () => {
  let fail = true
  const h = await harness({ transport: async config => ({ status: config.url === '/exam-results' && fail ? 503 : 200, data: {} }) })
  h.localStorage.setItem('guest_saved_results', JSON.stringify([{ examName: 'Guest', attemptId: 'attempt', answers: [] }]))
  h.store.getState().setAuth(payload, fakeAccess)
  await new Promise(resolve => setTimeout(resolve, 20))
  const rows = JSON.parse(h.localStorage.getItem('assessment_outbox_v1'))
  assert.equal(rows.length, 1)
  assert.equal(rows[0].owner, payload.id)
  fail = false
  await h.outbox.flushOperations(payload.id)
  assert.equal(JSON.parse(h.localStorage.getItem('assessment_outbox_v1')).length, 0)
})
test('question loading follows bounded pages and does not truncate at two hundred', async () => {
  const h = await harness({ transport: async config => ({ status: 200, data: Array.from({ length: config.params?.page === 2 ? 5 : 200 }, (_, i) => ({ _id: `${config.params?.page || 1}-${i}` })) }) })
  const response = await h.api.get('/questions?testType=short_test')
  assert.equal(response.data.length, 205)
})
