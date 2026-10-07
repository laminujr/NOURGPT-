// ============================================================
// NOURGPT — REAL AI FRONTEND
// BY MUHAMMAD LAMINU
// NOUR OFFICIALS STUDIO
// ============================================================

const APP_CONFIG = {
  appName: "NOURGPT",
  creator: "MUHAMMAD LAMINU",
  studio: "NOUR OFFICIALS STUDIO",
  version: "2.0.0",

  // KEEPING YOUR REAL LIVE BACKEND
  backendUrl: "https://nourgpt-backend.onrender.com"
};

const STORAGE_KEY = "nourgpt_chat_history";

let messages = [];
let isGenerating = false;

// ============================================================
// DOM ELEMENTS
// ============================================================

const messagesContainer =
  document.getElementById("messages");

const messageInput =
  document.getElementById("messageInput");

const sendButton =
  document.getElementById("sendBtn");

const typingIndicator =
  document.getElementById("typing");

const welcomeScreen =
  document.getElementById("welcome");

const newChatButton =
  document.getElementById("newChatBtn");

const menuButton =
  document.getElementById("menuBtn");

const profileButton =
  document.getElementById("profileBtn");

const profilePanel =
  document.getElementById("profilePanel");

const overlay =
  document.getElementById("overlay");

const chatForm =
  document.getElementById("chatForm");

const promptCards =
  document.querySelectorAll(".prompt-card");

// ============================================================
// INITIALIZE
// ============================================================

document.addEventListener("DOMContentLoaded", () => {
  initializeApp();
});

function initializeApp() {

  loadMessages();

  setupEvents();

  updateSendButton();

  autoResizeTextarea();

  console.log("======================================");
  console.log("NOURGPT FRONTEND");
  console.log("Creator:", APP_CONFIG.creator);
  console.log("Studio:", APP_CONFIG.studio);
  console.log("Backend:", APP_CONFIG.backendUrl);
  console.log("Version:", APP_CONFIG.version);
  console.log("Status: READY");
  console.log("======================================");
}

// ============================================================
// EVENTS
// ============================================================

function setupEvents() {

  // ----------------------------------------------------------
  // CHAT FORM
  // ----------------------------------------------------------

  if (chatForm) {

    chatForm.addEventListener(
      "submit",
      (event) => {

        event.preventDefault();

        sendMessage();

      }
    );

  }

  // ----------------------------------------------------------
  // SEND BUTTON
  // ----------------------------------------------------------

  if (sendButton) {

    sendButton.addEventListener(
      "click",
      (event) => {

        event.preventDefault();

        sendMessage();

      }
    );

  }

  // ----------------------------------------------------------
  // MESSAGE INPUT
  // ----------------------------------------------------------

  if (messageInput) {

    messageInput.addEventListener(
      "keydown",
      (event) => {

        if (
          event.key === "Enter" &&
          !event.shiftKey
        ) {

          event.preventDefault();

          sendMessage();

        }

      }
    );

    messageInput.addEventListener(
      "input",
      () => {

        autoResizeTextarea();

        updateSendButton();

      }
    );

  }

  // ----------------------------------------------------------
  // NEW CHAT
  // ----------------------------------------------------------

  if (newChatButton) {

    newChatButton.addEventListener(
      "click",
      () => {

        startNewChat();

        closeMobileSidebar();

        closeProfile();

      }
    );

  }

  // ----------------------------------------------------------
  // MOBILE MENU
  // ----------------------------------------------------------

  if (menuButton) {

    menuButton.addEventListener(
      "click",
      () => {

        openMobileSidebar();

      }
    );

  }

  // ----------------------------------------------------------
  // OVERLAY
  // ----------------------------------------------------------

  if (overlay) {

    overlay.addEventListener(
      "click",
      () => {

        closeMobileSidebar();

        closeProfile();

      }
    );

  }

  // ----------------------------------------------------------
  // PROFILE BUTTON
  // ----------------------------------------------------------

  if (profileButton) {

    profileButton.addEventListener(
      "click",
      () => {

        toggleProfile();

      }
    );

  }

  // ----------------------------------------------------------
  // PROMPT CARDS
  // ----------------------------------------------------------

  promptCards.forEach((card) => {

    card.addEventListener(
      "click",
      () => {

        const prompt =
          card.dataset.prompt ||
          "";

        if (!prompt) {
          return;
        }

        if (!messageInput) {
          return;
        }

        messageInput.value =
          prompt;

        autoResizeTextarea();

        updateSendButton();

        messageInput.focus();

      }
    );

  });

  // ----------------------------------------------------------
  // ESC KEY
  // ----------------------------------------------------------

  document.addEventListener(
    "keydown",
    (event) => {

      if (event.key === "Escape") {

        closeMobileSidebar();

        closeProfile();

      }

    }
  );

  // ----------------------------------------------------------
  // WINDOW RESIZE
  // ----------------------------------------------------------

  window.addEventListener(
    "resize",
    () => {

      autoResizeTextarea();

    }
  );

}

