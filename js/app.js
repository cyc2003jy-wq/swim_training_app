/* =========================================
   AQUAFLOW - INTERACTIVITY
   ========================================= */

document.addEventListener('DOMContentLoaded', () => {
    
    // 1. Navbar Scroll Effect (Glassmorphism gets stronger on scroll)
    const navbar = document.querySelector('.navbar');
    
    window.addEventListener('scroll', () => {
        if (window.scrollY > 50) {
            navbar.style.background = 'rgba(10, 17, 40, 0.8)';
            navbar.style.boxShadow = '0 4px 30px rgba(0, 0, 0, 0.5)';
        } else {
            navbar.style.background = 'rgba(10, 17, 40, 0.45)';
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
            this.hue = Math.random() > 0.5 ? 190 : 200; // cyan-ish
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
                    ctx.strokeStyle = `rgba(0, 242, 254, ${opacity})`;
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
        ctx.fillStyle = '#a0aec0';
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
        gradient.addColorStop(0, '#00f2fe');
        gradient.addColorStop(1, 'rgba(79, 172, 254, 0.3)');
        
        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.roundRect(x, y, barWidth, barHeight, [6, 6, 0, 0]);
        ctx.fill();
        
        // Distance label on top
        ctx.fillStyle = '#fff';
        ctx.font = 'bold 11px Inter, sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText(`${dist}m`, x + barWidth / 2, y - 6);
        
        // Date label at bottom
        ctx.fillStyle = '#a0aec0';
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
const systemPrompt = {
    role: "system",
    content: `You are AquaFlow AI, a world-class elite swimming coach with 20 years of experience shaping Olympic athletes. You possess deep expertise in hydrodynamics, sports biomechanics, energy systems (Aerobic, Anaerobic Alactic, Lactate Tolerance), and periodization.

### YOUR PERSONA & TONE
- **Tone:** Authoritative, highly professional, encouraging, and razor-sharp. You do not use fluffy language. You speak like a senior head coach.
- **Formatting:** You MUST use Markdown to make your answers clear and scannable. Use bolding for key terms, bullet points for lists, and headers (###) for structure.
- **Terminology:** Accurately use swimming terminology (e.g., EVF, catch, pull, streamline, hypoxic, DPS, stroke rate, ACWR, taper).

### RULES OF ENGAGEMENT
1. **Actionable Feedback:** Always provide 2-3 specific, actionable steps the swimmer can take during their next pool session.
2. **Structured Workouts:** If asked for a workout plan, you MUST format it exactly like this:
   - **Warmup:** [Distance] [Stroke/Drill] @ [Rest Interval]
   - **Main Set:** [Sets] x [Distance] [Stroke] @ [Pace/Interval/Rest] (Focus: [Goal])
   - **Cooldown:** [Distance] [Stroke]
3. **Medical Disclaimer:** If the user mentions shoulder pain, rotator cuff issues, or knee pain (especially in breaststroke), you MUST append a disclaimer advising them to consult a sports physical therapist, while offering temporary adjustments (e.g., "Switch to a recovery drill like single-arm freestyle").
4. **No Hallucinations:** You only discuss swimming, strength & conditioning for swimmers, and swimming nutrition. If asked about unrelated topics, politely redirect them to the pool.`
};

let messageHistory = [systemPrompt];

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
    
    // Add to history
    messageHistory.push({ role: 'user', content: text });
    
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
  minDetectionConfidence: 0.5,
  minTrackingConfidence: 0.5
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
                       {color: '#00d2ff', lineWidth: 4});
        drawLandmarks(canvasCtx, results.poseLandmarks,
                      {color: '#3a7bd5', lineWidth: 2, radius: 4});
                      
        // Biomechanical Analysis Engine
        analyzeSwimmingAngles(results.poseLandmarks);
    } else {
        updateFeedback("No person detected. Please make sure your full body is in frame.", "warning");
    }
    canvasCtx.restore();
});

// 3. ==========================================
//    SMART SWIMMING ANALYSIS ENGINE v2.0
//    Stroke Recognition + Per-Stroke Metrics
// ==========================================

// --- Stroke Classification Votes ---
let strokeVotes = { freestyle: 0, backstroke: 0, breaststroke: 0, butterfly: 0 };

// --- Per-Stroke Metrics Collector ---
let analysisReport = {
    framesAnalyzed: 0,
    strokeDetected: 'unknown',
    // Raw landmark snapshots for AI context
    metrics: {
        // Shared
        avgLeftElbowAngle: [],
        avgRightElbowAngle: [],
        avgShoulderTilt: [],
        headPositionDiffs: [],
        // Freestyle / Backstroke
        leftCrossoverCount: 0,
        rightCrossoverCount: 0,
        armAlternationScore: 0,
        armSimultaneousScore: 0,
        // Breaststroke
        kneeWidthRatios: [],
        armSymmetryScores: [],
        glideFrames: 0,
        // Butterfly
        bodyUndulationAmplitudes: [],
        doubleKickDetected: 0,
        singleKickDetected: 0,
        // Body line
        bodyLineAngles: [],
        hipDropCount: 0,
    }
};

// User-selected stroke override
let userStrokeOverride = null;

function resetAnalysisReport() {
    analysisReport.framesAnalyzed = 0;
    analysisReport.strokeDetected = 'unknown';
    strokeVotes = { freestyle: 0, backstroke: 0, breaststroke: 0, butterfly: 0 };
    const m = analysisReport.metrics;
    m.avgLeftElbowAngle = [];
    m.avgRightElbowAngle = [];
    m.avgShoulderTilt = [];
    m.headPositionDiffs = [];
    m.leftCrossoverCount = 0;
    m.rightCrossoverCount = 0;
    m.armAlternationScore = 0;
    m.armSimultaneousScore = 0;
    m.kneeWidthRatios = [];
    m.armSymmetryScores = [];
    m.glideFrames = 0;
    m.bodyUndulationAmplitudes = [];
    m.doubleKickDetected = 0;
    m.singleKickDetected = 0;
    m.bodyLineAngles = [];
    m.hipDropCount = 0;
}

let prevLeftWristY = null;
let prevRightWristY = null;
let frameCount = 0;

function analyzeSwimmingAngles(landmarks) {
    frameCount++;
    if (frameCount % 5 !== 0) return; // Sample every 5 frames for better accuracy

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

    // ============ STROKE CLASSIFICATION ============
    const shoulderMidY = (leftShoulder.y + rightShoulder.y) / 2;
    const isFaceUp = nose.visibility > 0.5 && nose.y < shoulderMidY - 0.08;
    const isFaceDown = nose.visibility > 0.5 && nose.y >= shoulderMidY - 0.02;

    // Check arm symmetry (both arms doing similar things simultaneously)
    const leftArmUp = leftWrist.visibility > 0.4 && leftWrist.y < leftShoulder.y;
    const rightArmUp = rightWrist.visibility > 0.4 && rightWrist.y < rightShoulder.y;
    const bothArmsUp = leftArmUp && rightArmUp;
    const oneArmUp = (leftArmUp && !rightArmUp) || (!leftArmUp && rightArmUp);

    // Arm symmetry check (are both wrists at similar vertical positions?)
    const wristYDiff = Math.abs((leftWrist.y || 0) - (rightWrist.y || 0));
    const armsSymmetric = wristYDiff < 0.08;

    // Knee width for breaststroke detection
    let kneeWidth = 0;
    let shoulderWidth = Math.abs(leftShoulder.x - rightShoulder.x);
    if (leftKnee.visibility > 0.4 && rightKnee.visibility > 0.4) {
        kneeWidth = Math.abs(leftKnee.x - rightKnee.x);
    }

    // Vote for stroke type
    if (isFaceUp && oneArmUp) {
        strokeVotes.backstroke += 2;
    } else if (isFaceUp) {
        strokeVotes.backstroke += 1;
    }

    if (bothArmsUp && armsSymmetric && isFaceDown) {
        // Could be butterfly or breaststroke
        if (kneeWidth > shoulderWidth * 0.9 && kneeWidth > 0) {
            strokeVotes.breaststroke += 2;
        } else {
            strokeVotes.butterfly += 2;
        }
    }

    if (oneArmUp && isFaceDown) {
        strokeVotes.freestyle += 2;
    }

    if (armsSymmetric && kneeWidth > shoulderWidth * 0.8 && kneeWidth > 0) {
        strokeVotes.breaststroke += 1;
    }

    // ============ COLLECT UNIVERSAL METRICS ============

    // Elbow angles
    if (leftElbow.visibility > 0.5 && leftWrist.visibility > 0.5) {
        m.avgLeftElbowAngle.push(calculateAngle(leftShoulder, leftElbow, leftWrist));
    }
    if (rightElbow.visibility > 0.5 && rightWrist.visibility > 0.5) {
        m.avgRightElbowAngle.push(calculateAngle(rightShoulder, rightElbow, rightWrist));
    }

    // Shoulder tilt (rotation)
    m.avgShoulderTilt.push(Math.abs(leftShoulder.y - rightShoulder.y));

    // Head position relative to shoulder line
    if (nose.visibility > 0.5) {
        m.headPositionDiffs.push(shoulderMidY - nose.y);
    }

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
    const midline = (leftShoulder.x + rightShoulder.x) / 2;
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
    if (userStrokeOverride && userStrokeOverride !== 'auto') {
        return userStrokeOverride;
    }
    const maxVotes = Math.max(...Object.values(strokeVotes));
    if (maxVotes === 0) return 'freestyle'; // default
    return Object.entries(strokeVotes).find(([k, v]) => v === maxVotes)[0];
}

// ============ COMPUTE SUMMARY STATS ============
function computeSummary() {
    const m = analysisReport.metrics;
    const total = analysisReport.framesAnalyzed;
    const stroke = determineFinalStroke();
    analysisReport.strokeDetected = stroke;

    const avg = arr => arr.length > 0 ? (arr.reduce((a, b) => a + b, 0) / arr.length).toFixed(1) : 'N/A';
    const pct = val => total > 0 ? ((val / total) * 100).toFixed(0) : '0';

    return {
        stroke: stroke,
        totalFrames: total,
        votes: strokeVotes,
        avgLeftElbow: avg(m.avgLeftElbowAngle),
        avgRightElbow: avg(m.avgRightElbowAngle),
        minLeftElbow: m.avgLeftElbowAngle.length > 0 ? Math.min(...m.avgLeftElbowAngle).toFixed(0) : 'N/A',
        minRightElbow: m.avgRightElbowAngle.length > 0 ? Math.min(...m.avgRightElbowAngle).toFixed(0) : 'N/A',
        avgShoulderTilt: avg(m.avgShoulderTilt),
        maxShoulderTilt: m.avgShoulderTilt.length > 0 ? Math.max(...m.avgShoulderTilt).toFixed(3) : 'N/A',
        avgHeadDiff: avg(m.headPositionDiffs),
        avgBodyAngle: avg(m.bodyLineAngles),
        hipDropPct: pct(m.hipDropCount),
        crossoverLeftPct: pct(m.leftCrossoverCount),
        crossoverRightPct: pct(m.rightCrossoverCount),
        armAlternationPct: pct(m.armAlternationScore),
        armSimultaneousPct: pct(m.armSimultaneousScore),
        avgKneeWidthRatio: avg(m.kneeWidthRatios),
        avgUndulation: avg(m.bodyUndulationAmplitudes),
        armSymmetry: avg(m.armSymmetryScores),
    };
}

// ============ AI REPORT GENERATION ============
async function generateAIReport(summary) {
    const strokeNames = { freestyle: '自由泳 (Freestyle)', backstroke: '仰泳 (Backstroke)', breaststroke: '蛙泳 (Breaststroke)', butterfly: '蝶泳 (Butterfly)' };
    const strokeName = strokeNames[summary.stroke] || summary.stroke;

    const reportBox = document.getElementById('aiFeedbackBox');
    feedbackList.innerHTML = `<li style="text-align: center; padding: 2rem;">
        <div class="pulse-dot" style="width: 12px; height: 12px; margin: 0 auto 1rem auto;"></div>
        <strong style="color: var(--accent-cyan);">🧠 AI is generating your personalized coaching report...</strong>
        <br><span style="color: var(--text-muted); font-size: 0.9rem;">Stroke detected: <strong>${strokeName}</strong></span>
    </li>`;

    const dataPayload = JSON.stringify(summary, null, 2);

    try {
        const response = await fetch('/api/analyze', {
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
        reportDiv.style.cssText = 'color: #e2e8f0; line-height: 1.8; font-size: 1rem;';
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
                reportDiv.innerHTML = marked.parse(fullText);
            } else {
                reportDiv.textContent = fullText;
            }
            reportBox.scrollTop = reportBox.scrollHeight;
        }
    } catch (err) {
        console.error('AI Report error:', err);
        feedbackList.innerHTML = `<li><strong style="color: #ff4a4a;">⚠️ Could not generate AI report.</strong><br>
            <span style="color: #a0aec0;">Falling back to local analysis...</span></li>`;
        showLocalFallbackReport(summary);
    }
}

// Local fallback if AI is unavailable
function showLocalFallbackReport(summary) {
    const threshold = 0.2;
    const total = summary.totalFrames;
    if (total === 0) { updateFeedback('Not enough frames.', 'warning'); return; }

    addFeedbackItem(`🏊 Stroke: ${summary.stroke.charAt(0).toUpperCase() + summary.stroke.slice(1)}`, `Detected with ${Math.max(...Object.values(summary.votes))} confidence votes.`, 'neutral');

    if (parseFloat(summary.avgLeftElbow) > 155 || parseFloat(summary.avgRightElbow) > 155) {
        addFeedbackItem('❌ Dropped Elbow', `Avg elbow angle: L=${summary.avgLeftElbow}° R=${summary.avgRightElbow}°. Aim for 90-130° during the catch.`, 'error');
    }
    if (parseFloat(summary.avgHeadDiff) > 0.08) {
        addFeedbackItem('⚠️ Head Too High', 'Your head lifts above the body line frequently. Keep a neutral spine.', 'warning');
    }
    if (parseFloat(summary.hipDropPct) > 25) {
        addFeedbackItem('⚠️ Hips Dropping', `Hips dropped in ${summary.hipDropPct}% of frames. Engage your core.`, 'warning');
    }
    if (parseFloat(summary.crossoverLeftPct) > 15 || parseFloat(summary.crossoverRightPct) > 15) {
        addFeedbackItem('❌ Arm Crossover', `L: ${summary.crossoverLeftPct}%, R: ${summary.crossoverRightPct}%. Enter hands in line with your shoulder.`, 'error');
    }
    if (parseFloat(summary.avgShoulderTilt) < 0.02) {
        addFeedbackItem('⚠️ Flat Body', 'You lack body rotation. Rotate from your hips for more power.', 'warning');
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
    let color = 'white';
    if (type === 'error') color = '#ff4a4a';
    if (type === 'success') color = '#00f2fe';
    if (type === 'warning') color = '#f39c12';

    li.innerHTML = `<strong style="color: ${color}">${title}</strong><br><span style="color: #a0aec0; font-size: 0.95rem; display: block; margin-top: 0.3rem;">${text}</span>`;
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

// 5. Video Upload Handler
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
            
            videoElement.play().then(() => {
                updateFeedback("⚙️ Analyzing video in real-time. Full report will instantly generate when playback completes.", "neutral");
                if(videoControls) videoControls.style.display = 'block';
                processUploadedVideo();
            }).catch(err => {
                console.error("Video play error:", err);
                updateFeedback("Could not play video. Try a different format (MP4 recommended).", "warning");
            });
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
