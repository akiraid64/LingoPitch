# LingoPitch: AI-Powered Sales Intelligence and Cultural Hardening

[![LingoPitch Production](https://img.shields.io/badge/Production-Live-success)](https://sublime-nature-production.up.railway.app/)
[![Powered by Lingo.dev](https://img.shields.io/badge/Localization-Lingo.dev-blue)](https://lingo.dev)

LingoPitch is a **Universal Sales Hardening Platform** designed to prepare sales teams for any global market from a single interface. Instead of forcing teams to adapt to a "one-size-fits-all" Western sales methodology, LingoPitch uses AI to adapt its behavior to the localized business norms of your customer.

The platform integrates **Cartesia's ultra-low latency voice** with **Gemini's strategic intelligence** and **Lingo.dev's cultural localization** to facilitate high-stakes sales conversations in multiple languages against dynamically generated cultural personas.

---

## Try the App Live
You can access the production environment here:
**[https://sublime-nature-production.up.railway.app/](https://sublime-nature-production.up.railway.app/)**

---

## The Problem: The "Culture Gap"
In international sales, knowing the language is not enough. Many deals are lost not because of *what* was said, but **how** it was said. We call this the "Culture Gap."

Most sales training forces everyone to use the same Western methods. LingoPitch does the opposite: it trains you to meet the customer where they are.

Sales reps often struggle because:
- **Style Clashes:** Being too direct can feel rude in some cultures, while being too vague can feel untrustworthy in others.
- **Tone-Deafness:** Focusing purely on money works in some markets, but building a personal relationship is the only way to win in others.
- **The Accent Barrier:** It is difficult to understand different regional accents in real-time without safe practice.
- **High Stakes:** Learning on the job with real customers is risky and expensive.

**LingoPitch provides a "High-Fidelity Cultural Simulator"—a safe place where you can fail for free and sharpen your instincts before your first real meeting.**

---

### One Platform, Many Cultures: Before vs. After
*How LingoPitch changes the way you sell globally.*

| Feature | **Traditional Sales Training** | **LingoPitch Universal Hardening** |
| :--- | :--- | :--- |
| **Methodology** | Forces a single style on every region. | Adapts the AI Customer to act like a real local buyer. |
| **Feedback** | Basic grammar and vocabulary checks. | Deep feedback on **Cultural Tone** and **Etiquette**. |
| **Risk** | You learn by losing real deals. | You learn by "failing for free" in a simulator. |
| **Outcome** | **Friction.** Customers feel misunderstood. | **Trust.** You sound like a local partner, not a stranger. |

---

## Demo and Overview
> [!NOTE]
> *Space reserved for YouTube Walkthrough Video*
> [![LingoPitch Demo](https://img.shields.io/badge/YouTube-Watch%20Demo-red)](https://youtube.com)

---

## Lingo.dev: The Cultural Intelligence Core

Cultural resonance is treated as a core architectural layer rather than a secondary feature. Through the integration of Lingo.dev and specialized prompt engineering, the following capabilities are achieved:

- **Multilingual AI Advisor:** Every chat response is dynamically localized using the Lingo.dev SDK, allowing users to receive complex sales coaching and playbook deep-dives in their native language while maintaining the strategic integrity of the original methodology.
- **Regional Behavioral Hardening:** AI personas are injected with regional business norms, local idioms, and specific cultural taboos. A "Discovery Call" in Tokyo is designed to feel fundamentally different from one in New York.
- **Cultural Accuracy Scoring:** Every session is evaluated by Gemini against a specialized rubric:
    1. **Cultural Appropriateness:** Adherence to regional business etiquette.
    2. **Language Formality:** Correct usage of formal/informal address (e.g., T-V distinction).
    3. **Relationship Sensitivity:** Balance of rapport-building vs. transaction-focus.
    4. **Protocol Adherence:** Respect for local decision-making hierarchies.

---

## Key Features

### 1. The Arena (Voice-to-Voice Simulation)
- **Cartesia Voice Agent:** Sub-200ms latency for natural, flowing conversations.
- **Dynamic Regional Personas:** Customers adapt behavior based on region (e.g., blunt ROI-focused German vs. polite British director).
- **Infinite Objection Handling:** AI pushes back with tough objections and regional negotiation styles.

### 2. Manager Mission Command (Admin Control)
- **Organization Settings:** Define the "Source of Truth" for your product.
- **Persona Recrafting:** Gemini generates deep-dive persona profiles (Pain points, Vibe, ROI-triggers) automatically.
- **Team Monitoring:** Detailed views of individual member performance and detailed rubrics.

### 3. Analytics and Performance Tracking
- **Skill Cluster Radar:** Visualizes strengths (Discovery, Value Prop, etc.) across the organization.
- **Performance Leaderboards:** Gamification for top-scoring sales representatives.
- **Executive Summaries:** Auto-generated summaries and actionable coaching tips for every call.

### 4. Sales Playbook Engine (RAG Intelligence)
- **Vectorized Knowledge Base:** Upload PDF playbooks to create a Retrieval-Augmented Generation (RAG) memory.
- **Proprietary Source of Truth:** The AI Sales Advisor uses high-speed Vector Search to grounding its advice in your company's specific sales methodology.
- **Compliance and Adherence:** Automatically cross-references call transcripts against playbooks to identify missing steps or deviations.

---

## Technical Architecture Overview

LingoPitch is built on a distributed AI architecture that handles high-concurrency voice streams and complex data retrieval. The system is designed to provide a "live" feel by offloading heavy computational tasks to specialized AI engines.

### Intelligent Localization (Lingo.dev)
The platform treats language not as a static setting, but as a dynamic layer. Using the **Lingo.dev SDK**, every UI string and AI response moves through a localization pipeline that preserves cultural nuances. When a user switches target markets, the system doesn't just translate text; it re-aligns the entire interface and AI personality to match regional business protocols. This ensures that a sales coaching session in Japanese feels fundamentally different from one in English.

### Contextual Advisory (AI Co-pilot)
The AI Sales Advisor acts as a "Mission Control" by performing high-dimensional reasoning across four distinct data streams:
- **Historical Context:** It ingests all past call transcripts and performance scores to identify long-term trends.
- **Team Dynamics:** It understands organizational roles, allowing for persona-specific advice (e.g., manager-level team summaries vs. rep-level coaching).
- **RAG Methodology:** The system performs a vector search against PDF playbooks to ensure advice is strictly grounded in the company's "Source of Truth."
- **Semantic Cross-Linking:** The "Co-pilot" logic identifies the delta between what the playbook required and what the rep actually said in the transcript, providing surgical coaching on missed opportunities.

### Ultra-Low Latency Voice & Persona Engine
Achieving natural conversation requires a complex orchestration of three distinct layers:
1. **Persona Definition:** The "soul" of the voice agent is generated via a specialized **Persona Recrafting** engine. When a manager updates the product context, Gemini synthesizes a deep-dive profile (Pain points, behavioral triggers, and cultural biases) which is stored as a persistent JSON identity.
2. **Cold-Start Synthesis:** At the start of every session, the system combines this deep persona with regional business protocols and relevant playbook chunks to create a "Cold Start" system prompt that "hardens" the AI customer's behavior.
3. **Voice Hardware Bridge:** A FastAPI server handles the direct WebSocket handshake with Cartesia, streaming raw audio at sub-200ms latency to ensure the interaction feels human and immediate.

---

## Tech Stack
- **Frontend**: React 19, Vite, Tailwind CSS, Framer Motion, Zustand.
- **Backend**: Node.js (Express), TypeScript, Gemini 2.5 Flash, Supabase (**pgvector** for RAG).
- **Voice Agent**: Python (FastAPI), Cartesia AI.
- **Intelligence**: Retrieval-Augmented Generation (RAG) and Semantic Search.
- **Localization**: Lingo.dev SDK.

---

## Strategic Roadmap (2026 Focus)

### Current Limitations
- **Non-Verbal Blindness:** Visual cues (body language, gestures) are not currently tracked or analyzed.
- **Hallucination Risk:** The AI may occasionally reference generic regional facts not explicitly present in provided context.
- **Contextual Depth:** Simulations are currently limited to single interactions.

### Roadmap
- **Emotional Intelligence (EQ) Engine:** Analyze tone, pacing, and emotional cues to provide a "Frustration Meter" for the AI customer.
- **Predictive Lead Scoring:** Forecast a rep's actual win-rate based on their roleplay consistency.
- **Real-Time Co-Pilot Mode:** Live overlay that provides "Whisper Coaching" during actual calls.
- **Multi-Party Scenarios:** Simulating sales calls with multiple stakeholders (e.g., CEO and CFO) in the same channel.
- **CRM Deep-Link:** Automated pushing of practice scores to Salesforce or HubSpot.
