# Codex Prompt: Dormitory Management & Automatic Billing Web App

## Role

You are a senior full-stack developer. Build a simple, practical, production-ready web application for dormitory management and automatic billing.

The project must be easy to use for a non-technical dormitory owner. Prioritize speed, simple UI, easy backup, and the ability to use from phone, tablet, or desktop.

---

## Project Name

**Dorm Bill Manager**

---

## Goal

Create a web application for managing dormitory rooms, recording water/electricity meters, generating monthly invoices automatically, and recording payments.

The system replaces paper records and manual calculation.

---

## Required Tech Stack

### Frontend

- Static web app
- HTML
- CSS
- JavaScript
- No heavy framework unless necessary
- Must be deployable to GitHub Pages
- Responsive design for mobile and desktop

### Backend / API

- Google Apps Script Web App
- Use `doPost(e)` as the main API endpoint
- Return JSON responses using Apps Script Content Service

### Database

- Google Sheets
- One spreadsheet with multiple tabs

### File Storage

- Google Drive for payment slip images
- Save only the slip URL in Google Sheets

---

## Important Architecture

Use this architecture:

```text
GitHub Pages Frontend
        ↓ fetch()
Google Apps Script Web App API
        ↓
Google Sheets Database
        ↓
Google Drive for slip image storage
```

Do not expose private Google API keys in frontend code.

The frontend should only call the deployed Google Apps Script Web App URL.

---

## App Pages / Main Screens

Create a clean web UI with these main pages:

```text
1. Dashboard
2. Room Management
3. Meter Recorder
4. Invoices / Billing
5. Settings
```

Payment can be a modal or separate screen opened from invoice detail.

---

# 1. Dashboard Page

## Purpose

Show overall dormitory status and monthly billing summary.

## UI Requirements

Show summary cards:

- Total Rooms
- Occupied Rooms
- Vacant Rooms
- Maintenance Rooms
- Bills This Month
- Paid Bills
- Unpaid Bills
- Total Revenue
- Received Amount
- Outstanding Amount

Show quick action buttons:

- Record Meter
- Generate Monthly Bills
- View Unpaid Bills
- Add New Room

Show a table or card list of unpaid invoices:

- Room No
- Tenant Name
- Amount Due
- Status
- Receive Payment button

Show recent activity logs:

- Meter recorded
- Invoice generated
- Payment received
- Room updated

---

# 2. Room Management Page

## Purpose

Manage rooms, tenants, rent, and custom room charges.

## UI Requirements

Include:

- Search by room number or tenant name
- Filter by floor
- Filter by room status
- Add Room button
- Room table on desktop
- Room cards on mobile
- Pagination for 1 to 1,000+ rooms

## Room Table Columns

- Room No
- Floor
- Tenant
- Phone
- Base Rent
- Common Fee
- Parking Fee
- Internet Fee
- Other Fee
- Status
- Actions

## Room Status

Use these statuses:

```text
occupied
vacant
maintenance
disabled
```

Show status badges:

- occupied = green
- vacant = gray
- maintenance = orange
- disabled = dark gray

## Add/Edit Room Form

Fields:

- Room Number
- Floor
- Tenant Name
- Phone Number
- Base Rent
- Common Fee
- Parking Fee
- Internet Fee
- Other Custom Fee
- Note
- Status

## Behavior

When saving a room:

- Create or update row in `Rooms`
- If tenant name exists, create or update row in `Tenants`
- Show success toast
- Refresh room table

---

# 3. Utility Meter Recorder Page

## Purpose

Record monthly water and electricity meter readings quickly.

This screen must be extremely simple and fast to use on mobile.

## UI Requirements

Include:

- Billing month selector
- Recording mode selector:
  - Water Only
  - Electricity Only
  - Water + Electricity
- Room search/select
- Previous meter display
- Current meter input
- Auto calculation preview
- Save button
- Save and Next Room button
- Progress section

## Fields

For water:

- Previous Water Meter
- Current Water Meter
- Water Units Used
- Water Rate
- Water Cost

For electricity:

- Previous Electricity Meter
- Current Electricity Meter
- Electricity Units Used
- Electricity Rate
- Electricity Cost

## Calculation Rules

```text
water_unit = current_water_meter - previous_water_meter
water_amount = water_unit * water_rate

electric_unit = current_electric_meter - previous_electric_meter
electric_amount = electric_unit * electric_rate
```

## Validation

- Current meter cannot be lower than previous meter
- Current meter must be a number
- Room is required
- Billing month is required