// ============================================================
// SEND MESSAGE
// ============================================================

async function sendMessage() {

  if (isGenerating) {
    return;
  }

  if (!messageInput) {
    return;
  }

  const text =
    messageInput.value.trim();

  if (!text) {
    return;
  }

  isGenerating = true;

  updateSendButton();

  // Hide welcome screen
  if (welcomeScreen) {

    welcomeScreen.classList.add(
      "hidden"
    );

    welcomeScreen.style.display =
      "none";

  }

  // Add user message
  addMessage(
    "user",
    text
  );

  // Clear input
  messageInput.value = "";

  autoResizeTextarea();

  updateSendButton();

  // Show typing
  showTyping();

  try {

    const answer =
      await askNourGPT(text);

    hideTyping();

    addMessage(
      "assistant",
      answer
    );

  } catch (error) {

    console.error(
      "NOURGPT REQUEST ERROR:",
      error
    );

    hideTyping();

    addMessage(
      "assistant",
      `⚠️ **NOURGPT CONNECTION ERROR**

${error.message}

Please check your internet connection and try again.`
    );

  } finally {

    isGenerating = false;

    updateSendButton();

  }

}

// ============================================================
// CONNECT TO LIVE RENDER BACKEND
// ============================================================

async function askNourGPT(message) {

  const endpoint =
    `${APP_CONFIG.backendUrl}/api/chat`;

  console.log(
    "NOURGPT → Sending request:",
    endpoint
  );

  const controller =
    new AbortController();

  const timeout =
    setTimeout(
      () => {

        controller.abort();

      },
      120000
    );

  try {

    const response =
      await fetch(
        endpoint,
        {
          method: "POST",

          headers: {
            "Content-Type": "application/json",
            "Accept": "application/json"
          },

          body: JSON.stringify({

            message: message,

            history:
              messages
                .slice(-20)
                .map(
                  (item) => ({
                    role: item.role,
                    content: item.content
                  })
                )

          }),

          signal:
            controller.signal

        }
      );

    clearTimeout(timeout);

    console.log(
      "NOURGPT ← HTTP:",
      response.status
    );

    const contentType =
      response.headers.get(
        "content-type"
      ) || "";

    let data;

    // --------------------------------------------------------
    // JSON RESPONSE
    // --------------------------------------------------------

    if (
      contentType.includes(
        "application/json"
      )
    ) {

      data =
        await response.json();

    }

    // --------------------------------------------------------
    // NON-JSON RESPONSE
    // --------------------------------------------------------

    else {

      const responseText =
        await response.text();

      throw new Error(
        `Backend returned an unexpected response: ${responseText.slice(0, 200)}`
      );

    }

    // --------------------------------------------------------
    // HTTP ERROR
    // --------------------------------------------------------

    if (!response.ok) {

      throw new Error(
        data.error ||
        `Backend error: HTTP ${response.status}`
      );

    }

    // --------------------------------------------------------
    // BACKEND SUCCESS CHECK
    // --------------------------------------------------------

    if (!data.success) {

      throw new Error(
        data.error ||
        "NOURGPT could not generate a response."
      );

    }

    // --------------------------------------------------------
    // ANSWER CHECK
    // --------------------------------------------------------

    if (
      !data.answer ||
      typeof data.answer !== "string"
    ) {

      throw new Error(
        "The AI backend returned no answer."
      );

    }

    console.log(
      "NOURGPT ← Answer received successfully."
    );

    return data.answer;

  } catch (error) {

    clearTimeout(timeout);

    // --------------------------------------------------------
    // TIMEOUT
    // --------------------------------------------------------

    if (
      error.name === "AbortError"
    ) {

      throw new Error(
        "The AI request took too long. Render may be waking up. Please try again."
      );

    }

    // --------------------------------------------------------
    // NETWORK ERROR
    // --------------------------------------------------------

    if (
      error instanceof TypeError
    ) {

      throw new Error(
        "NOURGPT could not reach the backend. Check your internet connection and make sure the Render backend is online."
      );

    }

    throw error;

  }

}

// ============================================================
// ADD MESSAGE
// ============================================================

function addMessage(
  role,
  content
) {

  const message = {

    role: role,

    content: content,

    timestamp: Date.now()

  };

  messages.push(message);

  renderMessage(message);

  saveMessages();

  scrollToBottom();

}

// ============================================================
// RENDER MESSAGE
// ============================================================

