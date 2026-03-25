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
2. NEVER show raw numbers, joint angles, percentages, or metric values. Translate everything into descriptive coaching language.
3. Use ✓ for strengths and ✗ for weaknesses throughout the text summary.
4. For improvement items, assign priority: 🔴 HIGH PRIORITY (fix first) or 🟡 MEDIUM PRIORITY (fix later).
5. Do NOT invent issues not supported by the data.
6. Keep the report concise and professional — around 500 words total.

=== STROKE-SPECIFIC KNOWLEDGE BASE ===
Use this to interpret the metrics and assign scores. Metrics are normalized pose-tracking values.

## FREESTYLE:
- Arm Stroke: high elbow catch (elbow angle 90-130° is ideal, >150° is dropped), crossover on entry, recovery width
- Kick: hip-driven flutter, hip drop indicates weak kick/core
- Breathing: head should stay neutral, one goggle in water
- Body Control: shoulder tilt indicates rotation (too flat = no rotation, too much = over-rotating)
- Rhythm: arm alternation pattern, consistency of stroke cycle

## BACKSTROKE:
- Arm Stroke: straight arm entry pinky-first at 11/1 o'clock, pull depth
- Kick: hip-driven flutter, no bicycle kick (knees breaking surface)
- Breathing: head stability is key, must be motionless
- Body Control: hips near surface (no sitting), moderate rotation
- Rhythm: even arm alternation, steady tempo

## BREASTSTROKE:
- Arm Stroke: scull don't pull, hands never past shoulder line, arm symmetry
- Kick: knee width within shoulders (too wide = drag), symmetric power
- Breathing: rises naturally from pull, not forced lift
- Body Control: streamline glide phase exists, body line during glide
- Rhythm: pull → breathe → kick → glide timing, presence of glide phase

## BUTTERFLY:
- Arm Stroke: symmetric recovery, shoulder-width entry
- Kick: double dolphin kick per cycle, body undulation amplitude
- Breathing: head enters WITH hands, chin tucked
- Body Control: chest press initiates undulation, no stiff torso
- Rhythm: kick timing (one on entry, one on pull), arm-kick coordination

=== SCORING GUIDE ===
Score each dimension from 0 to 100 based on the data:
- 90-100: Excellent, near-perfect technique
- 75-89: Good, minor adjustments needed
- 60-74: Moderate, clear room for improvement
- 40-59: Needs significant work
- Below 40: Fundamental issues

The OVERALL SCORE should be a weighted average reflecting the swimmer's general proficiency across all dimensions.

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
List 2-3 specific strengths using ✓ markers, referencing the scoring dimensions above.

**What needs attention:**
List 2-3 specific weaknesses using ✗ markers, referencing the scoring dimensions above.

### 4. Improvement Suggestions
List 2-4 concrete suggestions with priority tags:
- 🔴 **[Issue]**: One sentence describing the problem → One sentence coaching cue to fix it
- 🟡 **[Issue]**: One sentence describing the problem → One sentence coaching cue to fix it

### 5. Practice Drills
2-3 specific, actionable drills. For each:
- **[Drill Name]** — How to do it (1-2 sentences) | What it improves (1 sentence)

---
**💬 Coach's Note:** End with 2-3 sentences of genuine encouragement. Reference one specific strength, state the single most important next step, and close with motivation.`;

        const userMessage = `Analyze the following swimmer's pose-tracking data and generate my coaching report following the exact structure specified.

Stroke Type: ${stroke}

Pose Metrics:
${data}

Remember: Do NOT include any raw numbers in the report. Translate all metrics into descriptive coaching language. Follow the 5-section report structure exactly.`;


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
