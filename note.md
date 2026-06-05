# Easy Rent Bill Notes

## 2026-06-04 15:37:47
- ทำอะไรไป: ตั้ง `Easy Rent Bill` เป็น main project, อ่าน `C:\Users\dekso\OneDrive\เดสก์ท็อป\cost v3\DevRoule.md`, อ่าน `PROMPT ERB.md`, ตรวจโฟลเดอร์ `UI`, คัดลอก `backup.py` มาไว้ในโปรเจกต์ และรันแบ็กอัปรอบแรกแล้ว
- ปัญหา/จุดต้องระวัง: requirement ล่าสุดของผู้ใช้กำหนดให้ไฟล์หลักน้อยที่สุด ไม่เกิน 5 ไฟล์, ใช้ `index.html` + `code.gs` เป็นแกนหลัก, และให้เก็บรูปหลังย่อเป็น base64 ใน Google Sheet ซึ่งต่างจาก prompt เดิมที่พูดถึง Google Drive
- แก้/แนวทาง: จะยึดคำสั่งล่าสุดของผู้ใช้เป็นหลัก, ออกแบบ `code.gs` ให้ทำงานกับชีตที่นำไปรันเองไม่สร้างไฟล์ชีตใหม่, และทำ frontend ให้มีจุด `** วาง APP URL ตรงนี้ **` สำหรับเปลี่ยน Web App URL ภายหลัง
- ทำต่อ: สรุปความเข้าใจโครงการและขอบเขตงานก่อน ยังไม่เริ่มเขียนโค้ดในรอบนี้

## 2026-06-04 15:41:00
- ทำอะไรไป: ตั้ง Git ในโปรเจกต์, เพิ่ม `.gitignore` ให้กันเฉพาะโฟลเดอร์ `backup/`, commit ชุดแรก และ push ไปที่ `https://github.com/Bunnamchaib/Easy-Rent-Bill`
- ปัญหา/จุดต้องระวัง: โฟลเดอร์นี้เดิมยังไม่เป็น git repo ในเครื่อง จึงต้อง init ก่อน และต้องกันไฟล์แบ็กอัปไม่ให้ขึ้น Git
- แก้/แนวทาง: ใช้ `git init --initial-branch=main`, ตั้ง remote `origin`, ตรวจว่า `backup/` ไม่ถูก stage แล้วค่อย push
- ทำต่อ: รอบถัดไปเริ่มพัฒนาไฟล์หลักของระบบตาม prompt และข้อกำหนดล่าสุดของผู้ใช้

## 2026-06-04 16:54:55
- ทำอะไรไป: สร้าง README.md สำหรับ GitHub อธิบายภาพรวมโปรเจกต์ เป้าหมาย เทคโนโลยี กติกาหลัก ทิศทางการเก็บรูป และสถานะปัจจุบันของ repo
- ปัญหา/จุดต้องระวัง: โปรเจกต์ยังอยู่ช่วง setup จึงต้องเขียน README ให้สื่อทั้งสิ่งที่มีอยู่จริงใน repo ตอนนี้ และสิ่งที่จะพัฒนาต่อ โดยไม่ทำให้สับสนว่าเสร็จแล้ว
- แก้/แนวทาง: เขียน README แบบตรงไปตรงมา ระบุ current repository contents และ development status ให้ชัด
- ทำต่อ: commit และ push README พร้อมอัปเดต note ขึ้น GitHub

## 2026-06-04 17:20:27
- ทำอะไรไป: สร้าง index.html และ code.gs เวอร์ชันใช้งานจริงของ Easy Rent Bill แล้ว โดย index.html รวม UI/CSS/JS ไฟล์เดียว มีหน้า Dashboard, ห้องพัก, จดมิเตอร์, ใบแจ้งหนี้, ตั้งค่า, modal รับชำระเงิน, login, mock mode และจุด ** วาง APP URL ตรงนี้ **; ส่วน code.gs ทำ action routing, สร้างชีต/ข้อมูลดัมมี่ในไฟล์ชีตที่รันอยู่, CRUD ห้อง, มิเตอร์, บิล, ชำระเงิน, export JSON/CSV
- ปัญหา/จุดต้องระวัง: หน้า meter เดิมมีความเสี่ยง rerender ทุกครั้งที่พิมพ์ และ backend seed ตัวอย่างเดิมเสี่ยงเรียก lock ซ้อนกัน
- แก้/แนวทาง: ปรับ preview meter ให้คำนวณใน DOM ตรง ๆ ไม่กระตุก, กันกรณีบันทึกเฉพาะน้ำหรือไฟไม่ให้ค่าฝั่งที่ไม่ได้แก้กลายเป็น 0, และเขียน code.gs ใหม่ทั้งไฟล์เพื่อตัดปัญหา lock/encoding พร้อมออกแบบไม่ดึง slip base64 ใน list endpoint เพื่อลดความช้า
- ตรวจสอบ: รัน syntax check ผ่านทั้ง index.html และ code.gs แล้ว (INDEX_HTML_SCRIPT_OK, CODE_GS_OK)
- ทำต่อ: รอบถัดไปควรทดสอบใช้งานจริงกับ Google Sheet bound script และเก็บจุด UI/flow ที่ต้องเกลาเพิ่มเติมจากการลองใช้งานจริง

