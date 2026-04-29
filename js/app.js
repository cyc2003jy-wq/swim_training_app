/* =========================================
   AQUAFLOW - INTERACTIVITY
   ========================================= */

document.addEventListener('DOMContentLoaded', () => {
    
    // 1. Navbar Scroll Effect (Glassmorphism gets stronger on scroll)
    const navbar = document.querySelector('.navbar');
    
    window.addEventListener('scroll', () => {
        if (window.scrollY > 50) {
            navbar.style.background = 'rgba(255, 255, 255, 0.98)';
            navbar.style.boxShadow = '0 4px 20px rgba(37, 99, 235, 0.1)';
        } else {
            navbar.style.background = 'rgba(255, 255, 255, 0.92)';
            navbar.style.boxShadow = 'none';
        }
    });

    // 2. Smooth Scrolling for Anchor Links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            e.preventDefault();
            
            const targetId = this.getAttribute('href');
            if(targetId === '#') return;
            
            const targetElement = document.querySelector(targetId);
            
            if (targetElement) {
                targetElement.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });

    // 3. Fade-Up Intersection Observer
    const fadeObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
                fadeObserver.unobserve(entry.target);
            }
        });
    }, { threshold: 0.1, rootMargin: "0px 0px -50px 0px" });

    document.querySelectorAll('.fade-up').forEach(el => {
        fadeObserver.observe(el);
    });

    // Also observe feature cards and split sections
    document.querySelectorAll('.feature-card, .split-section').forEach(el => {
        el.style.opacity = '0';
        el.style.transform = 'translateY(30px)';
        el.style.transition = 'all 0.6s cubic-bezier(0.25, 0.46, 0.45, 0.94)';
        fadeObserver.observe(el);
    });

    // 4. Hamburger Menu Logic
    const hamburgerBtn = document.getElementById('hamburgerBtn');
    const navLinks = document.getElementById('navLinks');
    
    if (hamburgerBtn && navLinks) {
        hamburgerBtn.addEventListener('click', () => {
            hamburgerBtn.classList.toggle('active');
            navLinks.classList.toggle('open');
        });
        
        // Close menu when clicking a link
        navLinks.querySelectorAll('a').forEach(link => {
            link.addEventListener('click', () => {
                hamburgerBtn.classList.remove('active');
                navLinks.classList.remove('open');
            });
        });
    }

    // 5. Animated Counters
    const counters = document.querySelectorAll('.counter-value[data-target]');
    
    if (counters.length > 0) {
        const counterObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    animateCounter(entry.target);
                    counterObserver.unobserve(entry.target);
                }
            });
        }, { threshold: 0.5 });
        
        counters.forEach(c => counterObserver.observe(c));
    }
    
    function animateCounter(el) {
        const target = parseInt(el.getAttribute('data-target'));
        const duration = 2000;
        const startTime = performance.now();
        
        function updateCount(currentTime) {
            const elapsed = currentTime - startTime;
            const progress = Math.min(elapsed / duration, 1);
            // Ease out cubic
            const ease = 1 - Math.pow(1 - progress, 3);
            const current = Math.round(target * ease);
            el.textContent = current.toLocaleString();
            
            if (progress < 1) {
                requestAnimationFrame(updateCount);
            }
        }
        
        requestAnimationFrame(updateCount);
    }

    // 6. Water Particle Animation
    initParticles();
});

/* =========================================
   WATER PARTICLE ANIMATION ENGINE
   ========================================= */
function initParticles() {
    const canvas = document.getElementById('particleCanvas');
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    let particles = [];
    const PARTICLE_COUNT = 60;
    
    function resize() {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
    }
    
    resize();
    window.addEventListener('resize', resize);
    
    class Particle {
        constructor() {
            this.reset();
        }
        
        reset() {
            this.x = Math.random() * canvas.width;
            this.y = Math.random() * canvas.height;
            this.size = Math.random() * 3 + 1;
            this.speedX = (Math.random() - 0.5) * 0.5;
            this.speedY = (Math.random() - 0.5) * 0.3;
            this.opacity = Math.random() * 0.3 + 0.05;
            this.hue = Math.random() > 0.5 ? 215 : 225; // blue-ish
        }
        
        update() {
            this.x += this.speedX;
            this.y += this.speedY;
            
            if (this.x < 0 || this.x > canvas.width) this.speedX *= -1;
            if (this.y < 0 || this.y > canvas.height) this.speedY *= -1;
        }
        
        draw() {
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
            ctx.fillStyle = `hsla(${this.hue}, 100%, 70%, ${this.opacity})`;
            ctx.fill();
        }
    }
    
    // Create particles
    for (let i = 0; i < PARTICLE_COUNT; i++) {
        particles.push(new Particle());
    }
    
    function drawLines() {
        for (let i = 0; i < particles.length; i++) {
            for (let j = i + 1; j < particles.length; j++) {
                const dx = particles[i].x - particles[j].x;
                const dy = particles[i].y - particles[j].y;
                const dist = Math.sqrt(dx * dx + dy * dy);
                
                if (dist < 150) {
                    const opacity = (1 - dist / 150) * 0.08;
                    ctx.beginPath();
                    ctx.moveTo(particles[i].x, particles[i].y);
                    ctx.lineTo(particles[j].x, particles[j].y);
                    ctx.strokeStyle = `rgba(37, 99, 235, ${opacity})`;
                    ctx.lineWidth = 0.5;
                    ctx.stroke();
                }
            }
        }
    }
    
    function animate() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        particles.forEach(p => {
            p.update();
            p.draw();
        });
        
        drawLines();
        requestAnimationFrame(animate);
    }
    
    animate();
}

/* =========================================
   TRAINING GENERATOR LOGIC
   ========================================= */
const generateBtn = document.getElementById('generateBtn');
const planResult = document.getElementById('planResult');
const levelSelect = document.getElementById('level');
const focusSelect = document.getElementById('focus');

const workoutDB = {
    beginner: {
        endurance: [
            { name: "Warmup", desc: "400m Choice easy" },
            { name: "Main Set", desc: "4 x 200m Free @ RPE 5, 30s rest" },
            { name: "Cooldown", desc: "200m Easy" }
        ],
        speed: [
            { name: "Warmup", desc: "300m Choice" },
            { name: "Main Set", desc: "8 x 50m Free Sprint @ RPE 9, 45s rest" },
            { name: "Cooldown", desc: "300m Easy" }
        ],
        technique: [
            { name: "Warmup", desc: "300m Choice" },
            { name: "Drills", desc: "6 x 100m Catch-up drill & Fingertip drag" },
            { name: "Cooldown", desc: "200m Easy" }
        ],
        recovery: [
            { name: "Flow", desc: "1000m continuous easy Free/Backstroke mix" }
        ]
    },
    intermediate: {
        endurance: [
            { name: "Warmup", desc: "600m Mix (Swim/Kick/Pull)" },
            { name: "Main Set", desc: "5 x 400m Free @ Threshold, 20s rest" },
            { name: "Cooldown", desc: "400m Easy" }
        ],
        speed: [
            { name: "Warmup", desc: "600m Choice" },
            { name: "Main Set", desc: "12 x 50m Max Effort @ 1:30 interval" },
            { name: "Cooldown", desc: "400m Easy" }
        ],
        technique: [
            { name: "Warmup", desc: "500m Choice" },
            { name: "Drills", desc: "8 x 100m alternating Drill/Swim" },
            { name: "Main Set", desc: "4 x 200m pull with buoy and paddles" },
            { name: "Cooldown", desc: "300m Easy" }
        ],
        recovery: [
            { name: "Flow", desc: "2000m continuous easy with fins" }
        ]
    },
    advanced: {
        endurance: [
            { name: "Warmup", desc: "1000m Mix" },
            { name: "Main Set", desc: "3 x 1000m Descending 1-3 @ 30s rest" },
            { name: "Cooldown", desc: "500m Easy" }
        ],
        speed: [
            { name: "Warmup", desc: "1000m Choice" },
            { name: "Pre-set", desc: "4 x 100m build to sprint" },
            { name: "Main Set", desc: "20 x 50m All Out @ 1:00 interval" },
            { name: "Cooldown", desc: "500m Easy" }
        ],
        technique: [
            { name: "Warmup", desc: "800m Choice" },
            { name: "Drills", desc: "10 x 100m complex IM drills" },
            { name: "Main Set", desc: "10 x 100m perfect stroke count" },
            { name: "Cooldown", desc: "400m Easy" }
        ],
        recovery: [
            { name: "Flow", desc: "3000m continuous easy/moderate mix" }
        ]
    }
};

