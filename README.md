# Easy Rent Bill

Easy Rent Bill is a lightweight dormitory billing web app designed for small apartment and dormitory owners. The goal is to make room management, meter recording, invoice generation, and payment tracking simple, fast, and mobile-friendly.

## Project Goal

This project is being built as a minimal web app with:

- `index.html` as the main frontend
- `code.gs` as the Google Apps Script backend
- Google Sheets as the database in the same spreadsheet where the script is installed
- A fast workflow for reading, updating, and saving dorm billing data

The app is planned to support:

- Dashboard summary
- Room and tenant management
- Water and electricity meter recording
- Monthly invoice generation
- Payment tracking
- Settings and connection to Google Sheets

## Target Stack

- HTML
- CSS
- JavaScript
- Google Apps Script
- Google Sheets

## Important Project Rules

- Keep the main project files as small and as few as possible
- Prefer a practical mobile-first UI
- Use the UI references in the `UI/` folder as the main visual direction
- Do not create a new spreadsheet from `code.gs`
- The script must work with the spreadsheet where it is pasted and executed
- A placeholder for the latest deployed Apps Script URL will be added in the frontend as `** วาง APP URL ตรงนี้ **`

## Image Handling Direction

For payment or related image uploads, the planned approach is:

- Resize the image before saving
- Limit image height to `512px`
- Keep the width proportional
- Convert the image to Base64
- Save the Base64 data into Google Sheets

This is intended to keep the app simple and self-contained for the first working version.

## Current Repository Contents

- `PROMPT ERB.md` - main requirement document
- `UI/` - UI references, screen mocks, and visual direction
- `backup.py` - local backup script used before edit rounds
- `note.md` - ongoing work log

## Development Status

This repository is currently in the planning and setup phase.

The next implementation target is to build the first working version with a very small file set, centered around:

- `index.html`
- `code.gs`

## Repository Link

[Bunnamchaib/Easy-Rent-Bill](https://github.com/Bunnamchaib/Easy-Rent-Bill)
