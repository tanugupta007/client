BACHPAN GARMENTS — STOREFRONT

This project uses static HTML/CSS/JavaScript pages plus a PHP/MySQL API for verified accounts and Razorpay Test Mode checkout. Live payments and stock reservation are not enabled.

PUBLIC PAGES AND FEATURES
- index.html, about.html, shop-by-school.html, contact.html and privacy-policy.html are the public pages.
- assets/css and assets/js contain the storefront styles and browser-side interactions.
- assets/data/recovered-products.json is a staging catalogue used by product browsing and search.
- School and product filters, search, responsive navigation, size-based cart and checkout review run in the browser.
- Adding a priced item requires a signed-in account with a verified email address.
- Checkout calculates prices on the server, creates Razorpay Orders, verifies signatures and captured status, and shows recent orders on the account page.

PRODUCT AND ORDER STATUS
- The recovered catalogue is not verified inventory. Product prices, available sizes and stock must be confirmed with the store.
- Chart-confirmed sizes and prices can be added to the browser-local cart. Unverified prices cannot be purchased.
- Test checkout charges only the verified items total. It does not include delivery charges or reserve inventory; the store must confirm stock and delivery details.
- The server records an order as paid only after Razorpay confirms a captured payment. Live payments are not enabled.

HOSTINGER DEPLOYMENT
- Configure PHP 8.1+, PDO MySQL, cURL, the database migration, private Razorpay Test Keys and email delivery as described in HOSTINGER-DEPLOYMENT.md.
- A static-only hosting provider cannot run the account or order API.
- Serve the pages over HTTP(S), not as file:// URLs, so the browser can fetch the JSON catalogue.
- The root .htaccess redirects HTTP to HTTPS on Apache. Remove or adapt it if the host does not support Apache configuration files.
- Product images are hosted in the local `assets/images/` directory.

LOCAL CHECKS
  node --check assets\js\school-catalog.js
  node --check assets\js\storefront.js
  node --check assets\js\cart-core.js
  node --check assets\js\checkout.js
  node --check assets\js\account.js
  node --test tests\cart-core.test.js

The PHP endpoints cannot be linted locally unless PHP is installed; verify account creation, email delivery and Test Mode payments after deployment. Keep the Test Key ID and Test Key Secret in server-side configuration only.
