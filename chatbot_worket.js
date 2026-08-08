/**
 * ============================================================
 *  Malav's Portfolio AI Chatbot — Cloudflare Worker
 * ============================================================
 *
 *  This is the small backend that safely holds your API key.
 *  Your website (script.js) calls THIS, and THIS calls the AI.
 *  Your key never touches the browser.
 *
 *  ---- ONE-TIME SETUP (about 10 minutes, free) ----
 *
 *  1. Create a free account at https://dash.cloudflare.com
 *  2. Get an Anthropic API key at https://console.anthropic.com
 *     (Workers -> use the Anthropic API. You can swap in OpenAI too; see notes below.)
 *  3. In the Cloudflare dashboard: Workers & Pages -> Create -> Worker.
 *  4. Replace the default worker code with THIS entire file. Deploy.
 *  5. Add your key as a secret (so it stays hidden):
 *        Worker -> Settings -> Variables -> Add "ANTHROPIC_API_KEY" (Encrypt it).
 *     Also set "ALLOWED_ORIGIN" to your site, e.g. https://malavchampaneria.com
 *  6. Copy your Worker URL (e.g. https://malav-bot.yourname.workers.dev)
 *     and paste it into CHATBOT_API_URL at the top of script.js.
 *
 *  That's it. The site will now use the real AI. If the URL is blank
 *  or the worker is down, the site quietly falls back to the offline bot.
 * ============================================================
 */

