-- Thailand DPP Hub · Supabase setup: all data that js/app.js renders + the HTML tables in index.html
-- Paste the whole file into Supabase > SQL Editor > New query > Run.
-- Safe to run again: tables are created only if missing, rows are upserted.
--
--   project_months  M1–M8 header of the Gantt            (MONTHS)
--   workstreams     4.1–4.8, name + colour                (WS)
--   activities      Gantt bars + WBS table rows           (A)
--   milestones      Gantt diamonds + flag markers         (MS + Battery Passport flag)
--   scopes          scope cards 4.2–4.7 on the TOR page   (SC)
--   scope_items     heading/paragraph pairs in each card  (SC[..][3])
--   scope_outputs   outputs per scope, page 06            (OUT)
--   scope_tasks     activities to do + status, page 06    (TASK) · scopes.inputs/outputs_to/watch_out = SN
--   scope_task_log  history of status changes made on page 06 (via set_task_status, section 3b)
--   app_secrets     hashed team passcode for status changes (not readable through the API)
--   ---- HTML tables in index.html ----
--   key_dates               01 ทำไมต้องเริ่มตอนนี้
--   untp_pillars            02 5 เสาหลักของ UNTP
--   case_comparison         04 ทุเรียน → จีน vs แบตเตอรี่ → EU
--   deliverables            07 สิ่งส่งมอบที่เสนอ
--   risks                   07 ความเสี่ยงหลัก
--   team_roles              08 โครงสร้างทีมที่เสนอ
--   raci                    08 RACI ตามขอบเขตงาน
--   stakeholder_activities  08 กิจกรรมที่ต้องใช้ผู้มีส่วนได้ส่วนเสีย

-- =========================================================
-- 1) TABLES
-- =========================================================
create table if not exists public.project_months (
  code       text primary key,          -- 'M1'
  label      text not null,             -- '25 พ.ย. 69 – 24 ธ.ค. 69'
  starts_on  date not null,             -- 2026-11-25
  sort_order int  not null
);

create table if not exists public.workstreams (
  id         text primary key,          -- '4.1'
  color_var  text not null,             -- CSS variable in style.css, e.g. '--ws0'
  name       text not null,
  sort_order int  not null
);

create table if not exists public.activities (
  id          text primary key,         -- '4.1.1'
  ws_id       text not null references public.workstreams(id),
  name        text not null,
  start_month numeric(4,2) not null,    -- 1-based, fractional (1.0 = start of M1, 8.9 = late M8)
  end_month   numeric(4,2) not null,
  output      text,                     -- WBS "ผลลัพธ์"
  owner       text,                     -- WBS "ผู้รับผิดชอบหลัก"
  sort_order  int not null,
  check (end_month >= start_month)
);

create table if not exists public.milestones (
  id         bigint generated always as identity primary key,
  ws_id      text not null references public.workstreams(id),
  month      numeric(4,2) not null,
  label      text not null,
  kind       text not null default 'milestone' check (kind in ('milestone','flag')),
  sort_order int not null,
  unique (ws_id, label)
);
-- for anyone who ran the first version of this file (no "kind" column yet)
alter table public.milestones add column if not exists kind text not null default 'milestone';

create table if not exists public.scopes (
  id         text primary key references public.workstreams(id),  -- '4.2'
  title      text not null,
  period     text not null,             -- 'M1–M3 · Roadmap ฉบับสมบูรณ์ M8'
  sort_order int  not null
);

create table if not exists public.scope_items (
  id         bigint generated always as identity primary key,
  scope_id   text not null references public.scopes(id) on delete cascade,
  heading    text not null,
  body       text not null,
  sort_order int  not null,
  unique (scope_id, heading)
);

-- page 06 (Output และกิจกรรม): notes per scope, outputs, and the activities the team tracks
alter table public.scopes add column if not exists inputs     text;   -- 'รับจาก'
alter table public.scopes add column if not exists outputs_to text;   -- 'ส่งต่อให้'
alter table public.scopes add column if not exists watch_out  text;   -- 'ต้องระวัง'

create table if not exists public.scope_outputs (
  id          text primary key,         -- 'O4.2-1'
  scope_id    text not null references public.scopes(id) on delete cascade,
  name        text not null,
  done_when   text not null,            -- 'ต้องมี / ถือว่าครบเมื่อ'
  deliverable text not null,            -- 'D2' / 'D2 → D5'
  sort_order  int  not null
);

create table if not exists public.scope_tasks (
  id          text primary key,         -- '4.2.1.1'
  activity_id text not null references public.activities(id) on delete cascade,  -- WBS row it belongs to
  name        text not null,
  how         text not null,            -- 'วิธีทำ'
  output_ids  text,                     -- 'O4.2-1, O4.2-6'
  owner       text not null,
  period      text not null,            -- 'M1–M2'
  evidence    text not null,            -- 'หลักฐานที่ติดตาม'
  status      text not null default 'todo' check (status in ('todo','doing','done','blocked')),
  sort_order  int  not null
);
-- last status change, written only by set_task_status() (section 3b)
alter table public.scope_tasks add column if not exists status_changed_at timestamptz;
alter table public.scope_tasks add column if not exists status_changed_by text;

-- every status change, newest last
create table if not exists public.scope_task_log (
  id         bigint generated always as identity primary key,
  task_id    text not null references public.scope_tasks(id) on delete cascade,
  old_status text,
  new_status text not null,
  changed_by text not null,
  changed_at timestamptz not null default now()
);

-- team passcode for changing status (hashed). Never readable through the API.
create table if not exists public.app_secrets (
  name  text primary key,
  value text not null
);

-- =========================================================
-- 2) DATA (copied from js/app.js)
-- =========================================================
insert into public.project_months (code, label, starts_on, sort_order) values
  ('M1','25 พ.ย. 69 – 24 ธ.ค. 69','2026-11-25',1),
  ('M2','25 ธ.ค. 69 – 24 ม.ค. 70','2026-12-25',2),
  ('M3','25 ม.ค. 70 – 24 ก.พ. 70','2027-01-25',3),
  ('M4','25 ก.พ. 70 – 24 มี.ค. 70','2027-02-25',4),
  ('M5','25 มี.ค. 70 – 24 เม.ย. 70','2027-03-25',5),
  ('M6','25 เม.ย. 70 – 24 พ.ค. 70','2027-04-25',6),
  ('M7','25 พ.ค. 70 – 24 มิ.ย. 70','2027-05-25',7),
  ('M8','25 มิ.ย. 70 – 24 ก.ค. 70','2027-06-25',8)
on conflict (code) do update set label=excluded.label, starts_on=excluded.starts_on, sort_order=excluded.sort_order;

insert into public.workstreams (id, color_var, name, sort_order) values
  ('4.1','--ws0','บริหารโครงการ',1),
  ('4.2','--ws1','Landscape · Gap · Ref. Arch. · Roadmap',2),
  ('4.3','--ws2','กระบวนการ End-to-End (ทุเรียน → จีน)',3),
  ('4.4','--ws3','Core Data · Profiles · Technical',4),
  ('4.5','--ws4','ร่างมาตรฐาน Thailand DPP Core',5),
  ('4.6','--ws5','End-to-End Prototype',6),
  ('4.7','--ws6','นำร่องธุรกรรมจริง',7),
  ('4.8','--ws7','สรุปผลและเผยแพร่',8)
on conflict (id) do update set color_var=excluded.color_var, name=excluded.name, sort_order=excluded.sort_order;

insert into public.activities (id, ws_id, name, start_month, end_month, output, owner, sort_order) values
  ('4.1.1','4.1','จัดทำ Inception Report',1.0,1.95,'Project/Work Plan, Methodology, Stakeholder & Field Plan, Risk Plan, ทีม','PM, PMO',1),
  ('4.1.2','4.1','บริหารประชุม/Workshop และล่าม',1.2,8.9,'กำหนดการ บันทึก รายงานกิจกรรม','PMO, Event, ล่าม',2),
  ('4.1.3','4.1','ประสานผู้มีส่วนได้ส่วนเสียไทย–จีน',1.0,8.9,'รายชื่อผู้ติดต่อ หนังสือในนาม สพธอ.','PMO, ผู้ประสานงานจีน',3),
  ('4.1.4','4.1','รายงานความก้าวหน้ารายเดือน',1.0,8.9,'Monthly progress report, issue/risk log','PM',4),
  ('4.2.1','4.2','ศึกษา Landscape และระบบนิเวศ',1.3,2.9,'แนวโน้ม กฎหมาย EU/จีน มาตรฐาน กรณีต่างประเทศ Stakeholder Map','Trade Lead, Legal, Standards',5),
  ('4.2.2','4.2','สัมภาษณ์ ≥ 20 ราย + Focus Group ≥ 1',1.5,3.5,'บันทึกสัมภาษณ์ สรุปความคิดเห็น','Trade Lead, BA',6),
  ('4.2.3','4.2','Gap Analysis 7 ด้าน + Reference Architecture',2.3,3.7,'Gap matrix จัดลำดับความสำคัญ Thailand DPP Ref. Arch.','Solution Arch., Trade Lead',7),
  ('4.2.4a','4.2','Implementation Roadmap ฉบับตั้งต้น',3.2,3.9,'Roadmap สั้น/กลาง/ยาว บทบาท KPI','Trade Lead',8),
  ('4.2.4b','4.2','Implementation Roadmap ฉบับสมบูรณ์',7.5,8.7,'Roadmap ปรับจากผลนำร่อง','Trade Lead, PM',9),
  ('4.2.5','4.2','Operating Model · ผู้ดูแล · Business Model',2.3,8.6,'ทางเลือก Operating Model, ผู้ดูแลแต่ละ component, Business Model + แบบจำลองการเงิน','Trade Lead, Legal',10),
  ('4.3.1','4.3','Supply Chain Map, Document & Data Inventory, As-Is',1.8,3.3,'แผนภาพห่วงโซ่ บัญชีเอกสาร As-Is process','BA, Durian Expert',11),
  ('4.3.2a','4.3','ลงพื้นที่ไทย (จันทบุรี/ระยอง)',2.2,2.9,'บันทึกลงพื้นที่ ยืนยัน pain point','BA, Durian Expert',12),
  ('4.3.2b','4.3','ลงพื้นที่จีนร่วมกับ สพธอ.',3.5,4.3,'กระบวนการฝั่งนำเข้า ความพร้อมเชื่อมข้อมูล','PM, BA, ผู้ประสานงานจีน',13),
  ('4.3.3','4.3','Pain Point, Value Prop., To-Be, Cross-Border Requirements',3.2,4.6,'To-Be process, data exchange requirements, DPP–Invoice linking','BA, Solution Arch.',14),
  ('4.3.4','4.3','รับฟังความคิดเห็น 2 รอบ (As-Is, To-Be)',3.0,4.7,'หลักฐานการรับฟัง ตารางปรับปรุง','BA, PMO',15),
  ('4.4.1','4.4','Thailand DPP Core Data Model + Data Dictionary',3.0,4.3,'Data model, dictionary, mapping มาตรฐาน','Data Arch.',16),
  ('4.4.2','4.4','Durian & Battery DPP Profiles',3.8,4.8,'Sector profiles, แหล่งข้อมูล ระดับสิทธิ์','Data Arch., Durian/Battery Expert',17),
  ('4.4.3','4.4','Technical Components + Interface Spec',3.8,5.2,'Identifier/Carrier, ID Resolver, Repository/OpenAPI, Security, Interface','Solution Arch.',18),
  ('4.4.4','4.4','รับฟังความคิดเห็นผลการออกแบบ',5.0,5.4,'สรุปความเห็นและการปรับปรุง','Data Arch., PMO',19),
  ('4.5.1','4.5','หารือ สมอ. + Standards Mapping + ร่างมาตรฐาน 8 หมวด',4.3,6.0,'ร่าง Thailand DPP Core Standard','Standards',20),
  ('4.5.2','4.5','Conformance Checklist + Test Cases',5.5,6.3,'Checklist, test cases','Standards, QA',21),
  ('4.5.3','4.5','รับฟังและปรับปรุงร่างมาตรฐาน',6.2,7.2,'ตารางข้อคิดเห็นและผลพิจารณา','Standards, PMO',22),
  ('4.5.4','4.5','Submission Package เสนอ สมอ.',7.2,8.6,'ชุดเอกสารครบตามรูปแบบ สมอ.','Standards',23),
  ('4.6.1','4.6','ออกแบบระบบ (Use case, Journey, Architecture, UI)',4.2,5.2,'System design, UI mockup','Solution Arch., UX',24),
  ('4.6.2','4.6','พัฒนา Core + Durian + Battery (TH/EN/ZH)',4.8,6.4,'Prototype พร้อม API ตาม spec','Dev',25),
  ('4.6.3','4.6','ทดสอบ System/API/Security/Conformance + ทดลองใช้ทุเรียน',6.0,6.8,'Test report, defect log','QA, Dev',26),
  ('4.6.4','4.6','ติดตั้ง Cloud ส่งมอบ ถ่ายทอดความรู้',7.5,8.8,'Source code, schema, API spec, คู่มือ, training','DevOps, Tech Writer',27),
  ('4.7.1','4.7','เตรียมความพร้อม: ผู้ประกอบการ บัญชี Data Carrier อบรม',5.8,6.6,'แผนธุรกรรม รายชื่อผู้เข้าร่วม checklist ความพร้อม','PM, BA, ผู้ประสานงานจีน',28),
  ('4.7.2','4.7','ดำเนินธุรกรรมจริง: DPP + Invoice (TLX) + Traceability',6.5,7.6,'หลักฐานการสร้าง/ส่ง/รับ/เข้าถึงข้อมูลถึงปลายทาง','PM, Dev, ผู้ประกอบการ',29),
  ('4.7.3','4.7','ประเมินผลเทียบ As-Is + ข้อเสนอขยายผล',7.4,8.2,'รายงานประเมินนำร่อง','BA, Trade Lead',30),
  ('4.8.1','4.8','Final Report + ข้อเสนอเชิงนโยบาย',7.6,8.9,'Final Report','PM, Trade Lead, Tech Writer',31),
  ('4.8.2','4.8','Executive Summary TH/EN + Presentation',8.2,8.9,'Exec Summary, Presentation, PDF + ต้นฉบับ','Tech Writer',32)
