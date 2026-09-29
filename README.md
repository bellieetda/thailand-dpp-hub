# Thailand DPP Project Hub

เว็บสรุปโครงการพัฒนาแนวทางการค้าดิจิทัลข้ามพรมแดนและพาสปอร์ตดิจิทัลสำหรับผลิตภัณฑ์ (Digital Product Passport: DPP) · TOR70-DPP

## หน้าในเว็บ
1. ภาพรวม DPP
2. แนวคิดและเทคนิค (UNTP, IDR, Thailand DPP Core)
3. DPP Data Layer + ตัวอย่าง (DPP, DFR, DCC, DTE และ JSON ทีละขั้นของทุเรียนและแบตเตอรี่ + ตัวอย่างการใช้งาน Battery Passport ตาม EU Battery Regulation + แท็บ Battery Pass-Ready: 11 ขั้นตาม User Stories และ Data Attribute Longlist v2.0)
4. กรณีทุเรียน → จีน และแบตเตอรี่ → EU
5. ขอบเขตงานตาม TOR
6. Output และกิจกรรม (4.2–4.7: output ที่ต้องส่ง กิจกรรม วิธีทำ หลักฐาน สถานะ)
7. แผนงาน 8 เดือน (พ.ย. 2569 – มิ.ย. 2570)
8. ทีมงานและผู้เกี่ยวข้อง

## โครงสร้างไฟล์
```
index.html      หน้าเว็บ (ทุกหน้าอยู่ในไฟล์เดียว สลับด้วย #hash)
css/style.css   สไตล์
js/app.js       สลับหน้า, โหลดข้อมูลจาก Supabase, สร้าง Gantt, WBS, การ์ดขอบเขตงาน, หน้า Output และกิจกรรม และตาราง
js/datalayer.js ข้อมูลตัวอย่างและแผนภาพของหน้า DPP Data Layer (แก้ตัวอย่างที่ไฟล์นี้)
js/config.js    Project URL + publishable key ของ Supabase (เว้นว่าง = ใช้ข้อมูลในเว็บ)
supabase/setup.sql  สร้าง 16 ตาราง + ข้อมูลตั้งต้น + RLS (รันใน Supabase SQL Editor)
img/*.webp      ภาพสถาปัตยกรรมและ infographic
.nojekyll       ให้ GitHub Pages เสิร์ฟไฟล์ตามจริง
```

## เปิดดูในเครื่อง
ดับเบิลคลิก `index.html` ได้เลย หรือรันเซิร์ฟเวอร์ง่าย ๆ
```bash
python3 -m http.server 8000
# แล้วเปิด http://localhost:8000
```

## ขึ้น GitHub Pages
1. สร้าง repository ใหม่ แล้วอัปโหลดไฟล์ทั้งหมดในโฟลเดอร์นี้ไว้ที่ root
2. ไปที่ Settings → Pages → Build and deployment
3. Source: **Deploy from a branch** · Branch: **main** · Folder: **/ (root)** แล้วกด Save
4. รอประมาณ 1–2 นาที เว็บจะอยู่ที่ `https://<username>.github.io/<repo>/`

## ข้อมูลจาก Supabase
1. Supabase → SQL Editor → New query → วาง `supabase/setup.sql` ทั้งไฟล์ → Run (ผลต้องขึ้น `ok` ครบ 16 แถว)
2. ใส่ Project URL และ publishable key ใน `js/config.js` (ห้ามใส่ secret / service_role key)
3. push ขึ้น GitHub ป้ายมุมล่างของเมนูซ้ายจะบอกว่าใช้ข้อมูลจากไหน: เขียว = Supabase, เหลือง = บางตาราง, แดง/เทา = ข้อมูลในเว็บ

หน้าเว็บแสดงข้อมูลในเว็บก่อน แล้วแทนที่ด้วยข้อมูลจาก Supabase เมื่อโหลดเสร็จ ถ้าต่อไม่ได้ (เช่น โปรเจกต์ฟรีถูกพักเพราะไม่มีการใช้งาน) หรือตารางไหนว่าง ส่วนนั้นจะใช้ข้อมูลในเว็บแทน

## แก้ข้อมูล
- Gantt, WBS, การ์ดขอบเขตงาน และตารางทุกตาราง: แก้ใน Supabase → Table Editor (ไม่ต้อง push ใหม่ รีเฟรชหน้าเว็บก็เห็น)
- สถานะกิจกรรมในหน้า Output และกิจกรรม: เลือกจากช่อง "สถานะ" บนหน้าเว็บได้เลย ระบบถามชื่อผู้แก้ + รหัสทีม แล้วบันทึกวันเวลาและชื่อใน `scope_tasks` (`status_changed_at`, `status_changed_by`) และเก็บประวัติทุกครั้งใน `scope_task_log` (รัน `setup.sql` ซ้ำไม่ล้างสถานะ แต่ข้อความอื่นที่แก้ใน Table Editor จะถูกเขียนทับด้วยค่าในไฟล์)
- ตั้งหรือเปลี่ยนรหัสทีม: รันใน SQL Editor (แทน `รหัสทีม` ด้วยรหัสจริง ห้าม commit รหัสจริงลงไฟล์ในนี้)
  ```sql
  insert into public.app_secrets (name, value) values ('task_passcode', extensions.crypt('รหัสทีม', extensions.gen_salt('bf')))
  on conflict (name) do update set value = excluded.value;
  ```
- ข้อมูลสำรองในเว็บ: `FALLBACK` ใน `js/app.js` และแถวในตารางของ `index.html` (ใช้เฉพาะตอนต่อ Supabase ไม่ได้)
- ข้อความอื่นในแต่ละหน้า: แก้ใน `index.html` (แต่ละหน้าคือ `<section id="...">`)
- สีหลัก: แก้ตัวแปรใน `:root` ของ `css/style.css`

ฟอนต์โหลดจาก Google Fonts (Mitr ทั้งหน้า ตั้งค่าที่ตัวแปร `--font` ใน `css/style.css`) ถ้าไม่มีอินเทอร์เน็ตจะใช้ฟอนต์ระบบแทน

> ข้อเสนอเชิงแนวคิด แผนงานและทีมเป็นข้อเสนอสำหรับ Inception Report ชื่อหน่วยงานและระบบในภาพเป็นตัวอย่างการจัดบทบาท
