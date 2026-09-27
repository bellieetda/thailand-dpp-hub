/* Thailand DPP Project Hub · page routing, Gantt, WBS, scope cards */
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

  /* ---------- workstreams ---------- */
  const WS={
    '4.1':{c:'--ws0',n:'บริหารโครงการ'},
    '4.2':{c:'--ws1',n:'Landscape · Gap · Ref. Arch. · Roadmap'},
    '4.3':{c:'--ws2',n:'กระบวนการ End-to-End (ทุเรียน → จีน)'},
    '4.4':{c:'--ws3',n:'Core Data · Profiles · Technical'},
    '4.5':{c:'--ws4',n:'ร่างมาตรฐาน Thailand DPP Core'},
    '4.6':{c:'--ws5',n:'End-to-End Prototype'},
    '4.7':{c:'--ws6',n:'นำร่องธุรกรรมจริง'},
    '4.8':{c:'--ws7',n:'สรุปผลและเผยแพร่'},
  };
  const MONTHS=[['M1','พ.ย. 69'],['M2','ธ.ค. 69'],['M3','ม.ค. 70'],['M4','ก.พ. 70'],['M5','มี.ค. 70'],['M6','เม.ย. 70'],['M7','พ.ค. 70'],['M8','มิ.ย. 70']];
  // [id, ws, name, start(month,1-based, fractional), end, output, owner, milestone?]
  const A=[
    ['4.1.1','4.1','จัดทำ Inception Report',1.0,1.95,'Project/Work Plan, Methodology, Stakeholder & Field Plan, Risk Plan, ทีม','PM, PMO'],
    ['4.1.2','4.1','บริหารประชุม/Workshop และล่าม',1.2,8.9,'กำหนดการ บันทึก รายงานกิจกรรม','PMO, Event, ล่าม'],
    ['4.1.3','4.1','ประสานผู้มีส่วนได้ส่วนเสียไทย–จีน',1.0,8.9,'รายชื่อผู้ติดต่อ หนังสือในนาม สพธอ.','PMO, ผู้ประสานงานจีน'],
    ['4.1.4','4.1','รายงานความก้าวหน้ารายเดือน',1.0,8.9,'Monthly progress report, issue/risk log','PM'],
    ['4.2.1','4.2','ศึกษา Landscape และระบบนิเวศ',1.3,2.9,'แนวโน้ม กฎหมาย EU/จีน มาตรฐาน กรณีต่างประเทศ Stakeholder Map','Trade Lead, Legal, Standards'],
    ['4.2.2','4.2','สัมภาษณ์ ≥ 20 ราย + Focus Group ≥ 1',1.5,3.5,'บันทึกสัมภาษณ์ สรุปความคิดเห็น','Trade Lead, BA'],
    ['4.2.3','4.2','Gap Analysis 7 ด้าน + Reference Architecture',2.3,3.7,'Gap matrix จัดลำดับความสำคัญ Thailand DPP Ref. Arch.','Solution Arch., Trade Lead'],
    ['4.2.4a','4.2','Implementation Roadmap ฉบับตั้งต้น',3.2,3.9,'Roadmap สั้น/กลาง/ยาว บทบาท KPI','Trade Lead'],
    ['4.2.4b','4.2','Implementation Roadmap ฉบับสมบูรณ์',7.5,8.7,'Roadmap ปรับจากผลนำร่อง','Trade Lead, PM'],
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
  ];
  const MS=[['4.1',1.95,'D1 Inception'],['4.2',3.45,'Focus Group'],['4.2',3.95,'D2 Interim 1'],['4.3',3.0,'รับฟัง As-Is'],['4.3',4.65,'รับฟัง To-Be'],['4.4',5.95,'D3 Interim 2'],['4.7',6.6,'Go-live ธุรกรรมจริง'],['4.5',7.95,'D4 Interim 3'],['4.8',8.6,'สัมมนาเผยแพร่'],['4.8',8.95,'D5 Final']];

  /* legend */
  document.getElementById('legend').innerHTML=Object.entries(WS).map(([k,w])=>`<span style="--c:var(${w.c})"><i></i>${k} ${w.n}</span>`).join('');

  /* gantt */
  const pct=m=>((m-1)/8*100).toFixed(2)+'%';
  let h=`<div class="g-head"><div class="g-lab" style="font-weight:600">กิจกรรม</div><div class="g-months">${MONTHS.map(([m,t])=>`<div><b>${m}</b>${t}</div>`).join('')}</div></div>`;
  Object.entries(WS).forEach(([k,w])=>{
    const acts=A.filter(a=>a[1]===k);
    const s=Math.min(...acts.map(a=>a[3])),e=Math.max(...acts.map(a=>a[4]));
    const ms=MS.filter(m=>m[0]===k).map(m=>`<span class="g-ms" style="--c:var(${w.c});left:${pct(m[1])}" title="${m[2]}"></span>`).join('');
    const flag=k==='4.4'?`<span class="g-flag" style="left:${pct(4.58)}" title="18 ก.พ. 2027 Battery Passport EU"></span>`:'';
    h+=`<div class="g-row grp" style="--c:var(${w.c})"><div class="g-lab"><span class="i">${k}</span>${w.n}</div><div class="g-track"><span class="g-bar" style="left:${pct(s)};width:calc(${pct(e)} - ${pct(s)})"></span>${ms}${flag}</div></div>`;
    acts.forEach(a=>{h+=`<div class="g-row" style="--c:var(${w.c})"><div class="g-lab"><span class="i">${a[0]}</span>${a[2]}</div><div class="g-track"><span class="g-bar" title="${a[2]}" style="left:${pct(a[3])};width:calc(${pct(a[4])} - ${pct(a[3])})"></span></div></div>`});
  });
  document.getElementById('gantt').innerHTML=h;

  /* wbs table */
  const mlabel=(s,e)=>{const a=Math.floor(s),b=Math.min(8,Math.floor(e-0.001));return a===b?`M${a}`:`M${a}–M${b}`};
  document.querySelector('#wbs tbody').innerHTML=A.map(a=>`<tr><td class="id" style="color:var(${WS[a[1]].c})">${a[0]}</td><td>${a[2]}</td><td class="id">${mlabel(a[3],a[4])}</td><td>${a[5]}</td><td>${a[6]}</td></tr>`).join('');

  /* scope cards (4.2–4.7) */
  const SC=[
    ['4.2','ศึกษา Landscape ระบบนิเวศ ช่องว่าง และ Implementation Roadmap','M1–M3 · Roadmap ฉบับสมบูรณ์ M8',[
      ['ศึกษา Landscape','แนวโน้ม paperless trade, interoperability, traceability · กฎหมาย EU (ESPR, Battery) และข้อกำหนดนำเข้าจีน · มาตรฐานสากล · กรณีต่างประเทศ · Stakeholder Map · data governance'],
      ['เก็บข้อมูล','สัมภาษณ์ ≥ 20 ราย/หน่วยงาน · Focus Group/Workshop ≥ 1 ครั้ง'],
      ['Gap + Reference Architecture','Gap 7 ด้าน: นโยบาย/กฎหมาย, มาตรฐาน, ข้อมูล, เทคโนโลยี, กำกับดูแล, ความพร้อมผู้ประกอบการ, ความยั่งยืน · Ref. Arch. เป็นกลางทางเทคโนโลยี'],
      ['Implementation Roadmap','9 หัวข้อ: เป้าหมายสั้น/กลาง/ยาว, องค์ประกอบแต่ละระยะ, บทบาท, ลำดับ, use case ขยายผล, สนับสนุนผู้ประกอบการ, กำกับดูแล, KPI, ความเสี่ยง'],
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
  ];
  document.getElementById('scopes').innerHTML=SC.map(([k,t,when,items])=>`<div class="card ws" style="--c:var(${WS[k].c})"><div class="hd"><span class="code">${k}</span><h3>${t}</h3><span class="when">${when}</span></div>${items.map(([a,b])=>`<h4>${a}</h4><p>${b}</p>`).join('')}</div>`).join('');
})();