## 2026-06-04 17:39:30
- ทำอะไรไป: วาง code.gs ลงใน Apps Script editor บน Edge, บันทึกสคริปต์, สร้าง deployment แบบ เว็บแอป, ตั้งสิทธิ์เข้าถึงเป็น ทุกคน, ผ่านขั้น authorize ของ Google และ deploy สำเร็จ
- ปัญหา/จุดต้องระวัง: browser plugin รอบนี้คุม Edge ตรง ๆ ไม่ได้ จึงใช้ Windows UI Automation จับ element ของ Edge/Apps Script แทน; ระหว่าง deploy มีหน้าคำเตือน This app hasn't been verified by Google และต้องกด Continue เพื่ออนุญาตสิทธิ์
- แก้/แนวทาง: ใช้ accessibility tree หาเมนู การทำให้ใช้งานได้ -> การทำให้ใช้งานได้รายการใหม่ -> เลือก เว็บแอป -> เปลี่ยนสิทธิ์เป็น ทุกคน -> กด authorize + continue จนได้ URL
- ผลลัพธ์: Web App URL = https://script.google.com/macros/s/AKfycbyPSr2jP2dGQY4aux5SVoXDHIh5zvTogSDlDDaEhFa_P1HX5rZseHNAzBi6YRymOPPV/exec และคัดลอก URL ลง clipboard แล้ว
- ทำต่อ: รอบถัดไปควรใส่ URL นี้ลง frontend / ทดสอบ PING และ INIT_DATABASE จากหน้าเว็บจริง

## 2026-06-04 19:52:00
- Did: fixed Apps Script month handling for legacy `billing_month` values, redeployed backend, updated `index.html` to the newest Web App URL, and tested dashboard + invoices from the local HTML app.
- Problem: earlier deploys still returned empty invoices because old sheet values were stored as ISO datetime strings and one paste/deploy round did not actually update the editor code.
- Fix: added month normalization plus timezone-safe handling in `code.gs`, verified deploy with `PING version=2026-06-04 19:40`, then confirmed `GET_INVOICES` returned 3 rows for `2026-06`.
- Test: local app at `http://127.0.0.1:4173/index.html` loaded successfully, dashboard showed revenue `15,130`, paid `5,690`, unpaid `9,440`, and invoices page showed 3 bills.
- Next: push code to GitHub and later clean up garbled sample Thai text in seeded demo data if needed.

## 2026-06-05 08:42:13
- Did: ran `backup.py` first, then updated `index.html` + `code.gs` for editable bill format settings, multi-credential login support, default payment method selection, invoice detail note/slip rendering, async meter save-next-room flow, and tighter numeric input layout.
- Problem: the live Apps Script URL currently used by the app still answers `PING version=2026-06-04 19:40`, so backend-only changes from the local `code.gs` are not live yet. That means extra credentials and slip image data on real invoice detail still need the correct Easy Rent Bill Apps Script project to be pasted/deployed.
- Fix: finished the local code changes, verified syntax (`INDEX_HTML_SCRIPT_OK`, `CODE_GS_OK`), confirmed direct API calls for `LOGIN`, `GET_SETTINGS`, `GET_INVOICES`, `GET_LOGS`, and `GET_METER_PROGRESS`, and aligned visible wording to `เชื่อมต่อฐานข้อมูลแล้ว`.
- Test: settings page showed the new fields, invoice detail showed the new custom-charge label path, and direct backend calls returned valid data. Browser testing later got stuck on the loading state after repeated navigation, so final live verification of the new meter flow and live slip image display still depends on deploying the updated `code.gs` to the correct bound script.
- Next: commit/push this repo update, then deploy the local `code.gs` to the real Easy Rent Bill Apps Script so the live web app uses the new backend behavior too.
