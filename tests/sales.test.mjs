import test from 'node:test'
import assert from 'node:assert/strict'
import { localDate } from '../src/lib/dates.js'

let scenario = 0
async function database(stock = 12) {
  const storage = new Map(Object.entries({
    brena_sales_seeded: 'true', brena_sales: '[]', brena_sale_items: '[]',
    brena_inventory: JSON.stringify([{ id: 'chicken', slug: 'chicken_pieces', quantity: stock }]),
  }))
  globalThis.localStorage = {
    getItem: key => storage.get(key) ?? null,
    setItem: (key, value) => storage.set(key, value),
  }
  return (await import('../src/lib/mockDb.js?scenario=' + scenario++)).db
}
const order = (quantity = 3) => ({ employee_id: 'emp-uuid-001', items: [{
  product_id: 'prod-001', product_name: 'Personal', chicken_pieces: 3,
  quantity, unit_price: 30, subtotal: quantity * 30,
}] })

test('a multi-unit sale deducts all pieces and records its timestamp', async () => {
  const db = await database()
  const result = db.createSale(order())
  assert.equal(result.error, undefined)
  assert.equal(db.getInventoryMap().chicken_pieces, 3)
  assert.equal(db.getSaleById(result.data.sale_id).total_amount, 90)
  assert.equal(result.data.created_at, db.getSaleById(result.data.sale_id).created_at)
  assert.equal(db.getSaleItems(result.data.sale_id)[0].quantity, 3)
})
for (const internal of [false, true]) test('insufficient stock rejects ' + (internal ? 'internal consumption' : 'a sale') + ' without mutating records', async () => {
  const db = await database(8)
  const result = db.createSale({ ...order(), is_admin_sale: internal })
  assert.ok(result.error)
  assert.equal(db.getInventoryMap().chicken_pieces, 8)
  assert.equal(db.getSales().total, 0)
  assert.equal(db.getMovements(50).length, 0)
})
test('exact stock can be consumed internally without a negative balance', async () => {
  const db = await database(9)
  assert.ok(db.createSale({ ...order(), is_admin_sale: true }).data)
  assert.equal(db.getInventoryMap().chicken_pieces, 0)
})
test('date keys use the calendar date of the supplied local time', () => {
  const date = new Date(2026, 9, 11, 23, 59)
  assert.equal(localDate(date), '2026-10-11')
})
