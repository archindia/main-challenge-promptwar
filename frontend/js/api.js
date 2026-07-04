/**
 * WanderLux AI - API Layer
 * Connects to Python FastAPI backend.
 * Falls back to mock data if backend is offline or API key is not configured.
 */

const API_BASE = 'http://localhost:8000/api';

class TravelAPI {
    constructor() {
        this.apiKey = localStorage.getItem('GEMINI_API_KEY') || '';
        this.useMock = false;
    }

    setApiKey(key) {
        this.apiKey = key;
        localStorage.setItem('GEMINI_API_KEY', key);
    }

    getHeaders() {
        const headers = {
            'Content-Type': 'application/json'
        };
        if (this.apiKey) {
            headers['X-API-Key'] = this.apiKey;
        }
        return headers;
    }

    async post(endpoint, data) {
        if (this.useMock) {
            return this.getMockResponse(endpoint, data);
        }

        try {
            const response = await fetch(`${API_BASE}${endpoint}`, {
                method: 'POST',
                headers: this.getHeaders(),
                body: JSON.stringify(data)
            });

            if (!response.ok) {
                const errData = await response.json().catch(() => ({}));
                throw new Error(errData.detail || `Server responded with status ${response.status}`);
            }

            return await response.json();
        } catch (error) {
            console.warn(`API call failed for ${endpoint}. Falling back to mock data.`, error);
            // Toggle mock mode if connection fails
            if (error.message.includes('Failed to fetch') || error.message.includes('NetworkError')) {
                this.useMock = true;
                window.WanderLuxAnims.showToast("Backend connection offline. Running in Demo Mock Mode.", "info");
                return this.getMockResponse(endpoint, data);
            }
            throw error;
        }
    }

    async get(endpoint) {
        try {
            const response = await fetch(`${API_BASE}${endpoint}`, {
                method: 'GET',
                headers: this.getHeaders()
            });

            if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
            return await response.json();
        } catch (error) {
            console.warn(`GET call failed for ${endpoint}. Returning static details.`, error);
            return this.getMockResponse(endpoint);
        }
    }

    // ─── Client Endpoints ───────────────────────────────────────────────

    async discoverDestinations(query, preferences = '', duration = '', country = '') {
        return this.post('/destinations/discover', { query, preferences, duration, country });
    }

    async getHiddenGems(destination, interest = '') {
        return this.post('/destinations/hidden-gems', { destination, interest });
    }

    async generateStory(place, style = 'immersive') {
        return this.post('/stories/generate', { place, style });
    }

    async getHeritage(destination, aspect = 'all') {
        return this.post('/cultural/heritage', { destination, aspect });
    }

    async suggestEvents(destination, month = '', interest = '') {
        return this.post('/events/suggest', { destination, month, interest });
    }

    async getExperiences(destination, expType = '') {
        // Query param vs body handling
        const url = `/cultural/experiences?destination=${encodeURIComponent(destination)}` + (expType ? `&exp_type=${encodeURIComponent(expType)}` : '');
        
        if (this.useMock) return this.getMockResponse('/cultural/experiences', { destination, expType });

        try {
            const response = await fetch(`${API_BASE}${url}`, {
                method: 'POST',
                headers: this.getHeaders()
            });
            if (!response.ok) throw new Error("Experiences retrieval failed");
            return await response.json();
        } catch (e) {
            return this.getMockResponse('/cultural/experiences', { destination, expType });
        }
    }

    async getCulturalDeepDive(destination, topic = 'overview') {
        return this.post('/cultural/deep-dive', { destination, topic });
    }

    async sendChatMessage(message, history = [], context = '') {
        return this.post('/chat/message', { message, conversation_history: history, destination_context: context });
    }

    // ─── Mock Fallbacks for Premium Demo Experience ────────────────────────

