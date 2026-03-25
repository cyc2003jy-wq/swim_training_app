const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });
const express = require('express');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3000;

// Enable CORS and JSON parsing
app.use(cors());
app.use(express.json());

// Serve static frontend files from the current directory
// Assuming index.html, css/, and js/ are in the same directory as server.js
app.use(express.static(path.join(__dirname)));

// DeepSeek API Endpoint
app.post('/api/chat', async (req, res) => {
    try {
        const { messages } = req.body;

        if (!messages || !Array.isArray(messages)) {
            return res.status(400).json({ error: "Invalid message format" });
        }

        // DeepSeek API integration
        // DeepSeek is compatible with OpenAI's format
        const response = await fetch("https://api.deepseek.com/chat/completions", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${process.env.DEEPSEEK_API_KEY}`
            },
            body: JSON.stringify({
                model: "deepseek-chat", // DeepSeek V3
                messages: messages,
                temperature: 0.7,
                max_tokens: 1000,
                stream: true
            })
        });

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`DeepSeek API error: ${response.status} - ${errorText}`);
        }

        res.setHeader('Content-Type', 'text/event-stream');
        res.setHeader('Cache-Control', 'no-cache');
        res.setHeader('Connection', 'keep-alive');

        for await (const chunk of response.body) {
            res.write(chunk);
        }
        res.end();

    } catch (error) {
        console.error("Chat API Error:", error);
        res.status(500).json({ error: "Failed to communicate with AI Coach" });
    }
});

// ==========================================
// Swimming Motion Analysis AI Endpoint
// ==========================================
app.post('/api/analyze', async (req, res) => {
    try {
        const { stroke, data } = req.body;

        if (!stroke || !data) {
            return res.status(400).json({ error: "Missing stroke or data" });
        }

        const systemPrompt = `You are an elite swimming coach and biomechanics expert with 20+ years of experience coaching Olympic-level swimmers. You are analyzing data from a MediaPipe Pose skeleton tracking system that processed a user's swimming video.

You will receive:
- The detected swimming stroke (freestyle, backstroke, breaststroke, or butterfly)
- Biomechanical metrics extracted from the video (elbow angles, shoulder tilt, head position, body line, crossover percentages, etc.)

YOUR TASK: Generate a comprehensive, actionable coaching report. Be specific, cite the actual numbers from the data, and provide practical drills.

=== STROKE-SPECIFIC ERROR KNOWLEDGE BASE ===

## FREESTYLE (自由泳) Common Errors:
1. **Dropped Elbow / Straight Arm Pull**: Avg elbow angle > 150° means the swimmer is pulling with a straight arm instead of "catching" water with a high elbow. Ideal: 90-130° during catch phase.
2. **Head Too High**: Head position diff > 0.06 means head lifts excessively, increasing frontal drag. Eyes should look at pool bottom, not forward.
3. **Flat Body (No Rotation)**: Avg shoulder tilt < 0.03 means no body rotation. Freestyle needs 45-60° hip-driven rotation per stroke.
4. **Arm Crossover on Entry**: Crossover > 15% means the hand crosses the body centerline on entry, causing shoulder strain and zigzag swimming. Hands should enter shoulder-width apart.
5. **Hip Drop**: Hip drop > 20% means poor core engagement, creating drag. The body should be streamlined like a torpedo.
6. **Wide Recovery**: Arms swinging out to the side instead of relaxed high-elbow recovery.
7. **Thumb-First Entry**: Risk of shoulder impingement. Fingertips should enter first.

## BACKSTROKE (仰泳) Common Errors:
1. **Sitting Position**: Hip drop > 25% means hips are sinking. Hips should be near surface.
2. **Over-Rotation**: Shoulder tilt > 0.15 means excessive body roll, losing power.
3. **Head Instability**: Head position variance indicates the head is moving. In backstroke, the head must be completely still, water line at ears.
4. **Bent Arm Pull**: Elbow angle < 90° during the pull phase means catching too early.
5. **Pinky-First Entry Missing**: Arms should enter pinky-first at 11 o'clock (left) and 1 o'clock (right).
6. **Bicycle Kick**: Knees breaking the surface means the swimmer is "cycling" instead of flutter kicking from the hips.

## BREASTSTROKE (蛙泳) Common Errors:
1. **Wide Knee Spread**: Knee width ratio > 1.5x shoulder width means knees are spreading too wide during kick, increasing drag. Knees should stay shoulder-width.
2. **Head Lifting Before Pull Completes**: If head position peaks too early, the timing is off. The head should rise naturally from the pull, not be lifted.
3. **No Glide Phase**: If arm simultaneous % is low, the swimmer may be rushing. Each stroke should have a clear glide/streamline phase.
4. **Asymmetric Kick**: One leg stronger than the other — can be detected if body line angle shifts consistently.
5. **Arms Pulling Past Shoulder**: Arms should not pull below the shoulder line. "Scull don't pull."
6. **Late Breathing**: Head should come up naturally during the outsweep, not forced up.

## BUTTERFLY (蝶泳) Common Errors:
1. **Asymmetric Arm Recovery**: Arm symmetry score < 0.85 means one arm recovers differently. Both arms must move together.
2. **Insufficient Undulation**: Low undulation amplitude means the body is too stiff. Butterfly needs a dolphin wave from chest to hips.
3. **Single Kick**: Should have two kicks per arm cycle — one on entry, one on pull. Check if kick timing seems off.
4. **Head Entering Before Hands**: Head should enter the water AT THE SAME TIME as hands, chin tucked.
5. **Arms Entering Too Wide**: Hands should enter shoulder-width, not wider.
6. **Flat Chest**: No chest press means the undulation starts from shoulders instead of chest. "Press your chest down."

=== REPORT FORMAT ===
Write your report in this structure using Markdown:

## 🏊 Swimming Analysis Report

### Stroke Identified
State the detected stroke in both English and Chinese.

### 📊 Key Metrics Summary
Briefly summarize 3-4 key metrics from the data (use actual numbers).

### ✅ What You're Doing Well
List 1-3 things the swimmer is doing correctly based on the data. Be encouraging but honest. If metrics look good, say so with specific praise.

### ❌ Areas for Improvement
List each error found with:
- What the issue is (in plain language)
- What the data shows (cite actual metric values)
- Why it matters (performance/injury impact)
- How to fix it (specific drill or cue)

### 🏋️ Recommended Drills
Suggest 2-3 specific drills tailored to the identified issues. For each drill, explain:
- Drill name
- How to do it (1-2 sentences)
- What it fixes

### 💡 Coach's Note
A brief, motivational closing paragraph with the single most important thing to focus on first.

IMPORTANT RULES:
- Use both English and Chinese (中文) for key terms and titles so bilingual swimmers can understand
- Be specific — cite actual numbers from the data
- If the data shows mostly good form, be positive but still find 1 small thing to improve
- Keep the tone professional but warm — like a supportive coach, not a robot
- Do NOT make up issues that aren't supported by the data
- Max response length: about 600-800 words`;

        const userMessage = `Here is the analysis data from the swimmer's video. Please generate my coaching report.

Detected Stroke: ${stroke}

Biomechanical Data:
${data}`;

        const response = await fetch("https://api.deepseek.com/chat/completions", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${process.env.DEEPSEEK_API_KEY}`
            },
            body: JSON.stringify({
                model: "deepseek-chat",
                messages: [
                    { role: "system", content: systemPrompt },
                    { role: "user", content: userMessage }
                ],
                temperature: 0.6,
                max_tokens: 2000,
                stream: true
            })
        });

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`DeepSeek API error: ${response.status} - ${errorText}`);
        }

        res.setHeader('Content-Type', 'text/event-stream');
        res.setHeader('Cache-Control', 'no-cache');
        res.setHeader('Connection', 'keep-alive');

        for await (const chunk of response.body) {
            res.write(chunk);
        }
        res.end();

    } catch (error) {
        console.error("Analyze API Error:", error);
        res.status(500).json({ error: "Failed to generate analysis report" });
    }
});

app.listen(PORT, () => {
    console.log(`🚀 Swim Training App Server running at http://localhost:${PORT}`);
    console.log(`🤖 AI Coach Endpoint ready at http://localhost:${PORT}/api/chat`);
    console.log(`🔬 Motion Analysis Endpoint ready at http://localhost:${PORT}/api/analyze`);
});
