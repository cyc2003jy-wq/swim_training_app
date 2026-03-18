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

    // 3. Simple Intersection Observer for Fade-in (Optional enhancement)
    const observerOptions = {
        threshold: 0.1,
        rootMargin: "0px 0px -50px 0px"
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
                observer.unobserve(entry.target);
            }
        });
    }, observerOptions);

    // Apply to feature cards
    document.querySelectorAll('.feature-card, .split-section').forEach(el => {
        el.style.opacity = '0';
        el.style.transform = 'translateY(30px)';
        el.style.transition = 'all 0.6s cubic-bezier(0.25, 0.46, 0.45, 0.94)';
        observer.observe(el);
    });
});

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

function appendLoading() {
    const msgDiv = document.createElement('div');
    msgDiv.classList.add('message', 'loading');
    msgDiv.id = 'loadingMsg';
    msgDiv.textContent = 'Coach is thinking...';
    chatMessages.appendChild(msgDiv);
    chatMessages.scrollTop = chatMessages.scrollHeight;
}

function removeLoading() {
    const loadingMsg = document.getElementById('loadingMsg');
    if(loadingMsg) loadingMsg.remove();
}

async function handleChatSend() {
    const text = chatInput.value.trim();
    if(!text) return;

    // Display user message
    appendMessage('user', text);
    chatInput.value = '';
    
    // Add to history
    messageHistory.push({ role: 'user', content: text });
    
    appendLoading();

    try {
        const response = await fetch('/api/chat', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ messages: messageHistory })
        });
        
        removeLoading();

        if(!response.ok) {
            throw new Error("Server response error");
        }

        const data = await response.json();
        
        if(data.reply) {
            appendMessage('ai', data.reply.content);
            messageHistory.push(data.reply);
        } else {
            appendMessage('ai', "Sorry, I encountered an error processing your technique.");
        }

    } catch (error) {
        removeLoading();
        console.error(error);
        appendMessage('ai', "Error connecting to the AI server. Please make sure the Node.js backend is running.");
    }
}

if(sendBtn && chatInput) {
    sendBtn.addEventListener('click', handleChatSend);
    chatInput.addEventListener('keypress', (e) => {
        if(e.key === 'Enter') handleChatSend();
    });
}

/* =========================================
   AI MOTION ANALYSIS (MEDIAPIPE)
   ========================================= */
const videoElement = document.getElementById('inputVideo');
const canvasElement = document.getElementById('outputCanvas');
const canvasCtx = canvasElement?.getContext('2d');
const startWebcamBtn = document.getElementById('startWebcamBtn');
const uploadVideoBtn = document.getElementById('uploadVideoBtn');
const videoUpload = document.getElementById('videoUpload');
const loadingAnalysis = document.getElementById('loadingAnalysis');
const feedbackList = document.getElementById('feedbackList');

let camera = null;
let isWebcamActive = false;
let isVideoUploaded = false;

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

// Helper: Calculate Euclidean distance
function calculateDistance(point1, point2) {
    return Math.sqrt(Math.pow(point2.x - point1.x, 2) + Math.pow(point2.y - point1.y, 2));
}

