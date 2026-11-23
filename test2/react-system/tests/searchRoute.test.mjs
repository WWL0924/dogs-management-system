import test from 'node:test'
import assert from 'node:assert/strict'
import searchRoute from '../src/utile/index.ts'

test('finds a nested route', () => {
  const routes = [
    { path: '/resident', children: [{ path: '/resident/mine' }] },
    { path: '/admin' },
  ]

  assert.equal(searchRoute('/resident/mine', routes), routes[0].children[0])
})

test('returns undefined when no route matches', () => {
  assert.equal(searchRoute('/missing', [{ path: '/resident' }]), undefined)
})