## Save Behavior

On save:

- Save to `Meter_Readings`
- If a record already exists for same room and billing month, update it instead of duplicating
- Show success toast
- Update progress count

---

# 4. Invoice & Billing Page

## Purpose

View invoices, generate monthly bills, check unpaid bills, and receive payments.

## UI Requirements

Include filters:

- Billing month
- Date
- Room search
- Status:
  - All
  - Unpaid
  - Paid
  - Cancelled

Include buttons:

- Auto Generate Bills
- Export CSV
- Print Selected
- Refresh

## Invoice Table Columns

- Invoice No
- Billing Month
- Room No
- Tenant
- Rent
- Water
- Electricity
- Custom Fees
- Total
- Status
- Actions

## Invoice Status

Use these statuses:

```text
unpaid
paid
cancelled
partial
```

For MVP, use only:

```text
unpaid
paid
cancelled
```

## Auto Generate Bill Behavior

When user clicks **Auto Generate Bills**:

For every occupied room:

1. Get room data from `Rooms`
2. Get active tenant from `Tenants`
3. Get meter data from `Meter_Readings`
4. Get default rates from `Settings`
5. Get custom charges from `Custom_Charges`
6. Calculate total bill
7. Create or update invoice in `Invoices`

Formula:

```text
total_amount =
base_rent
+ common_fee
+ parking_fee
+ internet_fee
+ other_fee
+ water_amount
+ electric_amount
+ custom_amount
```

## Invoice Detail Modal

Show:

- Dormitory Name
- Invoice Number
- Billing Month
- Room Number
- Tenant Name
- Rent Amount
- Water Usage and Cost
- Electricity Usage and Cost
- Common Fee
- Parking Fee
- Internet Fee
- Other Fees
- Total Amount
- Payment Status

Actions:

- Receive Payment
- Print Bill
- Download Bill
- Close

---

# 5. Payment Modal / Payment Screen

## Purpose

Record payment and close invoice.

## UI Requirements

When clicking **Receive Payment**, open modal with:

- Room Number
- Tenant Name
- Invoice Number
- Total Amount Due
- Payment Method selector:
  - Cash
  - QR Code Transfer

---

## Cash Payment UI

Fields:

- Paid Amount
- Received Date
- Receiver Name
- Note

Button:

- Confirm Cash Payment

On confirm:

- Create row in `Payments`
- Update invoice status to `paid`
- Update invoice paid amount
- Update paid date
- Show success message

---

## QR Code Transfer UI

Show:

- QR Code image placeholder or actual QR Code URL from settings
- Bank Name
- Account Name
- Account Number
- PromptPay ID
- Paid Amount input
- Upload Slip button
- Take Photo button
- Slip preview area
- Note

Button:

- Confirm Transfer Payment

On confirm:

- Upload slip image to Google Drive through Apps Script
- Save slip URL in `Payments`
- Update invoice status to `paid`
- Show success message

If file upload is too complex for first version, create a clean placeholder function and document how to enable it.

---

# 6. Settings Page

## Purpose

Configure dormitory information, utility rates, bank transfer data, and API settings.

## UI Requirements

Sections:

### Dormitory Info

- Dormitory Name
- Address
- Phone Number
- Logo URL

### Utility Rates

- Water Rate per Unit
- Electricity Rate per Unit
- Default Base Rent
- Default Common Fee
- Default Parking Fee
- Default Internet Fee

### Bank Transfer

- Bank Name
- Account Name
- Account Number
- PromptPay ID
- QR Code Image URL

### Google Apps Script Connection

- Apps Script Web App URL
- Test Connection button

### Backup

- Export Backup
- Download CSV
- Download JSON

---

# Google Sheets Database Schema

Create documentation and Apps Script initialization for these sheets:

```text
Settings
Rooms
Tenants
Meter_Readings
Invoices
Payments
Custom_Charges
Logs
```

---

## Sheet: Settings

Columns:

```text
key
value
note
updated_at
```

Example rows:

```text
dorm_name | Dorm Bill Manager | Dormitory name
water_rate | 18 | Baht per unit
electric_rate | 8 | Baht per unit
bank_name | Kasikorn Bank | Bank
bank_account_name | Dorm Owner | Account name
bank_account_no | 123-456-7890 | Bank account
promptpay_id | 0812345678 | PromptPay ID
qr_code_url | https://example.com/qr.png | QR image
invoice_prefix | INV | Invoice prefix
```