on conflict (id) do update set ws_id=excluded.ws_id, name=excluded.name, start_month=excluded.start_month,
  end_month=excluded.end_month, output=excluded.output, owner=excluded.owner, sort_order=excluded.sort_order;

insert into public.milestones (ws_id, month, label, kind, sort_order) values
  ('4.1',1.95,'D1 Inception','milestone',1),
  ('4.2',3.45,'Focus Group','milestone',2),
  ('4.2',3.95,'D2 Interim 1','milestone',3),
  ('4.3',3.0,'รับฟัง As-Is','milestone',4),
  ('4.3',4.65,'รับฟัง To-Be','milestone',5),
  ('4.4',5.95,'D3 Interim 2','milestone',6),
  ('4.7',6.6,'Go-live ธุรกรรมจริง','milestone',7),
  ('4.5',7.95,'D4 Interim 3','milestone',8),
  ('4.8',8.6,'สัมมนาเผยแพร่','milestone',9),
  ('4.8',8.95,'D5 Final','milestone',10),
  ('4.4',3.7741935484,'18 ก.พ. 2027 Battery Passport EU','flag',11)
on conflict (ws_id, label) do update set month=excluded.month, kind=excluded.kind, sort_order=excluded.sort_order;

insert into public.scopes (id, title, period, inputs, outputs_to, watch_out, sort_order) values
  ('4.2','ศึกษา Landscape ระบบนิเวศ ช่องว่าง และ Implementation Roadmap','M1–M3 · Roadmap ฉบับสมบูรณ์ M8',
   'เริ่มได้ทันทีเมื่อ ETDA อนุมัติ Inception Report (M1)',
   'รายชื่อผู้มีส่วนได้ส่วนเสีย → 4.3 · Ref. Arch. และ requirement EU/จีน → 4.4 · ภาพรวมมาตรฐาน → 4.5 · Roadmap → 4.8',
   'ETDA ต้องเห็นชอบ Ref. Arch. ใน M3 ก่อน 4.4 เริ่ม · ต้องนัดสัมภาษณ์ตั้งแต่ M1 เพราะช่วงปีใหม่ (M2–M3) นัดยาก · Business Model ต้องรอต้นทุนจริงจาก 4.6 และผลนำร่อง 4.7',1),
  ('4.3','ศึกษาและออกแบบกระบวนการ End-to-End และการแลกเปลี่ยนข้อมูลข้ามพรมแดน','M2–M4',
   'Stakeholder Map และผลสัมภาษณ์ (4.2)',
   'Inventory + Requirements + Data Message → 4.4 · To-Be ทุเรียนและแบตเตอรี่ → 4.4, 4.6 · ค่า baseline + ผู้นำเข้าที่สนใจ → 4.7',
   'ลงพื้นที่ไทย ธ.ค. อยู่นอกฤดูทุเรียน · ตรุษจีน 6 ก.พ. 70 ควรไปจีนครึ่งหลังของ ม.ค. · ต้องวัด baseline ตอนนี้ ไม่อย่างนั้น 4.7 ไม่มีตัวเลขเทียบ · เส้นทางแบตเตอรี่ทำระดับ desk study ไม่ต้องมีธุรกรรมจริง',2),
  ('4.4','กำหนด DPP Core Data Elements, Sector Profiles และ Technical Components','M3–M5',
   'Ref. Arch. (4.2) · Inventory, To-Be, Requirements (4.3)',
   'Data model v1.0 → 4.5 · schema + OpenAPI → 4.6',
   'ต้อง freeze v1.0 ภายใน M5 ไม่อย่างนั้น 4.6 พัฒนาไม่ทัน · ขอเข้าถึง NSW/e-Phyto/TLX ใช้เวลา ต้องส่งหนังสือตั้งแต่ M3 · Battery Passport บังคับ 18 ก.พ. 2027 ตรวจกับตัวบทล่าสุด',3),
  ('4.5','จัดทำร่างมาตรฐาน Thailand DPP Core Standard','M4–M8',
   'ภาพรวมมาตรฐาน (4.2) · Data model, Profiles, Technical spec v1.0 (4.4)',
   'Checklist → ทดสอบ 4.6 · Submission Package → 4.8',
   'ใช้แม่แบบ สมอ. ตั้งแต่ร่างแรก · ช่วงรับฟัง M6–M7 ชนกับธุรกรรมจริง ต้องแยกคนรับผิดชอบ · ร่างต้องตรงกับที่ Prototype ทำได้จริง',4),
  ('4.6','พัฒนาและทดสอบ End-to-End DPP Prototype','M4–M8',
   'To-Be (4.3) · spec + OpenAPI v1.0 (4.4) · Checklist (4.5)',
   'ระบบพร้อมก่อนธุรกรรมจริง 4.7 (ต้น M6) · ต้นทุนจริง → Business Model 4.2.5',
   'เวลาพัฒนาสั้น ต้องเริ่ม core ขนานกับงานออกแบบ · ระบบรัฐที่ยังต่อไม่ได้ใช้ mock โครงสร้างเดียวกัน · TOR ยังไม่ระบุระยะดูแล Cloud หลังจบ',5),
  ('4.7','ดำเนินการนำร่องกับธุรกรรมการค้าข้ามพรมแดนจริง','M6–M8',
   'ผู้เข้าร่วมและ baseline (4.3) · Prototype ที่ทดสอบแล้ว (4.6)',
   'ผลประเมิน → Roadmap ฉบับสมบูรณ์ + Business Model (4.2) · Final Report (4.8)',
   'ทุเรียนภาคตะวันออกออกมาก เม.ย.–พ.ค. หลุดช่วงนี้ต้องรอปีหน้า · สงกรานต์ 13–15 เม.ย. และวันหยุดแรงงานจีน 1–5 พ.ค. · ฝั่งจีนไม่ร่วมให้ใช้แผนสำรองที่ผู้นำเข้าเป็นผู้ยืนยันปลายทาง',6)
on conflict (id) do update set title=excluded.title, period=excluded.period, inputs=excluded.inputs,
  outputs_to=excluded.outputs_to, watch_out=excluded.watch_out, sort_order=excluded.sort_order;

insert into public.scope_items (scope_id, heading, body, sort_order) values
  ('4.2','ศึกษา Landscape','แนวโน้ม paperless trade, interoperability, traceability · กฎหมาย EU (ESPR, Battery) และข้อกำหนดนำเข้าจีน · มาตรฐานสากล · กรณีต่างประเทศ · Stakeholder Map · data governance',1),
  ('4.2','เก็บข้อมูล','สัมภาษณ์ ≥ 20 ราย/หน่วยงาน · Focus Group/Workshop ≥ 1 ครั้ง',2),
  ('4.2','Gap + Reference Architecture','Gap 7 ด้าน: นโยบาย/กฎหมาย, มาตรฐาน, ข้อมูล, เทคโนโลยี, กำกับดูแล, ความพร้อมผู้ประกอบการ, ความยั่งยืน · Ref. Arch. เป็นกลางทางเทคโนโลยี',3),
  ('4.2','Implementation Roadmap','9 หัวข้อ: เป้าหมายสั้น/กลาง/ยาว, องค์ประกอบแต่ละระยะ, บทบาท, ลำดับ, use case ขยายผล, สนับสนุนผู้ประกอบการ, กำกับดูแล, KPI, ความเสี่ยง',4),
  ('4.2','Operating Model · ผู้ดูแล · Business Model','หารูปแบบการดำเนินงาน Thailand DPP Core ของประเทศ เช่น รัฐดำเนินการเอง, federated (registry/resolver กลาง + ผู้ให้บริการเอกชน), PPP เทียบกรณีต่างประเทศ · ใครเป็นผู้ดูแล: หน่วยงานเจ้าภาพ ผู้ดูแลมาตรฐาน ผู้ให้บริการระบบ บทบาทและกลไกกำกับ · Business model ที่เลี้ยงตัวเองได้: แหล่งรายได้ (ค่าลงทะเบียน/ออก ID, ค่ารับรองผู้ให้บริการ, API/บริการเสริม) ต้นทุนดำเนินงาน และช่วงที่ต้องใช้งบรัฐก่อนคุ้มทุน',5),
  ('4.3','ห่วงโซ่และเอกสาร','Supply Chain Map · Document & Data Inventory · ใครสร้าง/ออก/รับ/ใช้ · As-Is ระดับสถานประกอบการ ล็อต การจัดส่ง',1),
  ('4.3','ลงพื้นที่','ไทย: จันทบุรี ระยอง (สวน ล้ง ผู้ส่งออก โลจิสติกส์) · จีน: ร่วมกับ สพธอ. · ศึกษาระบบ traceability เดิม',2),
  ('4.3','To-Be + Requirements','Pain point · Value proposition · ความยั่งยืน · To-Be · Cross-Border Data Exchange Requirements · เชื่อม DPP กับ Invoice',3),
  ('4.3','รับฟัง 2 รอบ','รอบ As-Is และรอบ To-Be พร้อมหลักฐานที่ตรวจสอบได้',4),
  ('4.4','Core Data Model','Product Identity, Lifecycle, Sustainability, Compliance & Certification, Traceability · Data Dictionary',1),
  ('4.4','Sector Profiles','Durian Profile (เชื่อม Invoice) · Battery Profile (ไม่ต้องมีผู้ประกอบการจริง)',2),
  ('4.4','Technical Components','Identifier & Data Carrier (GS1 และทางเลือก URI) · ID Resolver · Repository & API (OpenAPI) · Security & Access Control · Interface Spec',3),
  ('4.4','ทบทวน','Focus Group / ผู้เชี่ยวชาญ ครอบคลุม core + ทุเรียน + แบตเตอรี่',4),
  ('4.5','ร่าง + Mapping','หารือ สมอ. · Standards Mapping · 8 หมวด: Scope, Terms, Identification & Carrier, Core Data, Resolver & Access, Interoperability & Security, Governance & Lifecycle, Conformance',1),
  ('4.5','Conformance','Conformance Checklist และ Test Cases',2),
  ('4.5','รับฟังและปรับปรุง','ภาครัฐ มาตรฐาน ผู้เชี่ยวชาญ เอกชน · ตารางข้อคิดเห็นและผลพิจารณา',3),
  ('4.5','Submission Package','ร่างฉบับสมบูรณ์ + mapping + checklist + ผลรับฟัง + หลักการเหตุผล (ไม่รวมการประกาศใช้)',4),
  ('4.6','ออกแบบและพัฒนา','Use case, role, journey, architecture, UI · สร้าง/จัดการ DPP, resolve, สิทธิ์, lifecycle, traceability, API · รองรับไทย อังกฤษ จีน',1),
  ('4.6','Durian + Battery','Durian: ตาม To-Be เชื่อม Invoice และ traceability เดิม · Battery: lifecycle + แบ่งระดับสิทธิ์',2),
  ('4.6','ทดสอบ','System, Integration/API, Security, Conformance · ทดลองใช้กับผู้เกี่ยวข้องทุเรียน',3),
  ('4.6','ส่งมอบ','Cloud ระหว่างและหลังโครงการ · Source code, schema, API spec, คู่มือ, test data, ถ่ายทอดความรู้ ETDA',4),
  ('4.7','เตรียมความพร้อม','แผน · ผู้ประกอบการไทย/จีน · บัญชีผู้ใช้ · Data Carrier · อบรม · ตรวจความพร้อม',1),
  ('4.7','ธุรกรรมจริง','สร้าง DPP กับสินค้าจริง · แลก Invoice ตาม To-Be · ใช้ข้อมูล traceability · หลักฐานว่าข้อมูลถึงปลายทาง',2),
  ('4.7','ประเมินผล','เทียบ As-Is ด้านกระบวนการ ข้อมูล เทคโนโลยี กฎหมาย การปฏิบัติงาน · ข้อเสนอขยายผลสินค้า/ประเทศอื่น',3)