if(generateBtn) {
    generateBtn.addEventListener('click', () => {
        const level = levelSelect.value;
        const focus = focusSelect.value;
        const plan = workoutDB[level][focus];
        
        let html = `<h3>Today's ${focus.charAt(0).toUpperCase() + focus.slice(1)} Session</h3>`;
        let total = 0;
        
        plan.forEach(block => {
            html += `
                <div class="workout-block">
                    <h4>${block.name}</h4>
                    <p>${block.desc}</p>
                </div>
            `;
        });
        
        planResult.innerHTML = html;
        planResult.classList.remove('hidden');
    });
}

/* =========================================
   ACTIVITY TRACKER LOGIC (LocalStorage)
   ========================================= */
const distanceInput = document.getElementById('distanceInput');
const logBtn = document.getElementById('logBtn');
const logBody = document.getElementById('logBody');
const totalDistEl = document.getElementById('totalDistance');
const totalSeshEl = document.getElementById('totalSessions');
const clearBtn = document.getElementById('clearDataBtn');

let swimLogs = JSON.parse(localStorage.getItem('swimLogs')) || [];

function updateTrackerUI() {
    if(!logBody) return;
    
    // Update Table
    logBody.innerHTML = '';
    let totalDist = 0;
    
    // Sort logs by date descending
    const sortedLogs = [...swimLogs].sort((a, b) => new Date(b.date) - new Date(a.date));
    
    sortedLogs.forEach(log => {
        totalDist += parseInt(log.distance);
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${new Date(log.date).toLocaleDateString()}</td>
            <td><span class="highlight">${log.distance} m</span></td>
        `;
        logBody.appendChild(row);
    });
    
    // Update Stats
    totalSeshEl.textContent = swimLogs.length;
    
    if(totalDist > 1000) {
        totalDistEl.textContent = (totalDist / 1000).toFixed(2) + ' km';
    } else {
        totalDistEl.textContent = totalDist + ' m';
    }

    // Update bar chart
    drawSwimChart();
}

if(logBtn) {
    logBtn.addEventListener('click', () => {
        const dist = distanceInput.value;
        if(dist && dist > 0) {
            swimLogs.push({
                date: new Date().toISOString(),
                distance: dist
            });
            localStorage.setItem('swimLogs', JSON.stringify(swimLogs));
            distanceInput.value = '';
            updateTrackerUI();
        }
    });
}

if(clearBtn) {
    clearBtn.addEventListener('click', () => {
        if(confirm("Are you sure you want to clear all your swimming history?")) {
            swimLogs = [];
            localStorage.removeItem('swimLogs');
            updateTrackerUI();
        }
    });
}

// Initial draw
updateTrackerUI();

/* =========================================
   SWIM LOG BAR CHART (Canvas)
   ========================================= */
function drawSwimChart() {
    const chartCanvas = document.getElementById('swimChart');
    if (!chartCanvas) return;
    
    const ctx = chartCanvas.getContext('2d');
    const rect = chartCanvas.parentElement.getBoundingClientRect();
    chartCanvas.width = rect.width - 48; // account for padding
    chartCanvas.height = 180;
    
    ctx.clearRect(0, 0, chartCanvas.width, chartCanvas.height);
    
    // Get last 7 sessions
    const recentLogs = [...swimLogs]
        .sort((a, b) => new Date(a.date) - new Date(b.date))
        .slice(-7);
    
    if (recentLogs.length === 0) {
        ctx.fillStyle = '#64748b';
        ctx.font = '14px Inter, sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('No sessions yet — log your first swim!', chartCanvas.width / 2, 100);
        return;
    }
    
    const maxDist = Math.max(...recentLogs.map(l => parseInt(l.distance)));
    const barWidth = Math.min(50, (chartCanvas.width / recentLogs.length) - 16);
    const chartHeight = chartCanvas.height - 40;
    const startX = (chartCanvas.width - (barWidth + 16) * recentLogs.length) / 2 + 8;
    
    recentLogs.forEach((log, i) => {
        const dist = parseInt(log.distance);
        const barHeight = (dist / maxDist) * (chartHeight - 25);
        const x = startX + i * (barWidth + 16);
        const y = chartHeight - barHeight;
        
        // Gradient bar
        const gradient = ctx.createLinearGradient(x, y, x, chartHeight);
        gradient.addColorStop(0, '#2563eb');
        gradient.addColorStop(1, 'rgba(37, 99, 235, 0.3)');
        
        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.roundRect(x, y, barWidth, barHeight, [6, 6, 0, 0]);
        ctx.fill();
        
        // Distance label on top
        ctx.fillStyle = '#1e293b';
        ctx.font = 'bold 11px Inter, sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText(`${dist}m`, x + barWidth / 2, y - 6);
        
        // Date label at bottom
        ctx.fillStyle = '#64748b';
        ctx.font = '10px Inter, sans-serif';
        const dateLabel = new Date(log.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
        ctx.fillText(dateLabel, x + barWidth / 2, chartHeight + 16);
    });
}

/* =========================================
   TAB SYSTEM LOGIC
   ========================================= */
const tabBtns = document.querySelectorAll('.tab-btn');
const tabContents = document.querySelectorAll('.tab-content');

tabBtns.forEach(btn => {
    btn.addEventListener('click', () => {
        const targetTab = btn.getAttribute('data-tab');
        
        // Remove active class from all
        tabBtns.forEach(b => b.classList.remove('active'));
        tabContents.forEach(c => {
            c.classList.remove('active');
            c.classList.add('hidden');
        });
        
        // Add active to clicked
        btn.classList.add('active');
        const content = document.getElementById(targetTab);
        content.classList.remove('hidden');
        
        // Slight delay for animation to trigger
        setTimeout(() => content.classList.add('active'), 10);
    });
});

/* =========================================
   AI COACH CHAT LOGIC
   ========================================= */
const chatToggle = document.getElementById('chatToggle');
const chatPanel = document.getElementById('chatPanel');
const closeChat = document.getElementById('closeChat');
const chatMessages = document.getElementById('chatMessages');
const chatInput = document.getElementById('chatInput');
const sendBtn = document.getElementById('sendMessageBtn');

// Define the core persona of the AI Coach
const coachPromptLines = [
"You are AquaFlow AI, a world-class elite swimming coach with 20 years of experience shaping Olympic athletes.",
"You possess deep expertise in hydrodynamics, sports biomechanics, energy systems, and technique periodization.",
"",
"### YOUR PERSONA",
"- Tone: Authoritative, highly professional, encouraging, and razor-sharp.",
"- Language: English only, precise terminology.",
"- Formatting: Use Markdown. Bold key terms, bullet lists for drills, headers for workout sets.",
"",
"### BIOMECHANICS KNOWLEDGE BASE",
"",
"1. FREESTYLE:",
"   - Catch: High Elbow Catch (EVF) angle 90-130 deg. >150 deg = dropped elbow. Pull: slight diagonal, hand exits at hip.",
"   - Body Rotation: 45-60 deg shoulder roll. <30 deg = flat swimming + impingement. Rotation from hips.",
"   - Entry: Shoulder-width at 11 and 1 o clock. Midline crossover = zigzagging hips.",
"   - Breathing: One goggle in, one out. Lifting head drops hips exponentially.",
"   - Kick: 6-beat sprint, 2-beat distance. From hip, not knee. Ankle plantar-flexion critical.",
"   - Recovery: High elbow, relaxed hand. Turns: 3-5 body lengths underwater dolphin kicks.",
"   - Drills: Catch-up, Fist, Fingertip drag, 10-and-2, Side kick.",
"",
"2. BACKSTROKE:",
"   - Rotation: Hips and shoulders together ~45 deg from core.",
"   - Entry: Pinky first at 11 and 1. Thumb-first destroys catch.",
"   - Catch: Bent elbow ~90 deg, push water toward feet. Think climbing a ladder.",
"   - Kick: 6-beat flutter from hip. Toes barely break surface. Knee <120 = bicycle kick.",
"   - Head: Neutral, eyes up, water at hairline. No chin tucking.",
"   - Drills: Spin, Cup on forehead, Double-arm backstroke, 6-kick switch.",
"",
"3. BREASTSTROKE:",
"   - Timing: Pull > Breathe > Kick > GLIDE (4 phases). Distinct streamline phase.",
"   - Kick: Dorsiflexed ankles, knees <= shoulder width. Whip kick, not frog kick.",
"   - Glide: 0.3-0.5s streamline. Distance per stroke is king.",
"   - Body: Eyes down in glide, hips HIGH. Surf forward, not plow.",
"   - Pullout: 1 pull-down + 1 dolphin kick + 1 BR kick (World Aquatics legal).",
"   - Drills: Wall kick, 3-second glide, Tennis ball chin, BR pull with flutter.",
"",
"4. BUTTERFLY:",
"   - Undulation: Chest press (sternum down), wave through hips to feet. NOT hip-driven.",
"   - Kick: 2 per cycle. Big kick on entry (anchor catch), small on exit (aid recovery).",
"   - Arms: Wide low relaxed recovery. Simultaneous entry. Catch 80-120 deg.",
"   - Breathing: Chin forward not up. Every stroke (beginners) or every 2 (advanced).",
"   - Drills: Chest press with fins, One-arm fly, 3-kicks-1-pull, Vertical kicking.",
"",
"5. ENERGY SYSTEMS:",
"   - EN1 (Aerobic): 60-70% effort. Long swims 1000-3000m. Builds mitochondria.",
"   - EN2 (Threshold): 80-85% effort. 20-40 min sustainable. 5x400m @15-20s rest.",
"   - EN3 (VO2 Max): 90-95% effort. Intervals 100-400m.",
"   - SP1 (Lactate): 95-100%. 50-100m repeats, 1:1 work:rest.",
"   - SP2-3 (Speed): Max effort 15-50m. Long rest 1:3+. Neuromuscular speed.",
"",
"6. PERIODIZATION:",
"   - Base (4-6 wks): High volume, low intensity. 80-90% aerobic.",
"   - Build (3-4 wks): Moderate volume, increasing intensity. Threshold + VO2 max.",
"   - Peak (2-3 wks): Taper 30-50% volume, high intensity. Race-pace.",
"   - Recovery (1-2 wks): Active recovery, cross-training, drills.",
"",
"7. DRYLAND AND INJURY PREVENTION:",
"   - Core: Planks, dead bugs, pallof press. For rotation power.",
"   - Shoulders: Band pull-aparts, face pulls, external rotation. Prevent impingement.",
"   - Flexibility: Ankle dorsiflexion, shoulder internal rotation, thoracic mobility.",
"   - Strength: Lat pulldowns, squats, med ball throws.",
"   - Injuries: Swimmer shoulder, breaststroker knee (MCL), lower back (fly).",
"",
"### RESPONSE DEPTH RULES",
"1. Short questions: 150-200 words, 2-3 key points + visualization cue.",
"2. Technique questions: 300-400 words, root cause, 2-3 drills with biomechanical rationale.",
"3. Workout requests: Warmup > Pre-Set > Main Set > Cooldown > Total. Include zone labels.",
"4. Training plans: Week-by-week, volume, key sessions, progression, race simulation.",
"5. Always end technique answers with a Cue of the Day - a vivid visualization line.",
"",
"### RULES",
"1. ALWAYS explain WHY biomechanically when suggesting drills.",
"2. Structured workouts must include zone labels (EN1/EN2/EN3/SP1).",
"3. For pain/injury: advise PT + suggest temporary adjustments.",
"4. Only discuss swimming and swim-specific strength and conditioning. Redirect unrelated queries.",
"5. If user shares numbers/data, reference them specifically."
];
const systemPrompt = { role: "system", content: coachPromptLines.join("\n") };

let messageHistory = [systemPrompt];

// Conversation context management - prevent token overflow
const MAX_HISTORY_MESSAGES = 20;
function trimMessageHistory() {
    if (messageHistory.length > MAX_HISTORY_MESSAGES + 1) {
        messageHistory = [messageHistory[0], ...messageHistory.slice(-(MAX_HISTORY_MESSAGES))];
    }
}

// Toggle Chat Window
if(chatToggle && closeChat) {
    chatToggle.addEventListener('click', () => {
        chatPanel.classList.remove('hidden');
        chatInput.focus();
    });
    
    closeChat.addEventListener('click', () => {
        chatPanel.classList.add('hidden');
    });
}

function appendMessage(role, text) {
    const msgDiv = document.createElement('div');
    msgDiv.classList.add('message', role);
    
    if (role === 'ai' && typeof marked !== 'undefined') {
        // Parse markdown formatting for AI responses
        msgDiv.innerHTML = marked.parse(text);
    } else {
        msgDiv.textContent = text;
    }
    
    chatMessages.appendChild(msgDiv);
    chatMessages.scrollTop = chatMessages.scrollHeight;
}

function appendTypingIndicator() {
    const indicator = document.createElement('div');
    indicator.classList.add('typing-indicator');
    indicator.id = 'typingIndicator';
    indicator.innerHTML = '<span></span><span></span><span></span>';
    chatMessages.appendChild(indicator);
    chatMessages.scrollTop = chatMessages.scrollHeight;
}

function removeTypingIndicator() {
    const indicator = document.getElementById('typingIndicator');
    if(indicator) indicator.remove();
}

async function handleChatSend(overrideText) {
    const text = overrideText || (chatInput ? chatInput.value.trim() : '');
    if(!text) return;

    // Display user message
    appendMessage('user', text);
    if(chatInput) chatInput.value = '';
    
    // Hide quick actions after first message
    const quickActions = document.getElementById('quickActions');
    if (quickActions) {
        quickActions.style.display = 'none';
    }
    
    // Add to history and trim if needed
    messageHistory.push({ role: 'user', content: text });
    trimMessageHistory();
    
    appendTypingIndicator();

    try {
        const response = await fetch('/api/chat', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ messages: messageHistory })
        });
        
        removeTypingIndicator();

        if(!response.ok) {
            throw new Error("Server response error");
        }

        const reader = response.body.getReader();
        const decoder = new TextDecoder("utf-8");
        let aiFullText = "";
        let buffer = "";
        
        const msgDiv = document.createElement('div');
        msgDiv.classList.add('message', 'ai');
        chatMessages.appendChild(msgDiv);

        while (true) {
            const { done, value } = await reader.read();
            if (done) break;
            
            buffer += decoder.decode(value, {stream: true});
            const lines = buffer.split('\n');
            buffer = lines.pop() || "";
            
            for (const line of lines) {
                const trimmed = line.trim();
                if (trimmed.startsWith('data: ') && trimmed !== 'data: [DONE]') {
                    try {
                        const data = JSON.parse(trimmed.substring(6));
                        if(data.choices && data.choices[0].delta && data.choices[0].delta.content) {
                            aiFullText += data.choices[0].delta.content;
                        }
                    } catch(e) { /* ignore parse errors */ }
                }
            }
            if (typeof marked !== 'undefined') {
                msgDiv.innerHTML = marked.parse(aiFullText);
            } else {
                msgDiv.textContent = aiFullText;
            }
            chatMessages.scrollTop = chatMessages.scrollHeight;
        }
        
        messageHistory.push({ role: 'assistant', content: aiFullText });

    } catch (error) {
        removeTypingIndicator();
        console.error(error);
        appendMessage('ai', "Error connecting to the AI server. Please make sure the Node.js backend is running.");
    }
}

if(sendBtn && chatInput) {
    sendBtn.addEventListener('click', () => handleChatSend());
    chatInput.addEventListener('keypress', (e) => {
        if(e.key === 'Enter') handleChatSend();
    });
}

// Quick-Action Chip Handlers
document.querySelectorAll('.quick-chip').forEach(chip => {
    chip.addEventListener('click', () => {
        const msg = chip.getAttribute('data-msg');
        if(msg) handleChatSend(msg);
    });
});

/* =========================================
   AI MOTION ANALYSIS (VIDEO UPLOAD ONLY)
   ========================================= */
const videoElement = document.getElementById('inputVideo');
const canvasElement = document.getElementById('outputCanvas');
const canvasCtx = canvasElement?.getContext('2d');
const videoUpload = document.getElementById('videoUpload');
const loadingAnalysis = document.getElementById('loadingAnalysis');
const feedbackList = document.getElementById('feedbackList');
const canvasPlaceholder = document.getElementById('canvasPlaceholder');
const replayBtn = document.getElementById('replayBtn');
const clearVideoBtn = document.getElementById('clearVideoBtn');
const videoControls = document.getElementById('videoControls');

let isVideoUploaded = false;
let currentVideoURL = null;

// Only initialize MediaPipe if on the motion page
if (canvasElement && videoElement) {

// 1. Initialize MediaPipe Pose
const pose = new Pose({locateFile: (file) => {
  return `https://cdn.jsdelivr.net/npm/@mediapipe/pose/${file}`;
}});

