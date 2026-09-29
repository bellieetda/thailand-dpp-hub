/* Thailand DPP Project Hub · page 03 DPP Data Layer: example credentials (DPP · DFR · DCC · DTE) for durian → CN and battery → EU.
   All companies, domains, codes and numbers are fictional examples. */
(function(){
/* ---------------- helpers ---------------- */
const esc=s=>s.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
function inl(v){
  if(v===null||typeof v!=='object')return JSON.stringify(v);
  if(Array.isArray(v))return '['+v.map(inl).join(', ')+']';
  return '{'+Object.entries(v).map(([k,x])=>JSON.stringify(k)+': '+inl(x)).join(', ')+'}';
}
function fmt(v,ind,pre){
  const one=inl(v);
  if(v===null||typeof v!=='object'||ind.length+pre+one.length<=78)return one;
  const i2=ind+'  ';
  if(Array.isArray(v))return '[\n'+v.map(x=>i2+fmt(x,i2,0)).join(',\n')+'\n'+ind+']';
  return '{\n'+Object.entries(v).map(([k,x])=>{const kk=JSON.stringify(k)+': ';return i2+kk+fmt(x,i2,kk.length)}).join(',\n')+'\n'+ind+'}';
}
function hl(obj){
  const j=esc(fmt(obj,'',0));
  return j.replace(/("(?:\\.|[^"\\])*")(\s*:)?|\b(true|false|null)\b|(-?\d+(?:\.\d+)?)/g,(m,str,colon,bool,num)=>{
    if(str)return colon?`<span class="k">${str}</span>${colon}`:`<span class="s">${str}</span>`;
    if(bool)return `<span class="b">${bool}</span>`;
    return `<span class="nm">${num}</span>`;
  });
}
const CTX=["https://www.w3.org/ns/credentials/v2","https://vocabulary.uncefact.org/untp/"];
const IDR='https://idr.thdpp.example';
const vc=(type,id,issuer,from,until,subject,extra={})=>Object.assign({"@context":CTX,"type":[type,"VerifiableCredential"],"id":id,"issuer":issuer,"validFrom":from},until?{"validUntil":until}:{},{"credentialSubject":subject},extra);
const status=(url,idx)=>({"credentialStatus":{"type":"BitstringStatusListEntry","statusPurpose":"revocation","statusListIndex":String(idx),"statusListCredential":url}});
const link=(url,name,type)=>({"linkURL":url,"linkName":name,"linkType":`https://test.uncefact.org/vocabulary/linkTypes/${type}`});
const cls=(code,name,sid,sname)=>({"code":code,"name":name,"schemeId":sid,"schemeName":sname});
const TH={"countryCode":"TH","countryName":"Thailand"};

document.getElementById('dl-envelope').innerHTML=hl({
  "@context":CTX,"type":["DigitalProductPassport","VerifiableCredential"],
  "id":"https://vc.issuer.example/dpp/…",
  "issuer":{"type":["CredentialIssuer"],"id":"did:web:issuer.example","name":"ชื่อผู้ออก","issuerAlsoKnownAs":[{"registeredId":"เลขนิติบุคคล 13 หลัก","idScheme":{"id":"https://dbd.example","name":"ทะเบียนนิติบุคคล (DBD)"}}]},
  "validFrom":"2027-04-19T00:00:00+07:00","validUntil":"…",
  "credentialSubject":{"type":["Product | Facility | ConformityAttestation"],"…":"เนื้อหาของแต่ละชนิด"},
  "credentialStatus":{"type":"BitstringStatusListEntry","statusListIndex":"…","statusListCredential":"https://vc.issuer.example/status/1"},
  "proof":"ลายเซ็นของผู้ออก (หรือห่อเป็น JWT: application/vc+jwt)"
});

/* ---------------- parties & IDs ---------------- */
const DOA={"type":["CredentialIssuer"],"id":"did:web:doa.example","name":"กรมวิชาการเกษตร (ตัวอย่าง)"};
const FARM={"id":"did:web:saas.thdpp.example:farmer:0001","name":"นายสมชาย ใจดี (ตัวอย่าง)"};
const EXP={"type":["CredentialIssuer"],"id":"did:web:chanfresh.example","name":"บริษัท จันทบุรีเฟรช จำกัด (ตัวอย่าง)","issuerAlsoKnownAs":[{"registeredId":"0225569000123","idScheme":{"id":"https://dbd.example","name":"ทะเบียนนิติบุคคล (DBD)"}}]};
const LAB={"type":["CredentialIssuer"],"id":"did:web:lab17025.example","name":"ห้องปฏิบัติการทดสอบ ABC · ISO/IEC 17025 (ตัวอย่าง)"};
const GTIN_D='08851234560011', LOT='A26';
const PROD_D=`${IDR}/01/${GTIN_D}/10/${LOT}`;
const PLOTS=[['9001-2201-000123','สวนสมชาย',8200,22500,6100],['9001-2201-000245','สวนมณี',6100,18000,9300],['9001-2201-000310','สวนทองดี',4300,15000,5200]];
const plotId=c=>`${IDR}/gap/${c}`;
const PACK={"id":`${IDR}/414/8851234560004`,"name":"โรงคัดบรรจุจันทบุรีเฟรช (ตัวอย่าง)","registeredId":"DOA-GMP-2201-0456"};
const TOPIC=t=>({"type":["ConformityTopic"],"id":`https://vocab.thdpp.example/conformity-topic/${t[0]}`,"name":t[1]});

/* ---------------- durian steps ---------------- */
const D=[];
D.push({n:1,t:'สวนขึ้นทะเบียนสถานที่',chip:'dfr',who:'เกษตรกร (ออกผ่าน DPP Provider SaaS)',when:'ต้นฤดู · 1 ครั้งต่อแปลง',
 desc:'แปลงทุเรียนแต่ละแปลงมี DFR ของตัวเอง บอกพิกัด ขอบเขตแปลง และชี้ไปใบรับรอง GAP ข้อมูลนี้แทบไม่เปลี่ยน ใช้ซ้ำได้ทุกล็อตทั้งฤดู',
 fields:[['credentialSubject.id',plotId(PLOTS[0][0]),'ID แปลง ใช้เป็นจุดอ้างอิงของทุกใบที่เกี่ยวกับแปลงนี้'],['registeredId','9001-2201-000123','รหัสแปลง GAP (รูปแบบตัวอย่าง)'],['locationInformation','12.6158, 102.0741 + ขอบเขตแปลง','ใช้ยืนยันว่าอยู่ในพื้นที่ที่ขึ้นทะเบียนกับ GACC'],['processCategory','CPC 01319 ผลไม้เขตร้อนอื่น ๆ','ประเภทการผลิต'],['performanceClaim[0].evidence','→ DCC GAP ของกรมวิชาการเกษตร','ลิงก์ไปขั้นที่ 2']],
 json:vc('DigitalFacilityRecord','https://vc.saas.thdpp.example/dfr/9001-2201-000123',{"type":["CredentialIssuer"],...FARM},'2026-12-01T00:00:00+07:00',null,{
   "type":["Facility"],"id":plotId(PLOTS[0][0]),"name":"สวนสมชาย แปลง 1 (ตัวอย่าง)","registeredId":"9001-2201-000123",
   "idScheme":{"id":"https://doa.example/gap-plot","name":"ทะเบียนแปลง GAP กรมวิชาการเกษตร (ตัวอย่าง)"},
   "countryOfOperation":TH,
   "processCategory":[cls('01319','Other tropical and subtropical fruits n.e.c. (durian)','https://unstats.un.org/unsd/classifications/Econ/cpc/','UN CPC')],
   "locationInformation":{"geoLocation":{"latitude":12.6158,"longitude":102.0741},"geoBoundary":[{"latitude":12.6171,"longitude":102.0726},{"latitude":12.6172,"longitude":102.0758},{"latitude":12.6145,"longitude":102.0759},{"latitude":12.6144,"longitude":102.0727}]},
   "address":{"addressLocality":"ท่าใหม่","addressRegion":"จันทบุรี","postalCode":"22120","addressCountry":TH},
   "relatedParty":[{"role":"operator","party":{"type":["Party"],...FARM}}],
   "performanceClaim":[{"type":["Claim"],"name":"แปลงได้รับรอง GAP","conformityTopic":[TOPIC(['gap','Good Agricultural Practice'])],"evidence":[link('https://vc.doa.example/gap/9001-2201-000123','GAP certificate · DOA','dcc')]}]
 }),
 links:['DCC GAP (ขั้น 2)','DTE คัดบรรจุ (ขั้น 3) อ้าง ID แปลงนี้']});

