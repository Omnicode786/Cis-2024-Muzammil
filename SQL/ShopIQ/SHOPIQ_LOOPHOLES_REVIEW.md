# ShopIQ Loopholes Review

This file reviews remaining loopholes, workflow gaps, security issues, and data-integrity risks in the current ShopIQ system.

The earlier invoice/payment loophole has already been fixed. It is still mentioned briefly for context, but this review focuses on other issues that may still exist.

## Research Basis

I compared ShopIQ with real retail/POS workflows used by small stores and larger supermarket systems. Real systems usually connect these areas tightly:

- POS checkout
- Customer accounts
- Inventory on hand
- Purchase orders and receiving
- Supplier/vendor management
- Stock adjustments and cycle counts
- Returns and refunds
- Payment allocation
- Audit logs
- Reports
- Staff permissions

Public references used for workflow comparison:

- [Shopify POS](https://www.shopify.com/pos) describes POS as a connected system for sales, payments, customers, and inventory.
- [Square inventory management](https://squareup.com/help/us/en/article/5228-item-options) documents item inventory tracking and stock changes.
- [Lightspeed Retail inventory counts](https://www.lightspeedhq.com/blog/inventory-counts/) explains full counts, partial counts, spot counts, and how counts help find shrinkage.
- [Oracle Retail receiving documentation](https://docs.oracle.com/en/industries/retail/retail-store-inventory-management/) shows that enterprise retail receiving is treated as a structured workflow tied to purchase orders, receipt records, and inventory updates.
- [Vori supermarket platform](https://www.vori.com/supermarkets) presents supermarket operations as connected POS, payments, ordering, receiving, inventory, and pricing.

## Short Real-World Workflow Comparison

### Real-World Supermarket Workflow

1. Products are created with SKU, barcode, department, supplier, tax, cost, retail price, pack size, and reorder rules.
2. Stock comes in through purchase orders or receiving.
3. Receiving updates stock only when goods are actually received.
4. POS sales reduce stock immediately.
5. Returns and refunds are recorded separately from sales.
6. Stock adjustments require reason codes, user identity, and audit history.
7. Customer credit is tied to known customer accounts only.
8. Supplier payables are tied to supplier invoices or purchase receipts.
9. Daily cash closing reconciles invoice totals with actual payments.
10. Reports separate gross sales, net sales, paid collections, discounts, tax, refunds, and cancellations.

### Current ShopIQ Workflow

ShopIQ already has the main modules:

- Products
- Customers
- Suppliers
- Billing and invoices
- Payments
- Purchases
- Reports
- Activity logs
- AI Assistant
- Settings
- Staff permissions

The system is strong for a student/project retail app and already handles many important relationships. The remaining issues are mostly around advanced retail correctness: cancellation/refund accounting, direct ledger edits, stock concurrency, report accuracy, audit depth, and production security.

## Fixed / Previous Loopholes

### Fixed Issue: Invoice Paid Amount Did Not Always Create A Payment

**What the problem was:**  
Earlier, an invoice could store a paid amount without creating a matching Payment record.

**Why it mattered:**  
Invoices and Payments could disagree. Reports and cashflow would become confusing.

**Risk before fix:**  
High. Sales and payment records could drift.

**Current status:**  
Fixed. Creating an invoice with paid amount now creates a linked automatic Payment record. Editing invoice paid amount updates the automatic payment instead of creating duplicates.

**Priority:** Fixed

### Fixed Issue: Walk-In Customers Could Have Dues

**What the problem was:**  
A walk-in invoice could be partial or unpaid even though no real customer was attached.

**Why it mattered:**  
The shop would not know who owed the money.

**Risk before fix:**  
High. Bad receivables and impossible collection.

**Current status:**  
Fixed. Walk-in invoices must be fully paid on spot. If there is credit or due amount, the user must select or create a customer.

**Priority:** Fixed

### Fixed Issue: Payment Could Mismatch Invoice Customer

**What the problem was:**  
An invoice-based payment could potentially be associated with the wrong customer.

**Why it mattered:**  
Customer balances and invoice settlement would become incorrect.

**Risk before fix:**  
High. Ledger corruption.

**Current status:**  
Fixed. Selecting an invoice in Payments now controls the customer and prevents selecting another customer.

**Priority:** Fixed

### Fixed Issue: Concurrent Sales Can Oversell Stock

**What the problem was:**  
Invoice creation checked stock before the transaction, then decremented stock inside the transaction. If two users sold the last units at the same time, both requests passed the stock check before either decrement finished.

**Why it mattered:**  
Real POS systems must prevent negative stock or overselling when two counters sell the same product.

**Risk before fix:**  
High. Stock could become negative or incorrect during busy use.

**Current status:**  
Fixed. The invoice creation uses Prisma's atomic decrement inside a single transaction and strictly checks for negative stock, safely aborting any concurrent oversell attempts.

**Priority:** Fixed

### Fixed Issue: Manual Stock Edits Are Too Powerful

**What the problem was:**  
Admins/managers could edit product stock directly from the product form without explaining the adjustment, bypassing standard audit requirements.

**Why it mattered:**  
Real inventory systems require reason codes for stock adjustments.

**Risk before fix:**  
High. Stock was changed without enough explanation, making audits weak.

**Current status:**  
Fixed. Editing a product's stock quantity via the UI or API now mandatorily requires a `stockAdjustmentReason` (and an optional note for "Other" reasons), which is cleanly saved to both the Stock Movement and Activity Log tables for full auditing.

**Priority:** Fixed

### 3. Customer Balance Is Directly Editable (FIXED)

**The Loophole:**
Customer balances could be edited directly from the customer form, bypassing the invoice and payment ledger entirely.

**How we fixed it:**
1. Removed direct manual overriding of the `balance` field in the customer edit form (made it strictly read-only).
2. Introduced an `Opening balance` field exclusive to customer creation that formally logs the starting ledger state.
3. Added a dedicated adjustment workflow (`balanceAdjustment`, `adjustmentReason`, `adjustmentNote`) to the edit form.
4. Any balance adjustment now utilizes atomic database operations and generates a permanent `CUSTOMER_BALANCE_ADJUSTMENT` activity log with full context and diffs.

**Priority:** Fixed

## Products And Inventory

### 3. Archived Products Can Hide Real Stock

**What the problem is:**  
Products can be archived even if they still have stock quantity.

**Why it matters:**  
Archived products may disappear from normal active inventory calculations and selling workflows while still representing real stock in the shop.

**Possible risk:**  
Inventory value and stock counts may be understated.

**Priority:** Medium

### 4. No True Cycle Count Workflow

**What the problem is:**  
There is no dedicated cycle count, spot count, or full inventory count process.

**Why it matters:**  
Real stores regularly compare physical stock with system stock to catch shrinkage, damage, theft, and mistakes.

**Possible risk:**  
Stock drift may go unnoticed until billing fails or products run out.

**Priority:** Medium

### 5. Latest Purchase Cost Replaces Product Cost

**What the problem is:**  
When a purchase is created, the product cost price is updated to the latest unit cost.

**Why it matters:**  
Real retail systems often use weighted average cost, batch cost, FIFO, or another costing method. Latest cost can distort profit if older stock was bought cheaper or more expensive.

**Possible risk:**  
Profit/loss reports may be inaccurate after cost changes.

**Priority:** High

### 6. Expiry And Batch Fields Exist But Are Not Enforced

**What the problem is:**  
Products support expiry date, manufacture date, batch number, and perishable flag, but billing does not enforce expiry checks or FEFO/FIFO selling.

**Why it matters:**  
Supermarkets and grocery stores must prevent expired stock from being sold.

**Possible risk:**  
Expired or wrong-batch goods can be sold.

**Priority:** Medium

### 7. No Pack Size Or Unit Conversion

**What the problem is:**  
The system has one unit field, but it does not model carton-to-piece, dozen-to-piece, kg-to-grams, or case-pack buying versus individual selling.

**Why it matters:**  
Small stores often buy cartons and sell pieces.

**Possible risk:**  
Stock can be entered in one unit and sold in another without conversion accuracy.

**Priority:** Medium

### 8. Barcode Is Not Unique Per Shop

**What the problem is:**  
SKU is unique per shop, but barcode is not.

**Why it matters:**  
If two active products share a barcode, scanning can identify the wrong item.

**Possible risk:**  
Wrong product billed or restocked.

**Priority:** Medium

### 9. Sale Price Can Be Lower Than Cost Without Warning

**What the problem is:**  
The app allows sale price to be lower than cost price.

**Why it matters:**  
Sometimes this is intentional for promos, but it should warn the owner.

**Possible risk:**  
Accidental loss-making prices.

**Priority:** Low

## Customers


### 11. Credit Limit Is Not Enforced During Billing

**What the problem is:**  
Customers have credit limits, but invoice creation does not appear to block a new due amount that exceeds the available credit.

**Why it matters:**  
Credit limits only help if the billing flow checks them.

**Possible risk:**  
Staff can create large dues beyond the allowed customer limit.

**Priority:** High

### 12. Duplicate Customer Records Are Easy

**What the problem is:**  
Phone, WhatsApp, email, and loyalty card number are searchable but not unique per shop.

**Why it matters:**  
The same customer can be created multiple times.

**Possible risk:**  
Dues and loyalty history split across multiple customer profiles.

**Priority:** Medium

### 13. No Customer Active/Inactive Status

**What the problem is:**  
Customers can be deleted only if they have no invoices/payments, but there is no proper archived/inactive customer state.

**Why it matters:**  
Old customers should be hidden from normal selection without deleting history.

**Possible risk:**  
Customer dropdowns and reports become cluttered.

**Priority:** Low

### 14. Staff Can Edit Sensitive Customer Ledger Fields

**What the problem is:**  
Staff can update customers, and the customer form includes balance and credit limit fields.

**Why it matters:**  
Staff should usually update contact details, not ledger values.

**Possible risk:**  
Accidental or intentional balance changes.

**Priority:** High

## Suppliers

### 15. Supplier Balance Is Directly Editable

**What the problem is:**  
Supplier balance can be edited in the supplier form.

**Why it matters:**  
Supplier balance should come from purchases, supplier payments, opening payables, and adjustments.

**Possible risk:**  
Supplier payable may not match purchase/payment records.

**Priority:** High

### 16. Purchase Can Have Due Amount Without Supplier Through API

**What the problem is:**  
The guided purchase UI asks for a supplier when a purchase has due amount, but the API allows supplierId to be optional. If a due purchase is created without supplier, no supplier balance is updated.

**Why it matters:**  
Credit purchases need a supplier account.

**Possible risk:**  
Payables can disappear from supplier ledger.

**Priority:** High

### 17. Supplier Payment Can Overpay Purchase

**What the problem is:**  
Invoice payments have remaining-balance checks, but supplier purchase payments do not appear to have the same strict overpayment check.

**Why it matters:**  
Supplier payouts should not exceed purchase due unless advance/refund logic exists.

**Possible risk:**  
Negative supplier balances or incorrect purchase paid amounts.

**Priority:** High

### 18. No Supplier Inactive Status

**What the problem is:**  
Suppliers with records cannot be deleted, but there is no inactive/archive status.

**Why it matters:**  
Old suppliers should be hidden from normal receiving without deleting history.

**Possible risk:**  
Supplier selection becomes messy over time.

**Priority:** Low

### 19. Supplier Tax Identity Is Not Unique

**What the problem is:**  
NTN and GST number fields exist but are not unique per shop.

**Why it matters:**  
Real vendor records often rely on tax identity to prevent duplicates.

**Possible risk:**  
Duplicate supplier accounts and split payables.

**Priority:** Medium

## Invoices And Billing

### 20. Guided Billing Is Still Too Simple For Real Baskets

**What the problem is:**  
The guided billing UI is focused on a simple product-line sale. The API supports item arrays, but the main UI does not behave like a full cart for multi-product grocery baskets.

**Why it matters:**  
Real POS checkout usually sells multiple items in one invoice.

**Possible risk:**  
Users may create multiple invoices for one sale or avoid using the system for real counter billing.

**Priority:** Medium

### 21. Editing Invoice Totals Can Break Item Totals

**What the problem is:**  
Invoice edit allows fields like total, paid amount, discount, tax, and status, but does not edit invoice line items or recalculate stock from changed items.

**Why it matters:**  
Invoice totals should match item totals.

**Possible risk:**  
Invoice item data, grand total, paid amount, and reports can disagree.

**Priority:** High

### 22. No Proper Refund Workflow

**What the problem is:**  
Cancelling an invoice reverses stock and clears due, but there is no complete refund/payment reversal workflow for paid invoices.

**Why it matters:**  
If the customer already paid, cancellation should record whether cash/card money was refunded or kept as credit.

**Possible risk:**  
Payments module may still show money collected even though invoice was cancelled.

**Priority:** High

### 23. No Formal Return Exchange Flow

**What the problem is:**  
Invoice cancellation exists, but there is no separate return, exchange, partial return, damaged return, or refund receipt workflow.

**Why it matters:**  
Real shops often return only one item from a multi-item bill.

**Possible risk:**  
Users may cancel entire invoices for partial returns.

**Priority:** Medium

### 24. Date-Based Invoice Numbering Is Weak

**What the problem is:**  
Default invoice numbers use `INV-${Date.now()}` style fallback.

**Why it matters:**  
Real billing usually needs predictable receipt sequences per shop, counter, and date.

**Possible risk:**  
Duplicate conflicts under heavy concurrency or weak invoice traceability.

**Priority:** Medium

### 25. Discount And Tax Are Invoice-Level, Not Line-Level

**What the problem is:**  
Discount and tax are stored mostly at invoice level. Details view distributes them across lines for display, but line-level tax/discount is not stored.

**Why it matters:**  
Different products can have different taxes or discounts.

**Possible risk:**  
Tax and profit reports can be less accurate.

**Priority:** Medium

## Payments

### 26. Customer Payment Without Invoice Can Leave Old Invoices Open

**What the problem is:**  
A customer payment can be recorded against the customer without selecting an invoice. This reduces customer balance, but does not allocate payment to specific unpaid invoices.

**Why it matters:**  
Real receivable systems allocate receipts to invoices.

**Possible risk:**  
Customer balance may look lower while old invoices still show PARTIAL or UNPAID.

**Priority:** High

### 27. Manual Payment Deletion Removes Financial Record

**What the problem is:**  
Manual payments can be deleted by admins/managers. The app logs deletion, but the payment row is removed.

**Why it matters:**  
Financial systems usually void or reverse payments instead of deleting them.

**Possible risk:**  
Audit trail loses full payment details.

**Priority:** High

### 28. No Cash Drawer Or Day Closing

**What the problem is:**  
Payments are recorded, but there is no shift closing, cashier cash drawer count, or expected-vs-actual cash reconciliation.

**Why it matters:**  
Retail shops need to compare system cash with physical cash.

**Possible risk:**  
Cash shortages or overages are hard to detect.

**Priority:** Medium

### 29. Split Payments Are Not Normalized

**What the problem is:**  
Invoice has a paymentBreakdown JSON field, but the main payment workflow is one Payment record at a time.

**Why it matters:**  
Customers may pay part cash and part card/JazzCash.

**Possible risk:**  
Payment method reports can be inaccurate if split payments are stored inconsistently.

**Priority:** Medium

### 30. Payment Reference Is Not Unique

**What the problem is:**  
Payment reference numbers are not unique per shop.

**Why it matters:**  
Bank/JazzCash/card references may need duplicate detection.

**Possible risk:**  
Duplicate payment entries can be recorded.

**Priority:** Low

## Purchases And Receiving

### 31. Purchase Status Is Not A True Receiving Workflow

**What the problem is:**  
Purchase creation immediately creates RECEIVED purchases and increases stock. ORDERED and PARTIAL statuses exist, but the UI/API do not fully model ordered, partially received, received, and closed stages.

**Why it matters:**  
Real receiving separates ordering from actual stock arrival.

**Possible risk:**  
Stock may be increased before goods are physically received.

**Priority:** High

### 32. Purchase Editing Does Not Reconcile Item Quantities

**What the problem is:**  
Purchase edit updates total, paid amount, supplier, status, and notes, but not purchase items or stock quantities.

**Why it matters:**  
If quantity or unit cost was wrong, there is no clean edit path that adjusts stock and item totals together.

**Possible risk:**  
Purchase totals and product stock can disagree.

**Priority:** High

### 33. Supplier Payment Is Not Automatically Created On Purchase Paid Amount

**What the problem is:**  
Creating a purchase stores paidAmount, but there is no clear matching automatic supplier payment record like the invoice automatic payment flow.

**Why it matters:**  
Payments module should show supplier cash paid at receiving time.

**Possible risk:**  
Purchase paid amounts and supplier payment cashflow may disagree.

**Priority:** High

### 34. Cancel Purchase Does Not Handle Supplier Refunds

**What the problem is:**  
Cancelling a purchase reverses stock and due, but does not clearly handle money already paid to the supplier.

**Why it matters:**  
If the shop already paid, cancellation should create refund/credit logic.

**Possible risk:**  
Supplier cashflow and purchase status can disagree.

**Priority:** Medium

## Reports And PDF Reports

### 35. Dashboard Snapshot Can Include Cancelled Invoices

**What the problem is:**  
The dashboard snapshot loads invoices by shop without excluding CANCELLED status in the main snapshot query.

**Why it matters:**  
Cancelled invoices should not count as active revenue.

**Possible risk:**  
Sales pulse, monthly revenue, timelines, and dashboard cards can overstate business performance.

**Priority:** High

### 36. Billing Module Gross Totals Can Include Cancelled Invoices

**What the problem is:**  
Billing aggregate metrics sum invoice totals without clearly excluding cancelled invoices.

**Why it matters:**  
Cancelled sales should be separated from active billed sales.

**Possible risk:**  
Gross billed and open due cards can mislead the user.

**Priority:** High

### 37. Report Export Uses Limited Snapshot Data

**What the problem is:**  
The dashboard snapshot used for reports limits invoices, payments, purchases, movements, and activities.

**Why it matters:**  
Reports for large stores need complete date-range aggregation, not only recent rows.

**Possible risk:**  
PDF reports become incomplete as data grows.

**Priority:** High

### 38. PDF Download Link Regenerates Report

**What the problem is:**  
Activity links point back to the report export API instead of a stored PDF file. Clicking the link can regenerate a new PDF and create another activity log.

**Why it matters:**  
A report should ideally represent the exact generated document at that time.

**Possible risk:**  
Activity spam and inconsistent historical report contents.

**Priority:** Medium

### 39. Reports Do Not Clearly Separate Gross, Net, Paid, Due, Refunds

**What the problem is:**  
Reports include many useful totals, but business reporting needs strict separation between gross sales, discounts, taxes, cancelled sales, paid collections, dues, refunds, and net sales.

**Why it matters:**  
Owners make decisions using these numbers.

**Possible risk:**  
Wrong interpretation of business performance.

**Priority:** Medium

## Activity Tab / Activity Feed

### 40. Activity Details Are Too Light For Audit

**What the problem is:**  
Many activity records say that something was updated, but do not store before/after values.

**Why it matters:**  
Audit logs should explain what changed, not only that something changed.

**Possible risk:**  
Hard to investigate wrong balances, stock changes, price edits, or payment edits.

**Priority:** Medium

### 41. Deleted Payments Lose Full Row History

**What the problem is:**  
When a manual payment is deleted, activity logs the deletion but the payment row is gone.

**Why it matters:**  
Financial records should usually be voided/reversed, not erased.

**Possible risk:**  
Audit history becomes incomplete.

**Priority:** High

### 42. Report Activity Can Duplicate

**What the problem is:**  
Generating and later downloading the same report URL can create multiple PDF report activity entries.

**Why it matters:**  
Activity should distinguish original generation from later downloads.

**Possible risk:**  
Activity stream becomes noisy.

**Priority:** Low

## Dashboard Analytics

### 43. Revenue Cards Can Mix Billed Sales With Real Cash

**What the problem is:**  
Dashboard revenue uses invoice totals, while payment method mix uses payments.

**Why it matters:**  
Owners need to know the difference between billed sales and money actually collected.

**Possible risk:**  
User may think all billed revenue has been received.

**Priority:** Medium

### 44. Latest Active Day Fallback Can Be Misread As Today

**What the problem is:**  
If today has no sales, dashboard falls back to latest active sales day.

**Why it matters:**  
The helper label explains it, but users may still read the main number as today's sales.

**Possible risk:**  
Small confusion in daily review.

**Priority:** Low

### 45. Inventory Value Ignores Archived Stock

**What the problem is:**  
Dashboard inventory value uses active products.

**Why it matters:**  
If archived products still have stock, real stock value may be hidden.

**Possible risk:**  
Inventory value understated.

**Priority:** Medium

## Settings

### 46. Signup Can Create Unlimited Workspaces

**What the problem is:**  
The signup route creates a new shop and admin account without invitation, rate limiting, or approval.

**Why it matters:**  
This is okay for a demo, but risky for a deployed production app.

**Possible risk:**  
Spam shops, unwanted admins, database growth, and abuse.

**Priority:** High

### 47. Currency Is Free Text

**What the problem is:**  
Currency is stored as text and can be edited to any value.

**Why it matters:**  
Reports and money labels expect a valid currency such as PKR.

**Possible risk:**  
Incorrect report labels or inconsistent shop settings.

**Priority:** Low

### 48. No Backup/Restore Or Data Export Setting

**What the problem is:**  
Settings does not provide owner-level backup, restore, or full export controls.

**Why it matters:**  
Real businesses need data portability and recovery.

**Possible risk:**  
Harder disaster recovery.

**Priority:** Low

## ShopIQ Copilot / AI Assistant

### 49. AI Can Prepare Powerful Stock Adjustments

**What the problem is:**  
AI write actions require approval, but stock adjustments can still be prepared by AI and approved by an authorized user.

**Why it matters:**  
Stock adjustments directly change inventory.

**Possible risk:**  
Wrong prompt or careless approval can create bad stock.

**Priority:** Medium

### 50. AI Chat Stores Business Context

**What the problem is:**  
Assistant messages can contain customer names, dues, product data, and business context.

**Why it matters:**  
Chat history is operational data and may include sensitive business/customer information.

**Possible risk:**  
Sensitive data stored longer than intended.

**Priority:** Medium

### 51. No User-Level AI Rate Limits

**What the problem is:**  
The Gemini system has queueing, key cooldowns, caching, and backend protections, but there is no clear per-user daily quota or abuse limit.

**Why it matters:**  
One user can still generate many AI requests.

**Possible risk:**  
Quota exhaustion or unnecessary API cost.

**Priority:** Medium

### 52. AI Validation Must Stay In Sync With API Validation

**What the problem is:**  
AI tools have their own schemas and preparation logic. If API validation changes later but AI validation does not, they can drift.

**Why it matters:**  
AI should never create records that normal UI/API rules would reject.

**Possible risk:**  
Different behavior between AI and manual workflows.

**Priority:** Medium

## Security And Permissions

### 53. Suspended Users May Keep Existing Session

**What the problem is:**  
Login checks that user status is ACTIVE, but `getCurrentUser` returns the user by session id without clearly blocking users who were suspended after login.

**Why it matters:**  
Suspending a user should remove access immediately.

**Possible risk:**  
Suspended staff may continue using the app until session expiry.

**Priority:** High

### 54. No Login Rate Limiting Or Account Lockout

**What the problem is:**  
Login does not appear to rate-limit attempts or lock accounts after repeated failures.

**Why it matters:**  
Public login forms need brute-force protection.

**Possible risk:**  
Password guessing attacks.

**Priority:** High

### 55. No CSRF Token On Cookie-Based Mutations

**What the problem is:**  
The app uses cookie sessions and many POST/PATCH/DELETE routes. SameSite helps, but there is no explicit CSRF token or origin check shown.

**Why it matters:**  
Sensitive mutation routes should be protected against cross-site request attacks.

**Possible risk:**  
Unwanted actions if browser/session protections are bypassed.

**Priority:** Medium

### 56. No MFA Or Password Change Workflow

**What the problem is:**  
There is staff creation and password reset through staff edit, but no user self-service password change or MFA.

**Why it matters:**  
Owner/admin accounts protect all shop data.

**Possible risk:**  
Weak account security.

**Priority:** Medium

### 57. Permissions JSON Exists But Is Not Used

**What the problem is:**  
User records include a permissions JSON field, but enforcement appears to use role rules only.

**Why it matters:**  
Future developers may assume custom permissions work when they do not.

**Possible risk:**  
Permission confusion.

**Priority:** Low

### 58. Default Demo Passwords Are Dangerous In Production

**What the problem is:**  
Seeded/demo accounts often use simple passwords such as `demo12345`.

**Why it matters:**  
This is acceptable for local demo data but not production.

**Possible risk:**  
Unauthorized access if demo accounts reach production.

**Priority:** High

## Database Consistency

### 59. Ledger Balances Are Denormalized Without Reconciliation

**What the problem is:**  
Customer and supplier balances are stored fields updated by workflows.

**Why it matters:**  
Stored balances can drift from invoices, purchases, and payments if bugs or manual edits occur.

**Possible risk:**  
Wrong receivables/payables.

**Priority:** High

### 60. Missing Database Check Constraints

**What the problem is:**  
Most non-negative rules are enforced by Zod/app code, not visible as database CHECK constraints.

**Why it matters:**  
Database-level constraints protect against future API bugs, scripts, or direct SQL changes.

**Possible risk:**  
Negative totals, invalid quantities, impossible discounts, or bad paid/due amounts.

**Priority:** High

### 61. No Strong Optimistic Locking

**What the problem is:**  
Records have updatedAt, but update routes do not require the client to send an expected updatedAt/version.

**Why it matters:**  
Two users can edit the same record, and the later save can overwrite the earlier save.

**Possible risk:**  
Lost updates.

**Priority:** Medium

### 62. Money Uses JavaScript Number During Calculations

**What the problem is:**  
Prisma Decimal values are often converted to Number for totals and reports.

**Why it matters:**  
For normal PKR values this is usually okay, but Decimal-safe calculations are better for financial systems.

**Possible risk:**  
Rounding issues in edge cases.

**Priority:** Low

### 63. Deletes Use Cascade In Some Relations

**What the problem is:**  
Shop deletion would cascade all data. Assistant threads cascade with users/shops. Product stock movements cascade with product.

**Why it matters:**  
Cascade behavior is useful but dangerous if a future delete endpoint is added.

**Possible risk:**  
Large accidental data loss.

**Priority:** Medium

## Final Priority Checklist

### High Priority

1. Add conditional stock decrement or row locking for invoice creation.
2. Remove direct editable customer/supplier balance fields from normal forms or move them to controlled opening-balance/adjustment workflows.
3. Enforce customer credit limit during billing.
4. Require supplier when purchase has due amount at API level.
5. Add supplier payment overpayment checks.
6. Make purchase paid amount create supplier payment records.
7. Add refund/void workflow for paid invoice cancellation.
8. Exclude cancelled invoices from dashboard and billing financial metrics.
9. Build reports from complete date-range aggregation, not limited snapshot rows.
10. Block suspended users immediately in `getCurrentUser`.
11. Add login/signup rate limiting.
12. Add DB CHECK constraints for non-negative money, quantities, paid/due relationships, and status/payment logic.
13. Add balance reconciliation jobs or views for customer/supplier ledgers.
14. Remove demo passwords from production.

### Medium Priority

1. Add cart-style multi-item billing UI.
2. Add purchase order receiving stages: ordered, partial received, received, closed.
3. Add cycle counts and stock adjustment reason codes.
4. Add product expiry/batch enforcement for perishable goods.
5. Add weighted-average or FIFO costing.
6. Add payment allocation to oldest/unpaid invoices.
7. Add split payment support.
8. Add void/reversal instead of hard delete for payments.
9. Add before/after metadata to activity logs.
10. Store generated PDFs or report snapshots instead of regenerating from activity links.
11. Add CSRF origin/token checks for mutation routes.
12. Add per-user AI usage limits.
13. Add optimistic locking on sensitive updates.

### Low Priority

1. Add inactive/archive state for customers and suppliers.
2. Make currency a controlled list.
3. Add backup/export settings.
4. Add duplicate warnings for customer phone, loyalty card, supplier tax number, barcode, and payment reference.
5. Add margin warning when sale price is below cost.
6. Clarify dashboard labels when latest active day is shown instead of today.

## Short Fix Direction

The safest next improvements should start with accounting and stock correctness:

1. Fix stock concurrency first.
2. Make customer/supplier balances ledger-derived or reconciliation-backed.
3. Add supplier payment automation like invoice payment automation.
4. Add refund/void logic before relying on cancellation for paid records.
5. Filter cancelled records out of financial dashboards and reports.
6. Harden sessions, login, signup, and production seed credentials.

After those are done, improve retail depth:

1. Multi-item billing cart.
2. Purchase order receiving stages.
3. Cycle count and stock adjustment reasons.
4. Expiry/batch handling.
5. Better costing method.

ShopIQ already has a strong base. The remaining risks are the kinds of issues that appear when a demo retail system grows into a real operational POS and inventory system.