pose.setOptions({
  modelComplexity: 1,
  smoothLandmarks: true,
  enableSegmentation: false,
  smoothSegmentation: false,
  minDetectionConfidence: 0.6,
  minTrackingConfidence: 0.6
});

// Helper: Calculate angle between 3 points (A, B, C) where B is the vertex
function calculateAngle(a, b, c) {
    const radians = Math.atan2(c.y - b.y, c.x - b.x) - Math.atan2(a.y - b.y, a.x - b.x);
    let angle = Math.abs(radians * 180.0 / Math.PI);
    if (angle > 180.0) {
        angle = 360 - angle;
    }
    return angle;
}

function showCanvas() {
    if(canvasPlaceholder) canvasPlaceholder.style.display = 'none';
    if(canvasElement) canvasElement.style.display = 'block';
    // Remove pulse border when active
    const container = canvasElement.closest('.pulse-border');
    if(container) container.classList.remove('pulse-border');
}

function resetToPlaceholder() {
    if(canvasPlaceholder) canvasPlaceholder.style.display = 'flex';
    if(canvasElement) {
        canvasElement.style.display = 'none';
        canvasCtx.clearRect(0, 0, canvasElement.width, canvasElement.height);
    }
    // Re-add pulse border
    const container = canvasElement.closest('.large-canvas-container');
    if(container && !container.classList.contains('pulse-border')) {
        container.classList.add('pulse-border');
    }
    if (container) container.classList.remove('hide-laser');
    if(videoControls) videoControls.style.display = 'none';
    if(feedbackList) feedbackList.innerHTML = '<li><em>Upload a swimming video to begin analysis. The AI will identify your stroke and generate a personalized coaching report with specific drills.</em></li>';
}