D.push({n:2,t:'กรมวิชาการเกษตรรับรอง GAP ของแปลง',chip:'dcc',who:'กรมวิชาการเกษตร',when:'หลังตรวจแปลง · อายุ 3 ปี',
 desc:'ใบรับรอง GAP ในรูป DCC ผูกกับ ID แปลงผ่าน assessedFacility และใส่ผลผลิตคาดการณ์ต่อฤดูที่ผู้ตรวจยืนยันแล้ว ค่านี้คือเพดานที่ใช้ตรวจ mass balance กันสวมสิทธิ์',
 fields:[['issuer.id','did:web:doa.example','ต้องอยู่ใน Trust Registry ว่ามีสิทธิ์ออก GAP'],['attestationType','certification',''],['assessedFacility.facility.id',plotId(PLOTS[0][0]),'ID เดียวกับ DFR ขั้น 1'],['assessedPerformance','ผลผลิตคาดการณ์ 22,500 กก./ฤดู · พื้นที่ 2.4 ha','ใช้เป็นเพดาน mass balance'],['conformance','true','ผ่าน'],['credentialStatus','status list index 88213','ถ้าถูกระงับ ด่านเห็นทันที']],
 json:vc('DigitalConformityCredential','https://vc.doa.example/gap/9001-2201-000123',DOA,'2026-12-01T00:00:00+07:00','2029-11-30T23:59:59+07:00',{
   "type":["ConformityAttestation"],"id":"https://vc.doa.example/gap/9001-2201-000123#attestation",
   "assessorLevel":"3rdParty","attestationType":"certification",
   "issuedToParty":FARM,
   "referenceScheme":{"id":"https://doa.example/schemes/gap-plant","name":"ระบบรับรอง GAP พืช (ตัวอย่าง)"},
   "conformityAssessment":[{"type":["ConformityAssessment"],"assessmentDate":"2026-11-20",
     "assessmentCriteria":[{"id":"https://vocab.thdpp.example/criteria/tas-9001","name":"มกษ. 9001 การปฏิบัติทางการเกษตรที่ดีสำหรับพืช","conformityTopic":[TOPIC(['gap','Good Agricultural Practice'])]}],
     "assessedFacility":[{"facility":{"id":plotId(PLOTS[0][0]),"name":"สวนสมชาย แปลง 1","registeredId":"9001-2201-000123"},"idVerifiedByCAB":true}],
     "assessedPerformance":[{"metric":{"id":"https://vocab.thdpp.example/metric/estimated-seasonal-yield","name":"ผลผลิตคาดการณ์ต่อฤดู"},"measure":{"value":22500,"unit":"KGM"}},{"metric":{"id":"https://vocab.thdpp.example/metric/planted-area","name":"พื้นที่ปลูก"},"measure":{"value":2.4,"unit":"HAR"}}],
     "conformance":true}]
 },status('https://vc.doa.example/status/gap-2026',88213)),
 links:['DFR สวน (ขั้น 1)','DPP ล็อต A26 อ้างเป็น evidence (ขั้น 5)']});

D.push({n:3,t:'โรงคัดบรรจุรับทุเรียนจาก 3 แปลง แล้วแพ็กเป็นล็อต A26',chip:'dte',who:'บริษัท จันทบุรีเฟรช (โรงคัด GMP)',when:'19 เม.ย. 2570',
 desc:'MakeEvent คือหัวใจของการตรวจย้อนกลับ input คือล็อตที่ตัดจากแต่ละแปลง output คือล็อต A26 ซึ่งมี ID เดียวกับ DPP ที่จะออกในขั้นที่ 5 ระบบคำนวณ mass balance จากเหตุการณ์นี้ก่อนออก e-Phyto',
 fields:[['credentialSubject[0].type','MakeEvent','แปรรูป / คัดบรรจุ'],['inputProduct','3 ล็อตเก็บเกี่ยว รวม 18,600 กก.','ID ของแต่ละล็อตมีรหัสแปลงอยู่ในตัว'],['outputProduct.product.id',PROD_D,'= DPP ล็อต A26'],['outputProduct.quantity','18,000 กก. (คัดทิ้ง 600 กก.)',''],['madeAtFacility.id',PACK.id,'→ DFR โรงคัด (มี DCC GMP)'],['activityType','GS1 CBV: packing','']],
 json:vc('DigitalTraceabilityEvent','https://vc.chanfresh.example/dte/pack-A26',EXP,'2027-04-19T14:30:00+07:00',null,[{
   "type":["MakeEvent"],"id":"https://vc.chanfresh.example/dte/pack-A26#e1","eventDate":"2027-04-19T14:30:00+07:00",
   "activityType":cls('packing','Packing','https://ref.gs1.org/cbv/BizStep','GS1 CBV BizStep'),
   "inputProduct":PLOTS.map(p=>({"product":{"id":`${plotId(p[0])}/harvest/2027-04-18`,"name":`ทุเรียนหมอนทองตัดจาก${p[1]} (${p[0]})`},"quantity":{"value":p[2],"unit":"KGM"},"disposition":"consumed"})),
   "outputProduct":[{"product":{"id":PROD_D,"name":"ทุเรียนหมอนทองสด เกรด A · ล็อต A26","batchNumber":LOT},"quantity":{"value":18000,"unit":"KGM"},"disposition":"new"}],
   "madeAtFacility":{"id":PACK.id,"name":PACK.name},
   "relatedParty":[{"role":"operator","party":{"type":["Party"],"id":EXP.id,"name":EXP.name}}]
 }]),
 mb:true,
 links:['ล็อตเก็บเกี่ยว → DFR สวน (ขั้น 1)','DFR โรงคัด + DCC GMP','DPP ล็อต A26 (ขั้น 5)']});

D.push({n:4,t:'แล็บตรวจล็อต A26: น้ำหนักแห้ง และสารปนเปื้อน',chip:'dcc',who:'ห้องปฏิบัติการ ISO/IEC 17025',when:'19 เม.ย. 2570',
 desc:'DCC ระดับล็อต assessedProduct ใช้ ID เดียวกับ DPP ผลน้ำหนักแห้งยืนยันว่าไม่ใช่ทุเรียนอ่อน ส่วนสารย้อมและโลหะหนักตอบข้อกังวลของจีน',
 fields:[['attestationType','testing',''],['assessedProduct.product.id',PROD_D,'= DPP ล็อต A26'],['assessedPerformance[0]','น้ำหนักแห้ง 34.5% (เกณฑ์หมอนทอง ≥ 32%)','กันทุเรียนอ่อน'],['assessedPerformance[1..2]','BY2 (Auramine O) · แคดเมียม: ไม่พบ','ข้อกังวลของจีน'],['conformance','true','']],
 json:vc('DigitalConformityCredential','https://vc.lab17025.example/test/A26-20270419',LAB,'2027-04-19T18:00:00+07:00','2027-06-30T23:59:59+07:00',{
   "type":["ConformityAttestation"],"id":"https://vc.lab17025.example/test/A26-20270419#attestation",
   "assessorLevel":"3rdParty","attestationType":"testing",
   "issuedToParty":{"id":EXP.id,"name":EXP.name},
   "conformityAssessment":[{"type":["ConformityAssessment"],"assessmentDate":"2027-04-19",
     "assessmentCriteria":[{"id":"https://vocab.thdpp.example/criteria/durian-dry-matter","name":"น้ำหนักแห้งทุเรียนหมอนทอง ≥ 32% (มาตรฐานสินค้าเกษตร ทุเรียน)"},{"id":"https://vocab.thdpp.example/criteria/gacc-durian-contaminants","name":"สารปนเปื้อนตามข้อกำหนดนำเข้าจีน (อ้างผ่าน CVC)"}],
     "assessedProduct":[{"product":{"id":PROD_D,"name":"ทุเรียนหมอนทองสด เกรด A","batchNumber":LOT},"idVerifiedByCAB":true}],
     "assessedPerformance":[{"metric":{"id":"https://vocab.thdpp.example/metric/dry-matter","name":"น้ำหนักแห้ง (dry matter)"},"measure":{"value":34.5,"unit":"P1"}},{"metric":{"id":"https://vocab.thdpp.example/metric/basic-yellow-2","name":"Basic Yellow 2 (Auramine O)"},"score":{"code":"ND","definition":"ไม่พบ (ต่ำกว่า LOD)"}},{"metric":{"id":"https://vocab.thdpp.example/metric/cadmium","name":"แคดเมียม"},"score":{"code":"ND","definition":"ไม่พบ (ต่ำกว่า LOD)"}}],
     "conformance":true}]
 }),
 links:['DPP ล็อต A26 อ้างเป็น evidence (ขั้น 5)']});