function renderMessage(message) {

  if (!messagesContainer) {
    return;
  }

  const messageElement =
    document.createElement("div");

  messageElement.className =
    `message ${message.role === "user" ? "user-message" : "assistant-message"}`;

  // ----------------------------------------------------------
  // AVATAR
  // ----------------------------------------------------------

  const avatar =
    document.createElement("div");

  avatar.className =
    "message-avatar";

  if (
    message.role === "user"
  ) {

    avatar.classList.add(
      "user-avatar"
    );

    avatar.textContent =
      "M";

  } else {

    avatar.classList.add(
      "ai-avatar"
    );

    avatar.textContent =
      "N";

  }

  // ----------------------------------------------------------
  // BODY
  // ----------------------------------------------------------

  const body =
    document.createElement("div");

  body.className =
    "message-body";

  // ----------------------------------------------------------
  // NAME
  // ----------------------------------------------------------

  const name =
    document.createElement("div");

  name.className =
    "message-name";

  name.textContent =
    message.role === "user"
      ? "You"
      : "NOURGPT";

  // ----------------------------------------------------------
  // CONTENT
  // ----------------------------------------------------------

  const content =
    document.createElement("div");

  content.className =
    "message-text";

  content.innerHTML =
    formatMessage(
      message.content
    );

  // ----------------------------------------------------------
  // APPEND
  // ----------------------------------------------------------

  body.appendChild(
    name
  );

  body.appendChild(
    content
  );

  messageElement.appendChild(
    avatar
  );

  messageElement.appendChild(
    body
  );

  messagesContainer.appendChild(
    messageElement
  );

}

// ============================================================
// FORMAT AI MESSAGE
// ============================================================

