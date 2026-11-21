# Bachpan Garments — Hostinger Production Deployment Guide

Official deployment, configuration, and operational guide for **Bachpan Garments** (`https://bachpangarments.in/`) on Hostinger Shared Hosting.

---

## 1. System Requirements & Architecture

- **Domain**: `https://bachpangarments.in/`
- **Hosting**: Hostinger Shared Hosting / Cloud Hosting
- **Web Server**: Apache with `mod_rewrite` enabled (`.htaccess` included)
- **Frontend**: Static HTML5, Tailwind CSS utilities + custom CSS, Vanilla JavaScript (zero build step)
- **Backend**: PHP 8.1+ (8.1, 8.2, or 8.3 recommended)
  - Required Extensions: `pdo_mysql`, `curl`, `openssl`, `mbstring`, `json`
- **Database**: MySQL 5.7+ / 8.0+ or MariaDB 10.3+
- **Payment Gateway**: Razorpay (Test Mode for staging, Live Mode for production)
- **Invoicing**: Pure PHP vector PDF invoice generator (navy blue & white branded template, no external binary dependencies)

---

## 2. Hostinger Server & Database Setup

### Step 1: Create Database in Hostinger hPanel
1. Log in to Hostinger **hPanel**.
2. Go to **Databases** → **MySQL Databases**.
3. Create a new database and user:
   - **Database Name**: e.g., `u123456789_bachpan`
   - **Username**: e.g., `u123456789_bachpanuser`
   - **Password**: Enter a strong password
   - **Host**: `localhost` (Hostinger default)

### Step 2: Database Setup (phpMyAdmin)
1. In hPanel, under **Databases**, click **Enter phpMyAdmin** next to your database.
2. Select your database name from the left sidebar.

#### Option A: Fresh Database Installation
1. Click the **Import** tab at the top.
2. Choose file: `database/install.sql`
3. Click **Go** at the bottom.
   *This initializes all 13 core tables, pre-seeds 18 schools, 63 products, 284 size variants with confirmed prices and stock, 113 images, and creates the default Administrator account.*

#### Option B: Upgrade Existing Database (Safe Migration)
1. First, take a backup: Click **Export** → **Quick** → **Go**.
2. Click the **SQL** tab.
3. Paste and run the contents of `database/migrations/20261105_password_auth_and_invoice.sql`.
4. Click **Go**.
   *This safely adds required invoice columns, payment method, product tags, and variant MRP.*

---

## 3. Secure Private Configuration (`bachpan-private/config.php`)

Sensitive credentials must be stored outside `public_html` so they can never be accessed via browser.

1. In Hostinger **File Manager**, navigate to your user home directory: `/home/u123456789/`
2. Create a folder named `bachpan-private/` parallel to `public_html/`:
   ```
   /home/u123456789/
   ├── bachpan-private/          <-- Protected (outside web root)
   │   └── config.php
   └── public_html/              <-- Web root (deployed website)
       ├── admin/
       ├── api/
       ├── assets/
       ├── invoices/
       └── index.html
   ```
3. Inside `/home/u123456789/bachpan-private/`, create `config.php`:

```php
<?php
return [
    // 1. Hostinger MySQL Database Credentials
    'db_host' => 'localhost',
    'db_name' => 'YOUR_HOSTINGER_DATABASE',       // e.g. u123456789_bachpan
    'db_user' => 'YOUR_HOSTINGER_DATABASE_USER',  // e.g. u123456789_bachpanuser
    'db_password' => 'YOUR_DATABASE_PASSWORD',

    // 2. Application Security Key (Minimum 32 random characters)
    'app_key' => 'REPLACE_WITH_A_LONG_RANDOM_SECRET_KEY_MIN_32_CHARS',

    // 3. Domain & Email Configuration
    'site_url' => 'https://bachpangarments.in',
    'mail_from' => 'orders@bachpangarments.in',
    'order_notify_email' => 'store-owner@example.com',

    // 4. Razorpay Credentials
    // TEST MODE: rzp_test_... Key ID & Test Secret
    // LIVE MODE: rzp_live_... Key ID & Live Secret
    'razorpay_key_id' => 'rzp_test_TtKbJCzGBMuMAo',
    'razorpay_key_secret' => 'YOUR_RAZORPAY_KEY_SECRET',
    'razorpay_webhook_secret' => 'YOUR_RAZORPAY_WEBHOOK_SECRET',
];
```

---

## 4. File Upload & Directory Permissions