D.push({n:5,t:'ผู้ส่งออกออก DPP ของล็อต A26',chip:'dpp',who:'บริษัท จันทบุรีเฟรช (ผู้ส่งออก)',when:'19 เม.ย. 2570',
 desc:'DPP เป็นจุดตั้งต้นที่ผู้ซื้อเห็นก่อน มีข้อมูลสินค้าและข้ออ้าง (claim) แต่ละข้อชี้ evidence ไปที่ DCC ส่วนรายละเอียดอื่นชี้ไป DTE, e-Phyto และ invoice ไม่ได้คัดลอกข้อมูลของใบอื่นมาไว้ในตัว',
 fields:[['credentialSubject.id',PROD_D,'ID ล็อต (GS1 Digital Link)'],['idGranularity','batch','ระดับล็อต'],['productCategory','HS 081060 Durians, fresh',''],['producedAtFacility','โรงคัดบรรจุ (GLN 8851234560004)','→ DFR'],['characteristics','หมอนทอง · เกรด A · 4–6 ลูก/กล่อง · ตัด 18 เม.ย.','ฟิลด์เปิดสำหรับ Durian Profile'],['performanceClaim','GAP 100% (3 DCC) · น้ำหนักแห้ง 34.5% · ไม่พบสารปนเปื้อน','แต่ละข้อมี evidence'],['relatedDocument','DTE คัดบรรจุ · DTE ขนส่ง · e-Phyto · invoice','']],
 json:vc('DigitalProductPassport','https://vc.chanfresh.example/dpp/A26',EXP,'2027-04-19T20:00:00+07:00','2027-07-31T23:59:59+07:00',{
   "type":["Product"],"id":PROD_D,"name":"ทุเรียนหมอนทองสด เกรด A (Fresh Durian Monthong)",
   "idScheme":{"id":"https://www.gs1.org/standards/id-keys/gtin","name":"GS1 GTIN + batch/lot"},
   "batchNumber":LOT,"idGranularity":"batch",
   "productCategory":[cls('081060','Durians, fresh','https://www.wcoomd.org/en/topics/nomenclature.aspx','HS 2022')],
   "producedAtFacility":{"id":PACK.id,"name":PACK.name,"registeredId":PACK.registeredId},
   "countryOfProduction":TH,
   "relatedParty":[{"role":"exporter","party":{"type":["Party"],"id":EXP.id,"name":EXP.name,"registeredId":"0225569000123"}}],
   "dimensions":{"weight":{"value":18000,"unit":"KGM"}},
   "packaging":{"description":"กล่องกระดาษลูกฟูก 1,000 กล่อง × 18 กก.","materialType":"corrugated board"},
   "materialProvenance":[{"name":"ทุเรียนหมอนทอง","originCountry":TH,"massFraction":1.0}],
   "characteristics":{"variety":"หมอนทอง (Monthong)","grade":"A","fruitsPerBox":"4–6","harvestDate":"2027-04-18","boxes":1000},
   "performanceClaim":[
     {"type":["Claim"],"name":"ผลิตจากแปลงที่ได้รับรอง GAP 100%","conformityTopic":[TOPIC(['gap','Good Agricultural Practice'])],"referenceCriteria":[{"id":"https://vocab.thdpp.example/criteria/tas-9001","name":"มกษ. 9001"}],"claimedPerformance":[{"metric":{"id":"https://vocab.thdpp.example/metric/gap-certified-share","name":"สัดส่วนจากแปลง GAP"},"measure":{"value":100,"unit":"P1"}}],"evidence":PLOTS.map(p=>link(`https://vc.doa.example/gap/${p[0]}`,`GAP ${p[0]}`,'dcc'))},
     {"type":["Claim"],"name":"ทุเรียนแก่ได้มาตรฐาน","conformityTopic":[TOPIC(['product-quality','Product quality'])],"claimedPerformance":[{"metric":{"id":"https://vocab.thdpp.example/metric/dry-matter","name":"น้ำหนักแห้ง"},"measure":{"value":34.5,"unit":"P1"}}],"evidence":[link('https://vc.lab17025.example/test/A26-20270419','ผลตรวจล็อต A26','dcc')]},
     {"type":["Claim"],"name":"ไม่พบสารปนเปื้อนตามข้อกำหนดจีน","conformityTopic":[TOPIC(['food-safety','Food safety'])],"evidence":[link('https://vc.lab17025.example/test/A26-20270419','ผลตรวจล็อต A26','dcc')]}
   ],
   "relatedDocument":[link('https://vc.chanfresh.example/dte/pack-A26','คัดบรรจุล็อต A26','dte'),link('https://vc.chanfresh.example/dte/move-A26','ขนส่งไปด่าน','dte'),{"linkURL":"https://ephyto.doa.example/cert/TH-2027-CN-004512","linkName":"e-Phyto","linkType":"https://vocab.thdpp.example/linkTypes/ephyto"},{"linkURL":"https://tlx.example/doc/CF-INV-2027-0419","linkName":"Commercial invoice (TLX)","linkType":"https://vocab.thdpp.example/linkTypes/invoice"}]
 },status('https://vc.chanfresh.example/status/1',4512)),
 links:['DCC GAP ×3 (ขั้น 2)','DCC ผลตรวจ (ขั้น 4)','DFR โรงคัด','DTE (ขั้น 3, 7)','e-Phyto + invoice (ขั้น 6)']});

D.push({n:6,t:'ผูกเอกสารการค้า: e-Phyto และ invoice ผ่าน TLX',chip:'doc',who:'กรมวิชาการเกษตร · ผู้ส่งออก',when:'20 เม.ย. 2570',
 desc:'e-Phyto และ invoice ไม่ใช่ credential ของ UNTP แต่ต้องอ้าง ID เดียวกันกับ DPP ตามที่ TOR กำหนดให้เชื่อม DPP กับ invoice ด่านจึงจับคู่ได้ว่าเอกสารกับสินค้าเป็นล็อตเดียวกัน',
 fields:[['invoice.lineItem.productId',PROD_D,'ID เดียวกับ DPP'],['invoice.lineItem.dppLink','https://vc.chanfresh.example/dpp/A26',''],['e-Phyto.consignment.lotRef','A26 → '+PROD_D,'กรมวิชาการเกษตรออกหลังผ่าน mass balance'],['ใบขน (NSW)','อ้าง DPP ID ในรายการสินค้า','ศุลกากรเช็กกับ Registry']],
 json:{"invoice (TLX · ย่อ)":{"documentType":"CommercialInvoice","invoiceNumber":"CF-INV-2027-0419","issueDate":"2027-04-20","seller":{"id":EXP.id,"name":EXP.name,"registeredId":"0225569000123"},"buyer":{"name":"Guangzhou Fresh Fruit Import Co. (ตัวอย่าง)"},"incoterms":"CIF","lineItem":[{"productId":PROD_D,"description":"Fresh durian Monthong grade A · lot A26","hsCode":"081060","quantity":{"value":18000,"unit":"KGM"},"packages":{"value":1000,"unit":"CT"},"dppLink":"https://vc.chanfresh.example/dpp/A26"}]},
   "e-Phyto (ย่อ)":{"certificateNumber":"TH-2027-CN-004512","issuer":"กรมวิชาการเกษตร (ตัวอย่าง)","consignment":{"commodity":"Fresh durian (Durio zibethinus)","quantity":{"value":18000,"unit":"KGM"},"lotReference":LOT,"productId":PROD_D},"placeOfOrigin":"Chanthaburi, Thailand","pointOfEntry":"Youyiguan, Guangxi, CN"}},
 links:['DPP relatedDocument (ขั้น 5)','IDR linkset (ขั้น 8)']});

