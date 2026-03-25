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
4. Do NOT invent issues not supported by the data.
5. Keep the report concise and professional — around 500 words total.

=== QUANTITATIVE SCORING SYSTEM ===
Calculate the score for each dimension EXACTLY using this methodology:
1. Deviation = abs(user_value - ideal_value)
2. Base Score = max(0, 100 - k * deviation) [k is a sensitivity multiplier you determine based on the metric's severity]
3. Overall Score = (0.25 * Arm Stroke) + (0.25 * Kick) + (0.15 * Breathing) + (0.20 * Body Control) + (0.15 * Rhythm & Timing). You may slightly adjust weights based on the stroke's characteristics.

=== STROKE-SPECIFIC EVALUATION METRICS ===
Base your scores on these specific criteria. Map the provided biomechanical data to these conceptual metrics as best as possible.

1. FREESTYLE (Front Crawl):
- Arm Stroke (划手): Entry point deviation from shoulder line (< 5cm → 100, 5-10cm → 70, >10cm → 40). Hand trajectory deviation from ideal "S" pull path.
- Kick (腿部): Knee bend and ankle rotation bend within ideal range ±5° → 100.
- Breathing (换气): Head elevation angle (< 20°) & sync deviation with arm pull (< 5%).
- Body Control (身体控制): Hip drop deviation from surface (< 3cm) & Body roll angle (> 30° → 100).
- Rhythm (配合节奏): Stroke-kick-breath cycle variability (STD < 5% → 100).

2. BREASTSTROKE:
- Arm Stroke: Elbow abduction amplitude, propulsion vector deviation (< 5° → 100).
- Kick: Knee abduction angle and ankle rotation (knees close to shoulder width ±5° → 100).
- Breathing: Head elevation angle, sync with arm pull (< 5° & sync ±5% → 100).
- Body Control: Torso to surface angle, core coordination (deviation < 5° → 100).
- Rhythm: Arm-leg-breathing sequence alignment error (< 5% → 100).

3. BACKSTROKE:
- Arm Stroke: Entry point, pull path linearity (deviation < 5cm → 100).
- Kick: Knee bend angle, kick rhythm (angle ±5° → 100).
- Breathing: Head rotation angle, breathing timing (deviation < 5° & timing dev < 5% → 100).
- Body Control: Body axis rotation (≥ 45° → 100).
- Rhythm: Arm-leg cycle difference (< 5% → 100).

4. BUTTERFLY:
- Arm Stroke: Arm recovery speed, entry angle (deviation < 5° & speed fluctuation < 5% → 100).
- Kick: Knee-ankle displacement amplitude, continuous double kick (deviation < 5cm & good continuity → 100).
- Breathing: Head lift amplitude, breathing timing (deviation < 5° & timing diff < 5% → 100).
- Body Control: Torso undulation wave vs standard wave error (< 5cm → 100).
- Rhythm: Arm to core undulation alignment error (< 5% → 100).

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
- 🔴 **[Issue]**: One sentence describing the problem → One sentence coaching cue to fix it
- 🟡 **[Issue]**: One sentence describing the problem → One sentence coaching cue to fix it

### 5. Practice Drills
2-3 specific, actionable drills. For each:
- **[Drill Name]** — How to do it (1-2 sentences) | What it improves (1 sentence)

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