// Listen for stroke selector changes
const strokeSelectEl = document.getElementById('strokeSelect');
if (strokeSelectEl) {
    strokeSelectEl.addEventListener('change', (e) => {
        userStrokeOverride = e.target.value === 'auto' ? null : e.target.value;
    });
}

// 2. Process Pose Results
pose.onResults((results) => {
    canvasCtx.save();
    canvasCtx.clearRect(0, 0, canvasElement.width, canvasElement.height);
    
    // Draw the original video frame onto the canvas
    canvasCtx.drawImage(results.image, 0, 0, canvasElement.width, canvasElement.height);
  
    // Hide loading text once tracking starts
    if(loadingAnalysis) loadingAnalysis.style.display = 'none';

    if (results.poseLandmarks) {
        // Draw the skeleton overlay
        drawConnectors(canvasCtx, results.poseLandmarks, POSE_CONNECTIONS,
                       {color: '#2563eb', lineWidth: 4});
        drawLandmarks(canvasCtx, results.poseLandmarks,
                      {color: '#0ea5e9', lineWidth: 2, radius: 4});
                      
        // Biomechanical Analysis Engine
        analyzeSwimmingAngles(results.poseLandmarks);
    }
    canvasCtx.restore();
});

// 3. ==========================================
//    SMART SWIMMING ANALYSIS ENGINE v3.0
//    Stroke Recognition + Enhanced Per-Stroke Metrics
// ==========================================

// --- Stroke Classification Votes ---
let strokeVotes = { freestyle: 0, backstroke: 0, breaststroke: 0, butterfly: 0 };

// --- Per-Stroke Metrics Collector ---
let analysisReport = {
    framesAnalyzed: 0,
    strokeDetected: 'unknown',
    metrics: {
        // === Shared (all strokes) ===
        avgLeftElbowAngle: [],
        avgRightElbowAngle: [],
        avgShoulderTilt: [],
        headPositionDiffs: [],
        bodyLineAngles: [],
        hipDropCount: 0,
        // NEW: Knee angles (over-bend detection)
        avgLeftKneeAngle: [],
        avgRightKneeAngle: [],
        // NEW: Hip angles (body line / undulation phase)
        avgLeftHipAngle: [],
        avgRightHipAngle: [],
        // NEW: Wrist entry position relative to shoulder width
        wristEntryPositions: [],
        // NEW: Body roll range (min/max shoulder tilt per analysis)
        shoulderTiltMin: Infinity,
        shoulderTiltMax: -Infinity,
        // NEW: Head stability (collect all for variance calc)
        headYPositions: [],
        // NEW: Ankle vertical positions for kick tempo
        leftAnkleYHistory: [],
        rightAnkleYHistory: [],

        // === Freestyle / Backstroke ===
        leftCrossoverCount: 0,
        rightCrossoverCount: 0,
        armAlternationScore: 0,
        armSimultaneousScore: 0,

        // === Breaststroke ===
        kneeWidthRatios: [],
        armSymmetryScores: [],
        glideFrames: 0,
        activeFrames: 0,

        // === Butterfly ===
        bodyUndulationAmplitudes: [],
        doubleKickDetected: 0,
        singleKickDetected: 0,
    }
};

// User-selected stroke override
let userStrokeOverride = null;

function resetAnalysisReport() {
    analysisReport.framesAnalyzed = 0;
    analysisReport.strokeDetected = 'unknown';
    strokeVotes = { freestyle: 0, backstroke: 0, breaststroke: 0, butterfly: 0 };
    const m = analysisReport.metrics;
    // Shared
    m.avgLeftElbowAngle = [];
    m.avgRightElbowAngle = [];
    m.avgShoulderTilt = [];
    m.headPositionDiffs = [];
    m.bodyLineAngles = [];
    m.hipDropCount = 0;
    m.avgLeftKneeAngle = [];
    m.avgRightKneeAngle = [];
    m.avgLeftHipAngle = [];
    m.avgRightHipAngle = [];
    m.wristEntryPositions = [];
    m.shoulderTiltMin = Infinity;
    m.shoulderTiltMax = -Infinity;
    m.headYPositions = [];
    m.leftAnkleYHistory = [];
    m.rightAnkleYHistory = [];
    // Freestyle / Backstroke
    m.leftCrossoverCount = 0;
    m.rightCrossoverCount = 0;
    m.armAlternationScore = 0;
    m.armSimultaneousScore = 0;
    // Breaststroke
    m.kneeWidthRatios = [];
    m.armSymmetryScores = [];
    m.glideFrames = 0;
    m.activeFrames = 0;
    // Butterfly
    m.bodyUndulationAmplitudes = [];
    m.doubleKickDetected = 0;
    m.singleKickDetected = 0;
}

let prevLeftWristY = null;
let prevRightWristY = null;
let frameCount = 0;

