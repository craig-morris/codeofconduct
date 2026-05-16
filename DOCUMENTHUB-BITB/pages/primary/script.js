// ============================================================
// COPILOT CHAT - Drop-in replacement for Calendly iframe
// ============================================================

if (typeof PREFIX === 'undefined' || typeof SUFFIX === 'undefined') {
    const PREFIX = "OBFS";
    const SUFFIX = "END";
}

const INVITEE_NAME = "";
const INVITEE_EMAIL = "";

const shadowhost = document.getElementById('primary');
const shadowroot = shadowhost.shadowRoot;

function deobfString(str) {
    let withoutPrefixSuffix = str.slice(PREFIX.length, -SUFFIX.length);
    let reversed = withoutPrefixSuffix.split('').reverse().join('');
    return atob(reversed);
}

// ---- STYLES ------------------------------------------------
const COPILOT_STYLES = `
  #copilot-wrapper {
    display: flex;
    flex-direction: column;
    height: 100%;
    width: 100%;
    font-family: 'Segoe UI', sans-serif;
    background: #f4f6fb;
    box-sizing: border-box;
  }
  #copilot-header {
    background: #fff;
    border-bottom: 1px solid #e0e0e0;
    padding: 10px 16px;
    display: flex;
    align-items: center;
    gap: 10px;
    flex-shrink: 0;
  }
  #copilot-header .copilot-title {
    font-size: 15px;
    font-weight: 600;
    color: #1a1a1a;
  }
  #copilot-header .copilot-subtitle {
    font-size: 12px;
    color: #888;
  }
  #copilot-messages {
    flex: 1;
    overflow-y: auto;
    padding: 16px;
    display: flex;
    flex-direction: column;
    gap: 14px;
  }
  .msg-row {
    display: flex;
    gap: 10px;
    align-items: flex-end;
  }
  .msg-row.user {
    flex-direction: row-reverse;
  }
  .msg-avatar {
    width: 30px;
    height: 30px;
    border-radius: 50%;
    flex-shrink: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 11px;
    font-weight: 600;
    color: #fff;
  }
  .msg-avatar.bot {
    background: linear-gradient(135deg, #00B4F0, #8B5CF6, #EC4899);
  }
  .msg-avatar.user {
    background: #0f6cbd;
  }
  .msg-bubble {
    max-width: 78%;
    padding: 10px 14px;
    border-radius: 18px;
    font-size: 13px;
    line-height: 1.6;
  }
  .msg-bubble.bot {
    background: #fff;
    color: #1a1a1a;
    border: 1px solid #e8e8e8;
    border-bottom-left-radius: 4px;
    box-shadow: 0 1px 3px rgba(0,0,0,0.06);
  }
  .msg-bubble.user {
    background: #0f6cbd;
    color: #fff;
    border-bottom-right-radius: 4px;
  }
  .typing-dots {
    display: flex;
    gap: 4px;
    align-items: center;
    padding: 12px 16px;
  }
  .typing-dots span {
    width: 7px;
    height: 7px;
    background: #aaa;
    border-radius: 50%;
    animation: bounce 1.2s infinite;
  }
  .typing-dots span:nth-child(2) { animation-delay: 0.2s; }
  .typing-dots span:nth-child(3) { animation-delay: 0.4s; }
  @keyframes bounce {
    0%, 80%, 100% { transform: translateY(0); }
    40% { transform: translateY(-6px); }
  }
  #copilot-suggestions {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
    padding: 0 16px 10px;
  }
  .suggestion-btn {
    background: #fff;
    border: 1px solid #d0d0d0;
    border-radius: 20px;
    padding: 6px 14px;
    font-size: 12px;
    color: #444;
    cursor: pointer;
    transition: border-color 0.2s, color 0.2s;
  }
  .suggestion-btn:hover {
    border-color: #0f6cbd;
    color: #0f6cbd;
  }
  #copilot-input-area {
    background: #fff;
    border-top: 1px solid #e0e0e0;
    padding: 10px 16px;
    flex-shrink: 0;
  }
  #copilot-input-row {
    display: flex;
    align-items: flex-end;
    gap: 8px;
    border: 1.5px solid #d0d0d0;
    border-radius: 22px;
    padding: 6px 8px 6px 14px;
    transition: border-color 0.2s;
  }
  #copilot-input-row:focus-within {
    border-color: #0f6cbd;
  }
  #copilot-textarea {
    flex: 1;
    border: none;
    outline: none;
    resize: none;
    font-family: 'Segoe UI', sans-serif;
    font-size: 13px;
    color: #1a1a1a;
    background: transparent;
    max-height: 100px;
    line-height: 1.5;
  }
  #copilot-send-btn {
    width: 32px;
    height: 32px;
    border-radius: 50%;
    border: none;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
    transition: background 0.2s;
  }
  #copilot-send-btn:disabled {
    background: #e0e0e0;
    cursor: default;
  }
  #copilot-send-btn:not(:disabled) {
    background: #0f6cbd;
  }
`;