D.push({n:7,t:'ขนส่งรถห้องเย็นไปด่านโหยวอี้กวน',chip:'dte',who:'ผู้ส่งออก / ผู้ขนส่ง',when:'20–23 เม.ย. 2570',
 desc:'MoveEvent บันทึกการย้ายล็อต A26 พร้อมอุณหภูมิระหว่างทาง ใช้ consignmentId เดียวกับเอกสารขนส่ง',
 fields:[['credentialSubject[0].type','MoveEvent',''],['movedProduct.product.id',PROD_D,'= DPP'],['fromFacility → toFacility','โรงคัด → ด่านโหยวอี้กวน (CN)',''],['consignmentId','urn:thdpp:consignment:70-1234-20270420','ทะเบียนรถ + วันที่ (ตัวอย่าง)'],['sensorData','อุณหภูมิเฉลี่ย 15 °C','']],
 json:vc('DigitalTraceabilityEvent','https://vc.chanfresh.example/dte/move-A26',EXP,'2027-04-23T09:10:00+07:00',null,[{
   "type":["MoveEvent"],"id":"https://vc.chanfresh.example/dte/move-A26#e1","eventDate":"2027-04-20T06:00:00+07:00",
   "activityType":cls('shipping','Shipping','https://ref.gs1.org/cbv/BizStep','GS1 CBV BizStep'),
   "movedProduct":[{"product":{"id":PROD_D,"name":"ทุเรียนหมอนทองสด ล็อต A26","batchNumber":LOT},"quantity":{"value":18000,"unit":"KGM"},"disposition":"in_transit"}],
   "fromFacility":{"id":PACK.id,"name":PACK.name},
   "toFacility":{"id":"https://idr.thdpp.example/port/CNYYG","name":"ด่านโหยวอี้กวน ผิงเสียง กว่างซี (ตัวอย่าง)"},
   "consignmentId":"urn:thdpp:consignment:70-1234-20270420",
   "sensorData":[{"metric":{"id":"https://vocab.thdpp.example/metric/temperature","name":"อุณหภูมิในตู้"},"measure":[{"value":15.0,"unit":"CEL"}],"sensor":{"id":"urn:thdpp:sensor:TRK-70-1234-T1","name":"logger ตู้เย็น"}}]
 }]),
 links:['DPP ล็อต A26']});

D.push({n:8,t:'ลงทะเบียนลิงก์ใน IDR แล้วด่านจีนตรวจ',chip:'doc',who:'Provider → National IDR · GACC ตรวจ',when:'23 เม.ย. 2570 ที่ด่าน',
 desc:'ทุก credential ข้างบนถูกรวบเป็น linkset ของ ID ล็อต A26 GACC สแกน QR แล้วได้ลิงก์ทั้งชุด ระบบตรวจทีละใบว่าลายเซ็นถูก ผู้ออกมีสิทธิ์ และยังไม่ถูกเพิกถอน',
 fields:[['anchor',PROD_D,''],['dpp','th · zh · en','กล้องทั่วไปเด้งไปภาษาตามเครื่อง'],['dcc','GAP ×3 · ผลตรวจล็อต',''],['dte · dfr','คัดบรรจุ · ขนส่ง · โรงคัด',''],['ephyto','accessRole: authority','เฉพาะหน่วยงานรัฐ'],['invoice','accessRole: partner','เฉพาะคู่ค้า']],
 json:{"linkset":[{"anchor":PROD_D,
   "dpp":[{"href":"https://vc.chanfresh.example/dpp/A26","type":"application/vc+jwt","hreflang":["th","zh","en"],"title":"DPP ล็อต A26"}],
   "dcc":[...PLOTS.map(p=>({"href":`https://vc.doa.example/gap/${p[0]}`,"type":"application/vc+jwt","title":`GAP ${p[0]}`})),{"href":"https://vc.lab17025.example/test/A26-20270419","type":"application/vc+jwt","title":"ผลตรวจล็อต"}],
   "dte":[{"href":"https://vc.chanfresh.example/dte/pack-A26","type":"application/vc+jwt"},{"href":"https://vc.chanfresh.example/dte/move-A26","type":"application/vc+jwt"}],
   "dfr":[{"href":"https://vc.chanfresh.example/dfr/packhouse","type":"application/vc+jwt","title":"โรงคัดบรรจุ"}],
   "ephyto":[{"href":"https://ephyto.doa.example/cert/TH-2027-CN-004512","accessRole":["untp:accessRole#Authority"]}],
   "invoice":[{"href":"https://tlx.example/doc/CF-INV-2027-0419","accessRole":["untp:accessRole#Partner"],"encryptionMethod":"AES-256"}]}]},
 checks:[['ลายเซ็นทุกใบถูกต้อง','✓'],['did:web:doa.example อยู่ใน Trust Registry สิทธิ์ออก GAP','✓'],['GAP ทั้ง 3 แปลงยังไม่ถูกเพิกถอน (status list)','✓'],['แปลงอยู่ในรายชื่อที่ขึ้นทะเบียนกับ GACC (ผ่าน CVC)','✓'],['Mass balance ทั้ง 3 แปลงไม่เกินผลผลิตคาดการณ์','✓'],['ผลตรวจล็อต: น้ำหนักแห้งผ่าน · ไม่พบสารปนเปื้อน','✓'],['e-Phyto และ invoice อ้าง ID ล็อตเดียวกับ DPP','✓']],
 links:['ทุกขั้นก่อนหน้า']});

/* ---------------- battery ---------------- */
const MFG={"type":["CredentialIssuer"],"id":"did:web:siamev.example","name":"บริษัท สยามอีวีเซลล์ จำกัด (ตัวอย่าง)","issuerAlsoKnownAs":[{"registeredId":"0215569000456","idScheme":{"id":"https://dbd.example","name":"ทะเบียนนิติบุคคล (DBD)"}}]};
const CAB={"type":["CredentialIssuer"],"id":"did:web:verifier-eu.example","name":"EU Verification Body (ตัวอย่าง)"};
const TLAB={"type":["CredentialIssuer"],"id":"did:web:batterylab.example","name":"Battery Test Lab · ISO/IEC 17025 (ตัวอย่าง)"};
const GTIN_B='08857654320754', SN='SEV75-2027-000418';
const MODEL_B=`${IDR}/01/${GTIN_B}`, PROD_B=`${MODEL_B}/21/${SN}`;
const FAC={"id":`${IDR}/414/8857654320006`,"name":"โรงงานประกอบแบตเตอรี่ สยามอีวีเซลล์ ระยอง (ตัวอย่าง)","registeredId":"8857654320006"};
const CELL='https://id.cellmaker.example/cells/NMC811-L21/batch/K2701-88';
const B=[];
B.push({n:1,t:'โรงงานประกอบแบตขึ้นทะเบียนสถานที่',chip:'dfr',who:'บริษัท สยามอีวีเซลล์',when:'ครั้งเดียว · อัปเดตรายปี',
 desc:'DFR ของโรงงานบอกที่ตั้ง กระบวนการผลิต และข้ออ้างระดับโรงงาน เช่น สัดส่วนไฟฟ้าหมุนเวียน ซึ่งมีผลต่อ carbon footprint ของแบตทุกก้อนที่ผลิตที่นี่',
 fields:[['credentialSubject.id',FAC.id,'GLN ของโรงงาน'],['processCategory','ISIC 2720 Manufacture of batteries and accumulators',''],['locationInformation','12.7063, 101.1510 (ระยอง, EEC)',''],['performanceClaim','ไฟฟ้าหมุนเวียน 45% (มี DCC รับรอง)','ใช้คำนวณ carbon footprint']],
 json:vc('DigitalFacilityRecord','https://vc.siamev.example/dfr/rayong-plant',MFG,'2027-01-05T00:00:00+07:00','2028-01-04T23:59:59+07:00',{
   "type":["Facility"],"id":FAC.id,"name":FAC.name,"registeredId":FAC.registeredId,
   "idScheme":{"id":"https://www.gs1.org/standards/id-keys/gln","name":"GS1 GLN"},"countryOfOperation":TH,
   "processCategory":[cls('2720','Manufacture of batteries and accumulators','https://unstats.un.org/unsd/classifications/Econ/isic','ISIC Rev.4')],
   "locationInformation":{"geoLocation":{"latitude":12.7063,"longitude":101.1510}},
   "address":{"addressLocality":"ปลวกแดง","addressRegion":"ระยอง","postalCode":"21140","addressCountry":TH},
   "relatedParty":[{"role":"owner","party":{"type":["Party"],"id":MFG.id,"name":MFG.name}}],
   "performanceClaim":[{"type":["Claim"],"name":"สัดส่วนไฟฟ้าหมุนเวียน 2026","claimedPerformance":[{"metric":{"id":"https://vocab.thdpp.example/metric/renewable-electricity-share","name":"ไฟฟ้าหมุนเวียน"},"measure":{"value":45,"unit":"P1"}}],"evidence":[link('https://vc.verifier-eu.example/rec/siamev-2026','Renewable electricity verification','dcc')]}]
 }),
 links:['DTE ประกอบ (ขั้น 3) madeAtFacility','DPP producedAtFacility (ขั้น 5)']});