1. Upload all contents of this project folder into `public_html/`:
   - `admin/` (Admin Panel portal)
   - `api/` (PHP endpoints: auth, orders, products, invoice, webhook)
   - `assets/` (CSS, JS, images, fonts, data)
   - `database/` (SQL schemas and migrations)
   - `invoices/` (Generated PDF invoices storage)
   - All HTML storefront files (`index.html`, `shop-by-school.html`, `checkout.html`, `account.html`, `about.html`, `contact.html`, `privacy-policy.html`)
   - `.htaccess` (HTTPS enforcement, invoice access restriction, security headers)
2. Set Directory Permissions in File Manager:
   - `assets/images/catalog/` → **755** (Allows admin image uploads)
   - `invoices/` → **755** (Allows automatic invoice saving)
   - All PHP files under `api/` and `admin/` → **644**
   - Directories → **755**

---

## 5. Razorpay Payment & Webhook Configuration

### Step 1: API Keys
1. Log in to [Razorpay Dashboard](https://dashboard.razorpay.com/).
2. Select **Test Mode** (for staging) or **Live Mode** (for production).
3. Go to **Account & Settings** → **API Keys** → **Generate Key**.
4. Enter `Key ID` and `Key Secret` into `/home/u123456789/bachpan-private/config.php`.

### Step 2: Webhook Setup
1. In Razorpay Dashboard, go to **Account & Settings** → **Webhooks** → **Add New Webhook**.
2. **Webhook URL**:
   ```
   https://bachpangarments.in/api/razorpay-webhook.php
   ```
3. **Secret**: Enter a secure random string and paste it in `razorpay_webhook_secret` in `config.php`.
4. **Active Events**: Check:
   - `payment.captured`
   - `payment.failed`
5. Click **Save Webhook**.

---

## 6. Admin Panel Setup & Real-Time Sync

- **Admin URL**: `https://bachpangarments.in/admin/`
- **Default Username**: `admin`
- **Default Password**: `Admin@Bachpan2026!`
  *(Change this password immediately after first login)*

### Admin Capabilities:
1. **Dashboard**: Revenue, total orders, pending orders breakdown, recent orders.
2. **Products & Stock (`admin/products.php`)**:
   - Flipkart Seller dashboard layout with top stat cards: Total Products, Active, Out of Stock, Low Stock.
   - Filter by school, category, gender, grade range (`Grade 1st to 5th`, `Grade 6th to 12th`), stock level.
   - Add, View, Edit, and Delete products and size variants.
   - Multi-image upload with client-side compression and primary thumbnail selection.
   - **Real-Time Storefront Sync**: Admin edits write directly to MySQL `products` and `product_variants` tables. The storefront (`api/products.php`) reads directly from MySQL with `Cache-Control: no-store` headers, reflecting updates immediately without caching delays.
3. **Orders (`admin/orders.php`)**:
   - Filter by status (`Paid`, `Confirmed`, `Shipped`, `Delivered`, `Pending Payment`, `Cancelled`).
   - Order detail inspection with delivery address.
   - Direct action buttons: **Inspect**, **Invoice ↗** (print view), **PDF ⬇** (download invoice), and **WhatsApp** (one-click pre-filled customer message).
4. **Customers (`admin/customers.php`)**:
   - Search registered customers and view purchase history.

---

## 7. Customer Authentication & Checkout Flow

1. **Authentication (No OTP / SMS / Google Auth)**:
   - **Login**: Email Address or 10-digit Mobile Number + Password.
   - **Signup**: Full Name, Email, Mobile Number, Password, Confirm Password. Accounts are activated instantly without OTP or SMS verification.
   - **Password Recovery**: Secure email link with expiring token (valid for 60 minutes).
2. **Checkout Process**:
   - Customer adds products to cart.
   - Customer clicks "Proceed to Checkout".
   - Checkout prompts for **Login** or **Create New Account**.
   - Customer confirms delivery address and reviews order summary.
   - Customer pays securely via Razorpay Checkout.
3. **Automated PDF Invoice**:
   - Generated automatically as PDF in `invoices/` upon payment verification.
   - Navy Blue & White branded template matching Bachpan Garments design.
   - Securely accessible only to the customer who placed the order and authorized administrators. Direct access to `/invoices/*.pdf` is blocked by `.htaccess`.

---

## 8. Verification & Local Testing Commands

Verify all syntax and business contracts locally:

```powershell
# 1. Run full test suite (67 automated tests)
node --test tests/*.test.js

# 2. Syntax check core JavaScript files
node --check assets/js/checkout.js
node --check assets/js/account.js
node --check assets/js/storefront.js
node --check assets/js/school-catalog.js
node --check assets/js/cart-core.js
```

All 67 tests pass cleanly.