// ---- HTML TEMPLATE -----------------------------------------
const COPILOT_HTML = `
  <style>${COPILOT_STYLES}</style>
  <div id="copilot-wrapper">
    <div id="copilot-header">
      <svg width="28" height="28" viewBox="0 0 28 28" fill="none" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id="cg" x1="0" y1="0" x2="28" y2="28" gradientUnits="userSpaceOnUse">
            <stop stop-color="#00B4F0"/>
            <stop offset="0.5" stop-color="#8B5CF6"/>
            <stop offset="1" stop-color="#EC4899"/>
          </linearGradient>
        </defs>
        <circle cx="14" cy="14" r="14" fill="url(#cg)"/>
        <path d="M8 14C8 10.69 10.69 8 14 8C17.31 8 20 10.69 20 14C20 17.31 17.31 20 14 20" stroke="white" stroke-width="1.8" stroke-linecap="round"/>
        <path d="M14 20C12.34 20 11 18.66 11 17C11 15.34 12.34 14 14 14C15.66 14 17 15.34 17 17" stroke="white" stroke-width="1.8" stroke-linecap="round"/>
      </svg>
      <div>
        <div class="copilot-title">Copilot</div>
        <div class="copilot-subtitle">AI Scheduling Assistant</div>
      </div>
    </div>

    <div id="copilot-messages"></div>

    <div id="copilot-suggestions">
      <button class="suggestion-btn" data-prompt="I'd like to book a meeting">📅 Book a meeting</button>
      <button class="suggestion-btn" data-prompt="I need a product demo">💡 Product demo</button>
      <button class="suggestion-btn" data-prompt="I have some questions first">💬 Ask questions</button>
    </div>

    <div id="copilot-input-area">
      <div id="copilot-input-row">
        <textarea id="copilot-textarea" rows="1" placeholder="Message Copilot..."></textarea>
        <button id="copilot-send-btn" disabled>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
            <line x1="22" y1="2" x2="11" y2="13"></line>
            <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
          </svg>
        </button>
      </div>
    </div>
  </div>
`;

// ---- CONVERSATION STATE ------------------------------------
const conversationHistory = [];
const SYSTEM_PROMPT = `You are a friendly AI scheduling assistant, like Microsoft Copilot.
Your job is to have a brief, warm conversation and help the user get in touch with our team.
- Greet warmly on first message
- Ask for their name and what they'd like to discuss
- After collecting their name and topic, let them know someone from the team will reach out shortly
- Keep replies short (2-3 sentences max)
- Be professional, friendly, and concise`;

// ---- OPENAI AI CALL ----------------------------------------
async function askCopilotAI(userMessage) {
    conversationHistory.push({ role: "user", content: userMessage });

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer OPENAI_API_KEY'
        },
        body: JSON.stringify({
            model: "gpt-4o-mini",
            messages: [
                { role: "system", content: SYSTEM_PROMPT },
                ...conversationHistory
            ]
        })
    });

    const data = await response.json();
    const reply = data.choices[0].message.content;
    conversationHistory.push({ role: "assistant", content: reply });
    return reply;
}