on conflict (scope_id, heading) do update set body=excluded.body, sort_order=excluded.sort_order;

insert into public.scope_outputs (id, scope_id, name, done_when, deliverable, sort_order) values
  ('O4.2-1','4.2','รายงาน Landscape และระบบนิเวศ','แนวโน้ม paperless trade, interoperability, traceability · กฎหมาย EU (ESPR, Battery Reg.) และข้อกำหนดนำเข้าจีน พร้อมวันบังคับใช้ · มาตรฐานสากล · กรณีต่างประเทศ · โครงสร้างพื้นฐานและระบบที่เกี่ยวข้อง · data governance · อ้างอิงแหล่งทุกข้อ','D2',1),
  ('O4.2-2','4.2','Stakeholder Map','หน่วยงานไทย จีน EU พร้อมบทบาท ข้อมูล/ระบบที่ถือ ระดับอิทธิพลและความสนใจ ผู้ติดต่อ','D2',2),
  ('O4.2-3','4.2','ผลสัมภาษณ์และ Focus Group','บันทึก ≥ 20 ราย/หน่วยงาน ครบทุกกลุ่ม · Focus Group ≥ 1 ครั้ง พร้อมรายชื่อและภาพ · ตารางสังเคราะห์ประเด็น','D2',3),
  ('O4.2-4','4.2','Gap Analysis 7 ด้าน','Gap matrix ครบ 7 ด้าน: สภาพปัจจุบัน เป้าหมาย ช่องว่าง ผลกระทบ ลำดับความสำคัญ ผู้รับผิดชอบ','D2',4),
  ('O4.2-5','4.2','Thailand DPP Reference Architecture','เป็นกลางทางเทคโนโลยี · component 4 กลุ่ม + federated services · data flow · จุดเชื่อมระบบเดิม · ETDA เห็นชอบใน M3','D2',5),
  ('O4.2-6','4.2','Operating Model · ผู้ดูแล · Business Model','ทางเลือก ≥ 3 แบบ + เกณฑ์เทียบ · ผู้ดูแลแต่ละ component และฐานอำนาจตามกฎหมาย · ต้นทุน รายได้ จุดคุ้มทุน และช่วงที่ต้องใช้งบรัฐ','D2 ทางเลือก → D5 ข้อเสนอ',6),
  ('O4.2-7','4.2','Implementation Roadmap','ครบ 9 หัวข้อตาม TOR · ฉบับตั้งต้นจาก Gap · ฉบับสมบูรณ์ปรับจากผลนำร่อง ผลรับฟังมาตรฐาน และ Business Model','D2 → D5',7),
  ('O4.3-1','4.3','Supply Chain Map ทุเรียน → จีน','ผู้เล่นทุกขั้นจากสวนถึงผู้นำเข้า · การไหลของสินค้า เอกสาร และข้อมูล · แยกเส้นทางขนส่งหลัก','D2',8),
  ('O4.3-2','4.3','Document & Data Inventory','ทุกเอกสาร/ข้อมูล: ผู้สร้าง ผู้ออก ผู้รับ ผู้ใช้ รูปแบบ ระบบที่เก็บ data element หลัก','D2',9),
  ('O4.3-3','4.3','As-Is Process + ค่า baseline','BPMN 3 ระดับ (สถานประกอบการ ล็อต การจัดส่ง) · ค่า baseline เวลา จำนวนเอกสาร การกรอกซ้ำ ไว้เทียบใน 4.7','D2',10),
  ('O4.3-4','4.3','รายงานลงพื้นที่ไทยและจีน','บันทึก ภาพ รายชื่อ · pain point ที่ยืนยันแล้ว · ระบบ traceability เดิม · ความพร้อมเชื่อมข้อมูลฝั่งจีน','D2, D3',11),
  ('O4.3-5','4.3','Pain Point, Bottleneck + Value Proposition','จุดคอขวด (เวลารอ ตรวจซ้ำ เอกสารกระดาษ) · รายบทบาท: เกษตรกร ล้ง ผู้ส่งออก หน่วยงานรัฐ GACC ผู้นำเข้า · ประเด็นความยั่งยืน','D3',12),
  ('O4.3-6','4.3','To-Be Process','BPMN ที่ใช้ DPP แทนเอกสาร/ขั้นตอนเดิม · ไม่เพิ่มการกรอกซ้ำ · ผ่านการรับฟังแล้ว','D3',13),
  ('O4.3-7','4.3','Cross-Border Data Exchange Requirements + DPP–Invoice linking','รายการเอกสาร/ข้อมูลที่ส่งเป็น Data Message · data element ที่ปลายทางต้องการ ช่องทาง รูปแบบ ภาษา ความปลอดภัย สิทธิ์ · วิธีอ้าง DPP ID ใน invoice ผ่าน TLX','D3',14),
  ('O4.3-8','4.3','หลักฐานรับฟัง 2 รอบ','รอบ As-Is และ To-Be: รายชื่อ ภาพ ตารางความเห็นและการปรับปรุง','D2, D3',15),
  ('O4.3-9','4.3','เส้นทาง End-to-End แบตเตอรี่ → EU','Supply chain เอกสาร/ข้อมูลที่ Battery Regulation กำหนด As-Is/To-Be ระดับแนวคิด จาก desk study และผู้เชี่ยวชาญ (ไม่ต้องมีธุรกรรมจริง) · ใช้ออกแบบ Battery Prototype','D3',16),
  ('O4.4-1','4.4','Thailand DPP Core Data Model','5 กลุ่ม: Product Identity, Lifecycle, Sustainability, Compliance & Certification, Traceability · แผนภาพ + JSON Schema/JSON-LD context · มีเลขเวอร์ชัน','D3',17),
  ('O4.4-2','4.4','Data Dictionary + Standards Mapping','ทุก element: ชื่อ TH/EN นิยาม ชนิด บังคับ/ทางเลือก code list ผู้ออก ระดับสิทธิ์ และ mapping UNTP/GS1/EU/จีน','D3',18),
  ('O4.4-3','4.4','Durian DPP Profile','element เฉพาะทุเรียน แหล่งข้อมูล ระดับสิทธิ์ การเชื่อม Invoice · ไฟล์ตัวอย่างที่ผ่าน schema','D3',19),
  ('O4.4-4','4.4','Battery DPP Profile','ข้อมูลตาม Battery Regulation · lifecycle · ระดับสิทธิ์ สาธารณะ / ผู้มีส่วนได้เสียโดยชอบ / หน่วยงานกำกับ · ไฟล์ตัวอย่าง','D3',20),
  ('O4.4-5','4.4','Technical Components Specification','Identifier & Data Carrier (QR/NFC/RFID) · ID Resolver · Repository & API · Security & Access Control · Interface/Data Exchange กับ NSW, e-Phyto, TLX, traceability เดิม','D3',21),
  ('O4.4-6','4.4','OpenAPI Specification','ไฟล์ OpenAPI 3 ที่ validate ผ่าน ใช้เป็นสัญญากับทีมพัฒนา 4.6','D3',22),
  ('O4.4-7','4.4','ผลรับฟังการออกแบบ + เวอร์ชัน 1.0','ตารางความเห็นผู้เชี่ยวชาญ → การปรับปรุง · ประกาศ v1.0 ที่ 4.5 และ 4.6 ใช้','D3',23),
  ('O4.4-8','4.4','Mapping DPP ↔ Cross-Border Process','ทุกขั้นใน To-Be (4.3) ระบุ DPP/credential ที่สร้างหรืออ่าน ผู้ทำ และ interface · ทุก requirement ข้ามพรมแดนมี data element รองรับ','D3',24),
  ('O4.5-1','4.5','บันทึกหารือ สมอ.','ประเภทมาตรฐาน แม่แบบเอกสาร ขั้นตอนเสนอ คณะกรรมการที่เกี่ยวข้อง ระยะเวลา','D4',25),
  ('O4.5-2','4.5','Standards Mapping','ทุกข้อกำหนดในร่างอ้างอิงมาตรฐานสากล (ISO/IEC 18975, UNTP, W3C VC, GS1 Digital Link, CEN-CENELEC) ระบุว่ารับมาทั้งหมด ปรับ หรือกำหนดใหม่','D4',26),
  ('O4.5-3','4.5','ร่าง Thailand DPP Core Standard','ครบ 8 หมวด ตามแม่แบบ สมอ. · ข้อกำหนดเขียนแบบ "ต้อง/ควร" ที่ทดสอบได้','D4',27),
  ('O4.5-4','4.5','Conformance Checklist + Test Cases + Conformance Report','ทุกข้อ "ต้อง" มีรายการตรวจและ test case · Conformance Report ผลตรวจ Prototype ตาม checklist','D4',28),
  ('O4.5-5','4.5','Stakeholder Consultation Report','ตารางข้อคิดเห็นและผลพิจารณา: ทุกความเห็นมีผล รับ/ไม่รับ พร้อมเหตุผล · หลักฐานกิจกรรมรับฟัง','D4',29),
  ('O4.5-6','4.5','Submission Package','ร่างฉบับสมบูรณ์ + mapping + checklist + ผลรับฟัง + หลักการและเหตุผล ครบตามรูปแบบ สมอ. (ไม่รวมการประกาศใช้)','D5',30),
  ('O4.6-1','4.6','System Design','use case, role, user journey, architecture, UI mockup TH/EN/ZH · ETDA เห็นชอบก่อนพัฒนา','D4',31),
  ('O4.6-2','4.6','Prototype: Core','สร้าง/จัดการ DPP ลงนาม resolve สิทธิ์ lifecycle traceability API ตาม OpenAPI · 3 ภาษา','D4',32),
  ('O4.6-3','4.6','Durian End-to-End Prototype','ตาม To-Be · เชื่อม Invoice (TLX) และ traceability เดิม · พร้อมใช้ในธุรกรรมจริง 4.7','D4',33),
  ('O4.6-4','4.6','Battery End-to-End Prototype','ครบเส้นทาง: สร้าง DPP → ลงทะเบียน → เข้าถึง/เรียกดู → ควบคุมสิทธิ์ตามบทบาท → lifecycle ด้วยข้อมูลตัวอย่าง','D4',34),
  ('O4.6-5','4.6','Test Report','System, Integration/API, Security, Conformance · ผลทดลองใช้กับผู้เกี่ยวข้องทุเรียน · defect log ไม่มี critical/high ค้าง','D4',35),
  ('O4.6-6','4.6','ระบบบน Cloud','ใช้งานได้ระหว่างโครงการ และหลังจบตามระยะที่ตกลงกับ ETDA','D5',36),
  ('O4.6-7','4.6','ชุดส่งมอบระบบ','Source code, schema, API spec, คู่มือผู้ใช้/ผู้ดูแล/ติดตั้ง, test data','D5',37),
  ('O4.6-8','4.6','ถ่ายทอดความรู้ ETDA','หลักสูตร รายชื่อ ผลประเมิน · ทีม ETDA deploy และดูแลระบบเองได้','D5',38),
  ('O4.6-9','4.6','Stakeholder Validation Report','ผู้เกี่ยวข้องทุเรียนและแบตเตอรี่ทดลองและให้ความเห็นต่อ Prototype ทั้ง 2 use case · ตารางความเห็น → การแก้ไข','D4',39),
  ('O4.7-1','4.7','แผนธุรกรรมจริง','จำนวน shipment ผู้เข้าร่วม เส้นทาง ช่วงเวลา เกณฑ์สำเร็จ แผนสำรอง · ETDA เห็นชอบใน M5','D4',40),
  ('O4.7-2','4.7','ผู้เข้าร่วมและความพร้อม','รายชื่อผู้ส่งออก ผู้นำเข้า หน่วยงาน พร้อมหนังสือตอบรับ · บัญชีผู้ใช้ · Data Carrier · ผลอบรม · checklist ความพร้อมผ่าน','D4',41),
  ('O4.7-3','4.7','หลักฐานธุรกรรมจริง','ขั้นต่ำ DPP + เอกสารการค้า ≥ 1 ประเภท (Invoice) · ต่อ shipment: DPP ที่สร้าง invoice ที่แลกผ่าน TLX ข้อมูล traceability และ log ว่าปลายทางเข้าถึงข้อมูล','D4',42),
  ('O4.7-4','4.7','Pilot Report','ผลนำร่อง ปัญหาและข้อจำกัด เทียบ baseline As-Is 5 ด้าน: กระบวนการ ข้อมูล เทคโนโลยี กฎหมาย การปฏิบัติงาน · ความเห็นผู้ใช้','D5',43),
  ('O4.7-5','4.7','Gap / Recommendation + Scaling Roadmap','ข้อเสนอแก้ปัญหาแต่ละด้านเพื่อใช้งานจริง · Scaling Roadmap: สินค้าและประเทศถัดไป ลำดับ เงื่อนไข · ส่งเข้า Roadmap ฉบับสมบูรณ์','D5',44)
