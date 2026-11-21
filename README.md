# Bachpan Garments storefront

This project uses static HTML/CSS/JavaScript pages with a PHP/MySQL API for email-verified customer accounts and Razorpay Test Mode checkout. Live payments and stock reservation are not enabled.

## Features

- Home, about, contact, privacy, and school catalogue pages.
- School and product browsing, filtering, and search using the recovered and restored catalog data.
- Product size selection and a browser-local cart using chart-confirmed prices; adding to cart requires a verified customer account.
- Hostinger checkout that calculates totals from the server pricebook, creates Razorpay Test Mode Orders, verifies signatures and captured status server-side, processes signed idempotent webhooks, and lists recent orders on the account page.
- Responsive navigation, galleries, and local website assets.

The recovered product export remains staging data: its stock and non-chart prices have not been verified. Exported listings restored from `products_export_1.csv` remain unavailable for ordering until their prices are verified. `assets/data/uniform-pricing.json` contains the size-wise prices transcribed from the supplied school charts. Values that could not be read confidently cannot be added to the cart. Test checkout charges the verified items total only; it does not include delivery charges or reserve stock. The store must confirm stock and delivery details. The server marks orders paid only after Razorpay reports a captured payment.

## Deploy

See [HOSTINGER-DEPLOYMENT.md](HOSTINGER-DEPLOYMENT.md) for the database migration, PHP 8.1+/PDO MySQL/cURL requirements, private Razorpay Test Key configuration, and Test Mode payment checks. The account and order APIs require a PHP/MySQL host; static-only hosting will not support them. Apache's root `.htaccess` redirects HTTP to HTTPS and blocks direct access to setup files.

Serve the site over HTTP(S), rather than opening HTML pages as `file://` URLs, so the JSON catalogue can be fetched by the browser.

## Checks

```powershell
node --check assets\js\school-catalog.js
node --check assets\js\storefront.js
node --check assets\js\cart-core.js
node --test tests\cart-core.test.js
node --test tests\uniform-pricing.test.js
```

The PHP API is not executable in the local workspace unless PHP is installed. Deploy and configure it on Hostinger before attempting signup or order submission.
