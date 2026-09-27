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
--   ---- HTML tables in index.html ----
--   key_dates               01 ทำไมต้องเริ่มตอนนี้
--   untp_pillars            02 5 เสาหลักของ UNTP
--   case_comparison         03 ทุเรียน → จีน vs แบตเตอรี่ → EU
--   deliverables            05 สิ่งส่งมอบที่เสนอ
--   risks                   05 ความเสี่ยงหลัก
--   team_roles              06 โครงสร้างทีมที่เสนอ
--   raci                    06 RACI ตามขอบเขตงาน
--   stakeholder_activities  06 กิจกรรมที่ต้องใช้ผู้มีส่วนได้ส่วนเสีย

-- =========================================================
-- 1) TABLES
-- =========================================================
create table if not exists public.project_months (
  code       text primary key,          -- 'M1'
  label      text not null,             -- 'พ.ย. 69'
  starts_on  date not null,             -- 2026-11-01
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

-- =========================================================
-- 2) DATA (copied from js/app.js)
-- =========================================================
insert into public.project_months (code, label, starts_on, sort_order) values
  ('M1','พ.ย. 69','2026-11-01',1),
  ('M2','ธ.ค. 69','2026-12-01',2),
  ('M3','ม.ค. 70','2027-01-01',3),
  ('M4','ก.พ. 70','2027-02-01',4),
  ('M5','มี.ค. 70','2027-03-01',5),
  ('M6','เม.ย. 70','2027-04-01',6),
  ('M7','พ.ค. 70','2027-05-01',7),
  ('M8','มิ.ย. 70','2027-06-01',8)
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
  ('4.3.1','4.3','Supply Chain Map, Document & Data Inventory, As-Is',1.8,3.3,'แผนภาพห่วงโซ่ บัญชีเอกสาร As-Is process','BA, Durian Expert',10),
  ('4.3.2a','4.3','ลงพื้นที่ไทย (จันทบุรี/ระยอง)',2.2,2.9,'บันทึกลงพื้นที่ ยืนยัน pain point','BA, Durian Expert',11),
  ('4.3.2b','4.3','ลงพื้นที่จีนร่วมกับ สพธอ.',3.5,4.3,'กระบวนการฝั่งนำเข้า ความพร้อมเชื่อมข้อมูล','PM, BA, ผู้ประสานงานจีน',12),
  ('4.3.3','4.3','Pain Point, Value Prop., To-Be, Cross-Border Requirements',3.2,4.6,'To-Be process, data exchange requirements, DPP–Invoice linking','BA, Solution Arch.',13),
  ('4.3.4','4.3','รับฟังความคิดเห็น 2 รอบ (As-Is, To-Be)',3.0,4.7,'หลักฐานการรับฟัง ตารางปรับปรุง','BA, PMO',14),
  ('4.4.1','4.4','Thailand DPP Core Data Model + Data Dictionary',3.0,4.3,'Data model, dictionary, mapping มาตรฐาน','Data Arch.',15),
  ('4.4.2','4.4','Durian & Battery DPP Profiles',3.8,4.8,'Sector profiles, แหล่งข้อมูล ระดับสิทธิ์','Data Arch., Durian/Battery Expert',16),
  ('4.4.3','4.4','Technical Components + Interface Spec',3.8,5.2,'Identifier/Carrier, ID Resolver, Repository/OpenAPI, Security, Interface','Solution Arch.',17),
  ('4.4.4','4.4','รับฟังความคิดเห็นผลการออกแบบ',5.0,5.4,'สรุปความเห็นและการปรับปรุง','Data Arch., PMO',18),
  ('4.5.1','4.5','หารือ สมอ. + Standards Mapping + ร่างมาตรฐาน 8 หมวด',4.3,6.0,'ร่าง Thailand DPP Core Standard','Standards',19),
  ('4.5.2','4.5','Conformance Checklist + Test Cases',5.5,6.3,'Checklist, test cases','Standards, QA',20),
  ('4.5.3','4.5','รับฟังและปรับปรุงร่างมาตรฐาน',6.2,7.2,'ตารางข้อคิดเห็นและผลพิจารณา','Standards, PMO',21),
  ('4.5.4','4.5','Submission Package เสนอ สมอ.',7.2,8.6,'ชุดเอกสารครบตามรูปแบบ สมอ.','Standards',22),
  ('4.6.1','4.6','ออกแบบระบบ (Use case, Journey, Architecture, UI)',4.2,5.2,'System design, UI mockup','Solution Arch., UX',23),
  ('4.6.2','4.6','พัฒนา Core + Durian + Battery (TH/EN/ZH)',4.8,6.4,'Prototype พร้อม API ตาม spec','Dev',24),
  ('4.6.3','4.6','ทดสอบ System/API/Security/Conformance + ทดลองใช้ทุเรียน',6.0,6.8,'Test report, defect log','QA, Dev',25),
  ('4.6.4','4.6','ติดตั้ง Cloud ส่งมอบ ถ่ายทอดความรู้',7.5,8.8,'Source code, schema, API spec, คู่มือ, training','DevOps, Tech Writer',26),
  ('4.7.1','4.7','เตรียมความพร้อม: ผู้ประกอบการ บัญชี Data Carrier อบรม',5.8,6.6,'แผนธุรกรรม รายชื่อผู้เข้าร่วม checklist ความพร้อม','PM, BA, ผู้ประสานงานจีน',27),
  ('4.7.2','4.7','ดำเนินธุรกรรมจริง: DPP + Invoice (TLX) + Traceability',6.5,7.6,'หลักฐานการสร้าง/ส่ง/รับ/เข้าถึงข้อมูลถึงปลายทาง','PM, Dev, ผู้ประกอบการ',28),
  ('4.7.3','4.7','ประเมินผลเทียบ As-Is + ข้อเสนอขยายผล',7.4,8.2,'รายงานประเมินนำร่อง','BA, Trade Lead',29),
  ('4.8.1','4.8','Final Report + ข้อเสนอเชิงนโยบาย',7.6,8.9,'Final Report','PM, Trade Lead, Tech Writer',30),
  ('4.8.2','4.8','Executive Summary TH/EN + Presentation',8.2,8.9,'Exec Summary, Presentation, PDF + ต้นฉบับ','Tech Writer',31)
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
  ('4.4',4.58,'18 ก.พ. 2027 Battery Passport EU','flag',11)
