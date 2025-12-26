# Nyx Cognitive Core 2.0 —HR Entity

> **Vision:** Transform CORE - from an AI-assisted HR tool into a living, autonomous HR entity — a secure, auditable, multi-tenant SaaS platform where AI is the central, continuous teammate. CORE 2.0 reasons, acts, learns, and improves organizational outcomes while ensuring human oversight, compliance, and enterprise-grade controls.

---

## Contents

1. Executive summary
2. Core principles
3. System overview (architecture)
4. AI Agent ecosystem (detailed)
5. Cognitive Data Graph & Digital Twins
6. Orchestration & LangGraph patterns
7. APIs, data models & schemas
8. UX / Interaction patterns
9. Governance, explainability & HITL
10. Operations: infra, observability, cost control
11. Roadmap & phased implementation
12. Testing, QA & red-team
13. Risks & mitigations
14. Appendix: prompt library snippets, JSON schemas, API examples

## 1. Executive summary
: an AI-first HR intelligence platform that autonomously executes repeatable HR tasks, continuously learns from outcomes, and provides traceable, auditable recommendations. The platform is built from five converging subsystems:

1. **AI Agent Layer** — specialized agents (CompetencyAI, GrowthAI, PolicyAI, BudgetAI, InsightAI, OpsAI) with clear I/O and safety gates.
2. **Orchestration Layer** — LangChain + LangGraph core that constructs, plans, and supervises multi-step agent workflows.
3. **Cognitive Data Graph** — a connected knowledge graph + vector index that fuses HR entities, time-series, documents, and embeddings.
4. **Execution & Workflow Engine** — safe action execution bus with approval flows, rollback, and digital signatures.
5. **Governance & Explainability** — audithood, model cards, prompt registry, XAI dashboards, and compliance tooling.
 is deployable on GCP (Cloud Run / GKE), using Vertex AI / Gemini / GPT-5 for models, Pinecone/Vertex Matching for vectors, Postgres for transactional data, and GCS for file storage.

## 2. Core principles

* **AI as teammate, not replacement:** Agents recommend and act within guarded scopes with human oversight for sensitive decisions.
* **Schema-first & ground-truthing:** All agent outputs must conform to JSON schemas and reference sources.
* **Immutable auditability:** Every AI prompt, response, and action is logged with cryptographic hashes for tamper evidence.
* **Continuous learning loop:** System learns from accept/reject signals and business outcomes to optimize prompts, routing, and models.
* **Privacy-by-design:** PII encryption, tenant isolation, and explicit retention policies.

## 3. System overview (architecture)

```
[UI React SPA] <---> [API Gateway/Auth] <---> [Backend Microservices]
                                            |-> ai-orchestrator (LangGraph)
                                            |-> agent services (Competency, Growth, Policy...)
                                            |-> workflow-executor (action bus)
                                            |-> data-services (Postgres, KG, Vector DB)
                                            |-> ingestion (OCR, ETL, embeddings)
                                            |-> observability & auditstore
```

### Key infrastructure

* **GCP**: Cloud Run/GKE, Cloud SQL (Postgres), GCS, Pub/Sub (eventing), Secret Manager.
* **AI**: Vertex AI (Gemini) + optional GPT-5 endpoints (via secure adapters).
* **Vector DB**: Pinecone or Vertex Matching.
* **Graph DB**: Neo4j (knowledge graph) or ArangoDB for multi-model flexibility.
* **CI/CD**: GitHub Actions + Terraform for IaC.

## 4. AI Agent ecosystem (detailed)

Agents are microservices exposing `analyze(inputs) -> {validated_json, confidence, sources, trace}`. Each agent must register its schemas, model policy, cost profile, and sensitivity thresholds in the Prompt Registry.

### CompetencyAI

* **Purpose:** Evaluate skills, compute readiness, prioritize gaps.
* **Inputs:** employee profile, role competencies, performance reviews, project logs.
* **Outputs:** readiness_score (0-1), gaps[], suggested_shortlist_skills[], confidence.
* **Plugins:** vector-similarity retriever, skill taxonomy normalizer, performance trender.