    getMockResponse(endpoint, requestData = {}) {
        const dest = requestData.destination || requestData.place || requestData.query || 'Kyoto';
        
        if (endpoint === '/destinations/discover') {
            return {
                success: true,
                data: {
                    destinations: [
                        {
                            name: "Kyoto",
                            country: "Japan",
                            tagline: "Where ancient temples meet modern Zen gardens.",
                            description: "Immerse yourself in Japan's cultural heart, dotted with thousands of classical Buddhist temples, gardens, imperial palaces, Shinto shrines, and traditional wooden houses.",
                            best_for: ["Culture", "History", "Food"],
                            best_time: "October - November & April - May",
                            highlights: ["Kinkaku-ji (Golden Pavilion)", "Fushimi Inari-taisha Shrine", "Gion District Glimpses"],
                            vibe: "Serene",
                            emoji: "⛩️"
                        },
                        {
                            name: "Oaxaca",
                            country: "Mexico",
                            tagline: "A culinary and cultural kaleidoscope.",
                            description: "Oaxaca is world-renowned for its rich indigenous culture, colorful street markets, magnificent colonial architecture, and unparalleled gastronomic heritage.",
                            best_for: ["Culinary", "Art", "Traditions"],
                            best_time: "October - December",
                            highlights: ["Monte Albán Ruins", "Santo Domingo Church", "Mole Tasting Tour"],
                            vibe: "Vibrant",
                            emoji: "🌮"
                        },
                        {
                            name: "Marrakech",
                            country: "Morocco",
                            tagline: "A sensory explosion of colors and spices.",
                            description: "Marrakech is an absolute sensory masterpiece, where historic palaces, bustling souks, secret gardens, and active street performers collide under the Atlas Mountains.",
                            best_for: ["Adventure", "Architecture", "Shopping"],
                            best_time: "March - May & September - November",
                            highlights: ["Jemaa el-Fnaa Square", "Majorelle Garden", "Bahia Palace"],
                            vibe: "Vibrant",
                            emoji: "🕌"
                        },
                        {
                            name: "Florence",
                            country: "Italy",
                            tagline: "The cradle of Renaissance masterworks.",
                            description: "Florence is an open-air art museum home to masterpieces of Renaissance art and architecture, including the iconic Duomo and Michelangelo's David.",
                            best_for: ["Art", "Architecture", "History"],
                            best_time: "May - September",
                            highlights: ["Uffizi Gallery", "Ponte Vecchio", "Duomo di Firenze"],
                            vibe: "Historic",
                            emoji: "🎨"
                        }
                    ]
                }
            };
        }

        if (endpoint === '/destinations/hidden-gems') {
            return {
                success: true,
                data: {
                    gems: [
                        {
                            name: "Gio-ji Temple",
                            location: "Arashiyama, Kyoto",
                            why_hidden: "Tucked deep inside Arashiyama forest, most skip it for the Bamboo Grove.",
                            description: "A tiny, quiet temple famous for its brilliant emerald moss garden and tall bamboo grove. Inside, you can view a rare circular window showing colored tree shadows.",
                            best_experience: "Sit on the tatami mats and watch the light filtering through the moss canopy.",
                            insider_tip: "Visit right after rainfall when the moss glows with a mesmerizing emerald green color.",
                            category: "nature",
                            emoji: "🌿"
                        },
                        {
                            name: "Otagi Nenbutsu-ji",
                            location: "Saga-Toriimoto, Kyoto",
                            why_hidden: "Located at the far edge of the tourist boundary.",
                            description: "A whimsical temple home to 1,200 unique stone statues, each carved with different facial expressions—some smiling, laughing, holding cups, or playing instruments.",
                            best_experience: "Find a statue that looks exactly like your personality.",
                            insider_tip: "Take the local bus to the top of the hill, then walk down to avoid the steep climb.",
                            category: "spiritual",
                            emoji: "🗿"
                        },
                        {
                            name: "Kurama-dera to Kibune Trail",
                            location: "Northern Mountains, Kyoto",
                            why_hidden: "Requires a 2-hour hike away from standard tour buses.",
                            description: "A gorgeous mountain path connecting two mystical villages, crossing giant cedar roots and spiritual mountain shrines built right into nature.",
                            best_experience: "Bathe in the natural hot springs of Kurama Onsen after the hike.",
                            insider_tip: "Perform a leaf-fortune reading at the Kibune shrine water stream.",
                            category: "adventure",
                            emoji: "⛰️"
                        },
                        {
                            name: "Kamigamo Shrine Market",
                            location: "Kita-ku, Kyoto",
                            why_hidden: "Only held once a month.",
                            description: "An authentic local handicraft market held on the grounds of one of Kyoto's oldest shrines, filled with artisan items, wood carvings, and homemade food.",
                            best_experience: "Talk to local craftsmen and sample homemade yuzu treats.",
                            insider_tip: "Held only on the fourth Sunday of each month. Arrive before 10 AM.",
                            category: "food",
                            emoji: "🍡"
                        }
                    ]
                }
            };
        }

        if (endpoint === '/stories/generate') {
            return {
                success: true,
                data: {
                    title: `Whispers of the Ancestors in ${dest}`,
                    place: dest,
                    opening_hook: "As the golden sun dips behind the ancient silhouette of the hills, the world holds its breath.",
                    story: `A visit to ${dest} is more than a journey in space; it is a step backward in time. As you walk down the narrow stone alleys, the soft sound of wooden sandals clicking against flagstones echoing in the dusk. The air carries the delicate scent of cedarwood incense, wet moss, and roasting tea leaves. In this place, every stone corner holds a story waiting to be uncovered, and every ancient courtyard garden is designed to mirror the vastness of the natural cosmos in a handful of sand and stone.\n\nYou encounter local artisans working in small wood workshops, carrying on techniques passed down through generations. They carve cherry wood and color textiles with botanical dyes, using wisdom that predates modern machinery. The spirit of community and deep harmony with the natural seasons is palpable in everything here, reminding travelers of a simpler, more meaningful way of experiencing the earth.`,
                    cultural_notes: "The local concept of 'Wabi-Sabi' centers on finding absolute beauty in imperfection and impermanence, deeply influencing the local architecture and gardens.",
                    traveler_reflection: "May your steps be slow, your eyes open, and your heart receptive to the quiet beauty hidden in the simple moments of this journey.",
                    mood: "Mystical"
                }
            };
        }

        if (endpoint === '/cultural/heritage') {
            return {
                success: true,
                data: {
                    destination: dest,
                    overview: `Rich cultural hub marked by centuries of preservation, architectural marvels, and living traditions.`,
                    heritage_sites: [
                        { name: "Kiyomizu-dera Temple", type: "UNESCO World Heritage Site", significance: "Stunning wooden temple built entirely without nails over a natural waterfall.", emoji: "⛩️" },
                        { name: "Historic District preservation zones", type: "Historical Area", significance: "Living neighborhoods showcasing traditional wood machiya architecture.", emoji: "🏡" }
                    ],
                    traditions: [
                        { name: "The Tea Ceremony (Chado)", description: "A highly choreographed preparation and consumption of green tea celebrating mindfulness.", when: "Offered year-round", emoji: "🍵" },
                        { name: "Traditional Silk Dyeing (Yuzen)", description: "Artisans hand-painting elaborate scenes and nature patterns on kimono fabrics.", when: "Special seasonal showcases", emoji: "👘" }
                    ],
                    art_forms: ["Noh Theater", "Flower Arrangement (Ikebana)", "Calligraphy (Shodo)"],
                    culinary_heritage: "Famous for traditional Kaiseki dining, representing seasonal harmony, fresh locally-sourced vegetables, and elaborate visual presentations.",
                    language_notes: "A simple 'Arigatou gozaimasu' (Thank you) accompanied by a slight bow is highly appreciated.",
                    preservation_efforts: "Historic preservation laws enforce strict architectural regulations on colors, materials, and signage inside the historic town boundaries.",
                    did_you_know: [
                        "There are over 1,600 Buddhist temples and 400 Shinto shrines in Kyoto alone.",
                        "Kaiseki dining originated from simple meals served to Buddhist monks during long ceremonies."
                    ]
                }
            };
        }

        if (endpoint === '/events/suggest') {
            return {
                success: true,
                data: {
                    events: [
                        {
                            name: "Gion Matsuri Festival",
                            type: "cultural",
                            description: "One of the most famous festivals in the country, featuring massive ornate parade floats that move through the city streets.",
                            dates: "July (Entire Month)",
                            location: "Downtown streets",
                            cultural_significance: "Began in the year 869 as a spiritual ritual to purify the city and ward off plague.",
                            visitor_tips: "The night before the main parades (Yoiyama) is fantastic for street food and lanterns.",
                            vibe: "Festive",
                            emoji: "🏮"
                        },
                        {
                            name: "Daimonji Gozan no Okuribi",
                            type: "religious",
                            description: "Five giant bonfires lit in the shape of character symbols on the mountains surrounding the city.",
                            dates: "August 16th",
                            location: "Visible across the hills",
                            cultural_significance: "Bids farewell to the spirits of ancestors returning to the spirit world.",
                            visitor_tips: "Book a rooftop table in advance or view from the banks of the Kamo River.",
                            vibe: "Sacred",
                            emoji: "🔥"
                        },
                        {
                            name: "Seasonal Autumn Illumination",
                            type: "art",
                            description: "Historic temples open up their gardens at night with beautifully designed spotlights illuminating the vibrant autumn leaves.",
                            dates: "November - December",
                            location: "Various Temples",
                            cultural_significance: "Celebrates the transition of seasons and the transient beauty of autumn.",
                            visitor_tips: "Eikan-do temple offers the most spectacular pond reflections, but expect queues.",
                            vibe: "Peaceful",
                            emoji: "🍁"
                        }
                    ]
                }
            };
        }

        if (endpoint === '/cultural/experiences') {
            return {
                success: true,
                data: {
                    experiences: [
                        {
                            title: "Kaiseki Cooking Workshop with Local Chef",
                            category: "cooking",
                            description: "Learn how to prepare classic seasonal side dishes under the guidance of a professional local chef.",
                            what_to_expect: "Selecting fresh ingredients, preparing dashi stock, and artistic plating using antique plates.",
                            cultural_insight: "Understand how Kaiseki honors the present micro-season through colors, flavors, and visual harmony.",
                            how_to_book: "Register online via local culinary academy website or reserve through partner boutique hotels.",
                            duration: "3 hours",
                            difficulty: "Easy",
                            emoji: "🥢"
                        },
                        {
                            title: "Zen Meditation and Calligraphy inside a Temple",
                            category: "wellness",
                            description: "Join a resident temple monk for a silent meditation session followed by ink painting.",
                            what_to_expect: "Focusing on breath, cleaning your mind, and letting the ink brush flow onto washi paper.",
                            cultural_insight: "Learn to embrace imperfection and focus entirely on the present stroke of the brush.",
                            how_to_book: "Book directly at the temple office in morning hours or online tourist heritage portals.",
                            duration: "2 hours",
                            difficulty: "Moderate",
                            emoji: "🧘"
                        }
                    ]
                }
            };
        }

        if (endpoint === '/cultural/deep-dive') {
            return {
                success: true,
                data: {
                    destination: dest,
                    topic: requestData.topic || "overview",
                    intro: `Discover the customs, etiquette, and social values that shape daily life in ${dest}.`,
                    key_insights: [
                        { title: "Harmony and Respect", content: "Great importance is placed on group harmony and respectful interactions in public spaces.", emoji: "🤝" }
                    ],
                    dos_and_donts: {
                        dos: ["Bow slightly when greeting people", "Remove shoes when entering temple structures or homes", "Keep trash with you until you find a bin"],
                        donts: ["Do not walk and eat street food at the same time", "Avoid loud phone conversations on public transit", "Do not tip at restaurants—it can be seen as impolite"]
                    },
                    essential_phrases: [
                        { phrase: "Konnichiwa", meaning: "Hello", pronunciation: "Kon-nee-chee-wah" },
                        { phrase: "Sumimasen", meaning: "Excuse me / Sorry", pronunciation: "Su-mee-mah-sen" }
                    ],
                    signature_dishes: [
                        { name: "Kyoto Kaiseki Ryori", description: "Multi-course seasonal feast showcasing exquisite local ingredients.", where_to_try: "Traditional ryokan in Gion" }
                    ],
                    respectful_travel_tips: [
                        "Always ask politely before taking photos of local artisans or residents.",
                        "Respect religious boundaries at shrines and temples."
                    ]
                }
            };
        }

        if (endpoint === '/chat/message') {
            return {
                success: true,
                data: {
                    reply: `I'd love to help you plan your journey to ${dest}! That destination is filled with incredible history and hidden gems. Would you like to explore off-the-beaten-path forest hikes, book a traditional cooking class, or hear about upcoming local festivals? Let me know your travel style!`,
                    suggested_actions: [
                        `Show hidden gems in ${dest}`,
                        `What local food should I try in ${dest}?`
                    ]
                }
            };
        }

        return { success: false, error: "Mock endpoint not defined" };
    }
}

// Export singleton api instance
window.WanderTravelAPI = new TravelAPI();
