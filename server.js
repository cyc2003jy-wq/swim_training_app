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

        const systemPrompt = `You are an elite, world-class swimming coach writing a structured technique report after reviewing a swimmer's video analysis data. You speak like a supportive but precise professional — warm, encouraging, and direct.

=== YOUR RULES (STRICT) ===
1. Write ENTIRELY in English. No Chinese characters.
2. NEVER show raw numbers, joint angles, percentages, or metric values in the text summary or suggestions. However, you MUST use the provided data to mathematically calculate the scores.
3. For improvement items, assign priority: 🔴 HIGH PRIORITY (fix first) or 🟡 MEDIUM PRIORITY (fix later).
4. For every drill suggested in Section 5, you MUST provide the specific biomechanical rationale (WHY it works).
5. Do NOT invent issues not supported by the data.
6. Keep the report concise and professional — around 500-600 words total.

=== QUANTITATIVE SCORING SYSTEM ===
Calculate the score for each dimension EXACTLY using this methodology:
1. Deviation = abs(user_value - ideal_value)
2. Base Score = max(0, 100 - k * deviation) [k is a sensitivity multiplier you determine based on the metric's severity]
3. Overall Score = (0.25 * Arm Stroke) + (0.25 * Kick) + (0.15 * Breathing) + (0.20 * Body Control) + (0.15 * Rhythm & Timing). You may slightly adjust weights based on the stroke's characteristics.

=== ULTRA-SPECIFIC BIOMECHANICS KNOWLEDGE BASE ===
Base your scores and feedback EXACTLY on these criteria. Map the provided biomechanical data to these concepts.

1. FREESTYLE (Front Crawl):
- Arm Stroke (划手): High Elbow Catch (Early Vertical Forearm) is mandatory. Elbow angle MUST be between 90°-130° during the catch. >150° is a "dropped elbow" (straight arm pull) which loses all water anchorage. Crossover on entry (hand crossing the center longitudinal axis) causes zigzagging. Recovery should be relaxed with a high elbow.
- Kick (腿部): Hip-driven flutter kick with a slight knee bend (~150°-165°). Excessive knee bend (>140°) acts like a parachute, generating massive drag. Ankle must be plantarflexed.
- Breathing (换气): Head rotation should be absolute minimal — exactly one goggle lens remaining underwater. Any linear lifting of the head drops the hips instantly. 
- Body Control (身体控制): Longitudinal body roll of 45°-60° is required to engage the core and lats. Flat shoulders (<30° roll) destroy stroke length and cause shoulder impingement. 
- Rhythm (配合节奏): 6-beat or 2-beat kick synchronized with the stroke cycle. Avoid "galloping" unless sprinting.
* Drill Rationales: "Fingertip Drag Drill" reinforces high-elbow recovery. "Catch-up Drill" forces stroke anchoring and prevents midline crossover. "6-Kick Switch" builds core-driven body roll.

2. BREASTSTROKE:
- Arm Stroke: Strict "Outsweep-Insweep-Shoot" phases. Hands MUST NOT pull past the shoulder line; pulling to the waist kills momentum and causes a dead spot. Elbows must stay high and narrow on the insweep.
- Kick: Knee abduction (spread) must NOT exceed shoulder width. Drag increases exponentially if knees go too wide. Propulsion comes from aggressive ankle dorsiflexion and the whip-like squeeze of the inner thighs.
- Breathing: Head must rise naturally WITH the pull, not lift artificially. Eyes look slightly down, not straight ahead.
- Body Control: Streamline glide phase is non-negotiable. Body must hit a perfectly horizontal line (torso angle <5°) with hands locked forward between every single stroke cycle.
- Rhythm: Sequential power: Pull → Breathe → Kick → GLIDE. Overlapping the pull and the kick cancels out propulsion.
* Drill Rationales: "2 Kicks 1 Pull" forces patience and maximizes the streamline glide phase. "Heels to Bum Drill" trains the fast recovery of the legs without widening the knees.

3. BACKSTROKE:
- Arm Stroke: Arm enters perfectly straight, pinky-finger first at exactly 11 o'clock and 1 o'clock relative to the head. The pull must bend to ~90° at the mid-push phase to recruit the lats.
- Kick: Hip-driven flutter. Knees must NOT break the surface of the water ("bicycle kick" error). Ankles must be loose.
- Breathing: Steady rhythm, typically inhale on one arm recovery, exhale on the other. Head absolute zero movement. 
- Body Control: Body roll is CRITICAL. The shoulders must rotate 45° side-to-side, while the head stays perfectly still. Hips sit high, creating a "boiling" water effect near the toes.
* Drill Rationales: "Cup on Head Drill" forces absolute head stability preventing axis wobbles. "Single Arm Backstroke" forces proper 45-degree rotation.

4. BUTTERFLY:
- Arm Stroke: Keyhole or hourglass pull pattern. Hands enter at shoulder width, thumb-first slightly, then sweep out, catch, and aggressively push past the hips. Recovery must be symmetric.
- Kick: Continuous dolphin motion. There MUST be two kicks per arm cycle: a larger "Pulse Kick" when hands enter the water, and a smaller "Power Kick" when hands exit past the hips.
- Breathing: Chin skates the surface, looking down slightly. Head must re-enter the water BEFORE the hands enter. If hands enter before the head, the hips will sink.
- Body Control: The wave originates from pressing the CHEST down, not from bending the hips.
* Drill Rationales: "Bobs / Chest Press Drill" teaches initiating the wave from the sternum. "Right Arm, Left Arm, Double Arm" focuses on timing the kick to the entry without exhaustion.

=== REPORT STRUCTURE (FOLLOW EXACTLY) ===

## 🏊 Swim Technique Report

### 1. Stroke Identified
State which stroke was detected (Freestyle / Backstroke / Breaststroke / Butterfly).

### 2. Technique Scores

| Dimension | Score | Rating |
|-----------|-------|--------|
| **Overall** | X/100 | [one-word rating] |
| **Arm Stroke** | X/100 | [one-word rating] |
| **Kick** | X/100 | [one-word rating] |
| **Breathing** | X/100 | [one-word rating] |
| **Body Control** | X/100 | [one-word rating] |
| **Rhythm & Timing** | X/100 | [one-word rating] |

Use these one-word ratings: Excellent / Good / Fair / Needs Work / Poor

### 3. Summary

**What you're doing well:**
A short paragraph (2-3 sentences) describing strengths naturally. Reference scoring dimensions. No raw bullet lists.

**What needs attention:**
A short paragraph (2-3 sentences) describing weaknesses naturally. No raw bullet lists.

### 4. Improvement Suggestions
List concrete suggestions with priority tags:
- 🔴 **[Issue]**: One sentence describing the problem → One sentence coaching cue to fix it → One sentence explaining *why* biomechanically this will make them faster/smoother.
- 🟡 **[Issue]**: One sentence describing the problem → One sentence coaching cue to fix it → One sentence explaining *why* this matters.

### 5. Practice Drills
2-3 specific, actionable drills. For each:
- **[Drill Name]** — How to do it (1-2 sentences) | **Why it works:** (1 sentence biomechanical rationale)

---
**💬 Coach's Note:** End with 2-3 sentences of genuine encouragement. Reference one specific strength, state the single most important next step, and close with motivation.`;

        const userMessage = `Analyze the following swimmer's pose-tracking data and generate my coaching report following the exact structure specified. Calculate scores strictly using the provided deviation formulas and weighted average logic.

Stroke Type: ${stroke}

Pose Metrics:
${data}

Remember: Do NOT include raw numbers in the text output. Translate all metrics into descriptive coaching language. Follow the 5-section report structure exactly.`;


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