function formatMessage(text) {

  if (!text) {
    return "";
  }

  let safeText =
    escapeHTML(text);

  // ----------------------------------------------------------
  // CODE BLOCKS
  // ----------------------------------------------------------

  safeText =
    safeText.replace(
      /```(?:[a-zA-Z0-9_-]+)?\n?([\s\S]*?)```/g,
      (match, code) => {

        return `
          <pre class="code-block">
            <code>${code.trim()}</code>
          </pre>
        `;

      }
    );

  // ----------------------------------------------------------
  // INLINE CODE
  // ----------------------------------------------------------

  safeText =
    safeText.replace(
      /`([^`]+)`/g,
      "<code>$1</code>"
    );

  // ----------------------------------------------------------
  // BOLD
  // ----------------------------------------------------------

  safeText =
    safeText.replace(
      /\*\*(.*?)\*\*/g,
      "<strong>$1</strong>"
    );

  // ----------------------------------------------------------
  // HEADINGS
  // ----------------------------------------------------------

  safeText =
    safeText.replace(
      /^### (.*)$/gm,
      "<h4>$1</h4>"
    );

  safeText =
    safeText.replace(
      /^## (.*)$/gm,
      "<h3>$1</h3>"
    );

  safeText =
    safeText.replace(
      /^# (.*)$/gm,
      "<h2>$1</h2>"
    );

  // ----------------------------------------------------------
  // BULLET LISTS
  // ----------------------------------------------------------

  safeText =
    safeText.replace(
      /^[•*-] (.*)$/gm,
      "<li>$1</li>"
    );

  // ----------------------------------------------------------
  // NUMBERED LISTS
  // ----------------------------------------------------------

  safeText =
    safeText.replace(
      /^\d+\. (.*)$/gm,
      "<li>$1</li>"
    );

  // ----------------------------------------------------------
  // LINE BREAKS
  // ----------------------------------------------------------

  safeText =
    safeText.replace(
      /\n/g,
      "<br>"
    );

  return safeText;

}

// ============================================================
// ESCAPE HTML
// ============================================================

function escapeHTML(text) {

  const div =
    document.createElement(
      "div"
    );

  div.textContent =
    text;

  return div.innerHTML;

}

// ============================================================
// TYPING INDICATOR
// ============================================================

function showTyping() {

  if (!typingIndicator) {
    return;
  }

  typingIndicator.classList.add(
    "active"
  );

  typingIndicator.setAttribute(
    "aria-hidden",
    "false"
  );

  scrollToBottom();

}

function hideTyping() {

  if (!typingIndicator) {
    return;
  }

  typingIndicator.classList.remove(
    "active"
  );

  typingIndicator.setAttribute(
    "aria-hidden",
    "true"
  );

}

// ============================================================
// SAVE CHAT HISTORY
// ============================================================

function saveMessages() {

  try {

    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify(messages)
    );

  } catch (error) {

    console.error(
      "NOURGPT history save error:",
      error
    );

  }

}

// ============================================================
// LOAD CHAT HISTORY
// ============================================================

function loadMessages() {

  try {

    const saved =
      localStorage.getItem(
        STORAGE_KEY
      );

    if (!saved) {
      return;
    }

    const parsed =
      JSON.parse(saved);

    if (!Array.isArray(parsed)) {
      return;
    }

    messages =
      parsed.filter(
        (item) =>
          item &&
          typeof item.role === "string" &&
          typeof item.content === "string"
      );

    if (
      messages.length === 0
    ) {
      return;
    }

    if (welcomeScreen) {

      welcomeScreen.style.display =
        "none";

    }

    if (messagesContainer) {

      messagesContainer.innerHTML =
        "";

      messages.forEach(
        (message) => {

          renderMessage(
            message
          );

        }
      );

    }

    scrollToBottom();

  } catch (error) {

    console.error(
      "NOURGPT history load error:",
      error
    );

    messages = [];

  }

}

// ============================================================
// NEW CHAT
// ============================================================

function startNewChat() {

  messages = [];

  try {

    localStorage.removeItem(
      STORAGE_KEY
    );

  } catch (error) {

    console.error(
      "Could not clear local history:",
      error
    );

  }

  if (messagesContainer) {

    messagesContainer.innerHTML =
      "";

  }

  if (welcomeScreen) {

    welcomeScreen.classList.remove(
      "hidden"
    );

    welcomeScreen.style.display =
      "";

  }

  if (messageInput) {

    messageInput.value =
      "";

    messageInput.focus();

  }

  hideTyping();

  autoResizeTextarea();

  updateSendButton();

}

// ============================================================
// TEXTAREA
// ============================================================

function autoResizeTextarea() {

  if (!messageInput) {
    return;
  }

  messageInput.style.height =
    "auto";

  messageInput.style.height =
    Math.min(
      messageInput.scrollHeight,
      180
    ) + "px";

}

// ============================================================
// SEND BUTTON STATE
// ============================================================

function updateSendButton() {

  if (
    !sendButton ||
    !messageInput
  ) {
    return;
  }

  const hasText =
    messageInput.value.trim().length > 0;

  sendButton.disabled =
    !hasText ||
    isGenerating;

  sendButton.setAttribute(
    "aria-disabled",
    String(
      sendButton.disabled
    )
  );

}

// ============================================================
// SCROLL CHAT
// ============================================================

function scrollToBottom() {

  requestAnimationFrame(
    () => {

      if (!messagesContainer) {
        return;
      }

      messagesContainer.scrollTo({

        top:
          messagesContainer.scrollHeight,

        behavior:
          "smooth"

      });

    }
  );

}

// ============================================================
// MOBILE SIDEBAR
// ============================================================

function openMobileSidebar() {

  if (sidebar) {

    sidebar.classList.add(
      "open"
    );

  }

  if (overlay) {

    overlay.classList.add(
      "active"
    );

  }

}

function closeMobileSidebar() {

  if (sidebar) {

    sidebar.classList.remove(
      "open"
    );

  }

  if (overlay) {

    overlay.classList.remove(
      "active"
    );

  }

}

// ============================================================
// PROFILE PANEL
// ============================================================

function toggleProfile() {

  if (!profilePanel) {
    return;
  }

  const isOpen =
    profilePanel.classList.contains(
      "open"
    );

  if (isOpen) {

    closeProfile();

  } else {

    openProfile();

  }

}

function openProfile() {

  if (profilePanel) {

    profilePanel.classList.add(
      "open"
    );

  }

  if (overlay) {

    overlay.classList.add(
      "active"
    );

  }

}

function closeProfile() {

  if (profilePanel) {

    profilePanel.classList.remove(
      "open"
    );

  }

  if (
    !sidebar ||
    !sidebar.classList.contains("open")
  ) {

    if (overlay) {

      overlay.classList.remove(
        "active"
      );

    }

  }

}

// ============================================================
// SERVICE WORKER
// ============================================================

if (
  "serviceWorker" in navigator
) {

  window.addEventListener(
    "load",
    () => {

      navigator.serviceWorker
        .register("./sw.js")
        .then(
          (registration) => {

            console.log(
              "NOURGPT service worker registered:",
              registration.scope
            );

          }
        )
        .catch(
          (error) => {

            console.error(
              "Service worker registration failed:",
              error
            );

          }
        );

    }
  );

}

// ============================================================
// GLOBAL ERROR HANDLER
// ============================================================

window.addEventListener(
  "error",
  (event) => {

    console.error(
      "NOURGPT application error:",
      event.error || event.message
    );

  }
);

// ============================================================
// UNHANDLED PROMISE HANDLER
// ============================================================

window.addEventListener(
  "unhandledrejection",
  (event) => {

    console.error(
      "NOURGPT unhandled promise error:",
      event.reason
    );

  }
);

// ============================================================
// NOURGPT READY
// ============================================================

console.log(
  "NOURGPT 2.0 frontend loaded — Muhammad Laminu"
);