B.push({n:2,t:'เซลล์จากผู้ผลิตต้นน้ำมาพร้อม DPP ของตัวเอง',chip:'dpp',who:'ผู้ผลิตเซลล์ (ต่างประเทศ)',when:'ก่อนประกอบ',
 desc:'แบตหนึ่งก้อนประกอบจากเซลล์ที่มี DPP ระดับล็อตของผู้ผลิตเซลล์ ใน DPP ของเซลล์มี materialProvenance ย้อนไปถึงเหมือง ผู้ผลิตแพ็กไม่ต้องคัดลอกข้อมูลนี้ แค่อ้าง ID ของล็อตเซลล์ใน DTE ขั้นถัดไป',
 fields:[['credentialSubject.id',CELL,'ID ล็อตเซลล์ของผู้ผลิตเซลล์'],['idGranularity','batch',''],['materialProvenance','Li (AU) · Ni (ID) · Co (CD) · กราไฟต์ (CN)','ต่อไปถึง DFR/DCC ของเหมือง'],['performanceClaim.evidence','DCC due diligence ของ supply chain','']],
 json:vc('DigitalProductPassport','https://vc.cellmaker.example/dpp/K2701-88',{"type":["CredentialIssuer"],"id":"did:web:cellmaker.example","name":"Cell Maker Co. (ตัวอย่าง)"},'2027-01-20T00:00:00Z','2037-01-20T00:00:00Z',{
   "type":["Product"],"id":CELL,"name":"NMC811 pouch cell 60 Ah","batchNumber":"K2701-88","idGranularity":"batch",
   "materialProvenance":[{"name":"Lithium","originCountry":{"countryCode":"AU","countryName":"Australia"},"massFraction":0.022,"recycledMassFraction":0.05},{"name":"Nickel","originCountry":{"countryCode":"ID","countryName":"Indonesia"},"massFraction":0.105,"recycledMassFraction":0.04},{"name":"Cobalt","originCountry":{"countryCode":"CD","countryName":"Congo, DR"},"massFraction":0.013,"recycledMassFraction":0.12},{"name":"Graphite","originCountry":{"countryCode":"CN","countryName":"China"},"massFraction":0.16}],
   "performanceClaim":[{"type":["Claim"],"name":"Supply chain due diligence","evidence":[link('https://vc.cab-dd.example/dd/cellmaker-2026','Due diligence audit','dcc')]}]
 }),
 links:['DTE ประกอบ inputProduct (ขั้น 3)']});

B.push({n:3,t:'ประกอบเซลล์เป็นแพ็ก 75 kWh',chip:'dte',who:'บริษัท สยามอีวีเซลล์',when:'10 ก.พ. 2570',
 desc:'MakeEvent เชื่อมล็อตเซลล์ (input) กับแพ็กรายชิ้น (output) output ใช้ ID เดียวกับ DPP ของแพ็ก ต่อย้อนกลับไปถึงเซลล์และเหมืองได้โดยไม่ต้องรวมข้อมูลไว้ที่เดียว',
 fields:[['inputProduct','เซลล์ 360 ชิ้น (ล็อต K2701-88) · BMS · housing','ID ล็อตเซลล์ → DPP เซลล์'],['outputProduct.product.id',PROD_B,'= DPP แพ็กรายชิ้น'],['madeAtFacility.id',FAC.id,'→ DFR โรงงาน'],['activityType','GS1 CBV: assembling','']],
 json:vc('DigitalTraceabilityEvent','https://vc.siamev.example/dte/assemble-'+SN,MFG,'2027-02-10T16:00:00+07:00',null,[{
   "type":["MakeEvent"],"id":`https://vc.siamev.example/dte/assemble-${SN}#e1`,"eventDate":"2027-02-10T15:42:00+07:00",
   "activityType":cls('assembling','Assembling','https://ref.gs1.org/cbv/BizStep','GS1 CBV BizStep'),
   "inputProduct":[{"product":{"id":CELL,"name":"NMC811 pouch cell 60 Ah","batchNumber":"K2701-88"},"quantity":{"value":360,"unit":"H87"},"disposition":"consumed"},{"product":{"id":"https://id.siamev.example/parts/BMS-V3/sn/BMS3-771204","name":"Battery management system"},"quantity":{"value":1,"unit":"H87"},"disposition":"consumed"}],
   "outputProduct":[{"product":{"id":PROD_B,"name":"EV battery pack 75 kWh","modelNumber":"SEV-NMC811-75","itemNumber":SN},"quantity":{"value":1,"unit":"H87"},"disposition":"new"}],
   "madeAtFacility":{"id":FAC.id,"name":FAC.name}
 }]),
 links:['DPP เซลล์ (ขั้น 2)','DFR โรงงาน (ขั้น 1)','DPP แพ็ก (ขั้น 5)']});

B.push({n:4,t:'รับรองระดับรุ่น: carbon footprint และ UN 38.3',chip:'dcc',who:'หน่วยทวนสอบ (EU) · แล็บทดสอบ',when:'ม.ค. 2570 · ใช้ทั้งรุ่น',
 desc:'Battery Regulation ให้ประกาศ carbon footprint ต่อรุ่นต่อโรงงาน DCC จึงอ้าง ID ระดับรุ่น (ไม่มี serial) แบตทุกก้อนในรุ่นนี้ชี้ evidence มาที่ใบเดียวกัน UN 38.3 เป็นผลทดสอบความปลอดภัยสำหรับขนส่งแบตลิเธียม',
 fields:[['assessedProduct.product.id',MODEL_B,'ระดับรุ่น'],['assessedPerformance','61.5 kg CO₂e ต่อ kWh','carbon footprint ต่อหน่วยพลังงาน'],['attestationType','verification · testing',''],['conformance','true','']],
 json:vc('DigitalConformityCredential','https://vc.verifier-eu.example/cf/SEV-NMC811-75-rayong',CAB,'2027-01-25T00:00:00Z','2032-01-24T23:59:59Z',{
   "type":["ConformityAttestation"],"id":"https://vc.verifier-eu.example/cf/SEV-NMC811-75-rayong#attestation",
   "assessorLevel":"3rdParty","attestationType":"verification","issuedToParty":{"id":MFG.id,"name":MFG.name},
   "conformityAssessment":[{"type":["ConformityAssessment"],"assessmentDate":"2027-01-22",
     "assessmentCriteria":[{"id":"https://vocab.thdpp.example/criteria/eu-battery-cf","name":"Carbon footprint ตาม EU Battery Regulation (EU) 2023/1542"}],
     "assessedProduct":[{"product":{"id":MODEL_B,"name":"EV battery pack 75 kWh","modelNumber":"SEV-NMC811-75"},"idVerifiedByCAB":true}],
     "assessedFacility":[{"facility":{"id":FAC.id,"name":FAC.name},"idVerifiedByCAB":true}],
     "assessedPerformance":[{"metric":{"id":"https://vocab.thdpp.example/metric/battery-carbon-footprint","name":"Carbon footprint (kg CO2e / kWh)"},"measure":{"value":61.5,"unit":"KGM"}}],
     "conformance":true}]
 }),
 links:['DPP แพ็กอ้างเป็น evidence (ขั้น 5)','DFR โรงงาน (assessedFacility)']});