---

## Sheet: Rooms

Columns:

```text
room_id
room_no
floor
status
base_rent
common_fee
parking_fee
internet_fee
other_fee
note
created_at
updated_at
```

---

## Sheet: Tenants

Columns:

```text
tenant_id
room_id
name
phone
start_date
end_date
status
created_at
updated_at
```

---

## Sheet: Meter_Readings

Columns:

```text
meter_id
billing_month
room_id
room_no
water_prev
water_current
water_unit
water_rate
water_amount
electric_prev
electric_current
electric_unit
electric_rate
electric_amount
recorded_at
updated_at
note
```

---

## Sheet: Invoices

Columns:

```text
invoice_id
invoice_no
billing_month
room_id
room_no
tenant_id
tenant_name
rent_amount
common_fee
parking_fee
internet_fee
other_fee
water_amount
electric_amount
custom_amount
total_amount
paid_amount
status
created_at
paid_at
updated_at
note
```

---

## Sheet: Payments

Columns:

```text
payment_id
invoice_id
invoice_no
room_id
room_no
tenant_name
paid_amount
method
slip_url
paid_at
received_by
note
created_at
```

---

## Sheet: Custom_Charges

Columns:

```text
charge_id
room_id
room_no
billing_month
name
amount
type
active
created_at
updated_at
```

Type values:

```text
one_time
recurring
```

---

## Sheet: Logs

Columns:

```text
log_id
action
ref_type
ref_id
detail
created_at
user
```

---

# Required API Actions

Implement one Apps Script endpoint with action routing.

Frontend calls:

```javascript
fetch(SCRIPT_URL, {
  method: "POST",
  body: JSON.stringify({
    action: "GET_ROOMS",
    payload: {}
  })
})
```

Apps Script receives JSON and routes by `action`.

---

## API Actions List

### System

```text
PING
INIT_DATABASE
GET_SETTINGS
SAVE_SETTINGS
GET_DASHBOARD_SUMMARY
GET_LOGS
```

### Rooms

```text
GET_ROOMS
GET_ROOM_DETAIL
CREATE_ROOM
UPDATE_ROOM
DELETE_ROOM
```

### Meter

```text
GET_PREVIOUS_METER
SAVE_METER_READING
GET_METER_PROGRESS
GET_METER_READINGS
```

### Invoices

```text
GENERATE_INVOICES
GET_INVOICES
GET_INVOICE_DETAIL
UPDATE_INVOICE_STATUS
CANCEL_INVOICE
```

### Payments

```text
SAVE_PAYMENT
UPLOAD_SLIP
GET_PAYMENTS
```

### Backup

```text
EXPORT_BACKUP_JSON
EXPORT_CSV
```

---

# Frontend Project Structure

Create this file structure:

```text
dorm-bill-manager/
  index.html
  README.md
  PROMPT.md
  /assets
    /css
      styles.css
    /js
      app.js
      api.js
      state.js
      router.js
      dashboard.js
      rooms.js
      meters.js
      invoices.js
      payments.js
      settings.js
      utils.js
    /img
      placeholder-qr.png
  /apps-script
    Code.gs
    README_APPS_SCRIPT.md
  /docs
    DATABASE_SCHEMA.md
    DEPLOYMENT.md
    WORKFLOW.md
```

---

# Frontend Behavior

## Routing

Use simple hash routing:

```text
#/dashboard
#/rooms
#/meters
#/invoices
#/settings
```

Default page:

```text
#/dashboard
```

## State

Keep global app state:

```javascript
const AppState = {
  settings: {},
  rooms: [],
  invoices: [],
  selectedMonth: "YYYY-MM"
}
```

## API Config

Use localStorage for Apps Script Web App URL:

```text
DBM_SCRIPT_URL
```

In Settings page, user can paste the deployed Apps Script URL and click "Test Connection".

---

# UI / UX Requirements

- Clean admin dashboard
- Mobile-first
- Desktop responsive
- Large buttons
- Clear input labels
- Thai-friendly spacing
- Simple icons if possible
- Status badges with colors
- Toast messages for success/error
- Loading spinner when fetching data
- Empty states when no data
- Confirmation modal before destructive actions
- Tables on desktop
- Cards on mobile
- Avoid complex UI
- Avoid unnecessary animations

---

# Language

Use Thai UI labels by default.

Example labels:

