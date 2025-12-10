# Security Policy

## Supported Versions

| Version | Supported          |
| ------- | ------------------ |
| Latest  | :white_check_mark: |

## Reporting a Vulnerability

We take security seriously at Wellio Health. If you discover a security vulnerability, please report it responsibly.

### How to Report

1. **Do NOT** open a public GitHub issue for security vulnerabilities
2. Email security concerns to: **security@wellio.app** (or contact the repository owner directly)
3. Include as much detail as possible:
   - Description of the vulnerability
   - Steps to reproduce
   - Potential impact
   - Suggested fix (if any)

### What to Expect

- **Acknowledgment**: Within 48 hours of your report
- **Initial Assessment**: Within 5 business days
- **Resolution Timeline**: Depends on severity
  - Critical: 24-48 hours
  - High: 1 week
  - Medium: 2 weeks
  - Low: Next release cycle

### Security Measures in Place

This project employs multiple layers of security:

- **Static Analysis**: CodeQL runs on every push/PR
- **Dependency Scanning**: Snyk monitors for vulnerable dependencies
- **Automated Updates**: Dependabot keeps dependencies current
- **Secret Detection**: CI pipeline checks for accidental credential exposure
- **Encryption**: Quantum-resistant encryption for sensitive medical data
- **Access Control**: Row-Level Security (RLS) on all database tables

### Scope

The following are in scope for security reports:
- Authentication/authorization bypasses
- Data exposure vulnerabilities
- Injection vulnerabilities (SQL, XSS, etc.)
- Cryptographic weaknesses
- Access control issues

### Out of Scope

- Social engineering attacks
- Denial of service attacks
- Issues in third-party services we integrate with

## Security Best Practices for Contributors

1. Never commit secrets or credentials
2. Use environment variables for sensitive configuration
3. Follow the principle of least privilege
4. Validate and sanitize all user inputs
5. Keep dependencies updated

---

Thank you for helping keep Wellio Health secure!