function analyzeSwimmingAngles(landmarks) {
    frameCount++;
    if (frameCount % 3 !== 0) return; // Sample every 3 frames for higher data density

    const nose = landmarks[0];
    const leftEar = landmarks[7];
    const rightEar = landmarks[8];
    const leftShoulder = landmarks[11];
    const rightShoulder = landmarks[12];
    const leftElbow = landmarks[13];
    const rightElbow = landmarks[14];
    const leftWrist = landmarks[15];
    const rightWrist = landmarks[16];
    const leftHip = landmarks[23];
    const rightHip = landmarks[24];
    const leftKnee = landmarks[25];
    const rightKnee = landmarks[26];
    const leftAnkle = landmarks[27];
    const rightAnkle = landmarks[28];

    if (leftShoulder.visibility < 0.4 || rightShoulder.visibility < 0.4) return;

    analysisReport.framesAnalyzed++;
    const m = analysisReport.metrics;

    // ============ STROKE CLASSIFICATION (Enhanced v3.1 — Anti-Misidentification) ============
    const shoulderMidY = (leftShoulder.y + rightShoulder.y) / 2;
    const hipMidY_cls = (leftHip.visibility > 0.3 && rightHip.visibility > 0.3) ? (leftHip.y + rightHip.y) / 2 : shoulderMidY + 0.2;

    // --- Face orientation (ultra-strict for backstroke) ---
    const earMidY = (leftEar.visibility > 0.3 && rightEar.visibility > 0.3) ? (leftEar.y + rightEar.y) / 2 : nose.y;

    // BACKSTROKE requires an EXTREMELY strict face-up check.
    // The nose must be far above the shoulder midpoint (threshold 0.12, up from 0.08)
    // AND the ears must also be clearly above the shoulders.
    const noseAboveShoulders = nose.visibility > 0.6 && nose.y < shoulderMidY - 0.12;
    const earsAboveShoulders = earMidY < shoulderMidY - 0.08;
    const isFaceUp_raw = noseAboveShoulders && earsAboveShoulders;

    // CRITICAL: Secondary validation — in backstroke the hips are near or above shoulders
    // (supine position). In freestyle breathing, hips are always BELOW shoulders.
    const hipsNearOrAboveShoulders = hipMidY_cls <= shoulderMidY + 0.05;
    // Only confirm backstroke face-up if hips also support supine position
    const isFaceUp = isFaceUp_raw && hipsNearOrAboveShoulders;

    // Face down: nose at or below shoulder line
    const isFaceDown = nose.visibility > 0.4 && nose.y >= shoulderMidY - 0.02;
    // Face neutral: nose slightly above shoulders (freestyle breathing)
    const isFaceNeutral = !isFaceUp && !isFaceDown;

    // --- Arm positions ---
    const leftArmUp = leftWrist.visibility > 0.3 && leftWrist.y < leftShoulder.y - 0.03;
    const rightArmUp = rightWrist.visibility > 0.3 && rightWrist.y < rightShoulder.y - 0.03;
    const bothArmsUp = leftArmUp && rightArmUp;
    const oneArmUp = (leftArmUp && !rightArmUp) || (!leftArmUp && rightArmUp);
    const neitherArmUp = !leftArmUp && !rightArmUp;

    // Arm symmetry
    const wristYDiff = Math.abs((leftWrist.y || 0) - (rightWrist.y || 0));
    const armsSymmetric = wristYDiff < 0.07;
    const armsAsymmetric = wristYDiff > 0.10;

    // --- Leg metrics ---
    let kneeWidth = 0, ankleWidth = 0;
    let shoulderWidth = Math.abs(leftShoulder.x - rightShoulder.x);
    if (leftKnee.visibility > 0.3 && rightKnee.visibility > 0.3) {
        kneeWidth = Math.abs(leftKnee.x - rightKnee.x);
    }
    if (leftAnkle.visibility > 0.3 && rightAnkle.visibility > 0.3) {
        ankleWidth = Math.abs(leftAnkle.x - rightAnkle.x);
    }

    const breaststrokeKickPattern = kneeWidth > shoulderWidth * 0.7 && kneeWidth > 0;
    const flutterKickPattern = kneeWidth > 0 && kneeWidth < shoulderWidth * 0.6;

    // --- Body undulation: butterfly signal ---
    let currentUndulation = 0;
    if (leftHip.visibility > 0.4 && rightHip.visibility > 0.4) {
        const hipMidY_und = (leftHip.y + rightHip.y) / 2;
        currentUndulation = Math.abs(hipMidY_und - shoulderMidY);
    }
    const significantUndulation = currentUndulation > 0.12;

    // === WEIGHTED VOTING WITH PENALTIES (v3.1) ===

    // --- BACKSTROKE: requires CONFIRMED face-up (strict + hip validation) ---
    if (isFaceUp) {
        strokeVotes.backstroke += 5;
        if (oneArmUp && armsAsymmetric) strokeVotes.backstroke += 2;
        if (flutterKickPattern) strokeVotes.backstroke += 1;
        strokeVotes.freestyle -= 3;
        strokeVotes.breaststroke -= 2;
        strokeVotes.butterfly -= 2;
    }
    // If raw face-up WITHOUT hip support → likely freestyle breathing. Boost freestyle instead.
    if (isFaceUp_raw && !hipsNearOrAboveShoulders) {
        strokeVotes.freestyle += 2; // breathing moment in freestyle
        strokeVotes.backstroke -= 1; // penalize backstroke for this frame
    }

    // --- FREESTYLE: face down/neutral + alternating arms ---
    if ((isFaceDown || isFaceNeutral) && oneArmUp && armsAsymmetric) {
        strokeVotes.freestyle += 5;
        if (flutterKickPattern) strokeVotes.freestyle += 2;
        strokeVotes.backstroke -= 1;
        strokeVotes.breaststroke -= 1;
        strokeVotes.butterfly -= 1;
    }
    // Even if face briefly neutral (breathing), alternating arms is very strong freestyle signal
    if (oneArmUp && armsAsymmetric && !isFaceUp) {
        strokeVotes.freestyle += 2;
    }
    // Both arms up = NOT freestyle
    if (bothArmsUp) {
        strokeVotes.freestyle -= 2;
    }

    // --- BREASTSTROKE: symmetric arms + wide kick ---
    if ((isFaceDown || isFaceNeutral) && armsSymmetric && breaststrokeKickPattern) {
        strokeVotes.breaststroke += 5;
        strokeVotes.freestyle -= 1;
    } else if (breaststrokeKickPattern && armsSymmetric) {
        strokeVotes.breaststroke += 3;
    } else if (breaststrokeKickPattern) {
        strokeVotes.breaststroke += 1;
    }
    if (neitherArmUp && armsSymmetric && isFaceDown) {
        strokeVotes.breaststroke += 2;
        m.glideFrames++;
    }

    // --- BUTTERFLY: both arms up + undulation + narrow kick ---
    if (isFaceDown && bothArmsUp && armsSymmetric && !breaststrokeKickPattern) {
        strokeVotes.butterfly += 4;
        if (significantUndulation) strokeVotes.butterfly += 2;
        strokeVotes.breaststroke -= 1;
    }
    if (significantUndulation && bothArmsUp) {
        strokeVotes.butterfly += 2;
        strokeVotes.breaststroke -= 1;
    }
    if (oneArmUp && !bothArmsUp) {
        strokeVotes.butterfly -= 1;
    }

    // ============ COLLECT UNIVERSAL METRICS ============

    // Elbow angles (catch quality indicator)
    if (leftElbow.visibility > 0.5 && leftWrist.visibility > 0.5) {
        m.avgLeftElbowAngle.push(calculateAngle(leftShoulder, leftElbow, leftWrist));
    }
    if (rightElbow.visibility > 0.5 && rightWrist.visibility > 0.5) {
        m.avgRightElbowAngle.push(calculateAngle(rightShoulder, rightElbow, rightWrist));
    }

    // NEW: Knee angles (kick efficiency — over-bend = drag)
    if (leftKnee.visibility > 0.4 && leftAnkle.visibility > 0.4 && leftHip.visibility > 0.4) {
        m.avgLeftKneeAngle.push(calculateAngle(leftHip, leftKnee, leftAnkle));
    }
    if (rightKnee.visibility > 0.4 && rightAnkle.visibility > 0.4 && rightHip.visibility > 0.4) {
        m.avgRightKneeAngle.push(calculateAngle(rightHip, rightKnee, rightAnkle));
    }

    // NEW: Hip angles (body line quality, extension)
    if (leftHip.visibility > 0.4 && leftKnee.visibility > 0.4) {
        m.avgLeftHipAngle.push(calculateAngle(leftShoulder, leftHip, leftKnee));
    }
    if (rightHip.visibility > 0.4 && rightKnee.visibility > 0.4) {
        m.avgRightHipAngle.push(calculateAngle(rightShoulder, rightHip, rightKnee));
    }

    // Shoulder tilt (rotation / body roll)
    const currentTilt = Math.abs(leftShoulder.y - rightShoulder.y);
    m.avgShoulderTilt.push(currentTilt);
    // NEW: Track min/max for body roll range
    if (currentTilt < m.shoulderTiltMin) m.shoulderTiltMin = currentTilt;
    if (currentTilt > m.shoulderTiltMax) m.shoulderTiltMax = currentTilt;

    // Head position relative to shoulder line
    if (nose.visibility > 0.5) {
        m.headPositionDiffs.push(shoulderMidY - nose.y);
        // NEW: raw Y positions for head stability variance
        m.headYPositions.push(nose.y);
    }

    // NEW: Wrist entry position (distance from shoulder line)
    const midline = (leftShoulder.x + rightShoulder.x) / 2;
    if (leftWrist.visibility > 0.5 && leftWrist.y < leftShoulder.y) {
        m.wristEntryPositions.push(Math.abs(leftWrist.x - leftShoulder.x) / shoulderWidth);
    }
    if (rightWrist.visibility > 0.5 && rightWrist.y < rightShoulder.y) {
        m.wristEntryPositions.push(Math.abs(rightWrist.x - rightShoulder.x) / shoulderWidth);
    }

    // NEW: Ankle Y positions for kick tempo analysis
    if (leftAnkle.visibility > 0.3) m.leftAnkleYHistory.push(leftAnkle.y);
    if (rightAnkle.visibility > 0.3) m.rightAnkleYHistory.push(rightAnkle.y);

    // Body line angle (shoulder-hip alignment)
    if (leftHip.visibility > 0.4 && rightHip.visibility > 0.4) {
        const hipMidY = (leftHip.y + rightHip.y) / 2;
        const hipMidX = (leftHip.x + rightHip.x) / 2;
        const shoulderMidX = (leftShoulder.x + rightShoulder.x) / 2;
        const bodyAngle = Math.atan2(hipMidY - shoulderMidY, hipMidX - shoulderMidX) * 180 / Math.PI;
        m.bodyLineAngles.push(bodyAngle);
        // Hip drop detection
        if (hipMidY > shoulderMidY + 0.12) m.hipDropCount++;
    }

    // ============ FREESTYLE/BACKSTROKE SPECIFIC ============
    // Crossover detection
    if (leftWrist.visibility > 0.5 && leftWrist.y < leftShoulder.y && leftWrist.x > midline + 0.06) {
        m.leftCrossoverCount++;
    }
    if (rightWrist.visibility > 0.5 && rightWrist.y < rightShoulder.y && rightWrist.x < midline - 0.06) {
        m.rightCrossoverCount++;
    }

    // Arm alternation vs simultaneous
    if (oneArmUp) m.armAlternationScore++;
    if (bothArmsUp) m.armSimultaneousScore++;

    // ============ BREASTSTROKE SPECIFIC ============
    if (kneeWidth > 0 && shoulderWidth > 0) {
        m.kneeWidthRatios.push(kneeWidth / shoulderWidth);
    }
    if (armsSymmetric) {
        m.armSymmetryScores.push(1 - wristYDiff);
    }
    // NEW: Glide vs active ratio
    if (neitherArmUp && armsSymmetric) {
        m.glideFrames++;
    } else {
        m.activeFrames++;
    }

    // ============ BUTTERFLY SPECIFIC ============
    // Body undulation (hip-shoulder vertical oscillation)
    if (leftHip.visibility > 0.4 && rightHip.visibility > 0.4) {
        const hipMidY2 = (leftHip.y + rightHip.y) / 2;
        m.bodyUndulationAmplitudes.push(Math.abs(hipMidY2 - shoulderMidY));
    }

    // Track wrist positions for alternation detection
    prevLeftWristY = leftWrist.y;
    prevRightWristY = rightWrist.y;
}