on conflict (id) do update set scope_id=excluded.scope_id, name=excluded.name, done_when=excluded.done_when,
  deliverable=excluded.deliverable, sort_order=excluded.sort_order;

-- status is left out of the update, so running this file again keeps the statuses the team has set
insert into public.scope_tasks (id, activity_id, name, how, output_ids, owner, period, evidence, status, sort_order) values
  ('4.2.1.1','4.2.1','วางกรอบและรายการแหล่งข้อมูล',
   'ทำ outline รายงานตามหัวข้อ TOR · รวบรวมตัวบทและเอกสาร (ESPR, Battery Regulation, ประกาศ GACC, UNTP, CPTA) · เลือกกรณีต่างประเทศ 4–5 กรณีพร้อมเหตุผล',
   'O4.2-1','Trade Lead','M1','outline + reading list ที่ ETDA เห็นชอบ','todo',1),
  ('4.2.1.2','4.2.1','สรุปกฎหมายและข้อกำหนด EU/จีน',
   'ตาราง requirement: ข้อกำหนด · ข้อมูลที่ต้องมี · วันบังคับใช้ · ผลต่อผู้ส่งออกไทย · อ้างอิงมาตรา · ตรวจกับตัวบทฉบับล่าสุด',
   'O4.2-1','Legal','M1–M2','ตาราง requirement พร้อมอ้างอิง','todo',2),
  ('4.2.1.3','4.2.1','เทียบมาตรฐานสากลและกรณีต่างประเทศ',
   'ตารางเทียบ UNTP, GS1 Digital Link, ISO/IEC 18975, W3C VC, CEN-CENELEC · ต่อกรณีเก็บ: สถาปัตยกรรม ผู้ดูแล แหล่งเงิน บทเรียน (ใช้ต่อใน 4.2.5)',
   'O4.2-1, O4.2-6','Standards, Trade Lead','M1–M2','ตารางเทียบ + สรุปรายกรณี','todo',3),
  ('4.2.1.4','4.2.1','ทำ Stakeholder Map',
   'เริ่มจากรายชื่อใน TOR แล้วเติมจากการสัมภาษณ์ · ระบุบทบาท ข้อมูล/ระบบที่ถือ อิทธิพล/ความสนใจ ผู้ติดต่อ · ปรับทุกสัปดาห์จนถึง M3',
   'O4.2-2','BA, PMO','M1–M2','แผนภาพ + ตารางผู้มีส่วนได้ส่วนเสีย','todo',4),
  ('4.2.1.5','4.2.1','เขียนรายงาน Landscape',
   'ร่าง → ทบทวนภายใน → ส่ง ETDA ให้ความเห็น → ปรับ · รวมเข้า Interim 1',
   'O4.2-1','Trade Lead, Tech Writer','M2','ร่างรายงาน + ตารางตอบความเห็น ETDA','todo',5),
  ('4.2.1.6','4.2.1','สำรวจโครงสร้างพื้นฐานและระบบที่เกี่ยวข้อง',
   'ระบบรัฐและเอกชนที่มีอยู่ เช่น NSW, e-Phyto, TLX, DBD, ทะเบียน GAP, traceability ของ NECTEC, GS1 · ต่อระบบ: เจ้าของ ข้อมูลที่มี ช่องทางเชื่อม (API/ไฟล์) สถานะ · ใช้ต่อใน Ref. Arch. และ Interface spec',
   'O4.2-1, O4.2-5','Solution Arch., BA','M1–M2','ตารางระบบที่เกี่ยวข้อง','todo',6),
  ('4.2.2.1','4.2.2','เลือกและนัดผู้ให้สัมภาษณ์',
   'ตั้งเป้า 25 ราย เผื่อยกเลิก ครอบคลุม นโยบาย กำกับ มาตรฐาน วิจัย เอกชน โลจิสติกส์ จีน · ส่งหนังสือเชิญในนาม สพธอ. ภายในสัปดาห์ที่ 2 · นัดให้ได้ก่อนหยุดปีใหม่',
   'O4.2-3','PMO, Trade Lead','M1','รายชื่อเป้าหมาย + หนังสือเชิญ + ตารางนัด','todo',7),
  ('4.2.2.2','4.2.2','ทำแบบสัมภาษณ์แยกกลุ่ม',
   'คำถามร่วม + คำถามเฉพาะกลุ่ม ครอบคลุม Gap 7 ด้าน Operating Model และความยินดีจ่าย · ทดลองใช้ 2 ราย แล้วปรับ',
   'O4.2-3','Trade Lead, BA','M1','interview guide ฉบับใช้จริง','todo',8),
  ('4.2.2.3','4.2.2','สัมภาษณ์และบันทึก',
   'ไป 2 คน (ถาม + จด) · ขออนุญาตบันทึกเสียง · ส่งบันทึกภายใน 2 วันทำการ · อัปเดต tracker จำนวนที่ทำแล้ว/เป้า ทุกสัปดาห์',
   'O4.2-3','Trade Lead, BA','M1–M3','บันทึกรายราย + tracker ครบ ≥ 20','todo',9),
  ('4.2.2.4','4.2.2','จัด Focus Group/Workshop',
   'นำเสนอร่าง Landscape, Gap, Ref. Arch. ให้ผู้เข้าร่วมยืนยันหรือแย้ง · จัดร่วมกับรับฟัง As-Is (4.3.4.1) ได้',
   'O4.2-3','Event, Trade Lead','M3','ใบลงทะเบียน ภาพ สรุปความเห็น','todo',10),
  ('4.2.2.5','4.2.2','สังเคราะห์ผล',
   'ถอดประเด็นจากบันทึกทุกรายลงตารางตาม Gap 7 ด้าน · นับความถี่ · ยกคำพูดสำคัญ',
   'O4.2-3, O4.2-4','BA','M3','ตารางสังเคราะห์ประเด็น','todo',11),
  ('4.2.3.1','4.2.3','ทำ Gap matrix 7 ด้าน',
   'ต่อด้าน: สภาพปัจจุบัน · เป้าหมาย · ช่องว่าง · ผลกระทบ · ความเร่งด่วน · ผู้รับผิดชอบ · จัดลำดับด้วยผลกระทบ × ความยาก · ผู้เชี่ยวชาญแต่ละด้านเป็นคนเติม',
   'O4.2-4','Trade Lead + ผู้เชี่ยวชาญ','M2–M3','Gap matrix ที่จัดลำดับแล้ว','todo',12),
  ('4.2.3.2','4.2.3','ร่าง Reference Architecture',
   'ใช้ component 4 กลุ่ม (Trust, Identity & Discovery, Exchange & Access, Semantics) + federated services · ระบุจุดเชื่อม NSW, e-Phyto, TLX, DBD · ไม่ผูกผลิตภัณฑ์หรือผู้ขายรายใด',
   'O4.2-5','Solution Arch.','M2–M3','แผนภาพ + คำอธิบาย component','todo',13),
  ('4.2.3.3','4.2.3','ขอความเห็นชอบ Ref. Arch.',
   'นำเสนอใน Focus Group และประชุม ETDA · ปรับตามความเห็น · ต้องได้ความเห็นชอบก่อน 4.4 เริ่ม',
   'O4.2-5','Solution Arch., PM','M3','บันทึกประชุมที่ระบุว่า ETDA เห็นชอบ','todo',14),
  ('4.2.4a.1','4.2.4a','ร่าง Roadmap ฉบับตั้งต้น',
   'แปลง gap ที่จัดลำดับแล้วเป็นงานระยะสั้น (≤ 1 ปี) กลาง (1–3 ปี) ยาว (3–5 ปี) · เขียนครบ 9 หัวข้อ · KPI ที่วัดได้ต่อระยะ',
   'O4.2-7','Trade Lead','M3','Roadmap ฉบับตั้งต้นใน Interim 1','todo',15),
  ('4.2.4b.1','4.2.4b','ปรับเป็น Roadmap ฉบับสมบูรณ์',
   'ใส่ผลนำร่อง (4.7.3) ผลรับฟังร่างมาตรฐาน (4.5.3) และข้อเสนอ Operating/Business Model (4.2.5) · ทบทวนกับ ETDA ก่อนรวมเข้า Final Report',
   'O4.2-7','Trade Lead, PM','M7–M8','Roadmap ฉบับสมบูรณ์ใน Final Report','todo',16),
  ('4.2.5.1','4.2.5','กำหนดทางเลือก Operating Model',
   'ใช้กรณีต่างประเทศจาก 4.2.1.3 · ทางเลือก ≥ 3 แบบ เช่น รัฐดำเนินการเอง, federated (registry/resolver กลาง + ผู้ให้บริการเอกชน), PPP · เกณฑ์เทียบ: ความน่าเชื่อถือ ต้นทุน ความเร็ว ความยั่งยืนทางการเงิน อำนาจตามกฎหมาย',
   'O4.2-6','Trade Lead','M2–M3','ตารางทางเลือก + เกณฑ์ ใน Interim 1','todo',17),
  ('4.2.5.2','4.2.5','ระบุผู้ดูแลแต่ละ component',
   'ต่อ component (Trust Registry, IDR, Registry, มาตรฐาน, Gateway): ใครเป็นเจ้าภาพ ใครดำเนินการ ฐานอำนาจตามกฎหมาย · หารือหน่วยงานที่เป็นไปได้ เช่น ETDA สมอ. กรมวิชาการเกษตร',
   'O4.2-6','Legal, Trade Lead','M3–M6','ตารางบทบาทระดับประเทศ + บันทึกหารือ','todo',18),
  ('4.2.5.3','4.2.5','ทำ Business Model และประมาณการเงิน',
   'ต้นทุนตั้งต้นและรายปีจากต้นทุนจริงของ Prototype (Cloud, คน) · แหล่งรายได้: ค่าลงทะเบียน/ออก ID, ค่ารับรองผู้ให้บริการ, API, บริการเสริม · ถามความยินดีจ่ายจากผู้ให้สัมภาษณ์และผู้ร่วมนำร่อง · หาจุดคุ้มทุนและช่วงที่ต้องใช้งบรัฐ',
   'O4.2-6','Trade Lead, PM','M5–M8','แบบจำลองการเงิน (spreadsheet) + สรุปข้อเสนอ','todo',19),
  ('4.3.1.1','4.3.1','รวบรวมเอกสารจริง',
   'ขอตัวอย่างเอกสารการค้าและเอกสารภาครัฐจริงตลอดเส้นทางจากผู้ส่งออก 2–3 ราย เช่น ใบรับรอง GAP/GMP ใบรับซื้อ packing list invoice e-Phyto ใบขน ผลตรวจห้องแล็บ · ปิดข้อมูลส่วนบุคคลก่อนเก็บ',
   'O4.3-2','BA, Durian Expert','M1–M2','คลังตัวอย่างเอกสาร','todo',20),
  ('4.3.1.2','4.3.1','ทำ Document & Data Inventory',
   'ตารางต่อเอกสาร: ผู้สร้าง ผู้ออก ผู้รับ ผู้ใช้ ขั้นที่เกิด รูปแบบ (กระดาษ/ดิจิทัล) ระบบที่เก็บ data element หลัก',
   'O4.3-2','BA','M2','ตาราง inventory','todo',21),
  ('4.3.1.3','4.3.1','วาด Supply Chain Map และ As-Is',
   'BPMN 3 ระดับ: สถานประกอบการ ล็อต การจัดส่ง · ยืนยันกับผู้ปฏิบัติงานจริง',
   'O4.3-1, O4.3-3','BA, Durian Expert','M2–M3','แผนภาพห่วงโซ่ + BPMN','todo',22),
  ('4.3.1.4','4.3.1','วัดค่า baseline',
   'เก็บตัวเลขที่จะใช้เทียบใน 4.7: เวลาเตรียมเอกสารต่อ shipment จำนวนเอกสาร จำนวนครั้งที่กรอกข้อมูลซ้ำ จุดที่เกิดข้อผิดพลาด',
   'O4.3-3','BA','M2–M3','ตาราง baseline พร้อมแหล่งตัวเลข','todo',23),
  ('4.3.2a.1','4.3.2a','วางแผนลงพื้นที่ไทย',
   'เลือกสวน ≥ 3 ล้ง/โรงคัด ≥ 2 ผู้ส่งออก ≥ 2 ในจันทบุรี/ระยอง · ประสานกรมวิชาการเกษตรในพื้นที่ · ทำ checklist สิ่งที่ต้องสังเกตและถาม',
   'O4.3-4','BA, PMO','M2','กำหนดการที่ยืนยันแล้ว + checklist','todo',24),
  ('4.3.2a.2','4.3.2a','ลงพื้นที่ไทยและสรุป',
   'สังเกตกระบวนการจริง ถ่ายภาพเอกสาร/ระบบ ยืนยัน pain point · ดูระบบ traceability เดิม (เช่น ของ NECTEC) · นอกฤดูให้เน้นสัมภาษณ์ แล้วสังเกตซ้ำช่วงต้นฤดูใน 4.7.1.3',
   'O4.3-4','BA, Durian Expert','M2','บันทึกลงพื้นที่ + ภาพ + รายการ pain point','todo',25),
  ('4.3.2b.1','4.3.2b','ประสานและนัดฝั่งจีน',
   'ผ่าน ETDA และผู้ประสานงานจีน · เป้าหมาย: ด่าน/GACC ผู้นำเข้า ผู้กระจายสินค้า ผู้ให้บริการระบบ · ส่งคำถามล่วงหน้าเป็นภาษาจีน · เลี่ยงช่วงตรุษจีน',
   'O4.3-4','ผู้ประสานงานจีน, PM','M3','กำหนดการที่ฝั่งจีนยืนยัน','todo',26),
  ('4.3.2b.2','4.3.2b','ลงพื้นที่จีนร่วมกับ สพธอ.',
   'เก็บ: เอกสาร/ข้อมูลที่ด่านตรวจ ระบบที่ใช้ ความพร้อมรับข้อมูลดิจิทัล · หาผู้นำเข้าที่ยินดีร่วมนำร่อง 4.7',
   'O4.3-4, O4.3-7','PM, BA, ผู้ประสานงานจีน','M3–M4','รายงานลงพื้นที่ + รายชื่อผู้นำเข้าที่สนใจร่วม','todo',27),
  ('4.3.3.1','4.3.3','สรุป Pain Point, Bottleneck และ Value Proposition',
   'หาจุดคอขวดจาก As-Is (เวลารอ ตรวจซ้ำ ส่งเอกสารกระดาษ) · ต่อบทบาท: ปัญหา · สิ่งที่ DPP ช่วย · ประโยชน์ที่วัดได้ · ใครจ่าย ใครได้ · รวมประเด็นความยั่งยืน',
   'O4.3-5','BA, Trade Lead','M3–M4','ตาราง pain point/value รายบทบาท','todo',28),
  ('4.3.3.2','4.3.3','ออกแบบ To-Be',
   'ระบุว่า DPP/DCC/DFR/DTE แทนเอกสารหรือขั้นตอนใด · ดึงข้อมูลจากระบบเดิมแทนการกรอกใหม่ · ทำ BPMN เทียบกับ As-Is',
   'O4.3-6','BA, Solution Arch.','M3–M4','BPMN To-Be + ตารางเทียบ As-Is','todo',29),
  ('4.3.3.3','4.3.3','เขียน Cross-Border Requirements และ DPP–Invoice linking',
   'data element ที่ปลายทางต้องการ ช่องทาง รูปแบบ ภาษา ความปลอดภัย สิทธิ์ · หารือทีม TLX ว่าจะอ้าง DPP ID ใน invoice อย่างไร',
   'O4.3-7','Solution Arch., BA','M4','เอกสาร requirements ที่ทีม TLX ทบทวนแล้ว','todo',30),
  ('4.3.3.4','4.3.3','กำหนดเอกสาร/ข้อมูลที่เป็น Data Message',
   'ต่อเอกสารใน Inventory: ส่งเป็นข้อมูลอิเล็กทรอนิกส์ แนบไฟล์ หรือแทนด้วย DPP/credential · ตรวจผลทางกฎหมายตาม พ.ร.บ. ธุรกรรมทางอิเล็กทรอนิกส์ และการยอมรับฝั่งจีน · เลือกรูปแบบข้อมูลมาตรฐาน',
   'O4.3-7','BA, Legal','M4','ตารางเอกสาร → รูปแบบ Data Message พร้อมเหตุผล','todo',31),
  ('4.3.3.5','4.3.3','ออกแบบเส้นทาง End-to-End แบตเตอรี่ → EU',
   'desk study จาก Battery Regulation/ESPR + สัมภาษณ์ ENTEC และผู้ผลิต · supply chain เอกสารและข้อมูลที่ต้องมี As-Is/To-Be ระดับแนวคิด · ไม่ต้องมีธุรกรรมจริง',
   'O4.3-9','BA, Battery Expert','M3–M4','แผนภาพเส้นทาง + To-Be แบตเตอรี่','todo',32),
  ('4.3.4.1','4.3.4','รับฟังรอบ As-Is',
   'นำเสนอ Supply Chain Map, Inventory, As-Is · จัดร่วมกับ Focus Group 4.2.2.4 ได้ · บันทึกความเห็นทุกข้อ',
   'O4.3-8','BA, PMO','M3','ใบลงทะเบียน ภาพ ตารางความเห็น → การปรับ','todo',33),
  ('4.3.4.2','4.3.4','รับฟังรอบ To-Be',
   'นำเสนอ Pain Point, Value Proposition, To-Be, Requirements · เชิญผู้ส่งออก หน่วยงานรัฐ ทีม TLX และ NSW',
   'O4.3-8','BA, PMO','M4','ใบลงทะเบียน ภาพ ตารางความเห็น → การปรับ','todo',34),
  ('4.4.1.1','4.4.1','รวบรวม data requirement',
   'ดึงจาก Inventory (4.3.1.2) ตาราง requirement EU/จีน (4.2.1.2) และ UNTP DPP · ทำ long list element พร้อมที่มา',
   'O4.4-1','Data Arch.','M3','long list element','todo',35),
  ('4.4.1.2','4.4.1','ออกแบบ Core Data Model',
   'แยก core (ใช้ได้ทุกสาขา) กับ sector-specific · จัดเป็น 5 กลุ่ม · ใช้ vocabulary ของ UNTP ก่อนสร้างใหม่ · ทำ JSON Schema + JSON-LD context',
   'O4.4-1','Data Arch.','M3–M4','แผนภาพ model + ไฟล์ schema','todo',36),
  ('4.4.1.3','4.4.1','เขียน Data Dictionary + mapping',
   'ทุก element: ชื่อ TH/EN นิยาม ชนิด บังคับ/ทางเลือก code list ผู้ออก ระดับสิทธิ์ mapping UNTP/GS1/EU/จีน',
   'O4.4-2','Data Arch., Standards','M4','Data Dictionary (spreadsheet)','todo',37),
  ('4.4.2.1','4.4.2','ทำ Durian Profile',
   'element เฉพาะ เช่น พันธุ์ แปลง GAP วันเก็บ โรงคัดบรรจุ ผลตรวจ เลข e-Phyto อ้างอิง invoice · ระบุแหล่งข้อมูลและระดับสิทธิ์ · ทบทวนกับผู้ส่งออก',
   'O4.4-3','Data Arch., Durian Expert','M4','Profile + ไฟล์ตัวอย่างที่ผ่าน schema','todo',38),
  ('4.4.2.2','4.4.2','ทำ Battery Profile',
   'map ข้อมูลที่ Battery Regulation กำหนดเป็น element · แบ่งระดับสิทธิ์ สาธารณะ / ผู้มีส่วนได้เสียโดยชอบ / หน่วยงานกำกับ · ใช้ข้อมูลตัวอย่าง ทบทวนกับ ENTEC',
   'O4.4-4','Data Arch., Battery Expert','M4','Profile + ไฟล์ตัวอย่างที่ผ่าน schema','todo',39),
  ('4.4.3.1','4.4.3','กำหนด Identifier & Data Carrier',
   'GS1 Digital Link (GTIN + lot) เป็นหลัก · ทางเลือก URI สำหรับผู้ไม่มี GTIN · เทียบ QR, NFC, RFID ด้านต้นทุนและการใช้งาน (ทุเรียน: QR บนกล่อง/พาเลท · แบตเตอรี่: QR บนตัวเครื่องหรือ RFID)',
   'O4.4-5','Solution Arch., Standards','M4','spec ตัวระบุ + ตัวอย่าง QR','todo',40),
  ('4.4.3.2','4.4.3','ออกแบบ ID Resolver + Repository & API',
   'resolver ตาม ISO/IEC 18975 (link types, linkset) · API สร้าง/แก้/ดึง/เพิกถอน DPP ลงทะเบียนลิงก์ ตรวจสอบ · เขียน OpenAPI 3 และ validate',
   'O4.4-5, O4.4-6','Solution Arch.','M4–M5','ไฟล์ OpenAPI ที่ validate ผ่าน','todo',41),
  ('4.4.3.3','4.4.3','ออกแบบ Security & Access Control',
   'การลงนาม credential · status list · สิทธิ์ตามบทบาท · การเข้ารหัสข้อมูลลับ · threat model · ตรวจกับ PDPA',
   'O4.4-5','Solution Arch., Legal','M4–M5','spec ความปลอดภัย + threat model','todo',42),
  ('4.4.3.4','4.4.3','เขียน Interface Specification',
   'จุดเชื่อม NSW, e-Phyto, TLX, traceability เดิม · ส่งหนังสือขอ spec/sandbox ในนาม สพธอ. ตั้งแต่ M3 · ถ้าไม่ได้ภายใน M4 ให้ใช้ mock ที่โครงสร้างเดียวกัน',
   'O4.4-5','Solution Arch., PMO','M3–M5','interface spec + สถานะการขอเข้าถึงแต่ละระบบ','todo',43),
  ('4.4.3.5','4.4.3','Map DPP กับ Cross-Border Process',
   'ไล่ทุกขั้นใน To-Be (4.3.3.2): สร้าง/อ่าน credential ใด ใครทำ ผ่าน interface ไหน · ตรวจว่าทุก requirement ข้ามพรมแดน (4.3.3.3) มี data element รองรับ',
   'O4.4-8','Data Arch., BA','M4–M5','ตาราง mapping ขั้นตอน ↔ DPP ↔ interface','todo',44),
  ('4.4.4.1','4.4.4','ทบทวนกับผู้เชี่ยวชาญและ freeze v1.0',
   'Focus Group ครอบคลุม core ทุเรียน แบตเตอรี่ (ENTEC, NECTEC, GS1, กรมวิชาการเกษตร) · ตารางความเห็น → การปรับ · ประกาศ v1.0 ให้ 4.5 และ 4.6 ใช้',
   'O4.4-7','Data Arch., PMO','M5','ตารางความเห็น + บันทึกประกาศ v1.0','todo',45),
  ('4.5.1.1','4.5.1','หารือ สมอ.',
   'ถาม: ประเภทมาตรฐาน แม่แบบ ขั้นตอนเสนอ คณะกรรมการที่เกี่ยวข้อง ระยะเวลา · ขอแม่แบบมาใช้ตั้งแต่ร่างแรก',
   'O4.5-1','Standards, PM','M4','บันทึกการประชุม + แม่แบบ สมอ.','todo',46),
  ('4.5.1.2','4.5.1','ทำ Standards Mapping',
   'ต่อข้อกำหนด: อ้างอิงมาตรฐานสากลใด รับมาทั้งหมด ปรับ หรือกำหนดใหม่ พร้อมเหตุผล',
   'O4.5-2','Standards','M4–M5','ตาราง mapping','todo',47),
  ('4.5.1.3','4.5.1','เขียนร่าง 8 หมวด',
   'ใช้เนื้อหาจาก 4.4 v1.0 · เขียนข้อกำหนดแบบ "ต้อง/ควร/อาจ" ที่ทดสอบได้ · ทบทวนภายในกับ Data Arch. และ Solution Arch.',
   'O4.5-3','Standards','M5','ร่างฉบับ 0.x ครบ 8 หมวด','todo',48),
  ('4.5.2.1','4.5.2','ทำ Checklist และ Test Cases',
   'ทุกข้อ "ต้อง" → รายการตรวจ 1 ข้อ + test case (input, ผลที่คาด) · ทดลองตรวจกับ Prototype 4.6 เพื่อพิสูจน์ว่าใช้ได้จริง',
   'O4.5-4','Standards, QA','M5–M6','checklist + test cases + Conformance Report','todo',49),
  ('4.5.3.1','4.5.3','จัดรับฟังร่างมาตรฐาน',
   'ประชุม ≥ 1 ครั้ง + เปิดรับความเห็นเป็นลายลักษณ์อักษร 2 สัปดาห์ · กลุ่ม: ภาครัฐ มาตรฐาน ผู้เชี่ยวชาญ เอกชน',
   'O4.5-5','Standards, PMO','M6–M7','ใบลงทะเบียน + ความเห็นที่ได้รับ','todo',50),
  ('4.5.3.2','4.5.3','พิจารณาความเห็นและปรับร่าง',
   'ตอบทุกความเห็น: รับ/ไม่รับ + เหตุผล · ปรับร่าง checklist และ mapping ให้ตรงกัน',
   'O4.5-3, O4.5-5','Standards','M7','Stakeholder Consultation Report + ร่างที่ปรับแล้ว','todo',51),
  ('4.5.4.1','4.5.4','ประกอบ Submission Package',
   'ร่างฉบับสมบูรณ์ + mapping + checklist + ผลรับฟัง + หลักการและเหตุผล · ให้ สมอ. ตรวจรูปแบบก่อนส่งจริง',
   'O4.5-6','Standards','M7–M8','ชุดเอกสารที่ สมอ. ตรวจรูปแบบแล้ว','todo',52),
  ('4.6.1.1','4.6.1','ทำ Use case, Role, Journey',
   'ดึงจาก To-Be (4.3.3.2) · journey ต่อบทบาท: ผู้ส่งออก โรงคัด กรมวิชาการเกษตร ผู้ตรวจปลายทาง ผู้นำเข้า ผู้บริโภค · แบตเตอรี่: ผู้ผลิต CB recycler',
   'O4.6-1','BA, UX','M4','เอกสาร use case + journey','todo',53),
  ('4.6.1.2','4.6.1','ทำ Architecture และ UI mockup',
   'architecture ตาม Ref. Arch. และ spec 4.4 · mockup TH/EN/ZH · ETDA เห็นชอบก่อนเริ่มพัฒนา',
   'O4.6-1','Solution Arch., UX','M4–M5','mockup + บันทึกความเห็นชอบ','todo',54),
  ('4.6.2.1','4.6.2','ตั้ง environment',
   'repo, CI/CD, dev/test/prod บน Cloud · พร้อมตั้งแต่ต้นช่วงพัฒนา',
   'O4.6-6','DevOps','M4–M5','environment ใช้งานได้ + pipeline รันผ่าน','todo',55),
  ('4.6.2.2','4.6.2','พัฒนา Core',
   'ออก/ลงนาม credential · repository · resolver + link registry · status list · สิทธิ์ · lifecycle · traceability · API ตาม OpenAPI v1.0 · ใช้ open source ที่มีอยู่ · sprint 2 สัปดาห์ demo ให้ ETDA ทุก sprint',
   'O4.6-2','Dev','M4–M6','demo ทุก sprint + API ผ่าน contract test','todo',56),
  ('4.6.2.3','4.6.2','พัฒนา Durian module',
   'หน้าจอ/นำเข้าข้อมูลตาม To-Be · อ้าง DPP ID ใน invoice ผ่าน TLX · ต่อ traceability เดิม (หรือ mock ถ้ายังไม่ได้สิทธิ์)',
   'O4.6-3','Dev','M5–M6','demo ครบ journey ทุเรียน','todo',57),
  ('4.6.2.4','4.6.2','พัฒนา Battery module และ UI 3 ภาษา',
   'Battery End-to-End: สร้าง DPP ลงทะเบียน เรียกดู ควบคุมสิทธิ์ lifecycle ด้วยข้อมูลตัวอย่าง · UI TH/EN/ZH ให้ผู้ประสานงานจีนตรวจภาษาจีน',
   'O4.6-2, O4.6-4','Dev, ผู้ประสานงานจีน','M5–M6','demo แบตเตอรี่ + UI 3 ภาษา','todo',58),
  ('4.6.3.1','4.6.3','ทดสอบระบบ',
   'test plan · System · Integration/API เทียบ OpenAPI · Security อย่างน้อย OWASP Top 10 · Conformance ด้วย checklist 4.5 · บันทึก defect',
   'O4.6-5','QA','M6','test report + defect log','todo',59),
  ('4.6.3.2','4.6.3','ทดลองใช้กับผู้เกี่ยวข้องทุเรียน',
   'ผู้ส่งออก/โรงคัดที่จะร่วม 4.7 ลองใช้ด้วยข้อมูลจริง · เก็บปัญหาการใช้งาน · ปิด defect critical/high ให้หมดก่อนธุรกรรมจริง',
   'O4.6-5','QA, BA','M6','ผลทดลองใช้ + defect ที่ปิดแล้ว','todo',60),
  ('4.6.3.3','4.6.3','Validation กับผู้เกี่ยวข้อง',
   'demo Prototype ทั้งทุเรียนและแบตเตอรี่ให้ผู้ส่งออก กรมวิชาการเกษตร ENTEC ผู้ผลิตแบตเตอรี่ และ ETDA ลองใช้ · เก็บความเห็นด้วยแบบฟอร์มเดียวกัน · สรุปสิ่งที่แก้',
   'O4.6-9','BA, Solution Arch.','M6','Stakeholder Validation Report','todo',61),
  ('4.6.4.1','4.6.4','ติดตั้ง Cloud และส่งมอบ',
   'deploy production · ส่ง source code, schema, API spec, คู่มือผู้ใช้/ผู้ดูแล/ติดตั้ง, test data · ตกลงระยะดูแล Cloud หลังจบกับ ETDA',
   'O4.6-6, O4.6-7','DevOps, Tech Writer','M7–M8','ใบส่งมอบที่ ETDA ลงนาม','todo',62),
  ('4.6.4.2','4.6.4','ถ่ายทอดความรู้ ETDA',
   'อบรมแบบลงมือ: ติดตั้ง ดูแล แก้ไข เพิ่ม profile · ให้ทีม ETDA deploy เองได้ 1 รอบ',
   'O4.6-8','Solution Arch., DevOps','M8','รายชื่อผู้อบรม + ผลประเมิน + ETDA deploy สำเร็จ','todo',63),
  ('4.7.1.1','4.7.1','กำหนดแผนธุรกรรมกับ ETDA',
   'จำนวน shipment ผู้เข้าร่วม เส้นทาง ช่วงเวลา (ทุเรียนออกมาก เม.ย.–พ.ค.) เกณฑ์สำเร็จ แผนสำรอง · ตัดสินใจร่วมกับ ETDA ใน M5',
   'O4.7-1','PM','M5','แผนธุรกรรมที่ ETDA เห็นชอบ','todo',64),
  ('4.7.1.2','4.7.1','หาผู้เข้าร่วมและทำข้อตกลง',
   'ผู้ส่งออก 2–3 รายจากการลงพื้นที่ + ผู้นำเข้าจาก 4.3.2b · หนังสือตอบรับร่วมโครงการ + ความยินยอมใช้ข้อมูล (PDPA)',
   'O4.7-2','PM, ผู้ประสานงานจีน','M5–M6','หนังสือตอบรับที่ลงนาม','todo',65),
  ('4.7.1.3','4.7.1','ลงพื้นที่รอบ 2 ต้นฤดู',
   'สังเกตกระบวนการจริงช่วงเริ่มเก็บเกี่ยว ยืนยัน To-Be · ตรวจความพร้อมของผู้ส่งออกแต่ละราย',
   'O4.7-2','BA, Durian Expert','M5','บันทึกลงพื้นที่ + ผลตรวจความพร้อม','todo',66),
  ('4.7.1.4','4.7.1','เตรียมบัญชี Data Carrier และอบรม',
   'สร้างบัญชี/คีย์ลงนาม · พิมพ์ QR · อบรมผู้ใช้ไทยและจีน (ภาษาจีนสำหรับผู้นำเข้า) · ซ้อมครบเส้นทางด้วยข้อมูลทดสอบ 1 รอบ',
   'O4.7-2','BA, Dev, ผู้ประสานงานจีน','M6','checklist ความพร้อมผ่านทุกข้อ + ผลการซ้อม','todo',67),
  ('4.7.2.1','4.7.2','ดำเนินธุรกรรมตาม runbook',
   'ขั้นต่ำต้องแลก DPP + เอกสารการค้า ≥ 1 ประเภท · ต่อ shipment: สร้าง DPP ของล็อต → ติด QR → อ้าง e-Phyto → ส่ง invoice ผ่าน TLX พร้อม DPP ID → ปลายทางสแกน/เรียก API → ยืนยันรับ · ทีมเฝ้าระบบระหว่างธุรกรรม',
   'O4.7-3','PM, Dev, ผู้ประกอบการ','M6–M7','checklist ต่อ shipment ครบทุกขั้น','todo',68),
  ('4.7.2.2','4.7.2','เก็บหลักฐาน',
   'log API ภาพหน้าจอ เวลา ต่อขั้น · ยืนยันจากผู้นำเข้า/ด่านว่าเข้าถึงข้อมูล · บันทึกปัญหาและวิธีแก้',
   'O4.7-3','Dev, BA','M6–M7','แฟ้มหลักฐานต่อ shipment + incident log','todo',69),
  ('4.7.3.1','4.7.3','เขียน Pilot Report',
   'วัดตัวชี้วัดเดียวกับ baseline (4.3.1.4) · แบบสอบถาม/สัมภาษณ์ผู้เข้าร่วม · วิเคราะห์ปัญหาและข้อจำกัด 5 ด้าน: กระบวนการ ข้อมูล เทคโนโลยี กฎหมาย การปฏิบัติงาน',
   'O4.7-4','BA, Trade Lead','M7–M8','Pilot Report พร้อมตัวเลขเทียบ baseline','todo',70),
  ('4.7.3.2','4.7.3','เขียน Gap/Recommendation และ Scaling Roadmap',
   'ข้อเสนอแก้ปัญหาแต่ละด้านเพื่อใช้งานจริง · สินค้าและประเทศถัดไป เงื่อนไข ลำดับ ต้นทุน · ส่งเข้า Roadmap ฉบับสมบูรณ์ (4.2.4b) และ Business Model (4.2.5.3)',
   'O4.7-5','Trade Lead','M8','Gap/Recommendation + Scaling Roadmap','todo',71)
