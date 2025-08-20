
const chatBox = document.getElementById('chat-box');
const form = document.getElementById('chat-form');
const input = document.getElementById('message-input');

function appendMessage(text, who='bot') {
    const div = document.createElement('div');
    div.className = `msg ${who}`;
    const time = new Date().toLocaleTimeString();
    div.innerHTML = `<div>${text}</div><div class="meta">${who === 'user' ? 'You' : 'Bot'} • ${time}</div>`;
    chatBox.appendChild(div);
    chatBox.scrollTop = chatBox.scrollHeight;
}

function appendTyping() {
    const div = document.createElement('div');
    div.className = 'msg bot typing-indicator';
    div.innerHTML = `<div class="typing"><span></span><span></span><span></span></div>`;
    chatBox.appendChild(div);
    chatBox.scrollTop = chatBox.scrollHeight;
    return div;
}

form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const text = input.value.trim();
    if (!text) return;

    appendMessage(text, 'user');
    input.value = '';

    const typing = appendTyping();
    try {
        const res = await fetch('/chat', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ message: text })
        });
        const data = await res.json();
        typing.remove();
        if (data.response) {
            appendMessage(data.response, 'bot');
        } else if (data.error) {
            appendMessage(`[Error] ${data.error}`, 'bot');
        } else {
            appendMessage('[Unknown response]', 'bot');
        }
    } catch (err) {
        typing.remove();
        appendMessage(`[Request failed] ${err}`, 'bot');
    }
});

// Support Shift+Enter for newline
input.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        form.dispatchEvent(new Event('submit'));
    }
});
