# Thailand DPP Project Hub

เว็บสรุปโครงการพัฒนาแนวทางการค้าดิจิทัลข้ามพรมแดนและพาสปอร์ตดิจิทัลสำหรับผลิตภัณฑ์ (Digital Product Passport: DPP) · TOR70-DPP

## หน้าในเว็บ
1. ภาพรวม DPP
2. แนวคิดและเทคนิค (UNTP, IDR, Thailand DPP Core)
3. กรณีทุเรียน → จีน และแบตเตอรี่ → EU
4. ขอบเขตงานตาม TOR
5. แผนงาน 8 เดือน (พ.ย. 2569 – มิ.ย. 2570)
6. ทีมงานและผู้เกี่ยวข้อง

## โครงสร้างไฟล์
```
index.html      หน้าเว็บ (ทุกหน้าอยู่ในไฟล์เดียว สลับด้วย #hash)
css/style.css   สไตล์
js/app.js       สลับหน้า, สร้าง Gantt, ตาราง WBS และการ์ดขอบเขตงาน
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

## แก้ข้อมูล
- ข้อความแต่ละหน้า: แก้ใน `index.html` (แต่ละหน้าคือ `<section id="...">`)
- กิจกรรมและช่วงเวลาใน Gantt / WBS: แก้ array `A` และ `MS` ใน `js/app.js`
- สีหลัก: แก้ตัวแปรใน `:root` ของ `css/style.css`

ฟอนต์โหลดจาก Google Fonts (Mitr ทั้งหน้า ตั้งค่าที่ตัวแปร `--font` ใน `css/style.css`) ถ้าไม่มีอินเทอร์เน็ตจะใช้ฟอนต์ระบบแทน

> ข้อเสนอเชิงแนวคิด แผนงานและทีมเป็นข้อเสนอสำหรับ Inception Report ชื่อหน่วยงานและระบบในภาพเป็นตัวอย่างการจัดบทบาท
