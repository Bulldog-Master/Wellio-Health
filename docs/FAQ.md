# Wellio FAQ

## For Individuals

### What is Wellio?

Wellio is a privacy-first Wellness APP Platform that helps you understand your wellbeing through the Functional Wellness Index (FWI), daily logs, and an encrypted Medical Vault—while keeping your raw data on your device.

### Who can see my data?

By default, only you. You can optionally invite:

- Friends, family, or colleagues ("supporters")  
- Trainers and coaches  
- Clinicians  

They only ever see limited, derived insights such as FWI and trends. They never see raw logs, journals, or Medical Vault contents.

### What is cMixx and why does it matter?

Even when messages are encrypted, most apps still leak metadata (who you talk to, how often, and when). **cMixx** is a metadata-private communication protocol from **xx network** that prevents this kind of tracking. In Wellio, all supporter communication uses cMixx.

### Do you sell my data or use it for ads?

No. Wellio is designed around data sovereignty and a zero-trust model. Your data is not sold, not used for targeted advertising, and not shared with third parties.

---

## For Professionals (Trainers / Coaches / Clinicians)

### As a trainer or coach, what do I see?

You see aggregated wellness signals such as:

- Functional Wellness Index (FWI)  
- Adherence trends  
- Behavioral patterns over time  

You do **not** see raw logs, meal details, journals, or Medical Vault files.

### As a clinician, what do I see?

You see functional patterns and lifestyle trends (e.g., sleep consistency, adherence), but not PHI, raw logs, or Medical Vault contents. The APP Platform is designed to reduce data-handling risk while still supporting behavior change.

### Is Wellio an EMR/EHR?

No. Wellio is **not** an EMR/EHR and is not intended for clinical record storage. It is a patient-centered wellness platform focused on functional behavior, not formal medical records.

### How are communications with clients protected?

All communication with clients is routed through **xx network's cMixx mixnet**, which eliminates metadata such as who is talking to whom, how often, and at what times. Content is encrypted, and patterns are protected from traffic analysis.

---

## Technical & Security

### What cryptography does Wellio use?

- **ML-KEM-768** for post-quantum-safe key establishment  
- **AES-256-GCM** for local encryption (including the Medical Vault)  
- **cMixx** for metadata-private communication  

### Where can I learn more?

See:

- [`SECURITY_FAQ.md`](SECURITY_FAQ.md)  
- [`SECURITY_AUDIT.md`](SECURITY_AUDIT.md)  
- [`ACCESS_MODEL.md`](ACCESS_MODEL.md)  
- [`CMIXX_INTEGRATION.md`](CMIXX_INTEGRATION.md)