### GrowthAI

* **Purpose:** Generate multi-step career/development plans, assign micro-projects & trainings.
* **Inputs:** CompetencyAI output, employee preferences, availability.
* **Outputs:** step[] {title, required_skills, training_ids, milestones, est_months}.

### PolicyAI

* **Purpose:** Analyze policies, flag risk, propose redlines, generate policy drafts.
* **Inputs:** document text, jurisdiction, company config.
* **Outputs:** flags[], suggested_revisions[], severity; `legal_review_required` boolean.

### BudgetAI

* **Purpose:** Forecast hiring/promotions costs; optimize internal vs external hire decisions.
* **Inputs:** salary bands, headcount plan, historical churn, promotions history.
* **Outputs:** scenarios {best, likely, worst}, comp_impact, recommendation.

### InsightAI

* **Purpose:** Synthesize org-level strategic recommendations, create leadership summaries.
* **Inputs:** aggregated KPIs, benchmark data, trend analysis.
* **Outputs:** prioritized recommendations, expected impact, required investments.

### OpsAI (execution agent)

* **Purpose:** Transform approved action cards into executable operations (create calendar invites, assign LMS training, update HRIS fields) via a scoped connector layer with audit and rollback.
* **Safety:** Actions require signed approvals if sensitive; OpsAI will not run destructive actions without explicit approval tokens.

## 5. Cognitive Data Graph & Digital Twins

### Cognitive Data Graph (CDG)

* **Nodes:** Employee, Role, Skill, Training, Department, Document, Event, Metric
* **Edges:** `reports_to`, `has_skill`, `trained_on`, `authored`, `cited_in`, `worked_on`
* **Storage:** Use Neo4j for graph queries; embed nodes for vector similarity.
* **Use cases:** neighborhood queries for skills, provenance paths for XAI, supply chains of knowledge.

### Employee Digital Twin

* **Definition:** Dynamic JSON object representing the employee: skills embeddings, preferences, engagement trends, sentiment score, learning style, memory embeddings of past interactions.
* **Update sources:** performance reviews, LMS completions, 1:1 notes (redacted/consented), survey responses.

## 6. Orchestration & LangGraph patterns

* **LangGraph planner** transforms user intents into a DAG of agent tasks.
* **Control nodes:** conditional branches (e.g., if readiness < 0.6 run GrowthAI else BudgetAI), retries, fallbacks.
* **Execution semantics:** orchestrator runs nodes with timeouts, collects outputs, validates schemas, and merges using merge policies (prioritize higher-confidence agents, union vs override).

**Example flow:** `Recommend Promotion` → CompetencyAI → if readiness>0.8 BudgetAI → PolicyAI → create action card → route for approval.

## 7. APIs, data models & schemas

Use OpenAPI for API contracts and public schemas on a registry. Example core schema snippets:

### Employee (JSON Schema - excerpt)

```json
{
  "$id":"/schemas/employee.json",
  "type":"object",
  "properties":{
    "id":{"type":"string","format":"uuid"},
    "tenant_id":{"type":"string"},
    "name":{"type":"string"},
    "skills":{"type":"array","items":{"type":"object","properties":{"name":{"type":"string"},"level":{"type":"integer"}}}}
  },
  "required":["id","tenant_id","name"]
}
```

### CompetencyGap response (excerpt)

```json
{
  "readiness_score":{"type":"number","minimum":0,"maximum":1},
  "gaps":{"type":"array","items":{"type":"object","properties":{"skill":{"type":"string"},"current":{"type":"number"},"target":{"type":"number"},"priority":{"type":"string"}}}}
}
```

**API Examples (short):**

* `POST /api/v2/ai/competency/gap` → `{employee_id, role_id}` → returns CompetencyGap JSON
* `POST /api/v2/ai/career-path` → `{employee_id, target_role_id, max_steps}` → career path JSON
* `POST /api/v2/workflow/execute` → `{action_card_id, approval_token}` → executes via OpsAI

## 8. UX / Interaction patterns