on conflict (id) do update set activity_id=excluded.activity_id, name=excluded.name, how=excluded.how, output_ids=excluded.output_ids,
  owner=excluded.owner, period=excluded.period, evidence=excluded.evidence, sort_order=excluded.sort_order;

-- =========================================================
-- 3) RLS: everyone may read, nobody may write with the public key
--    (edit data in Table Editor; the dashboard is not limited by RLS)
-- =========================================================
do $$
declare t text;
begin
  foreach t in array array['project_months','workstreams','activities','milestones','scopes','scope_items',
                           'scope_outputs','scope_tasks','scope_task_log'] loop
    execute format('alter table public.%I enable row level security', t);
    execute format('drop policy if exists "public read" on public.%I', t);
    execute format('create policy "public read" on public.%I for select to anon, authenticated using (true)', t);
    execute format('grant select on public.%I to anon, authenticated', t);  -- in case new tables are not exposed to the API by default
  end loop;
end $$;

-- app_secrets: RLS on and no policy = nobody reads or writes it through the API
alter table public.app_secrets enable row level security;
revoke all on public.app_secrets from anon, authenticated;

-- =========================================================
-- 3b) STATUS CHANGES from the web page (page 06)
--     The page calls set_task_status(); it checks the team passcode, updates the status,
--     stamps date/time + name, and appends a row to scope_task_log.
--     Set or change the passcode by running this line on its own (replace the text in quotes;
--     do not save the real passcode in this file, it is public on GitHub):
--       insert into public.app_secrets (name, value) values ('task_passcode', extensions.crypt('รหัสทีม', extensions.gen_salt('bf')))
--       on conflict (name) do update set value = excluded.value;
-- =========================================================
create extension if not exists pgcrypto with schema extensions;