```text
แดชบอร์ด
ห้องพัก
บันทึกมิเตอร์
บิล
ตั้งค่า
รับเงิน
สร้างบิลเดือนนี้
บันทึกและไปห้องถัดไป
ยังไม่จ่าย
จ่ายแล้ว
ยกเลิก
```

Code comments may be English.

---

# Sample Data

Include sample data for local UI demo if Apps Script URL is not configured.

Sample rooms:

```text
101 | ชั้น 1 | สมชาย | 3500 | occupied
102 | ชั้น 1 | - | 3500 | vacant
201 | ชั้น 2 | มาลี | 4000 | occupied
202 | ชั้น 2 | วิชัย | 4000 | occupied
```

Sample rates:

```text
water_rate = 18
electric_rate = 8
```

---

# Apps Script Requirements

Create `apps-script/Code.gs`.

It must include:

- `doPost(e)`
- `jsonResponse(data)`
- `getSheet(name)`
- `initDatabase()`
- `getSettings()`
- `saveSettings(payload)`
- `getRooms(payload)`
- `createRoom(payload)`
- `updateRoom(payload)`
- `getPreviousMeter(payload)`
- `saveMeterReading(payload)`
- `generateInvoices(payload)`
- `getInvoices(payload)`
- `getInvoiceDetail(payload)`
- `savePayment(payload)`
- `getDashboardSummary(payload)`
- `appendLog(action, refType, refId, detail, user)`

## Important Apps Script Rules

- Use LockService when writing to Sheets
- Use SpreadsheetApp
- Use ContentService to return JSON
- Handle errors and return JSON with success false
- Use IDs like:
  - R + timestamp for room_id
  - T + timestamp for tenant_id
  - M + timestamp for meter_id
  - I + timestamp for invoice_id
  - P + timestamp for payment_id
- Prevent duplicate invoices for the same room and billing month
- Prevent duplicate meter rows for the same room and billing month by updating the existing row

---

# JSON Response Format

All API responses must use:

```json
{
  "success": true,
  "data": {},
  "message": "OK"
}
```

For errors:

```json
{
  "success": false,
  "error": "Error message",
  "message": "Something went wrong"
}
```

---

# Security Notes

For MVP:

- Use a simple admin password stored in Settings or localStorage
- Do not expose Google service account keys
- Do not expose private API secrets
- Google Apps Script URL can be public but only accepts known actions
- Validate all input in Apps Script
- Add simple request token support if possible

Optional request token:

Frontend sends:

```json
{
  "action": "GET_ROOMS",
  "token": "admin-token",
  "payload": {}
}
```

Apps Script checks token from Settings.

---

# Backup Requirements

Create frontend functions to:

- Export current app data as JSON
- Export invoice table as CSV
- Document how to download full Google Sheets backup as `.xlsx`

---

# Deployment Documentation

Create `docs/DEPLOYMENT.md` with steps:

## Google Sheets

1. Create new Google Sheet
2. Copy spreadsheet ID
3. Open Apps Script
4. Paste `Code.gs`
5. Set `SPREADSHEET_ID`
6. Run `initDatabase`
7. Deploy as Web App
8. Set access to appropriate user / anyone with link depending on setup
9. Copy Web App URL

## GitHub Pages

1. Push frontend files to GitHub
2. Enable GitHub Pages
3. Open website URL
4. Go to Settings page
5. Paste Apps Script Web App URL
6. Click Test Connection

---

# Acceptance Criteria

The project is complete when:

- App opens from `index.html`
- App works without build step
- UI is responsive on mobile and desktop
- User can configure Apps Script URL
- User can add/edit rooms
- User can record water/electricity meter
- System calculates water/electricity cost
- User can generate monthly invoices
- User can view invoice detail
- User can record cash payment
- User can record QR transfer payment with slip URL placeholder
- Dashboard summary updates from Sheet data
- Apps Script can initialize all required sheets
- All API responses are JSON
- README explains setup clearly

---

# Development Order

Build in this order:

```text
1. Static UI layout and routing
2. Mock data mode
3. API wrapper
4. Apps Script database initialization
5. Rooms CRUD
6. Meter recording
7. Invoice generation
8. Payment recording
9. Dashboard summary
10. Backup/export
11. Deployment docs
```

---

# Important Instruction

Do not over-engineer.

This app is for a real dormitory owner who wants:

- Easy operation
- Less paper
- Less manual calculation
- Data backup
- Access from anywhere
- Simple dashboard
- Fast meter recording
- Simple payment confirmation

Prioritize practical usage over complex architecture.
