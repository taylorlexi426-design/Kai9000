const API_BASE = '/api/v1';

const chatLog = document.getElementById('chat-log');
const chatForm = document.getElementById('chat-form');
const chatInput = document.getElementById('chat-input');
const deviceStatusEl = document.getElementById('device-status');
const historyListEl = document.getElementById('command-history');
let currentStatus = null;

function renderStatus(status) {
  currentStatus = status;
  deviceStatusEl.textContent = JSON.stringify(status, null, 2);
}

function createHistoryEntry(entry) {
  const li = document.createElement('li');
  const statusClass = entry.success ? 'success' : 'failure';
  const statusText = entry.success ? 'OK' : 'FAILED';
  li.innerHTML = `<span class="${statusClass}">[${statusText}]</span> ${entry.action} — ${entry.createdAt}`;
  return li;
}

function prependHistoryEntry(entry) {
  if (!entry) return;
  const emptyState = historyListEl.querySelector('li');
  if (emptyState && emptyState.textContent === 'No commands executed yet.') {
    historyListEl.innerHTML = '';
  }
  historyListEl.prepend(createHistoryEntry(entry));
}

function applyCommandUpdate(command) {
  if (!command?.log) return;

  prependHistoryEntry(command.log);

  if (command.action === 'info' && command.raw && typeof command.raw === 'object') {
    renderStatus({
      ...command.raw,
      lastCommand: command.log,
    });
    return;
  }

  if (currentStatus) {
    renderStatus({
      ...currentStatus,
      lastCommand: command.log,
    });
  }
}

function appendMessage(sender, content) {
  const el = document.createElement('div');
  el.className = `chat-message ${sender === 'user' ? 'user' : 'ai'}`;
  el.textContent = content;
  chatLog.appendChild(el);
  chatLog.scrollTop = chatLog.scrollHeight;
}

async function sendMessage(message) {
  appendMessage('user', message);
  try {
    const res = await fetch(`${API_BASE}/chat/message`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message }),
    });
    const data = await res.json();
    if (!res.ok) {
      appendMessage('ai', data.error || 'Something went wrong.');
      return;
    }
    appendMessage('ai', data.reply?.content || 'OK');
    applyCommandUpdate(data.command);
  } catch (err) {
    appendMessage('ai', `Network error: ${err.message}`);
  }
}

async function refreshStatus() {
  deviceStatusEl.textContent = 'Loading…';
  try {
    const res = await fetch(`${API_BASE}/device/status`);
    const data = await res.json();
    renderStatus(data);
  } catch (err) {
    deviceStatusEl.textContent = `Failed to load status: ${err.message}`;
  }
}

async function refreshHistory() {
  historyListEl.innerHTML = '';
  try {
    const res = await fetch(`${API_BASE}/device/history?limit=50`);
    const data = await res.json();
    if (!Array.isArray(data) || data.length === 0) {
      const li = document.createElement('li');
      li.textContent = 'No commands executed yet.';
      historyListEl.appendChild(li);
      return;
    }
    data.forEach((entry) => {
      historyListEl.appendChild(createHistoryEntry(entry));
    });
  } catch (err) {
    const li = document.createElement('li');
    li.textContent = `Failed to load history: ${err.message}`;
    historyListEl.appendChild(li);
  }
}

chatForm.addEventListener('submit', (e) => {
  e.preventDefault();
  const message = chatInput.value.trim();
  if (!message) return;
  chatInput.value = '';
  sendMessage(message);
});

document.getElementById('refresh-status').addEventListener('click', refreshStatus);
document.getElementById('refresh-history').addEventListener('click', refreshHistory);

refreshStatus();
refreshHistory();
