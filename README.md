# Wellio — Privacy-First Wellness APP Platform

Your health. Your privacy. Your control.

Wellio is a **privacy-first Wellness APP Platform** built for **individuals**, with optional support from **friends, family, colleagues, trainers, coaches, and clinicians**. Raw data stays on the user's device. Only *derived wellness insights*—such as FWI, trend patterns, and adherence signals—may be shared, and only with explicit user consent.

Communication with all optional supporters is protected with **post-quantum encryption (ML-KEM-768)** and **xx network's cMixx metadata-elimination protocol**.  
This ensures that *neither content nor communication patterns* ever leak.

---

## 🚀 Platform Highlights

### Individual-First Design
- Complete personal wellness dashboard  
- Functional Wellness Index (FWI)  
- Today-at-a-Glance insights  
- Sleep, meals, hydration, movement, and mood logs  
- Private Medical Vault with PQ-encrypted storage  

### Optional Support Network
Invite trusted people to help you reach your goals:
- Friends, family, and colleagues  
- Trainers & coaches  
- Clinicians  

Each receives strictly limited, role-appropriate **derived insights**, never raw logs or documents.

---

## 🔐 Security Foundation

| Layer | Description |
|-------|-------------|
| **On-Device Data** | Raw logs, journals, and vault contents never leave the device. |
| **Post-Quantum Crypto** | ML-KEM-768 for key establishment, AES-256-GCM for local encryption. |
| **Metadata Protection** | All outbound communication routed through xx network's cMixx. |
| **Zero-Trust Architecture** | Servers cannot view or infer user wellness data. |
| **Professional Access Controls** | Coaches and clinicians see trends, not personal entries. |

For full details, see:  
- [`SECURITY_FAQ.md`](docs/SECURITY_FAQ.md)  
- [`SECURITY_AUDIT.md`](docs/SECURITY_AUDIT.md)  
- [`ACCESS_MODEL.md`](docs/ACCESS_MODEL.md)  
- [`CMIXX_INTEGRATION.md`](docs/CMIXX_INTEGRATION.md)

---

## 🧠 Functional Wellness Index (FWI)

FWI is computed on-device using:
- Sleep quality & timing  
- Meal and hydration consistency  
- Activity & movement balance  
- Mood and stress reflections  

Only the **FWI score and derived patterns** are ever shared. No raw entries, timestamps, or vault files are exposed.

---

## 📡 Professional & Personal Network Roles

| Role | What They Can See | What They Cannot See |
|------|-------------------|----------------------|
| **Friends / Family / Colleagues** | High-level wellbeing summaries | All logs, vault, journals, PHI |
| **Trainers / Coaches** | FWI, adherence, trend views | Raw logs, journals, vault contents |
| **Clinicians** | Functional patterns without PHI | Vault, raw data, identifiers |

Access is logged and revocable at any time.

---

## 🏗️ Architecture Overview

See:  
- [`ARCHITECTURE.md`](docs/ARCHITECTURE.md)  
- [`CMIXX_INTEGRATION.md`](docs/CMIXX_INTEGRATION.md)

The system consists of:
- On-device data computation  
- Derived-insight gating  
- cMixx metadata-private transport  
- Role-based insight receivers  
- A unified APP Platform model

---

## 🧪 Development

```bash
npm install
npm run dev
npm run build
npm run preview
npm run typecheck
npm run test
```

---

## 📄 License

UNLICENSED (Proprietary)

---

## 📝 Notes

This repository includes a `.env` file containing **publishable** client configuration only.  
Private secrets are handled via Lovable Cloud Secrets and are never exposed in the codebase.
