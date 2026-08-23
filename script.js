const sendBtn = document.getElementById('send-btn');
const userInput = document.getElementById('user-input');
const chatMessages = document.getElementById('chat-messages');
const clearBtn = document.getElementById('clear-btn');

function escapeHTML(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

function formatText(text) {
  let safe = escapeHTML(text);
  safe = safe.replace(/\*\*(.*?)\*\*/g, '<b>$1</b>');
  safe = safe.replace(/\s\*\s/g, '<br>• ');
  safe = safe.replace(/^\*\s/g, '• ');
  return safe;
}

function getTime() {
  const now = new Date();
  return now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

function addMessage(text, sender, save = true) {
  const row = document.createElement('div');
  row.className = 'msg-row ' + sender;

  if (sender === 'bot') {
    const avatar = document.createElement('div');
    avatar.className = 'bot-avatar';
    avatar.textContent = '🤖';
    row.appendChild(avatar);
  }

  const wrap = document.createElement('div');
  wrap.className = 'bubble-wrap ' + sender;

  const bubble = document.createElement('div');
  bubble.className = 'bubble ' + (sender === 'user' ? 'user-msg' : 'bot-msg');
  bubble.innerHTML = formatText(text);

  const time = document.createElement('div');
  time.className = 'msg-time';
  time.textContent = getTime();

  wrap.appendChild(bubble);
  wrap.appendChild(time);
  row.appendChild(wrap);

  chatMessages.appendChild(row);
  chatMessages.scrollTop = chatMessages.scrollHeight;

  if (save) saveMessage(text, sender);
}

function showTyping() {
  const row = document.createElement('div');
  row.className = 'msg-row bot';
  row.id = 'typing-indicator';

  const avatar = document.createElement('div');
  avatar.className = 'bot-avatar';
  avatar.textContent = '🤖';
  row.appendChild(avatar);

  const bubble = document.createElement('div');
  bubble.className = 'bubble bot-msg typing';
  bubble.innerHTML = '<span></span><span></span><span></span>';
  row.appendChild(bubble);

  chatMessages.appendChild(row);
  chatMessages.scrollTop = chatMessages.scrollHeight;
}

function hideTyping() {
  const typing = document.getElementById('typing-indicator');
  if (typing) typing.remove();
}

function saveMessage(text, sender) {
  const history = JSON.parse(localStorage.getItem('chatHistory') || '[]');
  history.push({ text, sender });
  localStorage.setItem('chatHistory', JSON.stringify(history));
}

function loadHistory() {
  const history = JSON.parse(localStorage.getItem('chatHistory') || '[]');
  if (history.length === 0) {
    addMessage('Namaste! Main aapka college assistant hoon. Kaise madad karu?', 'bot');
  } else {
    history.forEach(msg => addMessage(msg.text, msg.sender, false));
  }
}

sendBtn.addEventListener('click', () => {
  const text = userInput.value.trim();
  if (text === '') return;
  addMessage(text, 'user');
  userInput.value = '';

  showTyping();

  fetch('/chat', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ message: text })
  })
    .then(res => res.json())
    .then(data => {
      hideTyping();
      addMessage(data.reply, 'bot');
    })
    .catch(() => {
      hideTyping();
      addMessage('Kuch error aa gaya, dobara try karo.', 'bot');
    });
});

userInput.addEventListener('keypress', (e) => {
  if (e.key === 'Enter') sendBtn.click();
});

clearBtn.addEventListener('click', () => {
  localStorage.removeItem('chatHistory');
  chatMessages.innerHTML = '';
  addMessage('Namaste! Main aapka college assistant hoon. Kaise madad karu?', 'bot');
});

loadHistory();