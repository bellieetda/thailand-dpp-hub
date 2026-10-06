/* Thailand DPP Project Hub · page routing, Supabase data, Gantt, WBS, scope cards, outputs & activities, tables */
(function(){
  /* ---------- page routing ---------- */
  const pages=[...document.querySelectorAll('[data-page]')], links=[...document.querySelectorAll('nav.side a.nl')];
  function show(){
    const id=(location.hash||'#home').slice(1), target=pages.find(p=>p.id===id)||pages[0];
    pages.forEach(p=>p.hidden=p!==target);
    links.forEach(a=>a.getAttribute('href')==='#'+target.id?a.setAttribute('aria-current','page'):a.removeAttribute('aria-current'));
    window.scrollTo(0,0);
  }
  window.addEventListener('hashchange',show);show();

  /* ---------- helpers ---------- */
  const $=id=>document.getElementById(id);
  const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const fill=(id,html)=>{const el=$(id);if(el)el.innerHTML=html};
  const bySort=rows=>[...rows].sort((a,b)=>(a.sort_order??0)-(b.sort_order??0));

  /* Proposed kickoff: 25 Nov 2026. Project months run from the 25th to the 24th. */
  const PLAN_START={year:2026,month:10,day:25}, DAY=86400000;
  const monthBoundary=i=>Date.UTC(PLAN_START.year,PLAN_START.month+i,PLAN_START.day);
  const projectDate=m=>{
    const offset=Number(m)-1, whole=Math.floor(offset), fraction=offset-whole;
    return monthBoundary(whole)+fraction*(monthBoundary(whole+1)-monthBoundary(whole));
  };
  const dateLabel=time=>new Intl.DateTimeFormat('th-TH',{day:'numeric',month:'short',year:'2-digit',timeZone:'UTC'}).format(new Date(time));
  const dueLabel=(code,fallback)=>/^M[1-8]$/.test(code)?dateLabel(monthBoundary(Number(code.slice(1)))-DAY):fallback;

  /* ---------- built-in data: shown first, and kept when Supabase is not configured or not reachable ---------- */
  const FALLBACK={
    WS:{
      '4.1':{c:'--ws0',n:'บริหารโครงการ'},
      '4.2':{c:'--ws1',n:'Landscape · Gap · Ref. Arch. · Roadmap'},
      '4.3':{c:'--ws2',n:'กระบวนการ End-to-End (ทุเรียน → จีน)'},
      '4.4':{c:'--ws3',n:'Core Data · Profiles · Technical'},
      '4.5':{c:'--ws4',n:'ร่างมาตรฐาน Thailand DPP Core'},
      '4.6':{c:'--ws5',n:'End-to-End Prototype'},
      '4.7':{c:'--ws6',n:'นำร่องธุรกรรมจริง'},
      '4.8':{c:'--ws7',n:'สรุปผลและเผยแพร่'},
    },
    MONTHS:Array.from({length:8},(_,i)=>['M'+(i+1),`${dateLabel(monthBoundary(i))} – ${dateLabel(monthBoundary(i+1)-DAY)}`]),
    // [id, ws, name, start(month,1-based, fractional), end, output, owner]
    A:[
      ['4.1.1','4.1','จัดทำ Inception Report',1.0,1.95,'Project/Work Plan, Methodology, Stakeholder & Field Plan, Risk Plan, ทีม','PM, PMO'],
      ['4.1.2','4.1','บริหารประชุม/Workshop และล่าม',1.2,8.9,'กำหนดการ บันทึก รายงานกิจกรรม','PMO, Event, ล่าม'],
      ['4.1.3','4.1','ประสานผู้มีส่วนได้ส่วนเสียไทย–จีน',1.0,8.9,'รายชื่อผู้ติดต่อ หนังสือในนาม สพธอ.','PMO, ผู้ประสานงานจีน'],
      ['4.1.4','4.1','รายงานความก้าวหน้ารายเดือน',1.0,8.9,'Monthly progress report, issue/risk log','PM'],
      ['4.2.1','4.2','ศึกษา Landscape และระบบนิเวศ',1.3,2.9,'แนวโน้ม กฎหมาย EU/จีน มาตรฐาน กรณีต่างประเทศ Stakeholder Map','Trade Lead, Legal, Standards'],
      ['4.2.2','4.2','สัมภาษณ์ ≥ 20 ราย + Focus Group ≥ 1',1.5,3.5,'บันทึกสัมภาษณ์ สรุปความคิดเห็น','Trade Lead, BA'],
      ['4.2.3','4.2','Gap Analysis 7 ด้าน + Reference Architecture',2.3,3.7,'Gap matrix จัดลำดับความสำคัญ Thailand DPP Ref. Arch.','Solution Arch., Trade Lead'],
      ['4.2.4a','4.2','Implementation Roadmap ฉบับตั้งต้น',3.2,3.9,'Roadmap สั้น/กลาง/ยาว บทบาท KPI','Trade Lead'],
      ['4.2.4b','4.2','Implementation Roadmap ฉบับสมบูรณ์',7.5,8.7,'Roadmap ปรับจากผลนำร่อง','Trade Lead, PM'],
      ['4.2.5','4.2','Operating Model · ผู้ดูแล · Business Model',2.3,8.6,'ทางเลือก Operating Model, ผู้ดูแลแต่ละ component, Business Model + แบบจำลองการเงิน','Trade Lead, Legal'],
      ['4.3.1','4.3','Supply Chain Map, Document & Data Inventory, As-Is',1.8,3.3,'แผนภาพห่วงโซ่ บัญชีเอกสาร As-Is process','BA, Durian Expert'],
      ['4.3.2a','4.3','ลงพื้นที่ไทย (จันทบุรี/ระยอง)',2.2,2.9,'บันทึกลงพื้นที่ ยืนยัน pain point','BA, Durian Expert'],
      ['4.3.2b','4.3','ลงพื้นที่จีนร่วมกับ สพธอ.',3.5,4.3,'กระบวนการฝั่งนำเข้า ความพร้อมเชื่อมข้อมูล','PM, BA, ผู้ประสานงานจีน'],
      ['4.3.3','4.3','Pain Point, Value Prop., To-Be, Cross-Border Requirements',3.2,4.6,'To-Be process, data exchange requirements, DPP–Invoice linking','BA, Solution Arch.'],
      ['4.3.4','4.3','รับฟังความคิดเห็น 2 รอบ (As-Is, To-Be)',3.0,4.7,'หลักฐานการรับฟัง ตารางปรับปรุง','BA, PMO'],
      ['4.4.1','4.4','Thailand DPP Core Data Model + Data Dictionary',3.0,4.3,'Data model, dictionary, mapping มาตรฐาน','Data Arch.'],
      ['4.4.2','4.4','Durian & Battery DPP Profiles',3.8,4.8,'Sector profiles, แหล่งข้อมูล ระดับสิทธิ์','Data Arch., Durian/Battery Expert'],
      ['4.4.3','4.4','Technical Components + Interface Spec',3.8,5.2,'Identifier/Carrier, ID Resolver, Repository/OpenAPI, Security, Interface','Solution Arch.'],
      ['4.4.4','4.4','รับฟังความคิดเห็นผลการออกแบบ',5.0,5.4,'สรุปความเห็นและการปรับปรุง','Data Arch., PMO'],
      ['4.5.1','4.5','หารือ สมอ. + Standards Mapping + ร่างมาตรฐาน 8 หมวด',4.3,6.0,'ร่าง Thailand DPP Core Standard','Standards'],
      ['4.5.2','4.5','Conformance Checklist + Test Cases',5.5,6.3,'Checklist, test cases','Standards, QA'],
      ['4.5.3','4.5','รับฟังและปรับปรุงร่างมาตรฐาน',6.2,7.2,'ตารางข้อคิดเห็นและผลพิจารณา','Standards, PMO'],
      ['4.5.4','4.5','Submission Package เสนอ สมอ.',7.2,8.6,'ชุดเอกสารครบตามรูปแบบ สมอ.','Standards'],
      ['4.6.1','4.6','ออกแบบระบบ (Use case, Journey, Architecture, UI)',4.2,5.2,'System design, UI mockup','Solution Arch., UX'],
      ['4.6.2','4.6','พัฒนา Core + Durian + Battery (TH/EN/ZH)',4.8,6.4,'Prototype พร้อม API ตาม spec','Dev'],
      ['4.6.3','4.6','ทดสอบ System/API/Security/Conformance + ทดลองใช้ทุเรียน',6.0,6.8,'Test report, defect log','QA, Dev'],
      ['4.6.4','4.6','ติดตั้ง Cloud ส่งมอบ ถ่ายทอดความรู้',7.5,8.8,'Source code, schema, API spec, คู่มือ, training','DevOps, Tech Writer'],
      ['4.7.1','4.7','เตรียมความพร้อม: ผู้ประกอบการ บัญชี Data Carrier อบรม',5.8,6.6,'แผนธุรกรรม รายชื่อผู้เข้าร่วม checklist ความพร้อม','PM, BA, ผู้ประสานงานจีน'],
      ['4.7.2','4.7','ดำเนินธุรกรรมจริง: DPP + Invoice (TLX) + Traceability',6.5,7.6,'หลักฐานการสร้าง/ส่ง/รับ/เข้าถึงข้อมูลถึงปลายทาง','PM, Dev, ผู้ประกอบการ'],
      ['4.7.3','4.7','ประเมินผลเทียบ As-Is + ข้อเสนอขยายผล',7.4,8.2,'รายงานประเมินนำร่อง','BA, Trade Lead'],
      ['4.8.1','4.8','Final Report + ข้อเสนอเชิงนโยบาย',7.6,8.9,'Final Report','PM, Trade Lead, Tech Writer'],
      ['4.8.2','4.8','Executive Summary TH/EN + Presentation',8.2,8.9,'Exec Summary, Presentation, PDF + ต้นฉบับ','Tech Writer'],
    ],
    // [ws, month, label]
    MS:[['4.1',1.95,'D1 Inception'],['4.2',3.45,'Focus Group'],['4.2',3.95,'D2 Interim 1'],['4.3',3.0,'รับฟัง As-Is'],['4.3',4.65,'รับฟัง To-Be'],['4.4',5.95,'D3 Interim 2'],['4.7',6.6,'Go-live ธุรกรรมจริง'],['4.5',7.95,'D4 Interim 3'],['4.8',8.6,'สัมมนาเผยแพร่'],['4.8',8.95,'D5 Final']],
    FLAGS:[['4.4',3+24/31,'18 ก.พ. 2027 Battery Passport EU']],
    // [ws, title, period, [[heading, body], ...]]
    SC:[
      ['4.2','ศึกษา Landscape ระบบนิเวศ ช่องว่าง และ Implementation Roadmap','M1–M3 · Roadmap ฉบับสมบูรณ์ M8',[
        ['ศึกษา Landscape','แนวโน้ม paperless trade, interoperability, traceability · กฎหมาย EU (ESPR, Battery) และข้อกำหนดนำเข้าจีน · มาตรฐานสากล · กรณีต่างประเทศ · Stakeholder Map · data governance'],
        ['เก็บข้อมูล','สัมภาษณ์ ≥ 20 ราย/หน่วยงาน · Focus Group/Workshop ≥ 1 ครั้ง'],
        ['Gap + Reference Architecture','Gap 7 ด้าน: นโยบาย/กฎหมาย, มาตรฐาน, ข้อมูล, เทคโนโลยี, กำกับดูแล, ความพร้อมผู้ประกอบการ, ความยั่งยืน · Ref. Arch. เป็นกลางทางเทคโนโลยี'],
        ['Implementation Roadmap','9 หัวข้อ: เป้าหมายสั้น/กลาง/ยาว, องค์ประกอบแต่ละระยะ, บทบาท, ลำดับ, use case ขยายผล, สนับสนุนผู้ประกอบการ, กำกับดูแล, KPI, ความเสี่ยง'],
        ['Operating Model · ผู้ดูแล · Business Model','หารูปแบบการดำเนินงาน Thailand DPP Core ของประเทศ เช่น รัฐดำเนินการเอง, federated (registry/resolver กลาง + ผู้ให้บริการเอกชน), PPP เทียบกรณีต่างประเทศ · ใครเป็นผู้ดูแล: หน่วยงานเจ้าภาพ ผู้ดูแลมาตรฐาน ผู้ให้บริการระบบ บทบาทและกลไกกำกับ · Business model ที่เลี้ยงตัวเองได้: แหล่งรายได้ (ค่าลงทะเบียน/ออก ID, ค่ารับรองผู้ให้บริการ, API/บริการเสริม) ต้นทุนดำเนินงาน และช่วงที่ต้องใช้งบรัฐก่อนคุ้มทุน'],
      ]],
      ['4.3','ศึกษาและออกแบบกระบวนการ End-to-End และการแลกเปลี่ยนข้อมูลข้ามพรมแดน','M2–M4',[
        ['ห่วงโซ่และเอกสาร','Supply Chain Map · Document & Data Inventory · ใครสร้าง/ออก/รับ/ใช้ · As-Is ระดับสถานประกอบการ ล็อต การจัดส่ง'],
        ['ลงพื้นที่','ไทย: จันทบุรี ระยอง (สวน ล้ง ผู้ส่งออก โลจิสติกส์) · จีน: ร่วมกับ สพธอ. · ศึกษาระบบ traceability เดิม'],
        ['To-Be + Requirements','Pain point · Value proposition · ความยั่งยืน · To-Be · Cross-Border Data Exchange Requirements · เชื่อม DPP กับ Invoice'],
        ['รับฟัง 2 รอบ','รอบ As-Is และรอบ To-Be พร้อมหลักฐานที่ตรวจสอบได้'],
      ]],
      ['4.4','กำหนด DPP Core Data Elements, Sector Profiles และ Technical Components','M3–M5',[
        ['Core Data Model','Product Identity, Lifecycle, Sustainability, Compliance & Certification, Traceability · Data Dictionary'],
        ['Sector Profiles','Durian Profile (เชื่อม Invoice) · Battery Profile (ไม่ต้องมีผู้ประกอบการจริง)'],
        ['Technical Components','Identifier & Data Carrier (GS1 และทางเลือก URI) · ID Resolver · Repository & API (OpenAPI) · Security & Access Control · Interface Spec'],
        ['ทบทวน','Focus Group / ผู้เชี่ยวชาญ ครอบคลุม core + ทุเรียน + แบตเตอรี่'],
      ]],
      ['4.5','จัดทำร่างมาตรฐาน Thailand DPP Core Standard','M4–M8',[
        ['ร่าง + Mapping','หารือ สมอ. · Standards Mapping · 8 หมวด: Scope, Terms, Identification & Carrier, Core Data, Resolver & Access, Interoperability & Security, Governance & Lifecycle, Conformance'],
        ['Conformance','Conformance Checklist และ Test Cases'],
        ['รับฟังและปรับปรุง','ภาครัฐ มาตรฐาน ผู้เชี่ยวชาญ เอกชน · ตารางข้อคิดเห็นและผลพิจารณา'],
        ['Submission Package','ร่างฉบับสมบูรณ์ + mapping + checklist + ผลรับฟัง + หลักการเหตุผล (ไม่รวมการประกาศใช้)'],
      ]],
      ['4.6','พัฒนาและทดสอบ End-to-End DPP Prototype','M4–M8',[
        ['ออกแบบและพัฒนา','Use case, role, journey, architecture, UI · สร้าง/จัดการ DPP, resolve, สิทธิ์, lifecycle, traceability, API · รองรับไทย อังกฤษ จีน'],
        ['Durian + Battery','Durian: ตาม To-Be เชื่อม Invoice และ traceability เดิม · Battery: lifecycle + แบ่งระดับสิทธิ์'],
        ['ทดสอบ','System, Integration/API, Security, Conformance · ทดลองใช้กับผู้เกี่ยวข้องทุเรียน'],
        ['ส่งมอบ','Cloud ระหว่างและหลังโครงการ · Source code, schema, API spec, คู่มือ, test data, ถ่ายทอดความรู้ ETDA'],
      ]],
      ['4.7','ดำเนินการนำร่องกับธุรกรรมการค้าข้ามพรมแดนจริง','M6–M8',[
        ['เตรียมความพร้อม','แผน · ผู้ประกอบการไทย/จีน · บัญชีผู้ใช้ · Data Carrier · อบรม · ตรวจความพร้อม'],
        ['ธุรกรรมจริง','สร้าง DPP กับสินค้าจริง · แลก Invoice ตาม To-Be · ใช้ข้อมูล traceability · หลักฐานว่าข้อมูลถึงปลายทาง'],
        ['ประเมินผล','เทียบ As-Is ด้านกระบวนการ ข้อมูล เทคโนโลยี กฎหมาย การปฏิบัติงาน · ข้อเสนอขยายผลสินค้า/ประเทศอื่น'],
      ]],
    ],
    // outputs & activities page · ws: [รับจาก, ส่งต่อให้, ต้องระวัง]
    SN:{
      '4.2':['เริ่มได้ทันทีเมื่อ ETDA อนุมัติ Inception Report (M1)','รายชื่อผู้มีส่วนได้ส่วนเสีย → 4.3 · Ref. Arch. และ requirement EU/จีน → 4.4 · ภาพรวมมาตรฐาน → 4.5 · Roadmap → 4.8','ETDA ต้องเห็นชอบ Ref. Arch. ใน M3 ก่อน 4.4 เริ่ม · ต้องนัดสัมภาษณ์ตั้งแต่ M1 เพราะช่วงปีใหม่ (M2–M3) นัดยาก · Business Model ต้องรอต้นทุนจริงจาก 4.6 และผลนำร่อง 4.7'],
      '4.3':['Stakeholder Map และผลสัมภาษณ์ (4.2)','Inventory + Requirements + Data Message → 4.4 · To-Be ทุเรียนและแบตเตอรี่ → 4.4, 4.6 · ค่า baseline + ผู้นำเข้าที่สนใจ → 4.7','ลงพื้นที่ไทย ธ.ค. อยู่นอกฤดูทุเรียน · ตรุษจีน 6 ก.พ. 70 ควรไปจีนครึ่งหลังของ ม.ค. · ต้องวัด baseline ตอนนี้ ไม่อย่างนั้น 4.7 ไม่มีตัวเลขเทียบ · เส้นทางแบตเตอรี่ทำระดับ desk study ไม่ต้องมีธุรกรรมจริง'],
      '4.4':['Ref. Arch. (4.2) · Inventory, To-Be, Requirements (4.3)','Data model v1.0 → 4.5 · schema + OpenAPI → 4.6','ต้อง freeze v1.0 ภายใน M5 ไม่อย่างนั้น 4.6 พัฒนาไม่ทัน · ขอเข้าถึง NSW/e-Phyto/TLX ใช้เวลา ต้องส่งหนังสือตั้งแต่ M3 · Battery Passport บังคับ 18 ก.พ. 2027 ตรวจกับตัวบทล่าสุด'],
      '4.5':['ภาพรวมมาตรฐาน (4.2) · Data model, Profiles, Technical spec v1.0 (4.4)','Checklist → ทดสอบ 4.6 · Submission Package → 4.8','ใช้แม่แบบ สมอ. ตั้งแต่ร่างแรก · ช่วงรับฟัง M6–M7 ชนกับธุรกรรมจริง ต้องแยกคนรับผิดชอบ · ร่างต้องตรงกับที่ Prototype ทำได้จริง'],
      '4.6':['To-Be (4.3) · spec + OpenAPI v1.0 (4.4) · Checklist (4.5)','ระบบพร้อมก่อนธุรกรรมจริง 4.7 (ต้น M6) · ต้นทุนจริง → Business Model 4.2.5','เวลาพัฒนาสั้น ต้องเริ่ม core ขนานกับงานออกแบบ · ระบบรัฐที่ยังต่อไม่ได้ใช้ mock โครงสร้างเดียวกัน · TOR ยังไม่ระบุระยะดูแล Cloud หลังจบ'],
      '4.7':['ผู้เข้าร่วมและ baseline (4.3) · Prototype ที่ทดสอบแล้ว (4.6)','ผลประเมิน → Roadmap ฉบับสมบูรณ์ + Business Model (4.2) · Final Report (4.8)','ทุเรียนภาคตะวันออกออกมาก เม.ย.–พ.ค. หลุดช่วงนี้ต้องรอปีหน้า · สงกรานต์ 13–15 เม.ย. และวันหยุดแรงงานจีน 1–5 พ.ค. · ฝั่งจีนไม่ร่วมให้ใช้แผนสำรองที่ผู้นำเข้าเป็นผู้ยืนยันปลายทาง'],
    },
    // [id, ws, output, ต้องมี / ถือว่าครบเมื่อ, งวดส่งมอบ]
    OUT:[
      ['O4.2-1','4.2','รายงาน Landscape และระบบนิเวศ','แนวโน้ม paperless trade, interoperability, traceability · กฎหมาย EU (ESPR, Battery Reg.) และข้อกำหนดนำเข้าจีน พร้อมวันบังคับใช้ · มาตรฐานสากล · กรณีต่างประเทศ · โครงสร้างพื้นฐานและระบบที่เกี่ยวข้อง · data governance · อ้างอิงแหล่งทุกข้อ','D2'],
      ['O4.2-2','4.2','Stakeholder Map','หน่วยงานไทย จีน EU พร้อมบทบาท ข้อมูล/ระบบที่ถือ ระดับอิทธิพลและความสนใจ ผู้ติดต่อ','D2'],
      ['O4.2-3','4.2','ผลสัมภาษณ์และ Focus Group','บันทึก ≥ 20 ราย/หน่วยงาน ครบทุกกลุ่ม · Focus Group ≥ 1 ครั้ง พร้อมรายชื่อและภาพ · ตารางสังเคราะห์ประเด็น','D2'],
      ['O4.2-4','4.2','Gap Analysis 7 ด้าน','Gap matrix ครบ 7 ด้าน: สภาพปัจจุบัน เป้าหมาย ช่องว่าง ผลกระทบ ลำดับความสำคัญ ผู้รับผิดชอบ','D2'],
      ['O4.2-5','4.2','Thailand DPP Reference Architecture','เป็นกลางทางเทคโนโลยี · component 4 กลุ่ม + federated services · data flow · จุดเชื่อมระบบเดิม · ETDA เห็นชอบใน M3','D2'],
      ['O4.2-6','4.2','Operating Model · ผู้ดูแล · Business Model','ทางเลือก ≥ 3 แบบ + เกณฑ์เทียบ · ผู้ดูแลแต่ละ component และฐานอำนาจตามกฎหมาย · ต้นทุน รายได้ จุดคุ้มทุน และช่วงที่ต้องใช้งบรัฐ','D2 ทางเลือก → D5 ข้อเสนอ'],
      ['O4.2-7','4.2','Implementation Roadmap','ครบ 9 หัวข้อตาม TOR · ฉบับตั้งต้นจาก Gap · ฉบับสมบูรณ์ปรับจากผลนำร่อง ผลรับฟังมาตรฐาน และ Business Model','D2 → D5'],
      ['O4.3-1','4.3','Supply Chain Map ทุเรียน → จีน','ผู้เล่นทุกขั้นจากสวนถึงผู้นำเข้า · การไหลของสินค้า เอกสาร และข้อมูล · แยกเส้นทางขนส่งหลัก','D2'],
      ['O4.3-2','4.3','Document & Data Inventory','ทุกเอกสาร/ข้อมูล: ผู้สร้าง ผู้ออก ผู้รับ ผู้ใช้ รูปแบบ ระบบที่เก็บ data element หลัก','D2'],
      ['O4.3-3','4.3','As-Is Process + ค่า baseline','BPMN 3 ระดับ (สถานประกอบการ ล็อต การจัดส่ง) · ค่า baseline เวลา จำนวนเอกสาร การกรอกซ้ำ ไว้เทียบใน 4.7','D2'],
      ['O4.3-4','4.3','รายงานลงพื้นที่ไทยและจีน','บันทึก ภาพ รายชื่อ · pain point ที่ยืนยันแล้ว · ระบบ traceability เดิม · ความพร้อมเชื่อมข้อมูลฝั่งจีน','D2, D3'],
      ['O4.3-5','4.3','Pain Point, Bottleneck + Value Proposition','จุดคอขวด (เวลารอ ตรวจซ้ำ เอกสารกระดาษ) · รายบทบาท: เกษตรกร ล้ง ผู้ส่งออก หน่วยงานรัฐ GACC ผู้นำเข้า · ประเด็นความยั่งยืน','D3'],
      ['O4.3-6','4.3','To-Be Process','BPMN ที่ใช้ DPP แทนเอกสาร/ขั้นตอนเดิม · ไม่เพิ่มการกรอกซ้ำ · ผ่านการรับฟังแล้ว','D3'],
      ['O4.3-7','4.3','Cross-Border Data Exchange Requirements + DPP–Invoice linking','รายการเอกสาร/ข้อมูลที่ส่งเป็น Data Message · data element ที่ปลายทางต้องการ ช่องทาง รูปแบบ ภาษา ความปลอดภัย สิทธิ์ · วิธีอ้าง DPP ID ใน invoice ผ่าน TLX','D3'],
      ['O4.3-8','4.3','หลักฐานรับฟัง 2 รอบ','รอบ As-Is และ To-Be: รายชื่อ ภาพ ตารางความเห็นและการปรับปรุง','D2, D3'],
      ['O4.3-9','4.3','เส้นทาง End-to-End แบตเตอรี่ → EU','Supply chain เอกสาร/ข้อมูลที่ Battery Regulation กำหนด As-Is/To-Be ระดับแนวคิด จาก desk study และผู้เชี่ยวชาญ (ไม่ต้องมีธุรกรรมจริง) · ใช้ออกแบบ Battery Prototype','D3'],
      ['O4.4-1','4.4','Thailand DPP Core Data Model','5 กลุ่ม: Product Identity, Lifecycle, Sustainability, Compliance & Certification, Traceability · แผนภาพ + JSON Schema/JSON-LD context · มีเลขเวอร์ชัน','D3'],
      ['O4.4-2','4.4','Data Dictionary + Standards Mapping','ทุก element: ชื่อ TH/EN นิยาม ชนิด บังคับ/ทางเลือก code list ผู้ออก ระดับสิทธิ์ และ mapping UNTP/GS1/EU/จีน','D3'],
      ['O4.4-3','4.4','Durian DPP Profile','element เฉพาะทุเรียน แหล่งข้อมูล ระดับสิทธิ์ การเชื่อม Invoice · ไฟล์ตัวอย่างที่ผ่าน schema','D3'],
      ['O4.4-4','4.4','Battery DPP Profile','ข้อมูลตาม Battery Regulation · lifecycle · ระดับสิทธิ์ สาธารณะ / ผู้มีส่วนได้เสียโดยชอบ / หน่วยงานกำกับ · ไฟล์ตัวอย่าง','D3'],
      ['O4.4-5','4.4','Technical Components Specification','Identifier & Data Carrier (QR/NFC/RFID) · ID Resolver · Repository & API · Security & Access Control · Interface/Data Exchange กับ NSW, e-Phyto, TLX, traceability เดิม','D3'],
      ['O4.4-6','4.4','OpenAPI Specification','ไฟล์ OpenAPI 3 ที่ validate ผ่าน ใช้เป็นสัญญากับทีมพัฒนา 4.6','D3'],
      ['O4.4-7','4.4','ผลรับฟังการออกแบบ + เวอร์ชัน 1.0','ตารางความเห็นผู้เชี่ยวชาญ → การปรับปรุง · ประกาศ v1.0 ที่ 4.5 และ 4.6 ใช้','D3'],
      ['O4.4-8','4.4','Mapping DPP ↔ Cross-Border Process','ทุกขั้นใน To-Be (4.3) ระบุ DPP/credential ที่สร้างหรืออ่าน ผู้ทำ และ interface · ทุก requirement ข้ามพรมแดนมี data element รองรับ','D3'],
      ['O4.5-1','4.5','บันทึกหารือ สมอ.','ประเภทมาตรฐาน แม่แบบเอกสาร ขั้นตอนเสนอ คณะกรรมการที่เกี่ยวข้อง ระยะเวลา','D4'],
      ['O4.5-2','4.5','Standards Mapping','ทุกข้อกำหนดในร่างอ้างอิงมาตรฐานสากล (ISO/IEC 18975, UNTP, W3C VC, GS1 Digital Link, CEN-CENELEC) ระบุว่ารับมาทั้งหมด ปรับ หรือกำหนดใหม่','D4'],
      ['O4.5-3','4.5','ร่าง Thailand DPP Core Standard','ครบ 8 หมวด ตามแม่แบบ สมอ. · ข้อกำหนดเขียนแบบ "ต้อง/ควร" ที่ทดสอบได้','D4'],
      ['O4.5-4','4.5','Conformance Checklist + Test Cases + Conformance Report','ทุกข้อ "ต้อง" มีรายการตรวจและ test case · Conformance Report ผลตรวจ Prototype ตาม checklist','D4'],
      ['O4.5-5','4.5','Stakeholder Consultation Report','ตารางข้อคิดเห็นและผลพิจารณา: ทุกความเห็นมีผล รับ/ไม่รับ พร้อมเหตุผล · หลักฐานกิจกรรมรับฟัง','D4'],
      ['O4.5-6','4.5','Submission Package','ร่างฉบับสมบูรณ์ + mapping + checklist + ผลรับฟัง + หลักการและเหตุผล ครบตามรูปแบบ สมอ. (ไม่รวมการประกาศใช้)','D5'],
      ['O4.6-1','4.6','System Design','use case, role, user journey, architecture, UI mockup TH/EN/ZH · ETDA เห็นชอบก่อนพัฒนา','D4'],
      ['O4.6-2','4.6','Prototype: Core','สร้าง/จัดการ DPP ลงนาม resolve สิทธิ์ lifecycle traceability API ตาม OpenAPI · 3 ภาษา','D4'],
      ['O4.6-3','4.6','Durian End-to-End Prototype','ตาม To-Be · เชื่อม Invoice (TLX) และ traceability เดิม · พร้อมใช้ในธุรกรรมจริง 4.7','D4'],
      ['O4.6-4','4.6','Battery End-to-End Prototype','ครบเส้นทาง: สร้าง DPP → ลงทะเบียน → เข้าถึง/เรียกดู → ควบคุมสิทธิ์ตามบทบาท → lifecycle ด้วยข้อมูลตัวอย่าง','D4'],
      ['O4.6-5','4.6','Test Report','System, Integration/API, Security, Conformance · ผลทดลองใช้กับผู้เกี่ยวข้องทุเรียน · defect log ไม่มี critical/high ค้าง','D4'],
      ['O4.6-6','4.6','ระบบบน Cloud','ใช้งานได้ระหว่างโครงการ และหลังจบตามระยะที่ตกลงกับ ETDA','D5'],
      ['O4.6-7','4.6','ชุดส่งมอบระบบ','Source code, schema, API spec, คู่มือผู้ใช้/ผู้ดูแล/ติดตั้ง, test data','D5'],
      ['O4.6-8','4.6','ถ่ายทอดความรู้ ETDA','หลักสูตร รายชื่อ ผลประเมิน · ทีม ETDA deploy และดูแลระบบเองได้','D5'],
      ['O4.6-9','4.6','Stakeholder Validation Report','ผู้เกี่ยวข้องทุเรียนและแบตเตอรี่ทดลองและให้ความเห็นต่อ Prototype ทั้ง 2 use case · ตารางความเห็น → การแก้ไข','D4'],
      ['O4.7-1','4.7','แผนธุรกรรมจริง','จำนวน shipment ผู้เข้าร่วม เส้นทาง ช่วงเวลา เกณฑ์สำเร็จ แผนสำรอง · ETDA เห็นชอบใน M5','D4'],
      ['O4.7-2','4.7','ผู้เข้าร่วมและความพร้อม','รายชื่อผู้ส่งออก ผู้นำเข้า หน่วยงาน พร้อมหนังสือตอบรับ · บัญชีผู้ใช้ · Data Carrier · ผลอบรม · checklist ความพร้อมผ่าน','D4'],
      ['O4.7-3','4.7','หลักฐานธุรกรรมจริง','ขั้นต่ำ DPP + เอกสารการค้า ≥ 1 ประเภท (Invoice) · ต่อ shipment: DPP ที่สร้าง invoice ที่แลกผ่าน TLX ข้อมูล traceability และ log ว่าปลายทางเข้าถึงข้อมูล','D4'],
      ['O4.7-4','4.7','Pilot Report','ผลนำร่อง ปัญหาและข้อจำกัด เทียบ baseline As-Is 5 ด้าน: กระบวนการ ข้อมูล เทคโนโลยี กฎหมาย การปฏิบัติงาน · ความเห็นผู้ใช้','D5'],
      ['O4.7-5','4.7','Gap / Recommendation + Scaling Roadmap','ข้อเสนอแก้ปัญหาแต่ละด้านเพื่อใช้งานจริง · Scaling Roadmap: สินค้าและประเทศถัดไป ลำดับ เงื่อนไข · ส่งเข้า Roadmap ฉบับสมบูรณ์','D5'],
    ],
    // [id, WBS activity, กิจกรรม, วิธีทำ, output ids, ผู้รับผิดชอบ, เดือน, หลักฐานที่ติดตาม, status: todo | doing | done | blocked]
    TASK:[
      ['4.2.1.1','4.2.1','วางกรอบและรายการแหล่งข้อมูล','ทำ outline รายงานตามหัวข้อ TOR · รวบรวมตัวบทและเอกสาร (ESPR, Battery Regulation, ประกาศ GACC, UNTP, CPTA) · เลือกกรณีต่างประเทศ 4–5 กรณีพร้อมเหตุผล','O4.2-1','Trade Lead','M1','outline + reading list ที่ ETDA เห็นชอบ','todo'],
      ['4.2.1.2','4.2.1','สรุปกฎหมายและข้อกำหนด EU/จีน','ตาราง requirement: ข้อกำหนด · ข้อมูลที่ต้องมี · วันบังคับใช้ · ผลต่อผู้ส่งออกไทย · อ้างอิงมาตรา · ตรวจกับตัวบทฉบับล่าสุด','O4.2-1','Legal','M1–M2','ตาราง requirement พร้อมอ้างอิง','todo'],
      ['4.2.1.3','4.2.1','เทียบมาตรฐานสากลและกรณีต่างประเทศ','ตารางเทียบ UNTP, GS1 Digital Link, ISO/IEC 18975, W3C VC, CEN-CENELEC · ต่อกรณีเก็บ: สถาปัตยกรรม ผู้ดูแล แหล่งเงิน บทเรียน (ใช้ต่อใน 4.2.5)','O4.2-1, O4.2-6','Standards, Trade Lead','M1–M2','ตารางเทียบ + สรุปรายกรณี','todo'],
      ['4.2.1.4','4.2.1','ทำ Stakeholder Map','เริ่มจากรายชื่อใน TOR แล้วเติมจากการสัมภาษณ์ · ระบุบทบาท ข้อมูล/ระบบที่ถือ อิทธิพล/ความสนใจ ผู้ติดต่อ · ปรับทุกสัปดาห์จนถึง M3','O4.2-2','BA, PMO','M1–M2','แผนภาพ + ตารางผู้มีส่วนได้ส่วนเสีย','todo'],
      ['4.2.1.5','4.2.1','เขียนรายงาน Landscape','ร่าง → ทบทวนภายใน → ส่ง ETDA ให้ความเห็น → ปรับ · รวมเข้า Interim 1','O4.2-1','Trade Lead, Tech Writer','M2','ร่างรายงาน + ตารางตอบความเห็น ETDA','todo'],
      ['4.2.1.6','4.2.1','สำรวจโครงสร้างพื้นฐานและระบบที่เกี่ยวข้อง','ระบบรัฐและเอกชนที่มีอยู่ เช่น NSW, e-Phyto, TLX, DBD, ทะเบียน GAP, traceability ของ NECTEC, GS1 · ต่อระบบ: เจ้าของ ข้อมูลที่มี ช่องทางเชื่อม (API/ไฟล์) สถานะ · ใช้ต่อใน Ref. Arch. และ Interface spec','O4.2-1, O4.2-5','Solution Arch., BA','M1–M2','ตารางระบบที่เกี่ยวข้อง','todo'],
      ['4.2.2.1','4.2.2','เลือกและนัดผู้ให้สัมภาษณ์','ตั้งเป้า 25 ราย เผื่อยกเลิก ครอบคลุม นโยบาย กำกับ มาตรฐาน วิจัย เอกชน โลจิสติกส์ จีน · ส่งหนังสือเชิญในนาม สพธอ. ภายในสัปดาห์ที่ 2 · นัดให้ได้ก่อนหยุดปีใหม่','O4.2-3','PMO, Trade Lead','M1','รายชื่อเป้าหมาย + หนังสือเชิญ + ตารางนัด','todo'],
      ['4.2.2.2','4.2.2','ทำแบบสัมภาษณ์แยกกลุ่ม','คำถามร่วม + คำถามเฉพาะกลุ่ม ครอบคลุม Gap 7 ด้าน Operating Model และความยินดีจ่าย · ทดลองใช้ 2 ราย แล้วปรับ','O4.2-3','Trade Lead, BA','M1','interview guide ฉบับใช้จริง','todo'],
      ['4.2.2.3','4.2.2','สัมภาษณ์และบันทึก','ไป 2 คน (ถาม + จด) · ขออนุญาตบันทึกเสียง · ส่งบันทึกภายใน 2 วันทำการ · อัปเดต tracker จำนวนที่ทำแล้ว/เป้า ทุกสัปดาห์','O4.2-3','Trade Lead, BA','M1–M3','บันทึกรายราย + tracker ครบ ≥ 20','todo'],
      ['4.2.2.4','4.2.2','จัด Focus Group/Workshop','นำเสนอร่าง Landscape, Gap, Ref. Arch. ให้ผู้เข้าร่วมยืนยันหรือแย้ง · จัดร่วมกับรับฟัง As-Is (4.3.4.1) ได้','O4.2-3','Event, Trade Lead','M3','ใบลงทะเบียน ภาพ สรุปความเห็น','todo'],
      ['4.2.2.5','4.2.2','สังเคราะห์ผล','ถอดประเด็นจากบันทึกทุกรายลงตารางตาม Gap 7 ด้าน · นับความถี่ · ยกคำพูดสำคัญ','O4.2-3, O4.2-4','BA','M3','ตารางสังเคราะห์ประเด็น','todo'],
      ['4.2.3.1','4.2.3','ทำ Gap matrix 7 ด้าน','ต่อด้าน: สภาพปัจจุบัน · เป้าหมาย · ช่องว่าง · ผลกระทบ · ความเร่งด่วน · ผู้รับผิดชอบ · จัดลำดับด้วยผลกระทบ × ความยาก · ผู้เชี่ยวชาญแต่ละด้านเป็นคนเติม','O4.2-4','Trade Lead + ผู้เชี่ยวชาญ','M2–M3','Gap matrix ที่จัดลำดับแล้ว','todo'],
      ['4.2.3.2','4.2.3','ร่าง Reference Architecture','ใช้ component 4 กลุ่ม (Trust, Identity & Discovery, Exchange & Access, Semantics) + federated services · ระบุจุดเชื่อม NSW, e-Phyto, TLX, DBD · ไม่ผูกผลิตภัณฑ์หรือผู้ขายรายใด','O4.2-5','Solution Arch.','M2–M3','แผนภาพ + คำอธิบาย component','todo'],
      ['4.2.3.3','4.2.3','ขอความเห็นชอบ Ref. Arch.','นำเสนอใน Focus Group และประชุม ETDA · ปรับตามความเห็น · ต้องได้ความเห็นชอบก่อน 4.4 เริ่ม','O4.2-5','Solution Arch., PM','M3','บันทึกประชุมที่ระบุว่า ETDA เห็นชอบ','todo'],
      ['4.2.4a.1','4.2.4a','ร่าง Roadmap ฉบับตั้งต้น','แปลง gap ที่จัดลำดับแล้วเป็นงานระยะสั้น (≤ 1 ปี) กลาง (1–3 ปี) ยาว (3–5 ปี) · เขียนครบ 9 หัวข้อ · KPI ที่วัดได้ต่อระยะ','O4.2-7','Trade Lead','M3','Roadmap ฉบับตั้งต้นใน Interim 1','todo'],
      ['4.2.4b.1','4.2.4b','ปรับเป็น Roadmap ฉบับสมบูรณ์','ใส่ผลนำร่อง (4.7.3) ผลรับฟังร่างมาตรฐาน (4.5.3) และข้อเสนอ Operating/Business Model (4.2.5) · ทบทวนกับ ETDA ก่อนรวมเข้า Final Report','O4.2-7','Trade Lead, PM','M7–M8','Roadmap ฉบับสมบูรณ์ใน Final Report','todo'],
      ['4.2.5.1','4.2.5','กำหนดทางเลือก Operating Model','ใช้กรณีต่างประเทศจาก 4.2.1.3 · ทางเลือก ≥ 3 แบบ เช่น รัฐดำเนินการเอง, federated (registry/resolver กลาง + ผู้ให้บริการเอกชน), PPP · เกณฑ์เทียบ: ความน่าเชื่อถือ ต้นทุน ความเร็ว ความยั่งยืนทางการเงิน อำนาจตามกฎหมาย','O4.2-6','Trade Lead','M2–M3','ตารางทางเลือก + เกณฑ์ ใน Interim 1','todo'],
      ['4.2.5.2','4.2.5','ระบุผู้ดูแลแต่ละ component','ต่อ component (Trust Registry, IDR, Registry, มาตรฐาน, Gateway): ใครเป็นเจ้าภาพ ใครดำเนินการ ฐานอำนาจตามกฎหมาย · หารือหน่วยงานที่เป็นไปได้ เช่น ETDA สมอ. กรมวิชาการเกษตร','O4.2-6','Legal, Trade Lead','M3–M6','ตารางบทบาทระดับประเทศ + บันทึกหารือ','todo'],
      ['4.2.5.3','4.2.5','ทำ Business Model และประมาณการเงิน','ต้นทุนตั้งต้นและรายปีจากต้นทุนจริงของ Prototype (Cloud, คน) · แหล่งรายได้: ค่าลงทะเบียน/ออก ID, ค่ารับรองผู้ให้บริการ, API, บริการเสริม · ถามความยินดีจ่ายจากผู้ให้สัมภาษณ์และผู้ร่วมนำร่อง · หาจุดคุ้มทุนและช่วงที่ต้องใช้งบรัฐ','O4.2-6','Trade Lead, PM','M5–M8','แบบจำลองการเงิน (spreadsheet) + สรุปข้อเสนอ','todo'],
      ['4.3.1.1','4.3.1','รวบรวมเอกสารจริง','ขอตัวอย่างเอกสารการค้าและเอกสารภาครัฐจริงตลอดเส้นทางจากผู้ส่งออก 2–3 ราย เช่น ใบรับรอง GAP/GMP ใบรับซื้อ packing list invoice e-Phyto ใบขน ผลตรวจห้องแล็บ · ปิดข้อมูลส่วนบุคคลก่อนเก็บ','O4.3-2','BA, Durian Expert','M1–M2','คลังตัวอย่างเอกสาร','todo'],
      ['4.3.1.2','4.3.1','ทำ Document & Data Inventory','ตารางต่อเอกสาร: ผู้สร้าง ผู้ออก ผู้รับ ผู้ใช้ ขั้นที่เกิด รูปแบบ (กระดาษ/ดิจิทัล) ระบบที่เก็บ data element หลัก','O4.3-2','BA','M2','ตาราง inventory','todo'],
      ['4.3.1.3','4.3.1','วาด Supply Chain Map และ As-Is','BPMN 3 ระดับ: สถานประกอบการ ล็อต การจัดส่ง · ยืนยันกับผู้ปฏิบัติงานจริง','O4.3-1, O4.3-3','BA, Durian Expert','M2–M3','แผนภาพห่วงโซ่ + BPMN','todo'],
      ['4.3.1.4','4.3.1','วัดค่า baseline','เก็บตัวเลขที่จะใช้เทียบใน 4.7: เวลาเตรียมเอกสารต่อ shipment จำนวนเอกสาร จำนวนครั้งที่กรอกข้อมูลซ้ำ จุดที่เกิดข้อผิดพลาด','O4.3-3','BA','M2–M3','ตาราง baseline พร้อมแหล่งตัวเลข','todo'],
      ['4.3.2a.1','4.3.2a','วางแผนลงพื้นที่ไทย','เลือกสวน ≥ 3 ล้ง/โรงคัด ≥ 2 ผู้ส่งออก ≥ 2 ในจันทบุรี/ระยอง · ประสานกรมวิชาการเกษตรในพื้นที่ · ทำ checklist สิ่งที่ต้องสังเกตและถาม','O4.3-4','BA, PMO','M2','กำหนดการที่ยืนยันแล้ว + checklist','todo'],
      ['4.3.2a.2','4.3.2a','ลงพื้นที่ไทยและสรุป','สังเกตกระบวนการจริง ถ่ายภาพเอกสาร/ระบบ ยืนยัน pain point · ดูระบบ traceability เดิม (เช่น ของ NECTEC) · นอกฤดูให้เน้นสัมภาษณ์ แล้วสังเกตซ้ำช่วงต้นฤดูใน 4.7.1.3','O4.3-4','BA, Durian Expert','M2','บันทึกลงพื้นที่ + ภาพ + รายการ pain point','todo'],
      ['4.3.2b.1','4.3.2b','ประสานและนัดฝั่งจีน','ผ่าน ETDA และผู้ประสานงานจีน · เป้าหมาย: ด่าน/GACC ผู้นำเข้า ผู้กระจายสินค้า ผู้ให้บริการระบบ · ส่งคำถามล่วงหน้าเป็นภาษาจีน · เลี่ยงช่วงตรุษจีน','O4.3-4','ผู้ประสานงานจีน, PM','M3','กำหนดการที่ฝั่งจีนยืนยัน','todo'],
      ['4.3.2b.2','4.3.2b','ลงพื้นที่จีนร่วมกับ สพธอ.','เก็บ: เอกสาร/ข้อมูลที่ด่านตรวจ ระบบที่ใช้ ความพร้อมรับข้อมูลดิจิทัล · หาผู้นำเข้าที่ยินดีร่วมนำร่อง 4.7','O4.3-4, O4.3-7','PM, BA, ผู้ประสานงานจีน','M3–M4','รายงานลงพื้นที่ + รายชื่อผู้นำเข้าที่สนใจร่วม','todo'],
      ['4.3.3.1','4.3.3','สรุป Pain Point, Bottleneck และ Value Proposition','หาจุดคอขวดจาก As-Is (เวลารอ ตรวจซ้ำ ส่งเอกสารกระดาษ) · ต่อบทบาท: ปัญหา · สิ่งที่ DPP ช่วย · ประโยชน์ที่วัดได้ · ใครจ่าย ใครได้ · รวมประเด็นความยั่งยืน','O4.3-5','BA, Trade Lead','M3–M4','ตาราง pain point/value รายบทบาท','todo'],
      ['4.3.3.2','4.3.3','ออกแบบ To-Be','ระบุว่า DPP/DCC/DFR/DTE แทนเอกสารหรือขั้นตอนใด · ดึงข้อมูลจากระบบเดิมแทนการกรอกใหม่ · ทำ BPMN เทียบกับ As-Is','O4.3-6','BA, Solution Arch.','M3–M4','BPMN To-Be + ตารางเทียบ As-Is','todo'],
      ['4.3.3.3','4.3.3','เขียน Cross-Border Requirements และ DPP–Invoice linking','data element ที่ปลายทางต้องการ ช่องทาง รูปแบบ ภาษา ความปลอดภัย สิทธิ์ · หารือทีม TLX ว่าจะอ้าง DPP ID ใน invoice อย่างไร','O4.3-7','Solution Arch., BA','M4','เอกสาร requirements ที่ทีม TLX ทบทวนแล้ว','todo'],
      ['4.3.3.4','4.3.3','กำหนดเอกสาร/ข้อมูลที่เป็น Data Message','ต่อเอกสารใน Inventory: ส่งเป็นข้อมูลอิเล็กทรอนิกส์ แนบไฟล์ หรือแทนด้วย DPP/credential · ตรวจผลทางกฎหมายตาม พ.ร.บ. ธุรกรรมทางอิเล็กทรอนิกส์ และการยอมรับฝั่งจีน · เลือกรูปแบบข้อมูลมาตรฐาน','O4.3-7','BA, Legal','M4','ตารางเอกสาร → รูปแบบ Data Message พร้อมเหตุผล','todo'],
      ['4.3.3.5','4.3.3','ออกแบบเส้นทาง End-to-End แบตเตอรี่ → EU','desk study จาก Battery Regulation/ESPR + สัมภาษณ์ ENTEC และผู้ผลิต · supply chain เอกสารและข้อมูลที่ต้องมี As-Is/To-Be ระดับแนวคิด · ไม่ต้องมีธุรกรรมจริง','O4.3-9','BA, Battery Expert','M3–M4','แผนภาพเส้นทาง + To-Be แบตเตอรี่','todo'],
      ['4.3.4.1','4.3.4','รับฟังรอบ As-Is','นำเสนอ Supply Chain Map, Inventory, As-Is · จัดร่วมกับ Focus Group 4.2.2.4 ได้ · บันทึกความเห็นทุกข้อ','O4.3-8','BA, PMO','M3','ใบลงทะเบียน ภาพ ตารางความเห็น → การปรับ','todo'],
      ['4.3.4.2','4.3.4','รับฟังรอบ To-Be','นำเสนอ Pain Point, Value Proposition, To-Be, Requirements · เชิญผู้ส่งออก หน่วยงานรัฐ ทีม TLX และ NSW','O4.3-8','BA, PMO','M4','ใบลงทะเบียน ภาพ ตารางความเห็น → การปรับ','todo'],
      ['4.4.1.1','4.4.1','รวบรวม data requirement','ดึงจาก Inventory (4.3.1.2) ตาราง requirement EU/จีน (4.2.1.2) และ UNTP DPP · ทำ long list element พร้อมที่มา','O4.4-1','Data Arch.','M3','long list element','todo'],
      ['4.4.1.2','4.4.1','ออกแบบ Core Data Model','แยก core (ใช้ได้ทุกสาขา) กับ sector-specific · จัดเป็น 5 กลุ่ม · ใช้ vocabulary ของ UNTP ก่อนสร้างใหม่ · ทำ JSON Schema + JSON-LD context','O4.4-1','Data Arch.','M3–M4','แผนภาพ model + ไฟล์ schema','todo'],
      ['4.4.1.3','4.4.1','เขียน Data Dictionary + mapping','ทุก element: ชื่อ TH/EN นิยาม ชนิด บังคับ/ทางเลือก code list ผู้ออก ระดับสิทธิ์ mapping UNTP/GS1/EU/จีน','O4.4-2','Data Arch., Standards','M4','Data Dictionary (spreadsheet)','todo'],
      ['4.4.2.1','4.4.2','ทำ Durian Profile','element เฉพาะ เช่น พันธุ์ แปลง GAP วันเก็บ โรงคัดบรรจุ ผลตรวจ เลข e-Phyto อ้างอิง invoice · ระบุแหล่งข้อมูลและระดับสิทธิ์ · ทบทวนกับผู้ส่งออก','O4.4-3','Data Arch., Durian Expert','M4','Profile + ไฟล์ตัวอย่างที่ผ่าน schema','todo'],
      ['4.4.2.2','4.4.2','ทำ Battery Profile','map ข้อมูลที่ Battery Regulation กำหนดเป็น element · แบ่งระดับสิทธิ์ สาธารณะ / ผู้มีส่วนได้เสียโดยชอบ / หน่วยงานกำกับ · ใช้ข้อมูลตัวอย่าง ทบทวนกับ ENTEC','O4.4-4','Data Arch., Battery Expert','M4','Profile + ไฟล์ตัวอย่างที่ผ่าน schema','todo'],
      ['4.4.3.1','4.4.3','กำหนด Identifier & Data Carrier','GS1 Digital Link (GTIN + lot) เป็นหลัก · ทางเลือก URI สำหรับผู้ไม่มี GTIN · เทียบ QR, NFC, RFID ด้านต้นทุนและการใช้งาน (ทุเรียน: QR บนกล่อง/พาเลท · แบตเตอรี่: QR บนตัวเครื่องหรือ RFID)','O4.4-5','Solution Arch., Standards','M4','spec ตัวระบุ + ตัวอย่าง QR','todo'],
      ['4.4.3.2','4.4.3','ออกแบบ ID Resolver + Repository & API','resolver ตาม ISO/IEC 18975 (link types, linkset) · API สร้าง/แก้/ดึง/เพิกถอน DPP ลงทะเบียนลิงก์ ตรวจสอบ · เขียน OpenAPI 3 และ validate','O4.4-5, O4.4-6','Solution Arch.','M4–M5','ไฟล์ OpenAPI ที่ validate ผ่าน','todo'],
      ['4.4.3.3','4.4.3','ออกแบบ Security & Access Control','การลงนาม credential · status list · สิทธิ์ตามบทบาท · การเข้ารหัสข้อมูลลับ · threat model · ตรวจกับ PDPA','O4.4-5','Solution Arch., Legal','M4–M5','spec ความปลอดภัย + threat model','todo'],
      ['4.4.3.4','4.4.3','เขียน Interface Specification','จุดเชื่อม NSW, e-Phyto, TLX, traceability เดิม · ส่งหนังสือขอ spec/sandbox ในนาม สพธอ. ตั้งแต่ M3 · ถ้าไม่ได้ภายใน M4 ให้ใช้ mock ที่โครงสร้างเดียวกัน','O4.4-5','Solution Arch., PMO','M3–M5','interface spec + สถานะการขอเข้าถึงแต่ละระบบ','todo'],
      ['4.4.3.5','4.4.3','Map DPP กับ Cross-Border Process','ไล่ทุกขั้นใน To-Be (4.3.3.2): สร้าง/อ่าน credential ใด ใครทำ ผ่าน interface ไหน · ตรวจว่าทุก requirement ข้ามพรมแดน (4.3.3.3) มี data element รองรับ','O4.4-8','Data Arch., BA','M4–M5','ตาราง mapping ขั้นตอน ↔ DPP ↔ interface','todo'],
      ['4.4.4.1','4.4.4','ทบทวนกับผู้เชี่ยวชาญและ freeze v1.0','Focus Group ครอบคลุม core ทุเรียน แบตเตอรี่ (ENTEC, NECTEC, GS1, กรมวิชาการเกษตร) · ตารางความเห็น → การปรับ · ประกาศ v1.0 ให้ 4.5 และ 4.6 ใช้','O4.4-7','Data Arch., PMO','M5','ตารางความเห็น + บันทึกประกาศ v1.0','todo'],
      ['4.5.1.1','4.5.1','หารือ สมอ.','ถาม: ประเภทมาตรฐาน แม่แบบ ขั้นตอนเสนอ คณะกรรมการที่เกี่ยวข้อง ระยะเวลา · ขอแม่แบบมาใช้ตั้งแต่ร่างแรก','O4.5-1','Standards, PM','M4','บันทึกการประชุม + แม่แบบ สมอ.','todo'],
      ['4.5.1.2','4.5.1','ทำ Standards Mapping','ต่อข้อกำหนด: อ้างอิงมาตรฐานสากลใด รับมาทั้งหมด ปรับ หรือกำหนดใหม่ พร้อมเหตุผล','O4.5-2','Standards','M4–M5','ตาราง mapping','todo'],
      ['4.5.1.3','4.5.1','เขียนร่าง 8 หมวด','ใช้เนื้อหาจาก 4.4 v1.0 · เขียนข้อกำหนดแบบ "ต้อง/ควร/อาจ" ที่ทดสอบได้ · ทบทวนภายในกับ Data Arch. และ Solution Arch.','O4.5-3','Standards','M5','ร่างฉบับ 0.x ครบ 8 หมวด','todo'],
      ['4.5.2.1','4.5.2','ทำ Checklist และ Test Cases','ทุกข้อ "ต้อง" → รายการตรวจ 1 ข้อ + test case (input, ผลที่คาด) · ทดลองตรวจกับ Prototype 4.6 เพื่อพิสูจน์ว่าใช้ได้จริง','O4.5-4','Standards, QA','M5–M6','checklist + test cases + Conformance Report','todo'],
      ['4.5.3.1','4.5.3','จัดรับฟังร่างมาตรฐาน','ประชุม ≥ 1 ครั้ง + เปิดรับความเห็นเป็นลายลักษณ์อักษร 2 สัปดาห์ · กลุ่ม: ภาครัฐ มาตรฐาน ผู้เชี่ยวชาญ เอกชน','O4.5-5','Standards, PMO','M6–M7','ใบลงทะเบียน + ความเห็นที่ได้รับ','todo'],
      ['4.5.3.2','4.5.3','พิจารณาความเห็นและปรับร่าง','ตอบทุกความเห็น: รับ/ไม่รับ + เหตุผล · ปรับร่าง checklist และ mapping ให้ตรงกัน','O4.5-3, O4.5-5','Standards','M7','Stakeholder Consultation Report + ร่างที่ปรับแล้ว','todo'],
      ['4.5.4.1','4.5.4','ประกอบ Submission Package','ร่างฉบับสมบูรณ์ + mapping + checklist + ผลรับฟัง + หลักการและเหตุผล · ให้ สมอ. ตรวจรูปแบบก่อนส่งจริง','O4.5-6','Standards','M7–M8','ชุดเอกสารที่ สมอ. ตรวจรูปแบบแล้ว','todo'],
      ['4.6.1.1','4.6.1','ทำ Use case, Role, Journey','ดึงจาก To-Be (4.3.3.2) · journey ต่อบทบาท: ผู้ส่งออก โรงคัด กรมวิชาการเกษตร ผู้ตรวจปลายทาง ผู้นำเข้า ผู้บริโภค · แบตเตอรี่: ผู้ผลิต CB recycler','O4.6-1','BA, UX','M4','เอกสาร use case + journey','todo'],
      ['4.6.1.2','4.6.1','ทำ Architecture และ UI mockup','architecture ตาม Ref. Arch. และ spec 4.4 · mockup TH/EN/ZH · ETDA เห็นชอบก่อนเริ่มพัฒนา','O4.6-1','Solution Arch., UX','M4–M5','mockup + บันทึกความเห็นชอบ','todo'],
      ['4.6.2.1','4.6.2','ตั้ง environment','repo, CI/CD, dev/test/prod บน Cloud · พร้อมตั้งแต่ต้นช่วงพัฒนา','O4.6-6','DevOps','M4–M5','environment ใช้งานได้ + pipeline รันผ่าน','todo'],
      ['4.6.2.2','4.6.2','พัฒนา Core','ออก/ลงนาม credential · repository · resolver + link registry · status list · สิทธิ์ · lifecycle · traceability · API ตาม OpenAPI v1.0 · ใช้ open source ที่มีอยู่ · sprint 2 สัปดาห์ demo ให้ ETDA ทุก sprint','O4.6-2','Dev','M4–M6','demo ทุก sprint + API ผ่าน contract test','todo'],
      ['4.6.2.3','4.6.2','พัฒนา Durian module','หน้าจอ/นำเข้าข้อมูลตาม To-Be · อ้าง DPP ID ใน invoice ผ่าน TLX · ต่อ traceability เดิม (หรือ mock ถ้ายังไม่ได้สิทธิ์)','O4.6-3','Dev','M5–M6','demo ครบ journey ทุเรียน','todo'],
      ['4.6.2.4','4.6.2','พัฒนา Battery module และ UI 3 ภาษา','Battery End-to-End: สร้าง DPP ลงทะเบียน เรียกดู ควบคุมสิทธิ์ lifecycle ด้วยข้อมูลตัวอย่าง · UI TH/EN/ZH ให้ผู้ประสานงานจีนตรวจภาษาจีน','O4.6-2, O4.6-4','Dev, ผู้ประสานงานจีน','M5–M6','demo แบตเตอรี่ + UI 3 ภาษา','todo'],
      ['4.6.3.1','4.6.3','ทดสอบระบบ','test plan · System · Integration/API เทียบ OpenAPI · Security อย่างน้อย OWASP Top 10 · Conformance ด้วย checklist 4.5 · บันทึก defect','O4.6-5','QA','M6','test report + defect log','todo'],
      ['4.6.3.2','4.6.3','ทดลองใช้กับผู้เกี่ยวข้องทุเรียน','ผู้ส่งออก/โรงคัดที่จะร่วม 4.7 ลองใช้ด้วยข้อมูลจริง · เก็บปัญหาการใช้งาน · ปิด defect critical/high ให้หมดก่อนธุรกรรมจริง','O4.6-5','QA, BA','M6','ผลทดลองใช้ + defect ที่ปิดแล้ว','todo'],
      ['4.6.3.3','4.6.3','Validation กับผู้เกี่ยวข้อง','demo Prototype ทั้งทุเรียนและแบตเตอรี่ให้ผู้ส่งออก กรมวิชาการเกษตร ENTEC ผู้ผลิตแบตเตอรี่ และ ETDA ลองใช้ · เก็บความเห็นด้วยแบบฟอร์มเดียวกัน · สรุปสิ่งที่แก้','O4.6-9','BA, Solution Arch.','M6','Stakeholder Validation Report','todo'],
      ['4.6.4.1','4.6.4','ติดตั้ง Cloud และส่งมอบ','deploy production · ส่ง source code, schema, API spec, คู่มือผู้ใช้/ผู้ดูแล/ติดตั้ง, test data · ตกลงระยะดูแล Cloud หลังจบกับ ETDA','O4.6-6, O4.6-7','DevOps, Tech Writer','M7–M8','ใบส่งมอบที่ ETDA ลงนาม','todo'],
      ['4.6.4.2','4.6.4','ถ่ายทอดความรู้ ETDA','อบรมแบบลงมือ: ติดตั้ง ดูแล แก้ไข เพิ่ม profile · ให้ทีม ETDA deploy เองได้ 1 รอบ','O4.6-8','Solution Arch., DevOps','M8','รายชื่อผู้อบรม + ผลประเมิน + ETDA deploy สำเร็จ','todo'],
      ['4.7.1.1','4.7.1','กำหนดแผนธุรกรรมกับ ETDA','จำนวน shipment ผู้เข้าร่วม เส้นทาง ช่วงเวลา (ทุเรียนออกมาก เม.ย.–พ.ค.) เกณฑ์สำเร็จ แผนสำรอง · ตัดสินใจร่วมกับ ETDA ใน M5','O4.7-1','PM','M5','แผนธุรกรรมที่ ETDA เห็นชอบ','todo'],
      ['4.7.1.2','4.7.1','หาผู้เข้าร่วมและทำข้อตกลง','ผู้ส่งออก 2–3 รายจากการลงพื้นที่ + ผู้นำเข้าจาก 4.3.2b · หนังสือตอบรับร่วมโครงการ + ความยินยอมใช้ข้อมูล (PDPA)','O4.7-2','PM, ผู้ประสานงานจีน','M5–M6','หนังสือตอบรับที่ลงนาม','todo'],
      ['4.7.1.3','4.7.1','ลงพื้นที่รอบ 2 ต้นฤดู','สังเกตกระบวนการจริงช่วงเริ่มเก็บเกี่ยว ยืนยัน To-Be · ตรวจความพร้อมของผู้ส่งออกแต่ละราย','O4.7-2','BA, Durian Expert','M5','บันทึกลงพื้นที่ + ผลตรวจความพร้อม','todo'],
      ['4.7.1.4','4.7.1','เตรียมบัญชี Data Carrier และอบรม','สร้างบัญชี/คีย์ลงนาม · พิมพ์ QR · อบรมผู้ใช้ไทยและจีน (ภาษาจีนสำหรับผู้นำเข้า) · ซ้อมครบเส้นทางด้วยข้อมูลทดสอบ 1 รอบ','O4.7-2','BA, Dev, ผู้ประสานงานจีน','M6','checklist ความพร้อมผ่านทุกข้อ + ผลการซ้อม','todo'],
      ['4.7.2.1','4.7.2','ดำเนินธุรกรรมตาม runbook','ขั้นต่ำต้องแลก DPP + เอกสารการค้า ≥ 1 ประเภท · ต่อ shipment: สร้าง DPP ของล็อต → ติด QR → อ้าง e-Phyto → ส่ง invoice ผ่าน TLX พร้อม DPP ID → ปลายทางสแกน/เรียก API → ยืนยันรับ · ทีมเฝ้าระบบระหว่างธุรกรรม','O4.7-3','PM, Dev, ผู้ประกอบการ','M6–M7','checklist ต่อ shipment ครบทุกขั้น','todo'],
      ['4.7.2.2','4.7.2','เก็บหลักฐาน','log API ภาพหน้าจอ เวลา ต่อขั้น · ยืนยันจากผู้นำเข้า/ด่านว่าเข้าถึงข้อมูล · บันทึกปัญหาและวิธีแก้','O4.7-3','Dev, BA','M6–M7','แฟ้มหลักฐานต่อ shipment + incident log','todo'],
      ['4.7.3.1','4.7.3','เขียน Pilot Report','วัดตัวชี้วัดเดียวกับ baseline (4.3.1.4) · แบบสอบถาม/สัมภาษณ์ผู้เข้าร่วม · วิเคราะห์ปัญหาและข้อจำกัด 5 ด้าน: กระบวนการ ข้อมูล เทคโนโลยี กฎหมาย การปฏิบัติงาน','O4.7-4','BA, Trade Lead','M7–M8','Pilot Report พร้อมตัวเลขเทียบ baseline','todo'],
      ['4.7.3.2','4.7.3','เขียน Gap/Recommendation และ Scaling Roadmap','ข้อเสนอแก้ปัญหาแต่ละด้านเพื่อใช้งานจริง · สินค้าและประเทศถัดไป เงื่อนไข ลำดับ ต้นทุน · ส่งเข้า Roadmap ฉบับสมบูรณ์ (4.2.4b) และ Business Model (4.2.5.3)','O4.7-5','Trade Lead','M8','Gap/Recommendation + Scaling Roadmap','todo'],
    ],
  };

  /* ---------- plan page: legend, Gantt, WBS, scope cards ---------- */
  function renderPlan(d){
    const WS=d.WS, n=d.MONTHS.length||8, color=k=>(WS[k]||{c:'--ws0'}).c;
    const axisStart=Date.UTC(PLAN_START.year,PLAN_START.month,1), axisEnd=Date.UTC(PLAN_START.year,PLAN_START.month+n+1,1);
    const datePct=time=>((time-axisStart)/(axisEnd-axisStart)*100).toFixed(4)+'%';
    const pct=m=>datePct(projectDate(m));
    const span=(s,e)=>`left:${pct(s)};width:calc(${pct(e)} - ${pct(s)})`;
    const calendar=Array.from({length:n+1},(_,i)=>{
      const start=Date.UTC(PLAN_START.year,PLAN_START.month+i,1), end=Date.UTC(PLAN_START.year,PLAN_START.month+i+1,1);
      const label=new Intl.DateTimeFormat('th-TH',{month:'short',year:'2-digit',timeZone:'UTC'}).format(new Date(start));
      return {start,end,label};
    });
    const columns=calendar.map(m=>`${(m.end-m.start)/DAY}fr`).join(' ');
    const grid=calendar.slice(1).map(m=>`linear-gradient(90deg,transparent calc(${datePct(m.start)} - 1px),var(--line) calc(${datePct(m.start)} - 1px),var(--line) ${datePct(m.start)},transparent ${datePct(m.start)})`).join(',');
    const trackStyle=`background-image:${grid};background-size:100% 100%`;
    const period=(s,e)=>`${dateLabel(projectDate(s))} – ${dateLabel(Math.ceil(projectDate(e)/DAY)*DAY-DAY)}`;

    fill('legend',Object.entries(WS).map(([k,w])=>`<span style="--c:var(${esc(w.c)})"><i></i>${esc(k)} ${esc(w.n)}</span>`).join(''));

    let h=`<div class="g-head"><div class="g-lab" style="font-weight:600">กิจกรรม · เริ่มประมาณ 25 พ.ย. 69</div><div class="g-months" style="grid-template-columns:${columns}">${calendar.map((m,i)=>`<div>${esc(m.label)}<b>${i<n?`M${i+1} เริ่มวันที่ 25`:'สิ้นสุด 24 ก.ค.'}</b></div>`).join('')}</div></div>`;
    Object.entries(WS).forEach(([k,w])=>{
      const acts=d.A.filter(a=>a[1]===k), c=esc(w.c);
      const bar=acts.length?`<span class="g-bar" style="${span(Math.min(...acts.map(a=>a[3])),Math.max(...acts.map(a=>a[4])))}"></span>`:'';
      const ms=d.MS.filter(m=>m[0]===k).map(m=>`<span class="g-ms" style="--c:var(${c});left:${pct(m[1])}" title="${esc(m[2])} · ${esc(dateLabel(projectDate(m[1])))}"></span>`).join('');
      const flags=d.FLAGS.filter(f=>f[0]===k).map(f=>`<span class="g-flag" style="left:${f[2].includes('18 ก.พ. 2027')?datePct(Date.UTC(2027,1,18)):pct(f[1])}" title="${esc(f[2])}"></span>`).join('');
      h+=`<div class="g-row grp" style="--c:var(${c})"><div class="g-lab"><span class="i">${esc(k)}</span>${esc(w.n)}</div><div class="g-track" style="${trackStyle}">${bar}${ms}${flags}</div></div>`;
      acts.forEach(a=>{h+=`<div class="g-row" style="--c:var(${c})"><div class="g-lab"><span class="i">${esc(a[0])}</span>${esc(a[2])}</div><div class="g-track" style="${trackStyle}"><span class="g-bar" title="${esc(a[2])} · ${esc(period(a[3],a[4]))}" style="${span(a[3],a[4])}"></span></div></div>`});
    });
    fill('gantt',h);

    const wbs=document.querySelector('#wbs tbody');
    if(wbs)wbs.innerHTML=d.A.map(a=>`<tr><td class="id" style="color:var(${esc(color(a[1]))})">${esc(a[0])}</td><td>${esc(a[2])}</td><td class="id">${mlabel(a[3],a[4],n)}<br>${esc(period(a[3],a[4]))}</td><td>${esc(a[5])}</td><td>${esc(a[6])}</td></tr>`).join('');

    fill('scopes',d.SC.map(([k,t,when,items])=>`<div class="card ws" style="--c:var(${esc(color(k))})"><div class="hd"><span class="code">${esc(k)}</span><h3>${esc(t)}</h3><span class="when">${esc(when)}</span></div>${items.map(([a,b])=>`<h4>${esc(a)}</h4><p>${esc(b)}</p>`).join('')}</div>`).join(''));
  }
  const mlabel=(s,e,n)=>{const a=Math.floor(s),b=Math.min(n,Math.floor(e-0.001));return a===b?`M${a}`:`M${a}–M${b}`};

  /* ---------- outputs & activities page ---------- */
  const STATUS={todo:'ยังไม่เริ่ม',doing:'กำลังทำ',done:'เสร็จ',blocked:'ติดปัญหา'};
  let work=null, canEdit=false, sb=null;   // canEdit: tasks came from Supabase, so their ids exist in the database
  const stampFmt=iso=>{try{return new Intl.DateTimeFormat('th-TH',{dateStyle:'medium',timeStyle:'short',timeZone:'Asia/Bangkok'}).format(new Date(iso))}catch(e){return String(iso)}};
  function statusCell(x){
    const s=x[8], stamp=x[9]?`<div class="stamp">${esc(stampFmt(x[9]))}${x[10]?` · ${esc(x[10])}`:''}</div>`:'';
    if(!canEdit)return `<span class="st ${esc(s)}">${esc(STATUS[s]||s)}</span>${stamp}`;
    return `<select class="st ${esc(s)}" data-task="${esc(x[0])}" aria-label="สถานะ ${esc(x[0])}">${Object.entries(STATUS).map(([v,l])=>`<option value="${v}"${v===s?' selected':''}>${l}</option>`).join('')}</select>${stamp}`;
  }
  function renderWork(d){
    work=d;
    const WS=d.WS, n=d.MONTHS.length||8, color=k=>(WS[k]||{c:'--ws0'}).c;
    // Supabase activities first; built-in ones fill in any activity the database does not have yet
    const acts=[...d.A,...FALLBACK.A.filter(a=>!d.A.some(b=>b[0]===a[0]))];
    const wsOf=Object.fromEntries(acts.map(a=>[a[0],a[1]]));
    const tasksOf=k=>d.TASK.filter(t=>wsOf[t[1]]===k);
    const count=(ts,s)=>ts.filter(t=>t[8]===s).length;

    fill('work-summary',d.SC.map(([k,t,when])=>{
      const ts=tasksOf(k), done=count(ts,'done'), blocked=count(ts,'blocked'), pct=ts.length?Math.round(done/ts.length*100):0;
      return `<tr><td class="id" style="color:var(${esc(color(k))})">${esc(k)}</td><td>${esc(t)}</td><td class="id">${esc(when)}</td><td>${d.OUT.filter(o=>o[1]===k).length}</td><td>${ts.length}</td><td><div class="prog" style="--c:var(${esc(color(k))})"><i style="width:${pct}%"></i></div><span class="id">เสร็จ ${done}/${ts.length}${blocked?` · ติดปัญหา ${blocked}`:''}</span></td></tr>`;
    }).join(''));

    fill('work-scopes',d.SC.map(([k,t,when])=>{
      const c=esc(color(k)), [inp,to,watch]=d.SN[k]||[];
      const outs=d.OUT.filter(o=>o[1]===k).map(o=>`<tr><td class="id">${esc(o[0])}</td><td><b>${esc(o[2])}</b></td><td>${esc(o[3])}</td><td class="id">${esc(o[4])}</td></tr>`).join('');
      const rows=acts.filter(a=>a[1]===k).map(a=>{
        const ts=d.TASK.filter(x=>x[1]===a[0]);
        if(!ts.length)return '';
        return `<tr class="sub"><td class="id">${esc(a[0])}</td><td colspan="5"><b>${esc(a[2])}</b> · ${mlabel(a[3],a[4],n)}</td></tr>`+ts.map(x=>`<tr><td class="id">${esc(x[0])}</td><td><b>${esc(x[2])}</b><div class="how">${esc(x[3])}</div>${String(x[4]||'').split(',').map(s=>s.trim()).filter(Boolean).map(o=>`<span class="tag">${esc(o)}</span>`).join('')}</td><td>${esc(x[5])}</td><td class="id">${esc(x[6])}</td><td>${esc(x[7])}</td><td>${statusCell(x)}</td></tr>`).join('');
      }).join('');
      return `<section class="wk" style="--c:var(${c})">
        <h2><span class="code">${esc(k)}</span>${esc(t)}</h2><p class="when">${esc(when)}</p>
        ${inp||to||watch?`<div class="grid3"><div class="card"><h4>รับจาก</h4><p>${esc(inp)}</p></div><div class="card"><h4>ส่งต่อให้</h4><p>${esc(to)}</p></div><div class="card"><h4>ต้องระวัง</h4><p>${esc(watch)}</p></div></div>`:''}
        <h3>Output ที่ต้องส่ง</h3>
        <div class="tbl"><table class="outs"><thead><tr><th>รหัส</th><th>Output</th><th>ต้องมี / ถือว่าครบเมื่อ</th><th>งวด</th></tr></thead><tbody>${outs}</tbody></table></div>
        <h3>กิจกรรมที่ต้องทำและติดตาม</h3>
        ${['4.2','4.3','4.4','4.5','4.6','4.7'].includes(k)?`<figure><img src="img/story-board-${esc(k)}.png" alt="Storyboard กิจกรรม${esc(t)}" loading="lazy"></figure>`:''}
        <div class="tbl"><table class="tasks"><thead><tr><th>รหัส</th><th>กิจกรรมและวิธีทำ</th><th>ผู้รับผิดชอบ</th><th>เดือน</th><th>หลักฐานที่ติดตาม</th><th>สถานะ</th></tr></thead><tbody>${rows}</tbody></table></div>
      </section>`;
    }).join(''));
  }

  /* Supabase rows -> the shapes renderPlan() uses; any table that did not load keeps the built-in data */
  function planFromRows(r){
    const d={...FALLBACK};
    if(r.workstreams)d.WS=Object.fromEntries(bySort(r.workstreams).map(w=>[w.id,{c:w.color_var,n:w.name}]));
    // Calendar labels are derived from the proposed kickoff, including when the database still has older month labels.
    if(r.activities)d.A=bySort(r.activities).map(a=>[a.id,a.ws_id,a.name,+a.start_month,+a.end_month,a.output,a.owner]);
    if(r.milestones){
      const ms=bySort(r.milestones);
      d.MS=ms.filter(m=>m.kind!=='flag').map(m=>[m.ws_id,+m.month,m.label]);
      d.FLAGS=ms.filter(m=>m.kind==='flag').map(m=>[m.ws_id,+m.month,m.label]);
    }
    if(r.scopes){
      const items=bySort(r.scope_items||[]);
      d.SC=bySort(r.scopes).map(s=>[s.id,s.title,s.period,items.filter(i=>i.scope_id===s.id).map(i=>[i.heading,i.body])]);
      // columns added later: a database that has not re-run setup.sql keeps the built-in notes
      d.SN={...FALLBACK.SN,...Object.fromEntries(r.scopes.filter(s=>s.inputs||s.outputs_to||s.watch_out).map(s=>[s.id,[s.inputs,s.outputs_to,s.watch_out]]))};
    }
    if(r.scope_outputs)d.OUT=bySort(r.scope_outputs).map(o=>[o.id,o.scope_id,o.name,o.done_when,o.deliverable]);
    if(r.scope_tasks)d.TASK=bySort(r.scope_tasks).map(t=>[t.id,t.activity_id,t.name,t.how,t.output_ids,t.owner,t.period,t.evidence,t.status,t.status_changed_at,t.status_changed_by]);
    return d;
  }

  /* ---------- HTML tables in index.html: the static rows stay until Supabase rows arrive ---------- */
  const RACI_COLS=['etda','pm','trade_lead','ba','standards','data_arch','solution_arch','dev_qa','china'];
  const TABLES={
    key_dates:['t-key-dates',r=>`<tr><td class="id">${esc(r.when_label)}</td><td>${esc(r.event)}</td><td>${esc((r.impact||'').replace('ตรงกับเดือนที่ 4 ของโครงการ','ตรงกับเดือนที่ 3 ของโครงการ (M3)'))}</td></tr>`],
    untp_pillars:['t-untp',r=>`<tr><td><b>${esc(r.pillar)}</b></td><td>${(r.components||[]).map(c=>`<code>${esc(c)}</code>`).join(' ')}</td><td>${esc(r.role)}</td></tr>`],
    case_comparison:['t-cases',r=>`<tr><td><b>${esc(r.aspect)}</b></td><td>${esc(r.durian_china)}</td><td>${esc(r.battery_eu)}</td></tr>`],
    deliverables:['t-deliverables',r=>`<tr><td class="id">${esc(r.code)}</td><td>${esc(dueLabel(r.month_code,r.due_label))} (${esc(r.month_code)})</td><td><b>${esc(r.title)}</b>: ${esc(r.content)}</td><td>${esc(r.scope_text)}</td></tr>`],
    risks:['t-risks',r=>`<tr><td>${esc(r.risk)}</td><td>${esc(r.impact)}</td><td>${esc(r.mitigation)}</td></tr>`],
    team_roles:['t-team',r=>`<tr><td><b>${esc(r.role)}</b>${r.tor_required?' <span class="pill">TOR</span>':''}</td><td>${esc(r.duties)}</td><td>${esc(r.scope_text)}</td><td>${esc(r.period)}</td></tr>`],
    raci:['t-raci',r=>`<tr><td>${esc(r.label)}</td>${RACI_COLS.map(c=>r[c]?`<td class="${esc(r[c])}">${esc(r[c])}</td>`:'<td class="C">–</td>').join('')}</tr>`],
    stakeholder_activities:['t-stakeholder-acts',r=>`<tr><td class="id">${esc(r.period)}</td><td>${esc(r.activity)}</td><td>${esc(r.participants)}</td></tr>`],
  };

  /* ---------- data source badge (sidebar footer) ---------- */
  function status(kind,text){
    const el=$('datasrc');if(!el)return;
    el.className='datasrc '+kind;el.textContent=text;
  }

  /* ---------- load from Supabase ---------- */
  const PLAN_TABLES=['workstreams','project_months','activities','milestones','scopes','scope_items','scope_outputs','scope_tasks'];
  async function load(){
    const cfg=window.DPP_CONFIG||{};
    if(!cfg.supabaseUrl||!cfg.supabaseKey){status('off','ข้อมูลในเว็บ (ยังไม่ได้ตั้งค่า Supabase)');return}
    if(!window.supabase||!window.supabase.createClient){status('err','โหลดตัวเชื่อม Supabase ไม่ได้ · ใช้ข้อมูลในเว็บ');return}
    status('wait','กำลังโหลดข้อมูลจาก Supabase…');

    sb=window.supabase.createClient(cfg.supabaseUrl,cfg.supabaseKey,{auth:{persistSession:false,autoRefreshToken:false}});
    const names=[...PLAN_TABLES,...Object.keys(TABLES)];
    const withTimeout=p=>Promise.race([p,new Promise(r=>setTimeout(()=>r({error:{message:'timeout'}}),10000))]);
    const results=await Promise.all(names.map(t=>withTimeout(sb.from(t).select('*')).then(res=>[t,res],err=>[t,{error:err}])));

    // a table counts as loaded when it answered without error and has rows (an empty answer usually means RLS blocked it)
    const rows={},missing=[];
    results.forEach(([t,{data,error}])=>{
      if(!error&&Array.isArray(data)&&data.length)rows[t]=data;
      else{missing.push(t);console.warn(`[DPP] ${t}:`,error?error.message:'no rows (check RLS policy)')}
    });

    canEdit=!!rows.scope_tasks;
    if(PLAN_TABLES.some(t=>rows[t])){const d=planFromRows(rows);renderPlan(d);renderWork(d)}
    Object.entries(TABLES).forEach(([t,[id,row]])=>{if(rows[t])fill(id,bySort(rows[t]).map(row).join(''))});

    const ok=names.length-missing.length;
    if(!ok)status('err','เชื่อมต่อ Supabase ไม่ได้ · ใช้ข้อมูลในเว็บ');
    else if(missing.length)status('warn',`ข้อมูลจาก Supabase ${ok}/${names.length} ตาราง · ที่เหลือใช้ข้อมูลในเว็บ`);
    else status('ok','ข้อมูลจาก Supabase');
  }

  /* ---------- status changes: RPC set_task_status in setup.sql checks the team passcode and records date/time + name ---------- */
  const store={
    get:k=>{try{return localStorage.getItem(k)||sessionStorage.getItem(k)}catch(e){return null}},
    set:(k,v,session)=>{try{(session?sessionStorage:localStorage).setItem(k,v)}catch(e){}},
    del:k=>{try{localStorage.removeItem(k);sessionStorage.removeItem(k)}catch(e){}},
  };
  const saved=()=>{const by=store.get('dpp.by'),pass=store.get('dpp.pass');return by&&pass?{by,pass}:null};
  function askWho(what,err){
    const dlg=$('who');if(!dlg||!dlg.showModal)return Promise.resolve(null);
    const f=dlg.querySelector('form');
    f.elements.by.value=store.get('dpp.by')||'';f.elements.pass.value='';
    $('who-what').textContent=what;$('who-err').textContent=err||'';
    dlg.returnValue='';dlg.showModal();
    return new Promise(res=>dlg.addEventListener('close',()=>{
      if(dlg.returnValue!=='ok')return res(null);
      const by=f.elements.by.value.trim(),pass=f.elements.pass.value;
      store.del('dpp.pass');store.set('dpp.by',by);store.set('dpp.pass',pass,!f.elements.remember.checked);
      res({by,pass});
    },{once:true}));
  }
  document.addEventListener('change',async e=>{
    const sel=e.target.closest&&e.target.closest('select[data-task]');
    if(!sel||!sb||!work)return;
    const t=work.TASK.find(x=>x[0]===sel.dataset.task);if(!t)return;
    const next=sel.value, what=`${t[0]} ${t[2]}: ${STATUS[t[8]]||t[8]} → ${STATUS[next]}`;
    sel.disabled=true;
    let who=saved()||await askWho(what);
    while(who){
      const {data,error}=await sb.rpc('set_task_status',{p_task_id:t[0],p_status:next,p_by:who.by,p_passcode:who.pass});
      if(!error){
        const r=Array.isArray(data)?data[0]:data;
        t[8]=r.status;t[9]=r.status_changed_at;t[10]=r.status_changed_by;
        renderWork(work);return;
      }
      if(/รหัสทีม/.test(error.message)){store.del('dpp.pass');who=await askWho(what,error.message);continue}
      alert('บันทึกสถานะไม่สำเร็จ: '+(/set_task_status|schema cache|function/i.test(error.message)?'ฐานข้อมูลยังไม่มีฟังก์ชันบันทึกสถานะ ให้รัน supabase/setup.sql ฉบับล่าสุด':error.message));
      break;
    }
    sel.value=t[8];sel.className='st '+t[8];sel.disabled=false;
  });

  renderPlan(FALLBACK);renderWork(FALLBACK);
  load().catch(err=>{console.warn('[DPP]',err);status('err','เชื่อมต่อ Supabase ไม่ได้ · ใช้ข้อมูลในเว็บ')});
})();