on conflict (ws_id, label) do update set month=excluded.month, kind=excluded.kind, sort_order=excluded.sort_order;

insert into public.scopes (id, title, period, sort_order) values
  ('4.2','ศึกษา Landscape ระบบนิเวศ ช่องว่าง และ Implementation Roadmap','M1–M3 · Roadmap ฉบับสมบูรณ์ M8',1),
  ('4.3','ศึกษาและออกแบบกระบวนการ End-to-End และการแลกเปลี่ยนข้อมูลข้ามพรมแดน','M2–M4',2),
  ('4.4','กำหนด DPP Core Data Elements, Sector Profiles และ Technical Components','M3–M5',3),
  ('4.5','จัดทำร่างมาตรฐาน Thailand DPP Core Standard','M4–M8',4),
  ('4.6','พัฒนาและทดสอบ End-to-End DPP Prototype','M4–M8',5),
  ('4.7','ดำเนินการนำร่องกับธุรกรรมการค้าข้ามพรมแดนจริง','M6–M8',6)
on conflict (id) do update set title=excluded.title, period=excluded.period, sort_order=excluded.sort_order;

insert into public.scope_items (scope_id, heading, body, sort_order) values
  ('4.2','ศึกษา Landscape','แนวโน้ม paperless trade, interoperability, traceability · กฎหมาย EU (ESPR, Battery) และข้อกำหนดนำเข้าจีน · มาตรฐานสากล · กรณีต่างประเทศ · Stakeholder Map · data governance',1),
  ('4.2','เก็บข้อมูล','สัมภาษณ์ ≥ 20 ราย/หน่วยงาน · Focus Group/Workshop ≥ 1 ครั้ง',2),
  ('4.2','Gap + Reference Architecture','Gap 7 ด้าน: นโยบาย/กฎหมาย, มาตรฐาน, ข้อมูล, เทคโนโลยี, กำกับดูแล, ความพร้อมผู้ประกอบการ, ความยั่งยืน · Ref. Arch. เป็นกลางทางเทคโนโลยี',3),
  ('4.2','Implementation Roadmap','9 หัวข้อ: เป้าหมายสั้น/กลาง/ยาว, องค์ประกอบแต่ละระยะ, บทบาท, ลำดับ, use case ขยายผล, สนับสนุนผู้ประกอบการ, กำกับดูแล, KPI, ความเสี่ยง',4),
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