B.push({n:5,t:'ผู้ผลิตออก DPP ของแพ็กรายชิ้น',chip:'dpp',who:'บริษัท สยามอีวีเซลล์',when:'10 ก.พ. 2570 · อายุ 10+ ปี',
 desc:'DPP แพ็กมีทั้งข้อมูลคงที่ (รุ่น เคมี ความจุ วัสดุ) และข้อมูลที่เปลี่ยนตามการใช้งาน (สุขภาพแบต) ข้อมูลแต่ละส่วนเปิดให้ดูตามระดับสิทธิ์ 3 ระดับตาม Battery Regulation',
 fields:[['credentialSubject.id',PROD_B,'ID รายชิ้น (GTIN + serial)'],['idGranularity','item',''],['productCategory','HS 850760 Lithium-ion accumulators',''],['characteristics','NMC811 · 75 kWh · 400 V · 450 กก. · 2,000 รอบ',''],['materialProvenance','Li 2% (recycled 5%) · Ni 8% (4%) · Co 1% (12%) ฯลฯ','รวมจาก DPP เซลล์'],['performanceClaim','carbon 61.5 kg CO₂e/kWh · recycled content · UN 38.3','evidence → DCC ขั้น 4'],['relatedDocument','DTE ประกอบ · คู่มือถอดแยก (ผู้มีส่วนได้เสีย) · ใบรับ EU Registry','']],
 json:vc('DigitalProductPassport','https://vc.siamev.example/dpp/'+SN,MFG,'2027-02-10T18:00:00+07:00','2037-02-10T00:00:00+07:00',{
   "type":["Product"],"id":PROD_B,"name":"EV battery pack 75 kWh NMC811",
   "idScheme":{"id":"https://www.gs1.org/standards/id-keys/gtin","name":"GS1 GTIN + serial"},
   "modelNumber":"SEV-NMC811-75","itemNumber":SN,"idGranularity":"item",
   "productCategory":[cls('850760','Lithium-ion accumulators','https://www.wcoomd.org/en/topics/nomenclature.aspx','HS 2022')],
   "producedAtFacility":{"id":FAC.id,"name":FAC.name,"registeredId":FAC.registeredId},
   "countryOfProduction":TH,
   "relatedParty":[{"role":"manufacturer","party":{"type":["Party"],"id":MFG.id,"name":MFG.name,"registeredId":"0215569000456"}}],
   "dimensions":{"weight":{"value":450,"unit":"KGM"}},
   "characteristics":{"batteryCategory":"EV battery","chemistry":"NMC811","ratedCapacity":{"value":75,"unit":"KWH"},"nominalVoltage":{"value":400,"unit":"VLT"},"expectedLifetimeCycles":2000,"manufactureDate":"2027-02-10","stateOfHealth":{"value":100,"unit":"P1"}},
   "materialProvenance":[{"name":"Lithium","originCountry":{"countryCode":"AU","countryName":"Australia"},"massFraction":0.02,"recycledMassFraction":0.05},{"name":"Nickel","originCountry":{"countryCode":"ID","countryName":"Indonesia"},"massFraction":0.08,"recycledMassFraction":0.04},{"name":"Cobalt","originCountry":{"countryCode":"CD","countryName":"Congo, DR"},"massFraction":0.01,"recycledMassFraction":0.12},{"name":"Aluminium","originCountry":TH,"massFraction":0.2,"recycledMassFraction":0.3}],
   "performanceClaim":[
     {"type":["Claim"],"name":"Battery carbon footprint","referenceRegulation":[{"id":"https://eur-lex.europa.eu/eli/reg/2023/1542/oj","name":"EU Battery Regulation (EU) 2023/1542"}],"claimedPerformance":[{"metric":{"id":"https://vocab.thdpp.example/metric/battery-carbon-footprint","name":"Carbon footprint (kg CO2e / kWh)"},"measure":{"value":61.5,"unit":"KGM"}}],"evidence":[link('https://vc.verifier-eu.example/cf/SEV-NMC811-75-rayong','Carbon footprint verification','dcc')]},
     {"type":["Claim"],"name":"Recycled content","claimedPerformance":[{"metric":{"name":"Recycled cobalt"},"measure":{"value":12,"unit":"P1"}},{"metric":{"name":"Recycled lithium"},"measure":{"value":5,"unit":"P1"}},{"metric":{"name":"Recycled nickel"},"measure":{"value":4,"unit":"P1"}}]},
     {"type":["Claim"],"name":"Transport safety UN 38.3","evidence":[link('https://vc.batterylab.example/un383/SEV-NMC811-75','UN 38.3 test report','dcc')]}
   ],
   "relatedDocument":[link(`https://vc.siamev.example/dte/assemble-${SN}`,'ประกอบแพ็ก','dte'),{"linkURL":"https://docs.siamev.example/SEV-NMC811-75/dismantling","linkName":"ข้อมูลถอดแยก / รีไซเคิล (เฉพาะผู้มีส่วนได้เสีย)","linkType":"https://vocab.thdpp.example/linkTypes/dismantling"},{"linkURL":"https://registry.dpp.example.eu/receipt/…","linkName":"EU DPP Registry receipt","linkType":"https://vocab.thdpp.example/linkTypes/registry-receipt"}]
 },status('https://vc.siamev.example/status/1',418)),
 access:[['สาธารณะ','ผู้ผลิต รุ่น เคมี ความจุ น้ำหนัก carbon footprint recycled content'],['ผู้มีส่วนได้เสีย (ซ่อม · รีไซเคิล)','ข้อมูลถอดแยก องค์ประกอบละเอียด ชิ้นส่วนอะไหล่ ข้อควรระวังความปลอดภัย'],['หน่วยงานรัฐ / notified body','รายงานผลทดสอบฉบับเต็ม']],
 links:['DCC carbon + UN 38.3 (ขั้น 4)','DFR โรงงาน (ขั้น 1)','DTE ประกอบ (ขั้น 3)']});

B.push({n:6,t:'ลงทะเบียน: National DPP Registry → EU DPP Registry',chip:'doc',who:'Provider · Cross-border Gateway',when:'ก่อนส่งออก',
 desc:'EU Registry เก็บแค่ตัวระบุกับผู้รับผิดชอบ เนื้อหา DPP ยังอยู่ที่ผู้ผลิตหรือ provider ข้างล่างเป็นโครงแนวคิด ไม่ใช่รูปแบบ API ทางการของ EU',
 fields:[['productIdentifier',PROD_B,''],['economicOperator','did:web:siamev.example + เลขนิติบุคคล',''],['commodityCode','8507 60',''],['passportEndpoint','https://vc.siamev.example/dpp/'+SN,'']],
 json:{"registration (แนวคิด)":{"productIdentifier":PROD_B,"passportIdentifier":`https://vc.siamev.example/dpp/${SN}`,"economicOperator":{"id":MFG.id,"registeredId":"0215569000456","country":"TH"},"facilityIdentifier":FAC.id,"commodityCode":"850760","productCategory":"EV battery","backupCopyProvider":"https://dpp-provider.thdpp.example","registeredAt":"2027-02-12T09:00:00Z"}},
 links:['DPP แพ็ก (ขั้น 5)','ศุลกากร EU เช็กตอนนำเข้า']});

