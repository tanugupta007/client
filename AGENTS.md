# AGENTS.md

## AI Coding Agent Operating Guide for Bachpan Garments Hostinger Storefront

This guide summarizes essential conventions, workflows, and pitfalls for AI coding agents working in this codebase. It is designed to maximize productivity and prevent common mistakes. For full details, see [README.md](README.md) and [HOSTINGER-DEPLOYMENT.md](HOSTINGER-DEPLOYMENT.md).

---

## Project Overview
- **Static HTML/CSS/JS frontend** served from the web root
- **PHP/MySQL backend** under `api/` for auth, orders, and payment
- **No build step**: validate with Node and PHP lint/tests only

---

## Key Conventions & Workflows

### 1. Data Authority
- The **authoritative pricebook** is [assets/data/uniform-pricing.json](assets/data/uniform-pricing.json)
- **Never trust browser-supplied prices or totals**; always validate against the server
- **Recovered/restored products** are browse-only until verified in the pricebook

### 2. Validation & Security
- All cart and order logic must be validated both **client-side** ([assets/js/cart-core.js](assets/js/cart-core.js)) and **server-side** ([api/orders.php](api/orders.php))
- **Razorpay**: Only test keys (`rzp_test_...`) are accepted; signatures and captured amounts are re-checked server-side
- **Sensitive config** is outside the repo/web root (see [HOSTINGER-DEPLOYMENT.md](HOSTINGER-DEPLOYMENT.md))
- **HTTPS is required** for payment APIs

### 3. Testing
- Use Node to check JS syntax and run tests:
  - `node --check assets\js\school-catalog.js`
  - `node --test tests\cart-core.test.js`
- Use PHP lint for backend:
  - `php -l api\orders.php`
- **Tests are the contract**: always check [tests/](tests/) for business rules

---

## File-by-File Checklist

### Frontend
- [assets/js/storefront.js](assets/js/storefront.js): Cart, auth, catalog, checkout
- [assets/js/cart-core.js](assets/js/cart-core.js): Cart rules, price formatting
- [assets/js/school-catalog.js](assets/js/school-catalog.js): Catalog/search/filter
- [assets/data/uniform-pricing.json](assets/data/uniform-pricing.json): Pricebook (source of truth)

### Backend
- [api/bootstrap.php](api/bootstrap.php): Config, session, helpers
- [api/auth.php](api/auth.php): Auth flows, rate limiting
- [api/orders.php](api/orders.php): Order creation, price validation, payment verification
- [api/razorpay-webhook.php](api/razorpay-webhook.php): Webhook validation/deduplication

### Tests
- [tests/cart-core.test.js](tests/cart-core.test.js): Cart/price rules
- [tests/product-text.test.js](tests/product-text.test.js): Catalog normalization
- [tests/uniform-pricing.test.js](tests/uniform-pricing.test.js): Pricebook, mappings, hidden products

---

## Common Pitfalls for AI Agents
- Editing only frontend logic without updating server validation
- Assuming all products in data are orderable
- Treating pricebook as optional (it is the contract)
- Forgetting HTTPS/config requirements
- Overlooking test coverage for business rules

---

## Best Practices
- **Always cross-check**: Data → Frontend logic → Server validation → Tests
- **Link, don’t duplicate**: Reference [README.md](README.md) and [HOSTINGER-DEPLOYMENT.md](HOSTINGER-DEPLOYMENT.md) for details
- **Minimal, actionable changes**: Only update what is necessary and always validate with tests

---

For iterative improvement, use `/chronicle improve` to refine these instructions based on session history and friction points.
