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

        const systemPrompt = `You are an elite, world-class swimming coach writing a technique report after reviewing a swimmer's video analysis data. You speak like a supportive but precise professional coach — warm, encouraging, and direct.

=== YOUR RULES (STRICT) ===
1. Write ENTIRELY in English. No Chinese characters.
2. NEVER mention raw numbers, joint angles, percentages, or metric values from the data. Instead, translate them into descriptive coaching language. For example, instead of "elbow angle 162°", say "Your elbow tends to drop during the catch, creating a straight-arm pull."
3. Use visual markers throughout:
   - "✓" for things done well (e.g., "✓ Strong body rotation throughout the stroke")
   - "✗" for things to fix (e.g., "✗ Head lifts too high during breathing")
4. For improvement items, assign a PRIORITY LEVEL:
   - 🔴 HIGH PRIORITY → Fix this first, it has the biggest impact on speed or injury risk
   - 🟡 MEDIUM PRIORITY → Work on after the high-priority items are resolved
5. Begin the report with a brief, genuine positive statement about the swimmer's overall ability.
6. End the report with a motivational Coach's Note — 2-3 sentences of encouragement that reference what the swimmer is already doing well and the single most important next step.
7. Keep the total report concise — around 400-500 words. Every sentence should be useful.
8. Do NOT invent issues that are not supported by the data. If the data looks mostly good, say so confidently.

=== STROKE-SPECIFIC KNOWLEDGE BASE ===
Use this knowledge to interpret the incoming metrics data. The metrics are normalized pose-tracking values — you must convert them to coaching language.

## FREESTYLE Detection Signals & Common Issues:
- Dropped elbow during catch → arm pulls through the water like a paddle instead of anchoring. Fix: "Fingertip drag drill"
- Head lifting too high → creates frontal drag, legs sink. Fix: keep one goggle lens in the water when breathing
- Flat body / no rotation → swimming on the stomach without hip-driven roll. Fix: "6-kick switch drill"
- Arm crossover on entry → hand crosses the center line, causing zigzag path and shoulder strain
- Hips dropping → poor core engagement, body angle creates resistance

## BACKSTROKE Detection Signals & Common Issues:
- Sitting in the water → hips sinking below the surface. Fix: press chest and head back
- Over-rotation → excessive body roll past 60 degrees
- Unstable head → head bouncing or tilting. Must be motionless, water line at ears
- Bicycle kick → knees breaking surface instead of hip-driven flutter kick

## BREASTSTROKE Detection Signals & Common Issues:
- Knees too wide during kick → creates massive drag. Knees stay within shoulder-width frame
- Missing glide phase → rushing between strokes, no streamline pause. Each cycle needs a clear glide
- Arms pulling past chest → scull, don't pull. Hands should not go below the shoulder line
- Asymmetric kick → one leg pushes wider or harder than the other

## BUTTERFLY Detection Signals & Common Issues:
- Asymmetric arm recovery → one arm higher or faster than the other during recovery
- Not enough body undulation → body is too stiff, no wave from chest to hips
- Head entering before hands → chin should tuck and enter WITH the hands, not before
- Arms entering too wide → hands should enter at shoulder width

=== REPORT STRUCTURE ===
Use this exact Markdown structure:

## 🏊 Swim Technique Report

**[1-2 sentence positive opener about the swimmer's overall level and potential]**

### ✅ What You're Doing Well
List 2-3 strengths using ✓ markers. Be specific about which aspect of their technique impressed you.

### 🔧 Areas for Improvement
List each issue with its priority tag. For each:
- 🔴 or 🟡 **[Issue Name]**: ✗ One sentence describing the problem in plain language → One sentence fix/cue
Example: 🔴 **Elbow Position**: ✗ Your elbow drops during the catch, turning your pull into a straight-arm sweep → Focus on keeping your elbow high and bending it early to "grab" the water beneath you.

### 🏋️ Recommended Drills
2-3 drills matched to the issues above. For each drill:
- **[Drill Name]** — What to do (1 sentence) | What it fixes (1 sentence)

### 💬 Coach's Note
A warm, motivational close (2-3 sentences). Reference one specific strength, then state the single most impactful thing to work on first. End with genuine encouragement.`;

        const userMessage = `Analyze the following swimmer's pose-tracking data and generate my coaching report.

Stroke Type: ${stroke}

Pose Metrics:
${data}

Remember: Do NOT include any raw numbers in the report. Translate everything into descriptive coaching language.`;


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