create or replace function public.set_task_status(p_task_id text, p_status text, p_by text, p_passcode text)
returns public.scope_tasks
language plpgsql
security definer
set search_path = public, extensions
as $$
declare
  v_hash text;
  v_old  text;
  v_by   text := left(btrim(coalesce(p_by, '')), 60);
  v_row  public.scope_tasks;
begin
  select value into v_hash from public.app_secrets where name = 'task_passcode';
  if v_hash is null then
    raise exception 'ยังไม่ได้ตั้งรหัสทีม (ดู supabase/setup.sql ข้อ 3b)';
  end if;
  if p_passcode is null or crypt(p_passcode, v_hash) <> v_hash then
    raise exception 'รหัสทีมไม่ถูกต้อง';
  end if;
  if p_status is null or p_status not in ('todo','doing','done','blocked') then
    raise exception 'สถานะไม่ถูกต้อง: %', p_status;
  end if;
  if v_by = '' then
    raise exception 'กรุณาใส่ชื่อผู้แก้';
  end if;

  select status into v_old from public.scope_tasks where id = p_task_id for update;
  if not found then
    raise exception 'ไม่พบกิจกรรม %', p_task_id;
  end if;

  update public.scope_tasks
     set status = p_status, status_changed_at = now(), status_changed_by = v_by
   where id = p_task_id
  returning * into v_row;

  insert into public.scope_task_log (task_id, old_status, new_status, changed_by)
  values (p_task_id, v_old, p_status, v_by);

  return v_row;
