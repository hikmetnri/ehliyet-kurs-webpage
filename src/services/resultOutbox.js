import api from '../api'
import { getSessionGeneration } from '../api/session'
const key = 'assessment_outbox_v1'
const read = () => JSON.parse(localStorage.getItem(key) || '[]')
export const queueOperation = (owner, path, data) => {
  if (!owner) throw new Error('Kayıt sahibi gerekli')
  const operationId = data.operationId || crypto.randomUUID()
  const rows = read()
  if (!rows.some(row => row.owner === owner && row.data.operationId === operationId)) {
    rows.push({ owner, path, data: { ...data, operationId } })
    localStorage.setItem(key, JSON.stringify(rows))
  }
  return operationId
}
export const flushOperations = async (owner) => {
  const generation = getSessionGeneration()
  const flush = async () => {
    let failed = false
    for (const row of read().filter(item => item.owner === owner)) {
      if (generation !== getSessionGeneration()) break
      try {
        await api.post(row.path, row.data, { authGeneration: generation })
        localStorage.setItem(key, JSON.stringify(read().filter(item => !(item.owner === owner && item.data.operationId === row.data.operationId))))
      } catch { failed = true }
    }
    return !failed
  }
  return navigator.locks ? navigator.locks.request('ehliyet-result-outbox', flush) : flush()
}