B.push({n:7,t:'ส่งทางเรือ แหลมฉบัง → รอตเตอร์ดัม',chip:'dte',who:'ผู้ผลิต / forwarder',when:'20 ก.พ. – 25 มี.ค. 2570',
 desc:'MoveEvent ระดับชิ้นหรือระดับพาเลท ใช้ UN/LOCODE ของท่าเรือ และเลข B/L เป็น consignmentId',
 fields:[['movedProduct.product.id',PROD_B,''],['fromFacility → toFacility','THLCH → NLRTM','UN/LOCODE'],['consignmentId','urn:thdpp:bl:SIAMEV-LCH-RTM-2027-0033','']],
 json:vc('DigitalTraceabilityEvent','https://vc.siamev.example/dte/ship-2027-0033',MFG,'2027-03-25T12:00:00Z',null,[{
   "type":["MoveEvent"],"id":"https://vc.siamev.example/dte/ship-2027-0033#e1","eventDate":"2027-02-20T10:00:00+07:00",
   "activityType":cls('shipping','Shipping','https://ref.gs1.org/cbv/BizStep','GS1 CBV BizStep'),
   "movedProduct":[{"product":{"id":PROD_B,"itemNumber":SN},"quantity":{"value":1,"unit":"H87"},"disposition":"in_transit"}],
   "fromFacility":{"id":"https://service.unece.org/trade/locode/THLCH","name":"Laem Chabang"},
   "toFacility":{"id":"https://service.unece.org/trade/locode/NLRTM","name":"Rotterdam"},
   "consignmentId":"urn:thdpp:bl:SIAMEV-LCH-RTM-2027-0033"
 }]),
 links:['DPP แพ็ก']});

B.push({n:8,t:'หลายปีต่อมา: ตรวจสุขภาพแบต ซ่อม และรีไซเคิล',chip:'dte',who:'ศูนย์บริการ · โรงรีไซเคิล (EU)',when:'2030 เป็นต้นไป',
 desc:'ModifyEvent ต่อท้ายประวัติของแบตก้อนเดิม ผู้ออกคือคนที่ทำกิจกรรมนั้น ไม่ใช่ผู้ผลิต DPP เดิมจึงไม่ต้องแก้ แค่มีลิงก์ใหม่เพิ่มใน IDR',
 fields:[['credentialSubject[0].type','ModifyEvent',''],['modifiedProduct.product.id',PROD_B,'ก้อนเดิม'],['sensorData','State of Health 91%','ค่าจาก BMS'],['issuer','did:web:service-de.example','ศูนย์บริการ (ต้องอยู่ใน trust list)']],
 json:vc('DigitalTraceabilityEvent','https://vc.service-de.example/dte/soh-'+SN+'-2030',{"type":["CredentialIssuer"],"id":"did:web:service-de.example","name":"EV Service Center GmbH (ตัวอย่าง)"},'2030-05-12T10:00:00Z',null,[{
   "type":["ModifyEvent"],"id":`https://vc.service-de.example/dte/soh-${SN}-2030#e1`,"eventDate":"2030-05-12T09:30:00Z",
   "activityType":cls('inspecting','Inspecting','https://ref.gs1.org/cbv/BizStep','GS1 CBV BizStep'),
   "modifiedProduct":[{"product":{"id":PROD_B,"itemNumber":SN},"disposition":"active"}],
   "modifiedAtFacility":{"id":"https://id.service-de.example/site/munich","name":"EV Service Center Munich (ตัวอย่าง)"},
   "sensorData":[{"metric":{"id":"https://vocab.thdpp.example/metric/state-of-health","name":"State of Health"},"measure":[{"value":91,"unit":"P1"}],"sensor":{"id":"urn:siamev:bms:BMS3-771204","name":"BMS"}}]
 }]),
 links:['DPP แพ็ก (ID เดิม)','IDR เพิ่มลิงก์ dte']});

/* ---------------- render steps ---------------- */
const CV={dpp:'var(--dpp)',dfr:'var(--dfr)',dcc:'var(--dcc)',dte:'var(--dte)',doc:'var(--doc)'};
const LB={dpp:'DPP',dfr:'DFR',dcc:'DCC',dte:'DTE',doc:'DOC'};
function renderSteps(list,el){
  el.innerHTML=list.map(s=>{
    const rows=s.fields.map(f=>`<tr><td class="f">${esc(f[0])}</td><td>${esc(f[1])}</td><td class="n">${esc(f[2]||'')}</td></tr>`).join('');
    let extra='';
    if(s.mb){extra=`<div class="card" style="margin-top:12px;box-shadow:none"><b>ตรวจ mass balance ก่อนออก e-Phyto</b><div class="mb">${PLOTS.map(p=>{const tot=p[4]+p[2],pct=Math.round(tot/p[3]*100);return `<div>${p[1]} (${p[0]}) · สะสมฤดูนี้ ${tot.toLocaleString()} / ${p[3].toLocaleString()} กก.<div class="bar"><i style="width:${pct}%"></i></div></div><div class="ok">${pct}% ✓</div>`}).join('')}</div><p style="font-size:13.5px;color:var(--muted);margin:8px 0 0">สะสม = ส่งก่อนหน้าในฤดูนี้ + ล็อตนี้ ถ้าเกิน 100% ของผลผลิตคาดการณ์ใน DCC GAP ระบบหยุดการออก e-Phyto</p></div>`}
    if(s.access){extra=`<div class="tbl"><table><thead><tr><th>ระดับสิทธิ์ (DAC)</th><th>เห็นอะไร</th></tr></thead><tbody>${s.access.map(a=>`<tr><td><b>${a[0]}</b></td><td>${a[1]}</td></tr>`).join('')}</tbody></table></div>`}
    if(s.checks){extra=`<div class="tbl"><table><thead><tr><th>GACC ตรวจ</th><th>ผล</th></tr></thead><tbody>${s.checks.map(c=>`<tr><td>${c[0]}</td><td class="ok">${c[1]}</td></tr>`).join('')}</tbody></table></div>`}
    return `<article class="step" style="--c:${CV[s.chip]}">
      <div class="shead"><div class="snum">${s.n}</div><div><h3>${esc(s.t)}</h3>
      <div class="smeta"><span class="chip ${s.chip}">${LB[s.chip]}</span><span>ผู้ออก: ${esc(s.who)}</span><span>เมื่อ: ${esc(s.when)}</span></div></div></div>
      <p class="sdesc">${esc(s.desc)}</p>
      <div class="tbl"><table class="ft"><thead><tr><th>ฟิลด์</th><th>ค่าตัวอย่าง</th><th>หมายเหตุ</th></tr></thead><tbody>${rows}</tbody></table></div>
      ${extra}
      <details><summary>ดู JSON ${s.chip==='doc'?'(ย่อ)':'ของ credential'}</summary><pre>${hl(s.json)}</pre></details>
      <div class="links">เชื่อมกับ: ${s.links.map(l=>`<span class="lk">${esc(l)}</span>`).join('')}</div>
    </article>`}).join('');
}
renderSteps(D,document.getElementById('dl-steps-durian'));
renderSteps(B,document.getElementById('dl-steps-battery'));