end $$;

revoke all on function public.set_task_status(text, text, text, text) from public;
grant execute on function public.set_task_status(text, text, text, text) to anon, authenticated;

-- =========================================================
-- 4) PAGE TABLES (HTML tables in index.html)
-- =========================================================
create table if not exists public.key_dates (
  id         bigint generated always as identity primary key,
  when_label text not null unique,      -- 'เมื่อไร' as shown, e.g. '20 ก.ค. 2026', 'ต่อเนื่อง'
  event_date date,                      -- exact date when there is one
  event      text not null,             -- 'เหตุการณ์'
  impact     text not null,             -- 'ผลต่อไทย'
  sort_order int  not null
);

create table if not exists public.untp_pillars (
  pillar     text primary key,          -- 'Data'
  components text[] not null,           -- {DPP,DFR,DCC,DTE}
  role       text not null,             -- 'หน้าที่'
  sort_order int  not null
);

create table if not exists public.case_comparison (
  aspect       text primary key,        -- 'แรงผลัก'
  durian_china text not null,           -- 'ทุเรียน → จีน'
  battery_eu   text not null,           -- 'แบตเตอรี่ → EU'
  sort_order   int  not null
);

create table if not exists public.deliverables (
  code       text primary key,          -- 'D1'
  due_label  text not null,             -- '24 ธ.ค. 69'
  month_code text not null references public.project_months(code),
  title      text not null,             -- 'Inception Report'
  content    text not null,
  scope_text text not null,             -- '4.2, 4.3' / '4.5–4.8'
  sort_order int  not null
);

create table if not exists public.risks (
  id         bigint generated always as identity primary key,
  risk       text not null unique,
  impact     text not null,
  mitigation text not null,
  sort_order int  not null
);

create table if not exists public.team_roles (
  id           bigint generated always as identity primary key,
  role         text not null unique,
  tor_required boolean not null default false,   -- shows the "TOR" pill
  duties       text not null,
  scope_text   text not null,                     -- '4.1, 4.8' / 'ทั้งหมด'
  period       text not null,                     -- 'M1–M8'
  sort_order   int  not null
);

-- one row per scope; each column is a party. value: R / A / S / C, null = '–'
create table if not exists public.raci (
  scope_id      text primary key references public.workstreams(id),
  label         text not null,          -- '4.2 Landscape & Roadmap'
  etda          char(1) check (etda          in ('R','A','S','C')),
  pm            char(1) check (pm            in ('R','A','S','C')),
  trade_lead    char(1) check (trade_lead    in ('R','A','S','C')),
  ba            char(1) check (ba            in ('R','A','S','C')),
  standards     char(1) check (standards     in ('R','A','S','C')),
  data_arch     char(1) check (data_arch     in ('R','A','S','C')),
  solution_arch char(1) check (solution_arch in ('R','A','S','C')),
  dev_qa        char(1) check (dev_qa        in ('R','A','S','C')),
  china         char(1) check (china         in ('R','A','S','C')),
  sort_order    int not null
);

create table if not exists public.stakeholder_activities (
  id           bigint generated always as identity primary key,
  period       text not null,           -- 'M1–M3'
  activity     text not null unique,
  participants text not null,
  sort_order   int  not null
);

-- =========================================================
-- 5) PAGE DATA (copied from index.html)
-- =========================================================
insert into public.key_dates (when_label, event_date, event, impact, sort_order) values
  ('20 ก.ค. 2026','2026-07-20','EU DPP Registry เปิดใช้งาน เก็บเฉพาะ ID และผู้ประกอบการ ข้อมูลจริงอยู่ที่ผู้ผลิต','ต้องมี ID และ provider ที่ต่อ API กับ EU ได้',1),
  ('18 ก.พ. 2027','2027-02-18','Battery Passport ภาคบังคับเริ่มสำหรับแบตเตอรี่บางกลุ่ม (ESPR / Battery Regulation)','ตรงกับเดือนที่ 3 ของโครงการ (M3) ผู้ผลิตแบตไทยต้องเตรียมตัว',2),
  ('ฤดูกาล 2026',null,'จีนเข้มงวดการตรวจย้อนกลับ มีกรณีข้อร้องเรียนทุเรียนและการสวมสิทธิ์ GAP','ต้องให้ GACC ตรวจ GAP ได้เองจากข้อมูลดิจิทัล',3),
  ('ต่อเนื่อง',null,'กรอบ CPTA (ESCAP) ผลักดันการค้าไร้กระดาษข้ามพรมแดน','DPP ต้องเชื่อมกับเอกสารการค้า เช่น invoice ผ่าน TLX',4)
on conflict (when_label) do update set event_date=excluded.event_date, event=excluded.event, impact=excluded.impact, sort_order=excluded.sort_order;

insert into public.untp_pillars (pillar, components, role, sort_order) values
  ('Data','{DPP,DFR,DCC,DTE}','ข้อมูลสินค้า สถานประกอบการ ผลการรับรอง และเหตุการณ์ตรวจสอบย้อนกลับ',1),
  ('Finding','{IDR,VCP}','หาข้อมูลจากตัวระบุบนสินค้า (ISO/IEC 18975) แสดงผลได้ทั้งคนและระบบ',2),
  ('Securing','{VCP,DIA,DAC}','กันการแก้ไข ผูก DID กับตัวตนจริง เข้ารหัสข้อมูลลับเฉพาะผู้มีสิทธิ์',3),
  ('Understanding','{Vocabulary,Taxonomies,CVC}','ภาษากลาง และการเทียบมาตรฐาน/กฎหมายที่เท่ากัน',4),
  ('Valuing','{BCT,CAP}','กรณีธุรกิจรายบทบาท และแผนขับเคลื่อนระดับอุตสาหกรรม',5)
on conflict (pillar) do update set components=excluded.components, role=excluded.role, sort_order=excluded.sort_order;

insert into public.case_comparison (aspect, durian_china, battery_eu, sort_order) values
  ('แรงผลัก','GACC ต้องการตรวจ GAP และที่มาของล็อต','ESPR / Battery Regulation: Battery Passport 18 ก.พ. 2027',1),
  ('ขอบเขตตาม TOR','As-Is/To-Be, Durian Profile, Prototype, ธุรกรรมจริง + Invoice','Battery Profile, Prototype แสดงวงจรชีวิตและการแบ่งสิทธิ์ ไม่ต้องมีผู้ประกอบการจริง',2),
  ('Component หลัก','IDR, Trust Registry, API Gateway (e-Phyto · NSW · TLX), CVC','National DPP Registry, Accreditation, Cross-border GW → EU Registry, DAC',3),
  ('ผู้ออกข้อมูลหลัก','กรมวิชาการเกษตร, สวน, โรงคัดบรรจุ','ผู้ผลิตแบต, หน่วยรับรอง (CB)',4),
  ('ผู้ตรวจปลายทาง','GACC, ผู้นำเข้า, ผู้บริโภคจีน','ศุลกากร EU, ผู้ซื้อ, recycler',5)
on conflict (aspect) do update set durian_china=excluded.durian_china, battery_eu=excluded.battery_eu, sort_order=excluded.sort_order;