* **Persistent Assistant:** right-rail with memory, persona selector, suggested actions.
* **Action Cards:** compact UI components with summary, score, top-3 sources, Accept / Request Changes buttons.
* **Explain Mode:** toggles to reveal prompt, model, schema, and source excerpts.
* **Simulation Canvas:** a slider-based visualizer to tweak variables (e.g., L&D budget) and watch projections.
* **Approval Inbox:** managers and approvers get a queue for AI-proposed actions; approvals add cryptographic signatures.

## 9. Governance, explainability & HITL

* **Prompt Registry:** Git-backed prompt store with metadata (owner, version, test cases).
* **Model Cards:** for each model (Gemini, GPT-5), store capabilities, known limitations, and intended use.
* **XAI artifacts:** provenance chain per recommendation (which docs, which data rows impacted result).
* **HITL policies:** admin-configurable sensitivity classifier and approval chains.
* **Immutable auditstore:** store hashed logs in BigQuery/Cloud Storage and optionally anchor hashes to a public ledger for high-assurance customers.

## 10. Operations: infra, observability, cost control

* **Observability:** OpenTelemetry traces, Prometheus metrics, Grafana dashboards for model latency, cost per tenant, hallucination rate.
* **Cost controls:** model routing policies, caching, per-tenant quotas, automatic fallback to cheaper models.
* **Autoscaling:** Cloud Run with concurrency settings; batch jobs for heavy embedding.
* **Secrets:** GCP Secret Manager, rotating keys; restricted service accounts.

## 11. Roadmap & phased implementation

**Phase 0 — Discovery (2 weeks)**

* Finalize schemas, data contracts, sample dataset, PII list.
* Prompt registry setup, initial model adapters.

**Phase 1 — Core MVP (8–10 weeks)**

* Basic UI, employee CRUD, ai-orchestrator, CompetencyAI (Flash), GrowthAI (single-step), documents ingestion, approvals UI.

**Phase 2 — Enterprise features (3–6 months)**

* Vector DB + KG, PolicyAI, OpsAI connectors (calendar, LMS), BudgetAI MVP, analytics dashboards.

**Phase 3 — Autonomy & learning (6–12 months)**

* Workflow automation (AI Task Executor), closed-loop feedback, prompt evolution pipeline, XAI dashboard.

**Phase 4 — Differentiators (12–24 months)**

* Deep personalization (digital twin), multi-agent debate, generative visuals, voice + multimodal interfaces.

## 12. Testing, QA & red-team

* **Prompt tests:** deterministic test harness with golden inputs, schema validation, and behavioral checks.
* **Synthetic scenarios:** nightly runs of business-critical flows (promotions, layoffs, budget changes) to detect regressions.
* **Bias & fairness tests:** measure disparate impact across protected attributes (if applicable and consented) — include technicians for Georgian labor context.
* **Red-team:** adversarial inputs to detect hallucination, privacy leaks, or policy bypasses.

## 13. Risks & mitigations

* **Hallucination:** ground outputs to primary sources, require approval for sensitive actions.
* **PII exposure:** strict redaction, field-level encryption, and tenant isolation.
* **Cost runaway:** routing rules, quotas, and soft-fallback to cached outputs.
* **Legal liability:** policy disclaimers; require human review for legal/compensation decisions.

## 14. Appendix

### Prompt snippet — CompetencyAI

```
System: You are CompetencyAI v2. Output ONLY JSON matching /schemas/competency_gap_v2.json. Include sources[] with {id, excerpt}.
User: Employee: {id:"...", skills:[...]}, Role: {id:"...", competencies:[...]}.
Task: Compute readiness_score and top 5 gaps. Use only provided sources and top-K retrieved docs.
```

### Career Path JSON schema (excerpt)

```json
{
  "type":"object",
  "properties":{
    "path":{"type":"array","items":{"type":"object","properties":{"title":{"type":"string"},"required_skills":{"type":"array"}}}}
  }
}
```

### Example API request — Competency

`POST /api/v2/ai/competency/gap`
Body: `{ "tenant_id":"t1","employee_id":"e123","role_id":"r456" }`

Response: CompetencyGap JSON + `ai_request_id` for traceability.