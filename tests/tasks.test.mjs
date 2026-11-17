import test from 'node:test';
import assert from 'node:assert/strict';
import { createTaskStore } from '../src/tasks.mjs';
import { createServer } from '../src/server.mjs';

const taskStore = () => createTaskStore();

test('створення завдання: назва обрізається, id існує', () => {
  const store = taskStore();
  const task = store.add('  Підготувати CI  ');
  assert.equal(task.title, 'Підготувати CI');
  assert.equal(task.completed, false);
  assert.match(task.id, /^[0-9a-f-]{36}$/);
  assert.equal(store.list().length, 1);
});

test('порожня назва відхиляється', () => {
  assert.throws(() => taskStore().add('   '), { code: 'TITLE_REQUIRED' });
});

test('оновлення і видалення завдання', () => {
  const store = taskStore();
  const task = store.add('Перевірити CD');
  assert.equal(store.update(task.id, true).completed, true);
  assert.equal(store.remove(task.id), true);
  assert.equal(store.list().length, 0);
});

test('HTTP: health, create, list, validation and delete', async (t) => {
  const server = createServer(taskStore());
  await new Promise((resolve) => server.listen(0, '127.0.0.1', resolve));
  t.after(() => new Promise((resolve, reject) => server.close((err) => err ? reject(err) : resolve())));
  const base = `http://127.0.0.1:${server.address().port}`;
  const page = await fetch(`${base}/`);
  assert.equal(page.status, 200);
  assert.match(await page.text(), /Task Tracker/);
  const health = await fetch(`${base}/health`);
  assert.equal(health.status, 200);
  assert.deepEqual(await health.json(), { status: 'ok' });

  const invalid = await fetch(`${base}/api/tasks`, {
    method: 'POST', headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ title: '' })
  });
  assert.equal(invalid.status, 400);
  assert.equal((await invalid.json()).error, 'TITLE_REQUIRED');

  const created = await fetch(`${base}/api/tasks`, {
    method: 'POST', headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ title: 'CI ready' })
  });
  assert.equal(created.status, 201);
  const task = await created.json();
  const list = await fetch(`${base}/api/tasks`);
  assert.deepEqual((await list.json()).items, [task]);

  const patch = await fetch(`${base}/api/tasks/${task.id}`, {
    method: 'PATCH', headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ completed: true })
  });
  assert.equal((await patch.json()).completed, true);
  const deleted = await fetch(`${base}/api/tasks/${task.id}`, { method: 'DELETE' });
  assert.equal(deleted.status, 200);
});