-- =========================================================
-- 3) RLS: everyone may read, nobody may write with the public key
--    (edit data in Table Editor; the dashboard is not limited by RLS)
-- =========================================================
do $$
declare t text;
begin
  foreach t in array array['project_months','workstreams','activities','milestones','scopes','scope_items'] loop
    execute format('alter table public.%I enable row level security', t);
    execute format('drop policy if exists "public read" on public.%I', t);
    execute format('create policy "public read" on public.%I for select to anon, authenticated using (true)', t);
    execute format('grant select on public.%I to anon, authenticated', t);  -- in case new tables are not exposed to the API by default
  end loop;
end $$;

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
  due_label  text not null,             -- 'สิ้น พ.ย. 69'
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
  ('18 ก.พ. 2027','2027-02-18','Battery Passport ภาคบังคับเริ่มสำหรับแบตเตอรี่บางกลุ่ม (ESPR / Battery Regulation)','ตรงกับเดือนที่ 4 ของโครงการ ผู้ผลิตแบตไทยต้องเตรียมตัว',2),
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
  ('D1','สิ้น พ.ย. 69','M1','Inception Report','Project Plan, Methodology, Work Plan, Stakeholder Engagement Plan, แผนลงพื้นที่ไทย–จีน, Risk Plan, โครงสร้างทีม','4.1',1),
  ('D2','สิ้น ม.ค. 70','M3','Interim 1','Landscape, Stakeholder Map, ผลสัมภาษณ์ ≥ 20 ราย, Focus Group, Gap Analysis, Thailand DPP Reference Architecture, Roadmap ฉบับตั้งต้น, Supply Chain Map, Document & Data Inventory, As-Is','4.2, 4.3',2),
  ('D3','สิ้น มี.ค. 70','M5','Interim 2','Pain Point, Value Proposition, To-Be, Cross-Border Data Exchange Requirements, DPP–Invoice linking, Core Data Model + Data Dictionary, Durian/Battery Profile, Technical Components + OpenAPI, ผลรับฟังความคิดเห็น','4.3, 4.4',3),
  ('D4','สิ้น พ.ค. 70','M7','Interim 3','ร่าง Thailand DPP Core Standard + Standards Mapping + Conformance Checklist/Test Cases + ผลรับฟัง, Prototype ที่ทดสอบแล้ว, แผนและผลธุรกรรมจริง','4.5, 4.6, 4.7',4),
  ('D5','สิ้น มิ.ย. 70','M8','Final','Final Report, Roadmap ฉบับสมบูรณ์, Executive Summary TH/EN, Presentation, Submission Package สมอ., Source code + เอกสารระบบ + คู่มือ + ถ่ายทอดความรู้, ผลประเมินนำร่อง, กิจกรรมเผยแพร่','4.5–4.8',5)
on conflict (code) do update set due_label=excluded.due_label, month_code=excluded.month_code, title=excluded.title,
  content=excluded.content, scope_text=excluded.scope_text, sort_order=excluded.sort_order;

insert into public.risks (risk, impact, mitigation, sort_order) values
  ('ฤดูกาลทุเรียน: ลงพื้นที่ช่วง ธ.ค.–ม.ค. นอกฤดู','เห็นกระบวนการจริงไม่ครบ','สัมภาษณ์เชิงลึกก่อน แล้วสังเกตรอบสองช่วงต้นฤดู (มี.ค.) · ใช้ข้อมูลฤดู 2569 จากผู้ส่งออกและ NECTEC',1),
  ('ประสานฝั่งจีน (GACC ผู้นำเข้า)','ธุรกรรมจริงไม่ครบถึงปลายทาง','ผู้ประสานงานภาษาจีนตั้งแต่ M1 · หาผู้นำเข้าที่ร่วมมือผ่านผู้ส่งออก · เตรียมแผนสำรองให้ผู้นำเข้าเป็นผู้ยืนยันปลายทาง',2),
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
  union all select 'activities',             31, (select count(*) from public.activities)::int
  union all select 'milestones',             11, (select count(*) from public.milestones)::int
  union all select 'scopes',                  6, (select count(*) from public.scopes)::int
  union all select 'scope_items',            23, (select count(*) from public.scope_items)::int
  union all select 'key_dates',               4, (select count(*) from public.key_dates)::int
  union all select 'untp_pillars',            5, (select count(*) from public.untp_pillars)::int
  union all select 'case_comparison',         5, (select count(*) from public.case_comparison)::int
  union all select 'deliverables',            5, (select count(*) from public.deliverables)::int
  union all select 'risks',                   6, (select count(*) from public.risks)::int
  union all select 'team_roles',             17, (select count(*) from public.team_roles)::int
  union all select 'raci',                    6, (select count(*) from public.raci)::int
  union all select 'stakeholder_activities',  8, (select count(*) from public.stakeholder_activities)::int
) t;