insert into public.deliverables (code, due_label, month_code, title, content, scope_text, sort_order) values
  ('D1','24 ธ.ค. 69','M1','Inception Report','Project Plan, Methodology, Work Plan, Stakeholder Engagement Plan, แผนลงพื้นที่ไทย–จีน, Risk Plan, โครงสร้างทีม','4.1',1),
  ('D2','24 ก.พ. 70','M3','Interim 1','Landscape, Stakeholder Map, ผลสัมภาษณ์ ≥ 20 ราย, Focus Group, Gap Analysis, Thailand DPP Reference Architecture, ทางเลือก Operating Model, Roadmap ฉบับตั้งต้น, Supply Chain Map, Document & Data Inventory, As-Is','4.2, 4.3',2),
  ('D3','24 เม.ย. 70','M5','Interim 2','Pain Point, Value Proposition, To-Be, Cross-Border Data Exchange Requirements, DPP–Invoice linking, Core Data Model + Data Dictionary, Durian/Battery Profile, Technical Components + OpenAPI, ผลรับฟังความคิดเห็น','4.3, 4.4',3),
  ('D4','24 มิ.ย. 70','M7','Interim 3','ร่าง Thailand DPP Core Standard + Standards Mapping + Conformance Checklist/Test Cases + ผลรับฟัง, Prototype ที่ทดสอบแล้ว, แผนและผลธุรกรรมจริง','4.5, 4.6, 4.7',4),
  ('D5','24 ก.ค. 70','M8','Final','Final Report, Roadmap ฉบับสมบูรณ์, Operating Model + Business Model, Executive Summary TH/EN, Presentation, Submission Package สมอ., Source code + เอกสารระบบ + คู่มือ + ถ่ายทอดความรู้, ผลประเมินนำร่อง, กิจกรรมเผยแพร่','4.5–4.8',5)
on conflict (code) do update set due_label=excluded.due_label, month_code=excluded.month_code, title=excluded.title,
  content=excluded.content, scope_text=excluded.scope_text, sort_order=excluded.sort_order;

insert into public.risks (risk, impact, mitigation, sort_order) values
  ('ฤดูกาลทุเรียน: ลงพื้นที่ช่วง ธ.ค.–ม.ค. นอกฤดู','เห็นกระบวนการจริงไม่ครบ','สัมภาษณ์เชิงลึกก่อน แล้วสังเกตรอบสองช่วงต้นฤดู (มี.ค.) · ใช้ข้อมูลฤดู 2569 จากผู้ส่งออกและ NECTEC',1),
  ('ประสานฝั่งจีน (GACC ผู้นำเข้า importer)','ธุรกรรมจริงไม่ครบถึงปลายทาง','ผู้ประสานงานภาษาจีนตั้งแต่ M1 · หาผู้นำเข้าที่ร่วมมือผ่านผู้ส่งออก · เตรียมแผนสำรองให้ผู้นำเข้าเป็นผู้ยืนยันปลายทาง',2),
  ('การเข้าถึงข้อมูลระบบรัฐ (e-Phyto, NSW, ทะเบียน GAP)','ต้นแบบต่อระบบจริงไม่ได้','ทำหนังสือในนาม สพธอ. เร็ว · ใช้ sandbox หรือข้อมูลจำลองที่มีโครงสร้างเดียวกัน',3),
  ('เวลาพัฒนาต้นแบบสั้น (M5–M6)','ไม่พร้อมก่อนธุรกรรมจริง','เริ่มพัฒนา core component (IDR, VC, registry) ขนานกับงานออกแบบ ใช้ open source ที่มีอยู่',4),
  ('ภาระผู้ประกอบการ/เกษตรกร','ไม่ยอมใช้หรือกรอกซ้ำ','ดึงจากระบบเดิม · ให้ provider/SaaS ทำแทน · ออกแบบ To-Be ที่ไม่เพิ่มขั้นตอน',5),
  ('กระบวนการ สมอ.','ร่างมาตรฐานไม่ตรงรูปแบบ','หารือ สมอ. ตั้งแต่ M4 · ใช้รูปแบบเอกสารของ สมอ. ตั้งแต่ร่างแรก',6)
on conflict (risk) do update set impact=excluded.impact, mitigation=excluded.mitigation, sort_order=excluded.sort_order;

insert into public.team_roles (role, tor_required, duties, scope_text, period, sort_order) values
  ('Project Manager',true,'บริหารภาพรวม คุณภาพ ส่งมอบ ประสาน ETDA','ทั้งหมด','M1–M8',1),
  ('PMO / Project Coordinator',true,'ติดตามแผน นัดหมาย เอกสาร ประชุม รายงานความก้าวหน้า','4.1, 4.8','M1–M8',2),
  ('ผู้ประสานงานภาษาจีน / ล่าม',true,'ติดต่อ GACC ผู้นำเข้า ลงพื้นที่จีน แปลเอกสาร TH–CN–EN','4.1, 4.3, 4.7','M1–M8 (หนัก M3–M4, M6–M7)',3),
  ('Digital Trade / Trade Facilitation Lead',false,'Landscape, CPTA, paperless trade, Roadmap','4.2, 4.8','M1–M3, M7–M8',4),
  ('Legal & Regulatory Expert',false,'ESPR, Battery Reg., ข้อกำหนดจีน, พ.ร.บ. ธุรกรรมฯ, data governance','4.2, 4.3, 4.5','M1–M3, M5–M7',5),
  ('Business Analyst / Process Designer',false,'Supply chain map, inventory, As-Is/To-Be (BPMN), requirements','4.3, 4.7','M2–M4, M6–M7',6),
  ('Durian Supply Chain Expert',false,'สวน ล้ง ส่งออก GAP/GMP e-Phyto ข้อกำหนด GACC','4.3, 4.4, 4.7','M2–M7',7),
  ('Battery / EV Expert',false,'Battery Profile, Battery Regulation, ประสาน ENTEC','4.4, 4.6','M3–M6',8),
  ('Standards Expert',false,'UNTP, GS1, ISO/IEC 18975, W3C VC, CEN-CENELEC, ประสาน สมอ.','4.2, 4.4, 4.5','M2–M8',9),
  ('Data Architect',false,'Core Data Model, Data Dictionary, Sector Profiles, JSON-LD','4.4, 4.5','M3–M6',10),
  ('Solution Architect',false,'Reference Architecture, IDR, Repository/API, Security, Interface spec','4.2, 4.4, 4.6','M2–M7',11),
  ('Developers (Backend/Frontend)',false,'Core components, Durian/Battery prototype, TH/EN/ZH UI, integration','4.6, 4.7','M4–M7',12),
  ('UX/UI Designer',false,'User journey, หน้าจอผู้ประกอบการ/verifier/ผู้บริโภค','4.6','M4–M5',13),
  ('QA & Security Tester',false,'System, API, security, conformance testing','4.6','M6–M7',14),
  ('DevOps / Cloud',false,'Environment, deployment, handover','4.6, 4.7','M5–M8',15),
  ('Event & Workshop Coordinator',false,'Workshop, Focus Group, Roundtable, สัมมนาเผยแพร่','4.1, 4.8','ตามกิจกรรม',16),
  ('Technical Writer',false,'รายงาน คู่มือ Executive Summary TH/EN','4.6, 4.8','M3, M5, M7–M8',17)
on conflict (role) do update set tor_required=excluded.tor_required, duties=excluded.duties,
  scope_text=excluded.scope_text, period=excluded.period, sort_order=excluded.sort_order;

--                                                          ETDA PM   Trade BA   Std  Data Sol  Dev  China
insert into public.raci (scope_id, label, etda, pm, trade_lead, ba, standards, data_arch, solution_arch, dev_qa, china, sort_order) values
  ('4.2','4.2 Landscape & Roadmap', 'A', 'S', 'R', 'S', 'S', 'C', 'S', null,'C', 1),
  ('4.3','4.3 End-to-End process',  'A', 'S', 'S', 'R', 'C', 'C', 'C', null,'S', 2),
  ('4.4','4.4 Data & Technical',    'A', 'S', 'C', 'S', 'S', 'R', 'R', 'C', 'C', 3),
  ('4.5','4.5 Core Standard',       'A', 'S', 'C', 'C', 'R', 'S', 'S', 'S', null,4),
  ('4.6','4.6 Prototype',           'A', 'S', null,'S', 'C', 'S', 'R', 'R', 'C', 5),
  ('4.7','4.7 Real transaction',    'A', 'R', 'C', 'R', null,'C', 'S', 'S', 'R', 6)
on conflict (scope_id) do update set label=excluded.label, etda=excluded.etda, pm=excluded.pm, trade_lead=excluded.trade_lead,
  ba=excluded.ba, standards=excluded.standards, data_arch=excluded.data_arch, solution_arch=excluded.solution_arch,
  dev_qa=excluded.dev_qa, china=excluded.china, sort_order=excluded.sort_order;

insert into public.stakeholder_activities (period, activity, participants, sort_order) values
  ('M1–M3','สัมภาษณ์เชิงลึก ≥ 20 ราย/หน่วยงาน','นโยบาย กำกับ มาตรฐาน วิจัย เอกชน โลจิสติกส์',1),
  ('M2–M3','ลงพื้นที่จันทบุรี/ระยอง','สวน ล้ง ผู้ส่งออก โลจิสติกส์ กรมวิชาการเกษตร',2),
  ('M3','Focus Group/Workshop ≥ 1 ครั้ง (Landscape, Gap, Ref. Arch.) + รับฟัง As-Is','นโยบาย กฎหมาย มาตรฐาน กลุ่มที่ได้รับผลกระทบ',3),
  ('M3–M4','ลงพื้นที่จีนร่วมกับ สพธอ.','GACC ผู้นำเข้า ผู้กระจายสินค้า',4),
  ('M4','รับฟัง To-Be, Value Proposition, Requirements','ผู้ส่งออก หน่วยงานรัฐ TLX NSW',5),
  ('M5','ทบทวน Core Data Model, Profiles, Technical Components','ผู้เชี่ยวชาญ ENTEC NECTEC GS1',6),
  ('M6–M7','รับฟังร่างมาตรฐาน · อบรมผู้ใช้ก่อนธุรกรรมจริง','สมอ. ภาครัฐ เอกชน · ผู้ส่งออก ผู้นำเข้าจีน',7),
  ('M8','Roundtable / สัมมนาเผยแพร่ผล','ผู้บริหาร หน่วยงานไทยและต่างประเทศ',8)
on conflict (activity) do update set period=excluded.period, participants=excluded.participants, sort_order=excluded.sort_order;

-- =========================================================
-- 6) RLS for the page tables
-- =========================================================
do $$
declare t text;
begin
  foreach t in array array['key_dates','untp_pillars','case_comparison','deliverables','risks',
                           'team_roles','raci','stakeholder_activities'] loop
    execute format('alter table public.%I enable row level security', t);
    execute format('drop policy if exists "public read" on public.%I', t);
    execute format('create policy "public read" on public.%I for select to anon, authenticated using (true)', t);
    execute format('grant select on public.%I to anon, authenticated', t);  -- in case new tables are not exposed to the API by default
  end loop;
end $$;

-- =========================================================
-- 7) CHECK — expected row counts are in the "expected" column
-- =========================================================
select t.tbl, t.expected, t.actual, case when t.expected = t.actual then 'ok' else 'MISMATCH' end as status
from (
            select 'project_months' as tbl,  8 as expected, (select count(*) from public.project_months)::int as actual
  union all select 'workstreams',             8, (select count(*) from public.workstreams)::int
  union all select 'activities',             32, (select count(*) from public.activities)::int
  union all select 'milestones',             11, (select count(*) from public.milestones)::int
  union all select 'scopes',                  6, (select count(*) from public.scopes)::int
  union all select 'scope_items',            24, (select count(*) from public.scope_items)::int
  union all select 'scope_outputs',          44, (select count(*) from public.scope_outputs)::int
  union all select 'scope_tasks',            71, (select count(*) from public.scope_tasks)::int
  union all select 'key_dates',               4, (select count(*) from public.key_dates)::int
  union all select 'untp_pillars',            5, (select count(*) from public.untp_pillars)::int
  union all select 'case_comparison',         5, (select count(*) from public.case_comparison)::int
  union all select 'deliverables',            5, (select count(*) from public.deliverables)::int
  union all select 'risks',                   6, (select count(*) from public.risks)::int
  union all select 'team_roles',             17, (select count(*) from public.team_roles)::int
  union all select 'raci',                    6, (select count(*) from public.raci)::int
  union all select 'stakeholder_activities',  8, (select count(*) from public.stakeholder_activities)::int
) t;