// 3. Advanced Biomechanical Analysis Logic
let frameCount = 0;
function analyzeSwimmingAngles(landmarks) {
    // Only update feedback every 10 frames to avoid flickering UI
    frameCount++;
    if(frameCount % 10 !== 0) return;
    
    // Core Landmarks
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
    
    // Ensure core visibility
    if (leftShoulder.visibility < 0.5 || rightShoulder.visibility < 0.5) return;

    feedbackList.innerHTML = ''; // Clear old feedback
    let issuesFound = 0;

    // --- Rule 1: High Elbow Catch (EVF) ---
    // Checking if the pulling arm is bent (EVF) or dropping straight
    if (leftElbow.visibility > 0.6 && leftWrist.visibility > 0.6) {
        const leftArmAngle = calculateAngle(leftShoulder, leftElbow, leftWrist);
        // Is arm pulling? (Wrist is below shoulder)
        if (leftWrist.y > leftShoulder.y) {
            if (leftArmAngle > 165) {
                addFeedbackItem("❌ Left Arm: Dropped Elbow", "Arm is too straight during the pull. Bend your elbow to 100-140° to catch water.", "error");
                issuesFound++;
            } else if (leftArmAngle > 90 && leftArmAngle < 150) {
                addFeedbackItem("✅ Left Arm: Excellent EVF", "Great high-elbow catch detected.", "success");
            }
        }
    }
    
    if (rightElbow.visibility > 0.6 && rightWrist.visibility > 0.6) {
        const rightArmAngle = calculateAngle(rightShoulder, rightElbow, rightWrist);
        if (rightWrist.y > rightShoulder.y) {
            if (rightArmAngle > 165) {
                addFeedbackItem("❌ Right Arm: Dropped Elbow", "Arm is too straight during the pull. Bend your elbow to 100-140°.", "error");
                issuesFound++;
            } else if (rightArmAngle > 90 && rightArmAngle < 150) {
                addFeedbackItem("✅ Right Arm: Excellent EVF", "Great high-elbow catch detected.", "success");
            }
        }
    }

    // --- Rule 2: Head Position (Looking Down vs Forward) ---
    // A good swimmer looks slightly forward/down, not straight ahead.
    if (nose.visibility > 0.6 && leftEar.visibility > 0.6 && rightEar.visibility > 0.6) {
        // If nose is much higher than ears (relative to body), head is lifted too high
        const earAvgY = (leftEar.y + rightEar.y) / 2;
        if (nose.y < earAvgY - 0.05) {
             addFeedbackItem("⚠️ Head Lifting", "Your head is lifted too high. Tuck your chin slightly to reduce frontal drag.", "warning");
             issuesFound++;
        }
    }

    // --- Rule 3: Body Rotation (Shoulder Roll) ---
    // In freestyle/backstroke, shoulders should roll. If shoulder Y values are exactly the same, they are swimming flat.
    const shoulderTilt = Math.abs(leftShoulder.y - rightShoulder.y);
    if (shoulderTilt < 0.02) { // Extremely flat shoulders
        addFeedbackItem("⚠️ Flat Shoulders", "You are swimming too flat. Rotate your torso from the hips to increase reach and power.", "warning");
        issuesFound++;
    } else if (shoulderTilt > 0.15) { // Good rotation
        addFeedbackItem("✅ Good Core Rotation", "Shoulders are rotating well, allowing for maximum extension.", "success");
    }

    // --- Rule 4: Crossover (Entering past midline) ---
    // Wrist crossing the center line of the body (nose) during entry.
    const midline = nose.x;
    if (leftWrist.visibility > 0.6 && leftWrist.y < leftShoulder.y) { // Left arm reaching forward
        if (leftWrist.x > midline + 0.05) { // Assuming facing camera, crossing right of nose
            addFeedbackItem("❌ Left Arm Crossover", "Your left hand is crossing your center line on entry. Enter shoulder-width apart.", "error");
            issuesFound++;
        }
    }
    if (rightWrist.visibility > 0.6 && rightWrist.y < rightShoulder.y) { // Right arm reaching forward
        if (rightWrist.x < midline - 0.05) { 
            addFeedbackItem("❌ Right Arm Crossover", "Your right hand is crossing your center line on entry. Enter shoulder-width apart.", "error");
            issuesFound++;
        }
    }

    // Default state if doing well
    if (issuesFound === 0) {
         addFeedbackItem("🌟 Great Form", "Body alignment and stroke mechanics look solid right now.", "success");
    }
}

function addFeedbackItem(title, text, type) {
    const li = document.createElement('li');
    let color = 'white';
    if(type === 'error') color = '#ff4a4a';
    if(type === 'success') color = '#00f2fe';
    if(type === 'warning') color = '#f39c12';
    
    li.innerHTML = `<strong style="color: ${color}">${title}</strong><br><span>${text}</span>`;
    feedbackList.appendChild(li);
}

function updateFeedback(text, type='neutral') {
    feedbackList.innerHTML = `<li><em>${text}</em></li>`;
}

// 4. Camera & Video Controls
if (startWebcamBtn) {
    startWebcamBtn.addEventListener('click', async () => {
        if(isVideoUploaded) {
            // Stop video
            videoElement.pause();
            isVideoUploaded = false;
        }

        if (isWebcamActive) {
            // Turn off webcam
            if(camera) camera.stop();
            isWebcamActive = false;
            startWebcamBtn.textContent = '📷 Start Webcam';
            startWebcamBtn.classList.remove('btn-danger');
            startWebcamBtn.classList.add('btn-primary');
            canvasCtx.clearRect(0, 0, canvasElement.width, canvasElement.height);
            updateFeedback("Webcam stopped.", "neutral");
        } else {
            // Turn on webcam
            loadingAnalysis.style.display = 'block';
            camera = new Camera(videoElement, {
              onFrame: async () => {
                await pose.send({image: videoElement});
              },
              width: 640,
              height: 480
            });
            camera.start();
            isWebcamActive = true;
            startWebcamBtn.textContent = '🛑 Stop Webcam';
            startWebcamBtn.classList.remove('btn-primary');
            startWebcamBtn.classList.add('btn-danger');
            updateFeedback("Initializing Pose Detection...", "neutral");
        }
    });
}

// Video Upload processing loop
async function processUploadedVideo() {
    if(videoElement.paused || videoElement.ended) return;
    
    await pose.send({image: videoElement});
    // Request next frame
    requestAnimationFrame(processUploadedVideo);
}

if (videoUpload) {
    videoUpload.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (!file) return;

        // Turn off webcam if active
        if (isWebcamActive && camera) {
            camera.stop();
            isWebcamActive = false;
            startWebcamBtn.textContent = '📷 Start Webcam';
            startWebcamBtn.classList.remove('btn-danger');
            startWebcamBtn.classList.add('btn-primary');
        }

        loadingAnalysis.style.display = 'block';
        isVideoUploaded = true;
        
        const fileURL = URL.createObjectURL(file);
        videoElement.src = fileURL;
        
        // When video has loaded enough to play
        videoElement.onloadeddata = () => {
            // Match canvas size to video aspect ratio
            const ratio = videoElement.videoWidth / videoElement.videoHeight;
            canvasElement.height = canvasElement.width / ratio;
            
            videoElement.play();
            updateFeedback("Analyzing uploaded video...", "neutral");
            processUploadedVideo();
        };
    });
}
