/**
 * WanderLux AI - UI Rendering Utilities
 */

const UI = {
    // ─── Loading Skeletons ─────────────────────────────────────────────
    
    renderSkeletonGrid(containerId, count = 4) {
        const container = document.getElementById(containerId);
        if (!container) return;
        
        let html = '';
        for (let i = 0; i < count; i++) {
            html += `
                <div class="skeleton-card">
                    <div class="skeleton skeleton-icon"></div>
                    <div class="skeleton skeleton-line w-30"></div>
                    <div class="skeleton skeleton-line w-60"></div>
                    <div class="skeleton skeleton-line w-100"></div>
                    <div class="skeleton skeleton-line w-80"></div>
                </div>
            `;
        }
        container.innerHTML = html;
    },

    renderSkeletonList(containerId, count = 3) {
        const container = document.getElementById(containerId);
        if (!container) return;
        
        let html = '';
        for (let i = 0; i < count; i++) {
            html += `
                <div class="skeleton-card" style="padding: 1rem; margin-bottom: 0.75rem;">
                    <div class="skeleton skeleton-line w-30"></div>
                    <div class="skeleton skeleton-line w-80"></div>
                </div>
            `;
        }
        container.innerHTML = html;
    },

    // ─── Destination Recommendations ──────────────────────────────────
    
    renderDestinations(containerId, destinations, onSelectCallback) {
        const container = document.getElementById(containerId);
        if (!container || !destinations || destinations.length === 0) {
            this.renderEmpty(containerId, "No destinations found", "Try matching with broad keywords like 'nature' or 'beaches'.");
            return;
        }
        
        container.innerHTML = '';
        destinations.forEach(dest => {
            const card = document.createElement('div');
            card.className = 'destination-card fade-in-up';
            
            const tagsHtml = dest.best_for ? dest.best_for.map(t => `<span class="card-tag">${t}</span>`).join('') : '';
            
            card.innerHTML = `
                <span class="card-emoji">${dest.emoji || '🌍'}</span>
                <span class="card-vibe">${dest.vibe || 'Explore'}</span>
                <h3 class="card-name">${dest.name}</h3>
                <div class="card-country">${dest.country}</div>
                <div class="card-tagline">"${dest.tagline}"</div>
                <p class="card-description">${dest.description}</p>
                <div class="card-tags">${tagsHtml}</div>
                <div class="card-meta">
                    <span class="card-time">🕒 ${dest.best_time || 'Best year round'}</span>
                    <span class="card-action">Details &rarr;</span>
                </div>
            `;
            
            card.addEventListener('click', () => {
                if (onSelectCallback) onSelectCallback(dest.name);
            });
            
            container.appendChild(card);
        });
    },

    // ─── Hidden Gems ──────────────────────────────────────────────────
    
    renderHiddenGems(containerId, gems) {
        const container = document.getElementById(containerId);
        if (!container || !gems || gems.length === 0) {
            this.renderEmpty(containerId, "No hidden gems revealed yet", "Select or search for a destination above to find its secrets.");
            return;
        }
        
        container.innerHTML = '';
        gems.forEach(gem => {
            const card = document.createElement('div');
            card.className = 'gem-card fade-in-up';
            card.innerHTML = `
                <div class="gem-category">${gem.category || 'Secret Spot'}</div>
                <h3 class="gem-name">${gem.emoji || '💎'} ${gem.name}</h3>
                <div class="gem-location">📍 ${gem.location}</div>
                <p class="gem-description">${gem.description}</p>
                <div class="gem-tip">
                    <span class="gem-tip-label">💡 Insider Tip</span>
                    ${gem.insider_tip}
                </div>
            `;
            container.appendChild(card);
        });
    },

    // ─── Immersive Stories ────────────────────────────────────────────
    
    renderStory(containerId, story) {
        const container = document.getElementById(containerId);
        if (!container || !story) return;
        
        container.innerHTML = `
            <div class="story-card fade-in-up">
                <span class="story-mood">✨ ${story.mood || 'Immersive'}</span>
                <h3 class="story-title">${story.title}</h3>
                <div class="story-hook">"${story.opening_hook}"</div>
                <div class="story-body">${story.story.replace(/\n/g, '<br><br>')}</div>
                
                ${story.cultural_notes ? `
                    <div class="story-cultural">
                        <div class="story-cultural-label">🏮 Cultural Footnote</div>
                        <p style="font-size: 0.9rem; color: var(--text-secondary);">${story.cultural_notes}</p>
                    </div>
                ` : ''}
                
                <div class="story-reflection">
                    ${story.traveler_reflection || 'Venture slow and carry these reflections with you.'}
                </div>
            </div>
        `;
    },

    // ─── Cultural Heritage ────────────────────────────────────────────
    
    renderHeritage(containerId, heritage) {
        const container = document.getElementById(containerId);
        if (!container || !heritage) return;
        
        const sitesHtml = heritage.heritage_sites ? heritage.heritage_sites.map(site => `
            <div class="heritage-site">
                <div class="heritage-site-emoji">${site.emoji || '🏛️'}</div>
                <div class="heritage-site-type">${site.type}</div>
                <div class="heritage-site-name">${site.name}</div>
                <div class="heritage-site-sig">${site.significance}</div>
            </div>
        `).join('') : '';

        const traditionsHtml = heritage.traditions ? heritage.traditions.map(t => `
            <div class="tradition-item">
                <span class="tradition-emoji">${t.emoji || '🎏'}</span>
                <div>
                    <div class="tradition-name">${t.name}</div>
                    <div class="tradition-desc">${t.description}</div>
                    <div class="tradition-when">📅 ${t.when}</div>
                </div>
            </div>
        `).join('') : '';

        const dykHtml = heritage.did_you_know ? heritage.did_you_know.map(fact => `
            <div class="dyk-fact">${fact}</div>
        `).join('') : '';

        container.innerHTML = `
            <div class="heritage-grid fade-in-up">
                <div class="heritage-main">
                    <h3 style="margin-bottom: 0.75rem; font-family: 'Playfair Display', serif; font-size: 1.5rem;">🏛️ Sites & Foundations</h3>
                    <p class="heritage-overview">${heritage.overview}</p>
                    <div class="heritage-sites">${sitesHtml}</div>
                </div>
                
                <div class="heritage-side">
                    <div class="heritage-side-title">🎋 Traditions & Arts</div>
                    <div class="traditions-list">${traditionsHtml}</div>
                </div>
                
                <div class="heritage-side">
                    <div class="heritage-side-title">💡 Did You Know?</div>
                    <div class="did-you-know">${dykHtml}</div>
                </div>
            </div>
        `;
    },

    // ─── Local Events ─────────────────────────────────────────────────
    
    renderEvents(containerId, events) {
        const container = document.getElementById(containerId);
        if (!container || !events || events.length === 0) {
            this.renderEmpty(containerId, "No upcoming events scheduled", "Explore events for this city to view local festival dates.");
            return;
        }
        
        container.innerHTML = '';
        events.forEach(ev => {
            const card = document.createElement('div');
            card.className = 'event-card fade-in-up';
            card.innerHTML = `
                <span class="event-emoji">${ev.emoji || '🎉'}</span>
                <div>
                    <span class="event-type">${ev.type}</span>
                    <h4 class="event-name">${ev.name}</h4>
                    <div class="event-location">📍 ${ev.location}</div>
                    <p class="event-desc">${ev.description}</p>
                    <div class="event-meta">
                        <span class="event-dates">${ev.dates}</span>
                        <span class="event-vibe">✨ ${ev.vibe}</span>
                    </div>
                </div>
            `;
            container.appendChild(card);
        });
    },

    // ─── Authentic Experiences ────────────────────────────────────────
    
    renderExperiences(containerId, experiences) {
        const container = document.getElementById(containerId);
        if (!container || !experiences || experiences.length === 0) {
            this.renderEmpty(containerId, "No activities suggested yet", "Unlock experiences for this destination to build your cultural checklist.");
            return;
        }
        
        container.innerHTML = '';
        experiences.forEach(exp => {
            const card = document.createElement('div');
            card.className = 'experience-card fade-in-up';
            card.innerHTML = `
                <span class="exp-category">${exp.emoji || '🤝'} ${exp.category}</span>
                <h3 class="exp-title">${exp.title}</h3>
                <p class="exp-desc">${exp.description}</p>
                <div class="exp-insight">
                    <span class="exp-insight-label">💡 Cultural Context</span>
                    ${exp.cultural_insight}
                </div>
                <div class="exp-meta">
                    <span>⏱️ ${exp.duration || 'Flexible'}</span>
                    <span class="exp-difficulty">${exp.difficulty || 'Easy'}</span>
                </div>
            `;
            container.appendChild(card);
        });
    },

    // ─── Cultural Deep Dive ───────────────────────────────────────────
    
    renderDeepDive(containerId, deepDive) {
        const container = document.getElementById(containerId);
        if (!container || !deepDive) return;
        
        const insightsHtml = deepDive.key_insights ? deepDive.key_insights.map(ins => `
            <div class="insight-item">
                <span class="insight-emoji">${ins.emoji || '💡'}</span>
                <div>
                    <h4 class="insight-title">${ins.title}</h4>
                    <p class="insight-content">${ins.content}</p>
                </div>
            </div>
        `).join('') : '';

        const dosHtml = deepDive.dos_and_donts?.dos ? deepDive.dos_and_donts.dos.map(item => `<li>${item}</li>`).join('') : '';
        const dontsHtml = deepDive.dos_and_donts?.donts ? deepDive.dos_and_donts.donts.map(item => `<li>${item}</li>`).join('') : '';

        const phrasesHtml = deepDive.essential_phrases ? deepDive.essential_phrases.map(item => `
            <div class="phrase-item">
                <div class="phrase-text">${item.phrase}</div>
                <div class="phrase-meaning">${item.meaning}</div>
                <div class="phrase-pronunciation">🗣️ ${item.pronunciation}</div>
            </div>
        `).join('') : '';

        container.innerHTML = `
            <div class="cultural-grid fade-in-up">
                <div class="cultural-main">
                    <h3 style="margin-bottom: 0.75rem; font-family: 'Playfair Display', serif; font-size: 1.5rem;">🌾 Customs & Insights</h3>
                    <p class="cultural-intro">${deepDive.intro}</p>
                    <div class="insights-list">${insightsHtml}</div>
                </div>
                
                <div class="cultural-side">
                    <div class="dos-donts">
                        <h4 class="dos-donts-title">📝 Etiquette Guide</h4>
                        <div class="dos-list-label">Do</div>
                        <ul class="dos-list">${dosHtml}</ul>
                        <div class="donts-list-label">Don't</div>
                        <ul class="donts-list">${dontsHtml}</ul>
                    </div>
                    
                    <div class="phrases-card">
                        <h4 style="margin-bottom: 1rem;">💬 Talk Like a Local</h4>
                        <div class="phrases-list">${phrasesHtml}</div>
                    </div>
                </div>
            </div>
        `;
    },

    // ─── Help Helpers ─────────────────────────────────────────────────
    
    renderEmpty(containerId, title, subtitle) {
        const container = document.getElementById(containerId);
        if (!container) return;
        container.innerHTML = `
            <div class="empty-state">
                <span class="empty-state-emoji">🏮</span>
                <h3 class="empty-state-title">${title}</h3>
                <p class="empty-state-subtitle">${subtitle}</p>
            </div>
        `;
    }
};

window.WanderLuxUI = UI;