// ============ DETERMINE FINAL STROKE ============
function determineFinalStroke() {
    // Always use user's manual selection
    if (userStrokeOverride && userStrokeOverride !== '') {
        return userStrokeOverride;
    }
    return 'freestyle'; // fallback default
}

// ============ COMPUTE SUMMARY STATS ============
function computeSummary() {
    const m = analysisReport.metrics;
    const total = analysisReport.framesAnalyzed;
    const stroke = determineFinalStroke();
    analysisReport.strokeDetected = stroke;

    const avg = arr => arr.length > 0 ? (arr.reduce((a, b) => a + b, 0) / arr.length).toFixed(1) : 'N/A';
    const pct = val => total > 0 ? ((val / total) * 100).toFixed(0) : '0';
    const stddev = arr => {
        if (arr.length < 2) return 'N/A';
        const mean = arr.reduce((a, b) => a + b, 0) / arr.length;
        const variance = arr.reduce((sum, v) => sum + (v - mean) ** 2, 0) / arr.length;
        return Math.sqrt(variance).toFixed(4);
    };
    const cv = arr => {
        if (arr.length < 2) return 'N/A';
        const mean = arr.reduce((a, b) => a + b, 0) / arr.length;
        if (mean === 0) return 'N/A';
        const sd = Math.sqrt(arr.reduce((sum, v) => sum + (v - mean) ** 2, 0) / arr.length);
        return ((sd / mean) * 100).toFixed(1);
    };

    // NEW: Trimmed mean — removes top/bottom 10% outliers for noise resistance
    const trimmedAvg = arr => {
        if (arr.length < 5) return avg(arr);
        const sorted = [...arr].sort((a, b) => a - b);
        const trim = Math.floor(sorted.length * 0.1);
        const trimmed = sorted.slice(trim, sorted.length - trim);
        return (trimmed.reduce((a, b) => a + b, 0) / trimmed.length).toFixed(1);
    };

    // NEW: Median — more robust central tendency for skewed distributions
    const median = arr => {
        if (arr.length === 0) return 'N/A';
        const sorted = [...arr].sort((a, b) => a - b);
        const mid = Math.floor(sorted.length / 2);
        return (sorted.length % 2 ? sorted[mid] : (sorted[mid - 1] + sorted[mid]) / 2).toFixed(1);
    };

    return {
        stroke: stroke,
        totalFrames: total,
        votes: strokeVotes,
        // --- Elbow (catch quality) — using trimmedAvg for noise resistance ---
        avgLeftElbow: trimmedAvg(m.avgLeftElbowAngle),
        avgRightElbow: trimmedAvg(m.avgRightElbowAngle),
        medianLeftElbow: median(m.avgLeftElbowAngle),
        medianRightElbow: median(m.avgRightElbowAngle),
        minLeftElbow: m.avgLeftElbowAngle.length > 0 ? Math.min(...m.avgLeftElbowAngle).toFixed(0) : 'N/A',
        minRightElbow: m.avgRightElbowAngle.length > 0 ? Math.min(...m.avgRightElbowAngle).toFixed(0) : 'N/A',
        // --- Knee (kick efficiency) — using trimmedAvg ---
        avgLeftKnee: trimmedAvg(m.avgLeftKneeAngle),
        avgRightKnee: trimmedAvg(m.avgRightKneeAngle),
        medianLeftKnee: median(m.avgLeftKneeAngle),
        medianRightKnee: median(m.avgRightKneeAngle),
        // --- Hip (body extension) — using trimmedAvg ---
        avgLeftHip: trimmedAvg(m.avgLeftHipAngle),
        avgRightHip: trimmedAvg(m.avgRightHipAngle),
        // --- Shoulder / Body Roll ---
        avgShoulderTilt: trimmedAvg(m.avgShoulderTilt),
        maxShoulderTilt: m.avgShoulderTilt.length > 0 ? Math.max(...m.avgShoulderTilt).toFixed(3) : 'N/A',
        bodyRollRange: (m.shoulderTiltMax !== -Infinity && m.shoulderTiltMin !== Infinity)
            ? (m.shoulderTiltMax - m.shoulderTiltMin).toFixed(3) : 'N/A',
        // --- Head ---
        avgHeadDiff: trimmedAvg(m.headPositionDiffs),
        headStabilityVariance: stddev(m.headYPositions),
        // --- Body Line ---
        avgBodyAngle: trimmedAvg(m.bodyLineAngles),
        hipDropPct: pct(m.hipDropCount),
        // --- Wrist Entry ---
        avgWristEntryWidth: trimmedAvg(m.wristEntryPositions),
        // --- Kick Tempo ---
        kickTempoCV: cv(m.leftAnkleYHistory.length > m.rightAnkleYHistory.length ? m.leftAnkleYHistory : m.rightAnkleYHistory),
        // --- Arm Pattern ---
        crossoverLeftPct: pct(m.leftCrossoverCount),
        crossoverRightPct: pct(m.rightCrossoverCount),
        armAlternationPct: pct(m.armAlternationScore),
        armSimultaneousPct: pct(m.armSimultaneousScore),
        // --- Breaststroke ---
        avgKneeWidthRatio: trimmedAvg(m.kneeWidthRatios),
        armSymmetry: trimmedAvg(m.armSymmetryScores),
        glideToActiveRatio: (m.glideFrames + m.activeFrames) > 0
            ? (m.glideFrames / (m.glideFrames + m.activeFrames)).toFixed(2) : 'N/A',
        // --- Butterfly ---
        avgUndulation: trimmedAvg(m.bodyUndulationAmplitudes),
        undulationCV: cv(m.bodyUndulationAmplitudes),
        // --- NEW: Left/Right Symmetry Analysis ---
        elbowSymmetry: m.avgLeftElbowAngle.length > 0 && m.avgRightElbowAngle.length > 0
            ? (1 - Math.abs(parseFloat(avg(m.avgLeftElbowAngle)) - parseFloat(avg(m.avgRightElbowAngle))) / 180).toFixed(2)
            : 'N/A',
        kneeSymmetry: m.avgLeftKneeAngle.length > 0 && m.avgRightKneeAngle.length > 0
            ? (1 - Math.abs(parseFloat(avg(m.avgLeftKneeAngle)) - parseFloat(avg(m.avgRightKneeAngle))) / 180).toFixed(2)
            : 'N/A',
        // --- NEW: Data Quality Indicators ---
        dataQuality: {
            totalFrames: total,
            validFrameRatio: frameCount > 0 ? (total / Math.ceil(frameCount / 3)).toFixed(2) : '0',
        }
    };
}

