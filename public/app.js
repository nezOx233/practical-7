const list = document.getElementById('task-list');
const form = document.getElementById('task-form');
const input = document.getElementById('task-title');
const message = document.getElementById('message');
const status = document.getElementById('api-status');
const taskCount = document.getElementById('task-count');
const taskProgress = document.getElementById('task-progress');

async function request(path, options = {}) {
  const response = await fetch(path, {
    headers: { 'content-type': 'application/json' },
    ...options
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data.message ?? 'Помилка сервера');
  return data;
}

async function refresh() {
  try {
    const { items } = await request('/api/tasks');
    status.textContent = 'Сервер підключено';
    status.classList.remove('offline');
    message.textContent = '';
    taskCount.textContent = `${items.length} завдань`;
    taskProgress.textContent = `Виконано: ${items.filter(item => item.completed).length} із ${items.length}`;
    list.replaceChildren();

    if (items.length === 0) {
      const empty = document.createElement('div');
      empty.className = 'empty';
      empty.textContent = 'Поки що справ немає. Додай перше завдання.';
      list.append(empty);
    }

    for (const item of items) {
      const li = document.createElement('li');
      if (item.completed) li.classList.add('completed');

      const label = document.createElement('label');
      const checkbox = document.createElement('input');
      checkbox.type = 'checkbox';
      checkbox.checked = item.completed;
      const title = document.createElement('span');
      title.textContent = item.title;
      checkbox.addEventListener('change', async () => {
        try {
          await request(`/api/tasks/${item.id}`, {
            method: 'PATCH', body: JSON.stringify({ completed: checkbox.checked })
          });
          await refresh();
        } catch (error) {
          checkbox.checked = !checkbox.checked;
          message.textContent = error.message;
        }
      });
      label.append(checkbox, title);

      const remove = document.createElement('button');
      remove.type = 'button';
      remove.textContent = 'Видалити';
      remove.setAttribute('aria-label', `Видалити: ${item.title}`);
      remove.addEventListener('click', async () => {
        try {
          await request(`/api/tasks/${item.id}`, { method: 'DELETE' });
          await refresh();
        } catch (error) {
          message.textContent = error.message;
        }
      });

      li.append(label, remove);
      list.append(li);
    }
  } catch (error) {
    status.textContent = 'Немає зв’язку із сервером';
    status.classList.add('offline');
    message.textContent = error.message;
  }
}

form.addEventListener('submit', async (event) => {
  event.preventDefault();
  const button = form.querySelector('button');
  button.disabled = true;
  message.textContent = '';
  try {
    await request('/api/tasks', { method: 'POST', body: JSON.stringify({ title: input.value }) });
    input.value = '';
    await refresh();
  } catch (error) {
    message.textContent = error.message;
  } finally {
    button.disabled = false;
  }
});

refresh();
