/**
 * WanderLux AI - Main Application Coordinator
 */

document.addEventListener('DOMContentLoaded', () => {
    // ─── State Management ─────────────────────────────────────────────
    const AppState = {
        currentDestination: 'Kyoto',
        chatHistory: [],
        activeTab: 'discovery'
    };

    // ─── UI Selectors ─────────────────────────────────────────────────
    const elements = {
        // Navigation & Modals
        navKeyBtn: document.getElementById('nav-key-btn'),
        modalOverlay: document.getElementById('modal-overlay'),
        modalClose: document.getElementById('modal-close'),
        modalSave: document.getElementById('modal-save'),
        apiKeyInput: document.getElementById('api-key-input'),
        apiBadge: document.getElementById('api-badge'),

        // Discovery Search
        searchQuery: document.getElementById('search-query'),
        searchPref: document.getElementById('search-pref'),
        searchDuration: document.getElementById('search-duration'),
        searchCountry: document.getElementById('search-country'),
        searchBtn: document.getElementById('search-btn'),
        discoveryGrid: document.getElementById('discovery-grid'),

        // Detail Context Panels
        contextTitle: document.getElementById('current-context-title'),
        gemsGrid: document.getElementById('gems-grid'),
        storyContainer: document.getElementById('story-container'),
        heritageContainer: document.getElementById('heritage-container'),
        eventsGrid: document.getElementById('events-grid'),
        experiencesGrid: document.getElementById('experiences-grid'),
        deepDiveContainer: document.getElementById('deep-dive-container'),

        // Immersive Story Controller
        storyStyleSelect: document.getElementById('story-style-select'),
        storyGenerateBtn: document.getElementById('story-generate-btn'),

        // Chat Widget
        chatToggleBtn: document.getElementById('chat-toggle-btn'),
        chatPanel: document.getElementById('chat-panel'),
        chatCloseBtn: document.getElementById('chat-close-btn'),
        chatMessages: document.getElementById('chat-messages'),
        chatInput: document.getElementById('chat-input'),
        chatSendBtn: document.getElementById('chat-send-btn')
    };

    // Initialize Animations
    if (window.WanderLuxAnims) {
        window.WanderLuxAnims.initParticles();
        window.WanderLuxAnims.initScrollReveal();
    }

    // Check localStorage for existing API key
    if (window.WanderTravelAPI.apiKey) {
        elements.apiKeyInput.value = window.WanderTravelAPI.apiKey;
        updateApiBadge(true);
    } else {
        updateApiBadge(false);
    }

    // ─── Event Handlers: Modals ───────────────────────────────────────
    elements.navKeyBtn.addEventListener('click', () => {
        elements.modalOverlay.classList.add('active');
    });

    elements.modalClose.addEventListener('click', () => {
        elements.modalOverlay.classList.remove('active');
    });

    elements.modalSave.addEventListener('click', () => {
        const key = elements.apiKeyInput.value.trim();
        window.WanderTravelAPI.setApiKey(key);
        elements.modalOverlay.classList.remove('active');
        updateApiBadge(!!key);
        window.WanderLuxAnims.showToast(key ? "Gemini API key successfully saved!" : "API key cleared. Running in offline mock mode.", "success");
    });

    function updateApiBadge(hasKey) {
        if (hasKey) {
            elements.apiBadge.innerHTML = '⚡ Connected';
            elements.apiBadge.style.color = 'var(--emerald)';
            elements.apiBadge.style.background = 'rgba(52,211,153,0.12)';
            elements.apiBadge.style.borderColor = 'var(--emerald)';
            window.WanderTravelAPI.useMock = false;
        } else {
            elements.apiBadge.innerHTML = '🔌 Demo / Mock Mode';
            elements.apiBadge.style.color = 'var(--gold)';
            elements.apiBadge.style.background = 'rgba(245,200,66,0.1)';
            elements.apiBadge.style.borderColor = 'var(--gold)';
            window.WanderTravelAPI.useMock = true;
        }
    }

    // ─── Event Handlers: Tags Quick Search ────────────────────────────
    document.querySelectorAll('.tag').forEach(tag => {
        tag.addEventListener('click', () => {
            elements.searchQuery.value = tag.dataset.query || tag.innerText;
            triggerDiscovery();
        });
    });

    // ─── Destination Discovery Trigger ────────────────────────────────
    elements.searchBtn.addEventListener('click', triggerDiscovery);
    elements.searchQuery.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') triggerDiscovery();
    });

    async function triggerDiscovery() {
        const query = elements.searchQuery.value.trim();
        if (!query) {
            window.WanderLuxAnims.showToast("Please enter keywords or interest first!", "error");
            return;
        }

        window.WanderLuxUI.renderSkeletonGrid('discovery-grid', 4);
        window.location.hash = "#discovery"; // Jump to section

        try {
            const res = await window.WanderTravelAPI.discoverDestinations(
                query,
                elements.searchPref.value,
                elements.searchDuration.value,
                elements.searchCountry.value.trim()
            );

            if (res.success && res.data.destinations) {
                window.WanderLuxUI.renderDestinations('discovery-grid', res.data.destinations, loadDestinationContext);
                window.WanderLuxAnims.showToast("Personalized recommendations generated!", "success");
            } else {
                throw new Error("Invalid response format");
            }
        } catch (err) {
            console.error(err);
            window.WanderLuxAnims.showToast(err.message || "Failed to load destinations", "error");
            window.WanderLuxUI.renderEmpty('discovery-grid', "Unable to discover destinations", "Please check your network or try again.");
        }
    }

    // ─── Load Destination Cultural Context ────────────────────────────
    async function loadDestinationContext(destinationName) {
        AppState.currentDestination = destinationName;
        elements.contextTitle.innerText = destinationName;
        window.location.hash = "#culture-context";

        window.WanderLuxAnims.showToast(`Exploring cultural wonders of ${destinationName}!`, "info");

        // Load details concurrently
        loadHiddenGems();
        loadImmersiveStory();
        loadCulturalHeritage();
        loadLocalEvents();
        loadExperiences();
        loadCulturalDeepDive();
    }

    // Feature 2: Hidden Gems
    async function loadHiddenGems() {
        window.WanderLuxUI.renderSkeletonGrid('gems-grid', 4);
        try {
            const res = await window.WanderTravelAPI.getHiddenGems(AppState.currentDestination);
            if (res.success && res.data.gems) {
                window.WanderLuxUI.renderHiddenGems('gems-grid', res.data.gems);
            }
        } catch (e) {
            window.WanderLuxUI.renderEmpty('gems-grid', "No hidden gems revealed", "Something went wrong.");
        }
    }

    // Feature 3: Immersive Storytelling
    elements.storyGenerateBtn.addEventListener('click', loadImmersiveStory);
    async function loadImmersiveStory() {
        const container = elements.storyContainer;
        container.innerHTML = `<div style="text-align: center; padding: 3rem;"><div class="chat-typing" style="margin: 0 auto;"><div class="typing-dot"></div><div class="typing-dot"></div><div class="typing-dot"></div></div><p style="margin-top: 1rem; color: var(--text-muted);">Weaving immersive cultural tale...</p></div>`;
        
        try {
            const style = elements.storyStyleSelect.value;
            const res = await window.WanderTravelAPI.generateStory(AppState.currentDestination, style);
            if (res.success && res.data) {
                window.WanderLuxUI.renderStory('story-container', res.data);
            }
        } catch (e) {
            container.innerHTML = `<div class="empty-state">Unable to compose story right now.</div>`;
        }
    }

    // Feature 4: Heritage Spotlight
    async function loadCulturalHeritage() {
        window.WanderLuxUI.renderSkeletonList('heritage-container', 2);
        try {
            const res = await window.WanderTravelAPI.getHeritage(AppState.currentDestination);
            if (res.success && res.data) {
                window.WanderLuxUI.renderHeritage('heritage-container', res.data);
            }
        } catch (e) {
            elements.heritageContainer.innerHTML = `<div class="empty-state">Heritage spotlight offline.</div>`;
        }
    }

    // Feature 5: Local Events
    async function loadLocalEvents() {
        window.WanderLuxUI.renderSkeletonGrid('events-grid', 3);
        try {
            const res = await window.WanderTravelAPI.suggestEvents(AppState.currentDestination);
            if (res.success && res.data.events) {
                window.WanderLuxUI.renderEvents('events-grid', res.data.events);
            }
        } catch (e) {
            window.WanderLuxUI.renderEmpty('events-grid', "Events timeline unavailable", "");
        }
    }

    // Feature 6: Authentic Experiences
    async function loadExperiences() {
        window.WanderLuxUI.renderSkeletonGrid('experiences-grid', 3);
        try {
            const res = await window.WanderTravelAPI.getExperiences(AppState.currentDestination);
            if (res.success && res.data.experiences) {
                window.WanderLuxUI.renderExperiences('experiences-grid', res.data.experiences);
            }
        } catch (e) {
            window.WanderLuxUI.renderEmpty('experiences-grid', "No local experiences logged", "");
        }
    }

    // Feature 7: Cultural Deep Dive (Customs & Etiquette)
    async function loadCulturalDeepDive() {
        window.WanderLuxUI.renderSkeletonList('deep-dive-container', 2);
        try {
            const res = await window.WanderTravelAPI.getCulturalDeepDive(AppState.currentDestination);
            if (res.success && res.data) {
                window.WanderLuxUI.renderDeepDive('deep-dive-container', res.data);
            }
        } catch (e) {
            elements.deepDiveContainer.innerHTML = `<div class="empty-state">Cultural guide offline.</div>`;
        }
    }

    // ─── AI Chat Panel Widget ──────────────────────────────────────────
    elements.chatToggleBtn.addEventListener('click', () => {
        elements.chatPanel.classList.toggle('open');
        if (elements.chatPanel.classList.contains('open') && AppState.chatHistory.length === 0) {
            // Send initial welcoming message
            triggerGreeting();
        }
    });

    elements.chatCloseBtn.addEventListener('click', () => {
        elements.chatPanel.classList.remove('open');
    });

    elements.chatSendBtn.addEventListener('click', sendChatMessage);
    elements.chatInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            sendChatMessage();
        }
    });

    async function triggerGreeting() {
        appendChatMessage("assistant", `Hello traveler! I am your Wanderlux AI companion. Ask me anything about local history, food, travel rules, or customs in ${AppState.currentDestination}. Let's make this trip unforgettable!`, [
            `Show hidden gems in ${AppState.currentDestination}`,
            `Tell me local dishes to try`
        ]);
    }

    async function sendChatMessage() {
        const text = elements.chatInput.value.trim();
        if (!text) return;

        elements.chatInput.value = '';
        appendChatMessage("user", text);

        // Show typing indicator
        const typingId = appendTypingIndicator();

        try {
            const res = await window.WanderTravelAPI.sendChatMessage(
                text,
                AppState.chatHistory.map(h => ({ role: h.role, content: h.content })),
                AppState.currentDestination
            );

            removeTypingIndicator(typingId);

            if (res.success && res.data) {
                appendChatMessage("assistant", res.data.reply, res.data.suggested_actions);
            }
        } catch (e) {
            removeTypingIndicator(typingId);
            appendChatMessage("assistant", "Apologies, my satellite map is currently experiencing interference. Please try asking again shortly.");
        }
    }

    function appendChatMessage(role, content, suggestions = []) {
        const msgDiv = document.createElement('div');
        msgDiv.className = `chat-message ${role}`;
        
        const avatarEmoji = role === 'user' ? '👤' : '🌍';
        
        let suggestionsHtml = '';
        if (suggestions && suggestions.length > 0) {
            suggestionsHtml = `
                <div class="chat-suggestions">
                    ${suggestions.map(s => `<div class="chat-suggestion">${s}</div>`).join('')}
                </div>
            `;
        }

        msgDiv.innerHTML = `
            <div class="chat-message-avatar">${avatarEmoji}</div>
            <div class="chat-message-content">
                ${content.replace(/\n/g, '<br>')}
                ${suggestionsHtml}
            </div>
        `;

        elements.chatMessages.appendChild(msgDiv);
        elements.chatMessages.scrollTop = elements.chatMessages.scrollHeight;

        // Save to state
        AppState.chatHistory.push({ role, content });

        // Add suggestion listener triggers
        msgDiv.querySelectorAll('.chat-suggestion').forEach(sugg => {
            sugg.addEventListener('click', () => {
                elements.chatInput.value = sugg.innerText;
                sendChatMessage();
            });
        });
    }

    function appendTypingIndicator() {
        const id = 'typing-' + Date.now();
        const msgDiv = document.createElement('div');
        msgDiv.className = 'chat-message assistant';
        msgDiv.id = id;
        msgDiv.innerHTML = `
            <div class="chat-message-avatar">🌍</div>
            <div class="chat-message-content">
                <div class="chat-typing">
                    <div class="typing-dot"></div>
                    <div class="typing-dot"></div>
                    <div class="typing-dot"></div>
                </div>
            </div>
        `;
        elements.chatMessages.appendChild(msgDiv);
        elements.chatMessages.scrollTop = elements.chatMessages.scrollHeight;
        return id;
    }

    function removeTypingIndicator(id) {
        const el = document.getElementById(id);
        if (el) el.remove();
    }

    // Default trigger load context on startup
    loadDestinationContext(AppState.currentDestination);
});