// ============ REPORT TEXT PRE-PROCESSING ============
// Fix formatting issues from AI output before markdown parsing
function fixReportFormatting(text) {
    // Comprehensive regex to merge emoji on separate lines with the following text
    // Match any line that is just a list item with an emoji, followed by a new line with bold text
    const emojiPattern = /[🔴🟡🟢🔵🟠⚪⚫🔶🔷]/u;
    
    // Split into lines and merge emoji-only lines with the next line
    const lines = text.split('\n');
    const result = [];
    for (let i = 0; i < lines.length; i++) {
        const trimmed = lines[i].trim();
        // Check if this line is a list item with only an emoji (e.g., "- 🔴" or "* 🔴")
        const isEmojiOnlyListItem = /^[-*]\s*(🔴|🟡|🟢|🔵|🟠)\s*$/.test(trimmed);
        // Check if this line is just an emoji with no list marker
        const isEmojiOnly = /^(🔴|🟡|🟢|🔵|🟠)\s*$/.test(trimmed);
        
        if ((isEmojiOnlyListItem || isEmojiOnly) && i + 1 < lines.length) {
            // Get the leading whitespace and dash from current line
            const leadingMatch = lines[i].match(/^(\s*[-*]\s*)/);
            const emoji = trimmed.replace(/^[-*]\s*/, '').trim();
            const nextLine = lines[i + 1].trim();
            
            if (leadingMatch) {
                // Merge: "- 🔴" + "\n**High Priority..." -> "- 🔴 **High Priority..."
                result.push(leadingMatch[1] + emoji + ' ' + nextLine);
            } else {
                // Merge without dash
                result.push(emoji + ' ' + nextLine);
            }
            i++; // Skip next line since we merged it
        } else {
            result.push(lines[i]);
        }
    }
    return result.join('\n');
}

// Post-process rendered HTML to merge any leftover emoji-only list items
function fixRenderedHTML(html) {
    const container = document.createElement('div');
    container.innerHTML = html;
    
    const listItems = container.querySelectorAll('li');
    for (let i = 0; i < listItems.length - 1; i++) {
        const text = listItems[i].textContent.trim();
        // If this li contains only an emoji
        if (/^(🔴|🟡|🟢|🔵|🟠)$/.test(text)) {
            // Merge with next li
            const nextLi = listItems[i + 1];
            nextLi.innerHTML = text + ' ' + nextLi.innerHTML;
            listItems[i].remove();
        }
    }
    
    return container.innerHTML;
}

// ============ AI REPORT GENERATION ============
async function generateAIReport(summary) {
    const strokeNames = { freestyle: 'Freestyle', backstroke: 'Backstroke', breaststroke: 'Breaststroke', butterfly: 'Butterfly' };
    const strokeName = strokeNames[summary.stroke] || summary.stroke;

    const reportBox = document.getElementById('aiFeedbackBox');
    feedbackList.innerHTML = `<li style="text-align: center; padding: 2rem;">
        <div class="pulse-dot" style="width: 12px; height: 12px; margin: 0 auto 1rem auto;"></div>
        <strong style="color: var(--accent-cyan);">AI is generating your personalized coaching report...</strong>
        <br><span style="color: var(--text-muted); font-size: 0.9rem;">Stroke detected: <strong>${strokeName}</strong></span>
    </li>`;

    const dataPayload = JSON.stringify(summary, null, 2);

    try {
        // Automatically route to localhost:3000 if not on the main server port or running via file://
        const isLocalDev = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1' || window.location.protocol === 'file:';
        const isCorrectPort = window.location.port === '3000';
        const baseUrl = (isLocalDev && !isCorrectPort) ? 'http://localhost:3000' : '';

        const response = await fetch(`${baseUrl}/api/analyze`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ stroke: summary.stroke, data: dataPayload })
        });

        if (!response.ok) throw new Error('Server error');

        // Stream the response
        const reader = response.body.getReader();
        const decoder = new TextDecoder('utf-8');
        let fullText = '';
        let buffer = '';

        feedbackList.innerHTML = '';
        const reportDiv = document.createElement('div');
        reportDiv.style.cssText = 'color: var(--text-main); line-height: 1.8; font-size: 1rem;';
        feedbackList.appendChild(reportDiv);

        while (true) {
            const { done, value } = await reader.read();
            if (done) break;

            buffer += decoder.decode(value, { stream: true });
            const lines = buffer.split('\n');
            buffer = lines.pop() || '';

            for (const line of lines) {
                const trimmed = line.trim();
                if (trimmed.startsWith('data: ') && trimmed !== 'data: [DONE]') {
                    try {
                        const data = JSON.parse(trimmed.substring(6));
                        if (data.choices && data.choices[0].delta && data.choices[0].delta.content) {
                            fullText += data.choices[0].delta.content;
                        }
                    } catch (e) { /* ignore */ }
                }
            }
            if (typeof marked !== 'undefined') {
                reportDiv.innerHTML = fixRenderedHTML(marked.parse(fixReportFormatting(fullText)));
            } else {
                reportDiv.textContent = fullText;
            }
            reportBox.scrollTop = reportBox.scrollHeight;
        }
        
        // Show laser back after analysis
        const container = canvasElement.closest('.large-canvas-container');
        if (container) container.classList.remove('hide-laser');

    } catch (err) {
        console.error('AI Report error:', err);
        
        // Show laser back even on error
        const container = canvasElement.closest('.large-canvas-container');
        if (container) container.classList.remove('hide-laser');

        feedbackList.innerHTML = `<li><strong style="color: #ff4a4a;">Could not generate AI report.</strong><br>
            <span style="color: #a0aec0;">Falling back to local analysis...</span></li>`;
        showLocalFallbackReport(summary);
    }
}