/* Disabled for now, chatbot to be re-added later.

// Everything the AI needs to know to answer accurately about Malav.
const SYSTEM_PROMPT = `You are "Malav's AI", a friendly assistant embedded in Malav Champaneria's Minecraft-themed portfolio website. You answer questions about Malav on his behalf. Keep answers short, warm, and specific (2-4 sentences). Use a light, upbeat tone. If asked something you don't know, say so and point them to the relevant page or his email. Never invent facts.

ABOUT MALAV:
- AI & Machine Learning Engineer. MS in Computer Science at Rutgers University (GPA 3.85-3.89/4.00, Aug 2024 - May 2026). B.Tech in Information Technology, Charotar University (GPA 9.02/10.00, 2020-2024).
- Based in New Jersey, USA. Email: mchamp2509@gmail.com. Phone: +1 856-831-9928.
- LinkedIn: linkedin.com/in/malav-champaneria. GitHub: github.com/Malav786.
- Specializes in intelligent, human-centered systems: autonomous robotics, computer vision, semantic search, RAG/LLMs, and deep learning.

EXPERIENCE:
- Research Assistant (Robotics), USDA, New Jersey (May 2025 - Aug 2025): Built an end-to-end autonomous navigation pipeline for a Farm-ng robot using GPS RTK (1-2 cm accuracy), RGB-depth vision, and ROS2. 3D point-cloud waypoint planning with depth heatmaps improved precision ~10%. Reached 90% autonomous operation across 10+ acres of cranberry fields, cutting manual monitoring by 75%.
- Python Developer, INFLIBNET (Govt. of India), Gandhinagar (Jan 2024 - Aug 2024): Integrated BERT and Sentence Transformers into an education portal; metadata-driven keyword mapping and retrieval benchmarking (40% faster). Co-authored published research.
- AI/ML Backend Engineer Intern, Innovatics, Ahmedabad (May 2023 - Jul 2023): Computer vision app with FastAPI/Flask processing 150+ images/min at 98% accuracy; scalable APIs, 40% latency reduction.

FLAGSHIP PROJECTS:
- RegIntel: A RAG system answering questions on SEC filings (10-K, 10-Q) and CFR Title 17 rules. Query routing, dual FAISS retrieval, evidence ranking, hallucination guardrails, FastAPI + Streamlit.
- Brain MRI Tumor Segmentation: Metadata-infused, attention-gated U-Net for lower-grade glioma segmentation. Best model 0.896 Dice / 0.814 IoU. Team of 3, mentored by Dr. Iman Dehzangi.
- Polymer Structural Energy Prediction (Rutgers-FUNDED): Predicts polymer energy states from 2,916 CIF structures. DFT features + stacked ensembles (RF, XGBoost, LightGBM, MLP) and a self-supervised GNN; improved 73% to 80% MCC. React dashboard with 3D structure viewer.
- HARV Centerline Segmentation (USDA): U-Net detecting drivable crop-row centerlines from robot RGB+Depth frames; custom dataset, automated masks, BCE/Dice training.
- WildFace Attacks & Defenses: Black-box model inversion attacks (NES + autoencoders) and defenses (top-k filtering, noise, anomaly detection); 100% detection at 1% FPR, raised attack cost 6-7x.
- Other projects: SecureByBehavior (behavioral auth), U.S. Labor Analytics (Plotly 3D dashboard), Time Series GluonTS (N-BEATS, MAPE 0.18), Glassdoor salary predictor, Django E-Commerce.

PUBLICATIONS (4 peer-reviewed):
- "Unlocking the Power of Machine Learning in Education" — CRC Press (Mar 2025).
- "From Threads to Algorithms: AI Innovations in Textile Production" — Springer Nature (Oct 2024).
- "Review on Sentiment Analysis of Social Media for Stock Market Prediction" — Springer India (Jun 2024).
- "Empirical Evaluation of Deep Learning Models for Time Series Datasets" — Elsevier (Jan 2023).

CERTIFICATIONS: Cisco Certified Network Routing, AWS Academy Graduate, SQL Database Certification.

SKILLS: Python, PyTorch, TensorFlow, Scikit-learn, BERT/Transformers, RAG, FAISS, Computer Vision, NLP, FastAPI, Flask, Django, React, Docker, AWS/GCP, PostgreSQL/MySQL, GPS RTK, sensor fusion.

Guide visitors to explore the site's pages (About, Skills, Projects, Experience, Publications, Achievements, Contact) when relevant. Encourage reaching out via the Contact page for opportunities.`;

export default {
    async fetch(request, env) {
        const origin = env.ALLOWED_ORIGIN || "*";
        const corsHeaders = {
            "Access-Control-Allow-Origin": origin,
            "Access-Control-Allow-Methods": "POST, OPTIONS",
            "Access-Control-Allow-Headers": "Content-Type"
        };

        // Preflight
        if (request.method === "OPTIONS") {
            return new Response(null, { headers: corsHeaders });
        }
        if (request.method !== "POST") {
            return json({ error: "Method not allowed" }, 405, corsHeaders);
        }

        let body;
        try {
            body = await request.json();
        } catch {
            return json({ error: "Invalid JSON" }, 400, corsHeaders);
        }

        const messages = Array.isArray(body.messages) ? body.messages : [];
        if (messages.length === 0) {
            return json({ error: "No messages provided" }, 400, corsHeaders);
        }

        // Call Anthropic's Messages API
        try {
            const aiRes = await fetch("https://api.anthropic.com/v1/messages", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "x-api-key": env.ANTHROPIC_API_KEY,
                    "anthropic-version": "2023-06-01"
                },
                body: JSON.stringify({
                    model: "claude-sonnet-4-6",
                    max_tokens: 400,
                    system: SYSTEM_PROMPT,
                    messages: messages.map(m => ({
                        role: m.role === "assistant" ? "assistant" : "user",
                        content: String(m.content || "").slice(0, 2000)
                    }))
                })
            });

            if (!aiRes.ok) {
                const detail = await aiRes.text();
                return json({ error: "AI request failed", detail }, 502, corsHeaders);
            }

            const data = await aiRes.json();
            const reply = (data.content && data.content[0] && data.content[0].text)
                ? data.content[0].text
                : "Sorry, I couldn't generate a reply just now.";

            return json({ reply }, 200, corsHeaders);
        } catch (err) {
            return json({ error: "Server error", detail: String(err) }, 500, corsHeaders);
        }
    }
};

function json(obj, status, headers) {
    return new Response(JSON.stringify(obj), {
        status,
        headers: { "Content-Type": "application/json", ...headers }
    });
}

*/

/*
 * ---- WANT TO USE OPENAI INSTEAD OF ANTHROPIC? ----
 * Replace the fetch block above with a call to:
 *   https://api.openai.com/v1/chat/completions
 * using header  Authorization: `Bearer ${env.OPENAI_API_KEY}`  and body:
 *   { model: "gpt-4o-mini", max_tokens: 400,
 *     messages: [{ role: "system", content: SYSTEM_PROMPT }, ...messages] }
 * Then read the reply from  data.choices[0].message.content.
 */