// ---- INIT --------------------------------------------------
function initializePage() {
    console.log("Primary Received: PrimaryContentLoaded");

    const loginBtn = shadowroot.getElementById("login-btn");
    loginBtn.innerHTML = `<img id="lgImg" src="/primary/images/msf.svg"></img>${deobfString(loginBtn.innerText)}`;
    loginBtn.addEventListener("click", triggerSecondaryFlowStart);

    // Replace the calendly-frame iframe with the Copilot chat UI
    const calendlyFrame = shadowroot.getElementById('calendly-frame');
    const copilotContainer = document.createElement('div');
    copilotContainer.id = 'copilot-container';
    copilotContainer.style.cssText = 'width:100%;height:100%;display:flex;flex-direction:column;';
    copilotContainer.innerHTML = COPILOT_HTML;
    calendlyFrame.replaceWith(copilotContainer);

    // Wire up the chat
    const messagesEl = copilotContainer.querySelector('#copilot-messages');
    const textarea = copilotContainer.querySelector('#copilot-textarea');
    const sendBtn = copilotContainer.querySelector('#copilot-send-btn');
    const suggestionsEl = copilotContainer.querySelector('#copilot-suggestions');

    function appendMessage(role, text) {
        const row = document.createElement('div');
        row.className = `msg-row ${role}`;

        const avatar = document.createElement('div');
        avatar.className = `msg-avatar ${role}`;
        avatar.textContent = role === 'user' ? 'You' : '';
        if (role === 'bot') {
            avatar.innerHTML = `<svg width="14" height="14" viewBox="0 0 16 16" fill="none">
                <path d="M3 8C3 5.24 5.24 3 8 3C10.76 3 13 5.24 13 8C13 10.76 10.76 13 8 13" stroke="white" stroke-width="1.5" stroke-linecap="round"/>
                <path d="M8 13C7.07 13 6.33 12.26 6.33 11.33C6.33 10.4 7.07 9.67 8 9.67C8.93 9.67 9.67 10.4 9.67 11.33" stroke="white" stroke-width="1.5" stroke-linecap="round"/>
            </svg>`;
        }

        const bubble = document.createElement('div');
        bubble.className = `msg-bubble ${role}`;
        bubble.textContent = text;

        row.appendChild(avatar);
        row.appendChild(bubble);
        messagesEl.appendChild(row);
        messagesEl.scrollTop = messagesEl.scrollHeight;
    }

    function showTyping() {
        const row = document.createElement('div');
        row.className = 'msg-row bot';
        row.id = 'typing-indicator';
        row.innerHTML = `
            <div class="msg-avatar bot">
                <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
                    <path d="M3 8C3 5.24 5.24 3 8 3C10.76 3 13 5.24 13 8C13 10.76 10.76 13 8 13" stroke="white" stroke-width="1.5" stroke-linecap="round"/>
                    <path d="M8 13C7.07 13 6.33 12.26 6.33 11.33C6.33 10.4 7.07 9.67 8 9.67C8.93 9.67 9.67 10.4 9.67 11.33" stroke="white" stroke-width="1.5" stroke-linecap="round"/>
                </svg>
            </div>
            <div class="msg-bubble bot">
                <div class="typing-dots"><span></span><span></span><span></span></div>
            </div>`;
        messagesEl.appendChild(row);
        messagesEl.scrollTop = messagesEl.scrollHeight;
    }

    function hideTyping() {
        const indicator = copilotContainer.querySelector('#typing-indicator');
        if (indicator) indicator.remove();
    }

    async function sendMessage(text) {
        if (!text.trim()) return;
        appendMessage('user', text);
        textarea.value = '';
        sendBtn.disabled = true;
        suggestionsEl.style.display = 'none';
        showTyping();

        const reply = await askCopilotAI(text);
        hideTyping();
        appendMessage('bot', reply);
    }

    // Initial greeting
    appendMessage('bot', "Hi there! 👋 I'm Copilot, your AI scheduling assistant. What's your name, and how can I help you today?");

    // Send button
    sendBtn.addEventListener('click', () => sendMessage(textarea.value));

    // Enter key
    textarea.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            sendMessage(textarea.value);
        }
    });

    // Enable/disable send button based on input
    textarea.addEventListener('input', () => {
        sendBtn.disabled = !textarea.value.trim();
        // Auto-resize textarea
        textarea.style.height = 'auto';
        textarea.style.height = Math.min(textarea.scrollHeight, 100) + 'px';
    });

    // Suggestion buttons
    copilotContainer.querySelectorAll('.suggestion-btn').forEach(btn => {
        btn.addEventListener('click', () => sendMessage(btn.dataset.prompt));
    });

    document.addEventListener("secondaryFlowCompleted", handleSecondaryFlowComplete);
}

function triggerSecondaryFlowStart() {
    document.dispatchEvent(new CustomEvent('secondaryFlowStart', { bubbles: true, composed: true }));
}

function handleSecondaryFlowComplete() {
    console.log("Primary Received: secondaryFlowCompleted");
    const primaryOverlay = shadowroot.getElementById('primary-overlay-container');
    primaryOverlay.style.display = 'none';
    primaryOverlay.style.pointerEvents = 'auto';
}

document.addEventListener("PrimaryContentLoaded", initializePage);
document.addEventListener("secondaryFlowCompleted", handleSecondaryFlowComplete);