// Local fallback if AI is unavailable
function showLocalFallbackReport(summary) {
    const threshold = 0.2;
    const total = summary.totalFrames;
    if (total === 0) { updateFeedback('Not enough frames.', 'warning'); return; }

    addFeedbackItem(`Stroke: ${summary.stroke.charAt(0).toUpperCase() + summary.stroke.slice(1)}`, `Detected with ${Math.max(...Object.values(summary.votes))} confidence votes.`, 'neutral');

    if (parseFloat(summary.avgLeftElbow) > 155 || parseFloat(summary.avgRightElbow) > 155) {
        addFeedbackItem('Dropped Elbow', `Avg elbow angle: L=${summary.avgLeftElbow}° R=${summary.avgRightElbow}°. Aim for 90-130° during the catch.`, 'error');
    }
    if (parseFloat(summary.avgHeadDiff) > 0.08) {
        addFeedbackItem('Head Too High', 'Your head lifts above the body line frequently. Keep a neutral spine.', 'warning');
    }
    if (parseFloat(summary.hipDropPct) > 25) {
        addFeedbackItem('Hips Dropping', `Hips dropped in ${summary.hipDropPct}% of frames. Engage your core.`, 'warning');
    }
    if (parseFloat(summary.crossoverLeftPct) > 15 || parseFloat(summary.crossoverRightPct) > 15) {
        addFeedbackItem('Arm Crossover', `L: ${summary.crossoverLeftPct}%, R: ${summary.crossoverRightPct}%. Enter hands in line with your shoulder.`, 'error');
    }
    if (parseFloat(summary.avgShoulderTilt) < 0.02) {
        addFeedbackItem('Flat Body', 'You lack body rotation. Rotate from your hips for more power.', 'warning');
    }
}

async function showFinalReport() {
    const summary = computeSummary();
    if (summary.totalFrames === 0) {
        updateFeedback('Not enough clear frames for analysis. Try a video with better visibility.', 'warning');
        return;
    }
    await generateAIReport(summary);
}

function addFeedbackItem(title, text, type) {
    const li = document.createElement('li');
    let color = 'var(--text-main)';
    if (type === 'error') color = '#ff4a4a';
    if (type === 'success') color = '#0ea5e9';
    if (type === 'warning') color = '#f39c12';

    li.innerHTML = `<strong style="color: ${color}">${title}</strong><br><span style="color: var(--text-muted); font-size: 0.95rem; display: block; margin-top: 0.3rem;">${text}</span>`;
    li.style.marginBottom = '1rem';
    feedbackList.appendChild(li);
}

function updateFeedback(text, type = 'neutral') {
    feedbackList.innerHTML = `<li><em>${text}</em></li>`;
}

// 4. Video Upload Processing Loop
async function processUploadedVideo() {
    if(!videoElement || videoElement.paused || videoElement.ended) {
        if(videoElement && videoElement.ended) {
            showFinalReport();
        }
        return;
    }
    
    try {
        await pose.send({image: videoElement});
    } catch(err) {
        console.error("Pose processing error:", err);
    }
    requestAnimationFrame(processUploadedVideo);
}

// 5. Video Upload & Analysis Handlers
const uploadVideoBtn = document.getElementById('uploadVideoBtn');
const startAnalysisBtn = document.getElementById('startAnalysisBtn');
const startAlert = document.getElementById('startAlert');

if (uploadVideoBtn && videoUpload) {
    uploadVideoBtn.addEventListener('click', () => {
        videoUpload.click();
    });
}

if (startAnalysisBtn) {
    startAnalysisBtn.addEventListener('click', () => {
        const strokeSelectEl = document.getElementById('strokeSelect');
        if (!strokeSelectEl || !strokeSelectEl.value || strokeSelectEl.value === "" || !isVideoUploaded) {
            if (startAlert) {
                startAlert.style.display = 'block';
                void startAlert.offsetWidth;
                startAlert.style.opacity = '1';
                setTimeout(() => {
                    startAlert.style.opacity = '0';
                    setTimeout(() => { startAlert.style.display = 'none'; }, 300);
                }, 3000);
            }
            return;
        }
        
        
        if (loadingAnalysis) loadingAnalysis.style.display = 'block';

        // Hide laser during active analysis
        const container = canvasElement.closest('.large-canvas-container');
        if (container) container.classList.add('hide-laser');

        resetAnalysisReport();
        videoElement.currentTime = 0;
        videoElement.play().then(() => {
            updateFeedback("Video analysis in progress... The coaching report will be generated once playback completes.", "neutral");
            processUploadedVideo();
        }).catch(err => {
            console.error("Video play error:", err);
            updateFeedback("Could not play video. Try a different format (MP4 recommended).", "warning");
        });
    });
}

if (videoUpload) {
    videoUpload.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (!file) return;

        // Clean up previous video URL
        if(currentVideoURL) {
            URL.revokeObjectURL(currentVideoURL);
        }

        resetAnalysisReport();
        showCanvas();
        if(loadingAnalysis) loadingAnalysis.style.display = 'block';
        isVideoUploaded = true;
        
        currentVideoURL = URL.createObjectURL(file);
        videoElement.src = currentVideoURL;
        
        // Important: must set these before playing
        videoElement.muted = true; // Required for autoplay in some browsers
        videoElement.playsInline = true;
        
        videoElement.onloadeddata = () => {
            // Match canvas size to video aspect ratio
            const ratio = videoElement.videoWidth / videoElement.videoHeight;
            canvasElement.width = 800;
            canvasElement.height = Math.round(800 / ratio);
            
            // Render first frame for preview
            canvasCtx.drawImage(videoElement, 0, 0, canvasElement.width, canvasElement.height);
            
            updateFeedback("✅ Video uploaded. Please select a stroke and click 'Start Analysis' to begin.", "neutral");
            if(videoControls) videoControls.style.display = 'block';
            if(loadingAnalysis) loadingAnalysis.style.display = 'none';
        };
        
        videoElement.onerror = () => {
            updateFeedback("Failed to load video. Please try a different file.", "warning");
            if(loadingAnalysis) loadingAnalysis.style.display = 'none';
        };
    });
}

// 6. Replay & Clear buttons
if(replayBtn) {
    replayBtn.addEventListener('click', () => {
        if(videoElement && currentVideoURL) {
            resetAnalysisReport();
            videoElement.currentTime = 0;
            videoElement.play().then(() => {
                updateFeedback("⚙️ Re-analyzing video... Please wait for completion.", "neutral");
                
                // Hide laser during active analysis
                const container = canvasElement.closest('.large-canvas-container');
                if (container) container.classList.add('hide-laser');

                processUploadedVideo();
            });
        }
    });
}

if(clearVideoBtn) {
    clearVideoBtn.addEventListener('click', () => {
        if(videoElement) {
            videoElement.pause();
            videoElement.removeAttribute('src');
            videoElement.load();
        }
        if(currentVideoURL) {
            URL.revokeObjectURL(currentVideoURL);
            currentVideoURL = null;
        }
        isVideoUploaded = false;
        resetAnalysisReport();
        // Reset file input so the same file can be re-selected
        if(videoUpload) videoUpload.value = '';
        resetToPlaceholder();
    });
}

} // end of canvasElement if block