/* ---------------- hub figures ---------------- */
function hub(cfg){
  const N=cfg.nodes, W=1100,H=560;
  const pos={TL:[40,30],TC:[430,30],TR:[820,30],ML:[40,232],C:[410,222],MR:[820,232],BL:[40,434],BC:[430,434],BR:[820,434]};
  let s=`<svg viewBox="0 0 ${W} ${H}" xmlns="http://www.w3.org/2000/svg" font-family="Mitr,sans-serif"><defs><marker id="a${cfg.id}" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0 0L10 5L0 10z" fill="#5B6573"/></marker></defs><rect width="${W}" height="${H}" fill="#fff"/>`;
  // edges first
  cfg.edges.forEach(e=>{
    s+=`<path d="${e.d}" fill="none" stroke="${e.c||'#8A94A3'}" stroke-width="2" ${e.dash?'stroke-dasharray="6 5"':''} marker-end="url(#a${cfg.id})"/>`;
    if(e.l){const [x,y,anc]=e.lp;s+=`<text x="${x}" y="${y}" font-size="12.5" font-family="ui-monospace,Menlo,Consolas,monospace" fill="#34445C" text-anchor="${anc||'middle'}" paint-order="stroke" stroke="#fff" stroke-width="5" stroke-linejoin="round">${esc(e.l)}</text>`}
  });
  Object.entries(N).forEach(([k,n])=>{
    const [x,y]=pos[k], w=k==='C'?280:240, h=k==='C'?116:96, col=getComputedStyle(document.documentElement).getPropertyValue('--'+n.t).trim()||'#666', soft=getComputedStyle(document.documentElement).getPropertyValue('--'+n.t+'-soft').trim()||'#eee';
    if(n.stack){s+=`<rect x="${x+10}" y="${y+10}" width="${w}" height="${h}" rx="12" fill="${soft}" stroke="${col}" stroke-width="1.2"/><rect x="${x+5}" y="${y+5}" width="${w}" height="${h}" rx="12" fill="${soft}" stroke="${col}" stroke-width="1.2"/>`}
    s+=`<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="12" fill="${k==='C'?'#FFFBEA':'#fff'}" stroke="${col}" stroke-width="${k==='C'?3:1.8}"/>`;
    s+=`<rect x="${x+14}" y="${y+14}" width="${n.t==='doc'?44:40}" height="20" rx="5" fill="${col}"/><text x="${x+14+(n.t==='doc'?22:20)}" y="${y+28.5}" font-size="12" font-weight="600" fill="#fff" text-anchor="middle" font-family="ui-monospace,Menlo,Consolas,monospace">${n.t==='doc'?'DOC':n.t.toUpperCase()}</text>`;
    s+=`<text x="${x+64}" y="${y+29}" font-size="15" font-weight="600" fill="#1B2533">${esc(n.title)}</text>`;
    (n.sub||[]).forEach((l,i)=>{s+=`<text x="${x+14}" y="${y+56+i*19}" font-size="13" fill="#667085">${esc(l)}</text>`});
  });
  s+='</svg>';
  return s+`<div class="figcap">${cfg.cap}</div>`;
}
const EC='#5B6573';
document.getElementById('dl-fig-durian').innerHTML=hub({id:'d',cap:'DPP ล็อต A26 อยู่ตรงกลาง ลูกศรบอกฟิลด์ที่ใช้อ้างถึงกัน แปลง GAP ไม่ได้ต่อกับ DPP ตรง ๆ แต่ต่อผ่าน DCC GAP และ DTE คัดบรรจุ',
 nodes:{TL:{t:'dcc',title:'GAP ×3 แปลง',sub:['ออกโดย กรมวิชาการเกษตร','ผลผลิตคาดการณ์ต่อฤดู'],stack:true},TC:{t:'dfr',title:'โรงคัดบรรจุ',sub:['GLN 8851234560004','+ DCC GMP'],},TR:{t:'dcc',title:'ผลตรวจล็อต A26',sub:['แล็บ ISO/IEC 17025','น้ำหนักแห้ง 34.5% · ไม่พบ BY2']},
  ML:{t:'dfr',title:'แปลง GAP ×3',sub:['พิกัด + ขอบเขตแปลง','รหัสแปลง 9001-2201-…'],stack:true},C:{t:'dpp',title:'ทุเรียน ล็อต A26 ★',sub:['/01/08851234560011/10/A26','batch · 18,000 กก. · 1,000 กล่อง']},MR:{t:'doc',title:'e-Phyto',sub:['กรมวิชาการเกษตร','accessRole: authority']},
  BL:{t:'dte',title:'MakeEvent คัดบรรจุ',sub:['3 ล็อตเก็บเกี่ยว → A26','mass balance คำนวณที่นี่']},BC:{t:'doc',title:'Invoice (TLX)',sub:['lineItem.productId = A26','accessRole: partner']},BR:{t:'dte',title:'MoveEvent ขนส่ง',sub:['โรงคัด → ด่านโหยวอี้กวน','อุณหภูมิ 15 °C']}},
 edges:[
  {d:'M430 230 L282 128',l:'performanceClaim.evidence',lp:[372,206,'end']},
  {d:'M550 222 L550 128',l:'producedAtFacility',lp:[556,178,'start']},
  {d:'M670 230 L818 128',l:'performanceClaim.evidence',lp:[728,206,'start']},
  {d:'M690 280 L818 280',l:'relatedDocument',lp:[754,270]},
  {d:'M550 338 L550 432',l:'relatedDocument',lp:[556,392,'start']},
  {d:'M282 436 L430 330',l:'outputProduct.id = DPP id',lp:[318,421,'start']},
  {d:'M818 436 L670 330',l:'movedProduct.id',lp:[790,372,'start']},
  {d:'M160 128 L160 230',l:'assessedFacility',lp:[168,164,'start'],dash:true},
  {d:'M160 434 L160 330',l:'inputProduct (ล็อตจากแปลง)',lp:[168,372,'start'],dash:true}
 ]});
document.getElementById('dl-fig-battery').innerHTML=hub({id:'b',cap:'DPP แพ็กรายชิ้นอยู่ตรงกลาง DCC ออกระดับรุ่นแล้วใช้ร่วมกันทั้งรุ่น ข้อมูลต้นน้ำต่อผ่าน DTE ประกอบ → DPP ของเซลล์ → เหมือง',
 nodes:{TL:{t:'dcc',title:'Carbon footprint',sub:['หน่วยทวนสอบ (ระดับรุ่น)','61.5 kg CO₂e / kWh']},TC:{t:'dfr',title:'โรงงานประกอบ ระยอง',sub:['GLN 8857654320006','+ DCC ไฟฟ้าหมุนเวียน 45%']},TR:{t:'dcc',title:'UN 38.3',sub:['แล็บทดสอบ (ระดับรุ่น)','ความปลอดภัยการขนส่ง']},
  ML:{t:'dpp',title:'DPP ล็อตเซลล์ (ต้นน้ำ)',sub:['ผู้ผลิตเซลล์ · batch','materialProvenance → เหมือง']},C:{t:'dpp',title:'แบต 75 kWh ★',sub:['/01/08857654320754/21/SEV75-…','item · NMC811 · 450 กก.']},MR:{t:'doc',title:'EU DPP Registry',sub:['ลงทะเบียน ID + ผู้ประกอบการ','ไม่ใช่ VC']},
  BL:{t:'dte',title:'MakeEvent ประกอบ',sub:['เซลล์ 360 ชิ้น → แพ็ก','ที่โรงงานระยอง']},BC:{t:'dte',title:'ModifyEvent',sub:['SoH 91% · ซ่อม · รีไซเคิล','ออกโดยศูนย์บริการ']},BR:{t:'dte',title:'MoveEvent ทางเรือ',sub:['THLCH → NLRTM','B/L เป็น consignmentId']}},
 edges:[
  {d:'M430 230 L282 128',l:'performanceClaim.evidence',lp:[372,206,'end']},
  {d:'M550 222 L550 128',l:'producedAtFacility',lp:[556,178,'start']},
  {d:'M670 230 L818 128',l:'performanceClaim.evidence',lp:[728,206,'start']},
  {d:'M690 280 L818 280',l:'ลงทะเบียน ID',lp:[754,270]},
  {d:'M550 432 L550 340',l:'modifiedProduct.id',lp:[556,392,'start']},
  {d:'M282 436 L430 330',l:'outputProduct.id = DPP id',lp:[318,421,'start']},
  {d:'M818 436 L670 330',l:'movedProduct.id',lp:[790,372,'start']},
  {d:'M160 434 L160 330',l:'inputProduct (ล็อตเซลล์)',lp:[168,372,'start'],dash:true}
 ]});

/* ---------------- tabs (no #hash: the hub uses it for page routing) ---------------- */
const tabs=[...document.querySelectorAll('#data .dl-tabs button')], panels=[...document.querySelectorAll('#data [role=tabpanel]')];
function show(id){
  if(!panels.some(p=>p.id===id))id='dl-overview';
  panels.forEach(p=>p.hidden=p.id!==id);tabs.forEach(t=>t.setAttribute('aria-selected',t.dataset.t===id));
}
tabs.forEach(t=>t.addEventListener('click',()=>{show(t.dataset.t);try{sessionStorage.setItem('dpp.dltab',t.dataset.t)}catch(e){}}));
let first=null;try{first=sessionStorage.getItem('dpp.dltab')}catch(e){}
show(first);
})();
