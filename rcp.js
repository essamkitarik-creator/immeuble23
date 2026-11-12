const defAmt=(o,t)=>{const dl=OS(o).dl;return t==='monthly'?S.fee:t==='debt'?dl:S.fee+dl};
function vRcp(){$('#v').innerHTML=`<div class="gl"><h2>إيصال استلام الاشتراك · فردي</h2><div class="fr"><div><label>المالك</label><select id="rn" onchange="rAuto()">${oOpts()}</select></div><div><label>النوع</label><select id="rty" onchange="rAuto()">${Object.entries(TY).map(([a,b])=>`<option value="${a}">${b}</option>`).join('')}</select></div><div><label>المبلغ</label><input id="ra2" type="number" min="0" value="${S.fee}"></div><div><label>التاريخ</label><input id="rdt2" type="date" value="${today()}"></div><div><button class="b p" onclick="rOne()">🖨️ طباعة الإيصال</button></div></div></div>
<div class="gl"><h2>طباعة جماعية</h2><div class="fr"><div><label>النوع</label><select id="bty">${Object.entries(TY).map(([a,b])=>`<option value="${a}">${b}</option>`).join('')}</select></div><div><label>التاريخ</label><input id="bdt" type="date" value="${today()}"></div><div><button class="b p" onclick="rAll()">🖨️ طباعة للمحددين</button></div></div>
<div class="fr">${S.owners.map(o=>`<label><input type="checkbox" class="bc" value="${o.n}" checked style="width:auto"> ${o.n} · ${e(o.name)}</label>`).join('')}</div></div>
<div class="gl"><h2>آخر الإيصالات (${S.rcs.length})</h2>${T(['الرقم','التاريخ','الشقة','المالك','النوع','المبلغ'],S.rcs.slice(-15).reverse().map(r=>[r.no,r.date,r.n,e(oname(r.n)),TY[r.t],fm(r.a)]))}</div>`}
const rAuto=()=>{const o=S.owners.find(o=>o.n==$('#rn').value);$('#ra2').value=defAmt(o,$('#rty').value)};
function rOne(){const o=S.owners.find(o=>o.n==$('#rn').value);prt([{o,t:$('#rty').value,a:+$('#ra2').value||0}],$('#rdt2').value)}
function rAll(){const ns=[...document.querySelectorAll('.bc:checked')].map(c=>+c.value),t=$('#bty').value;prt(S.owners.filter(o=>ns.includes(o.n)).map(o=>({o,t,a:defAmt(o,t)})),$('#bdt').value)}
const A1=['','واحد','اثنان','ثلاثة','أربعة','خمسة','ستة','سبعة','ثمانية','تسعة','عشرة','أحد عشر','اثنا عشر','ثلاثة عشر','أربعة عشر','خمسة عشر','ستة عشر','سبعة عشر','ثمانية عشر','تسعة عشر'],A10=['','','عشرون','ثلاثون','أربعون','خمسون','ستون','سبعون','ثمانون','تسعون'],A100=['','مائة','مئتان','ثلاثمائة','أربعمائة','خمسمائة','ستمائة','سبعمائة','ثمانمائة','تسعمائة'];
function a3(n){const h=Math.floor(n/100),r=n%100,p=[];if(h)p.push(A100[h]);if(r){if(r<20)p.push(A1[r]);else{const u=r%10,t=Math.floor(r/10);p.push(u?A1[u]+' و'+A10[t]:A10[t])}}return p.join(' و')}
function aw(n){n=Math.round(n);if(!n)return'صفر درهم';const th=Math.floor(n/1000),r=n%1000,p=[];if(th)p.push(th===1?'ألف':th===2?'ألفان':th<=10?a3(th)+' آلاف':a3(th)+' ألف');if(r)p.push(a3(r));return p.join(' و')+' درهم'}
const rcHtml=(o,t,a,date,no,ms)=>{const ar=new Date(date+'T12:00:00').toLocaleDateString('ar-MA-u-nu-latn',{day:'numeric',month:'long',year:'numeric'}),fr=date.split('-').reverse().join('/');
return`<div class="rc" dir="rtl"><div class="rr rt"><span class="g"><i>درهم</i><b class="v">${f(a)}</b><i>B.P. DH</i></span><span class="g"><i>عدد</i><b class="v">${no}</b><i>N°</i></span></div><h3>REÇU &nbsp; إيصال</h3>
<div class="rr"><i>توصلت من السيد</i><b class="v">${e(o.name)}</b><i>Reçu de</i></div>
<div class="rr"><i>بما قدره</i><b class="v">${aw(a)}</b><i>la somme de</i></div>
<div class="rr"><i>وذلك</i><b class="v">${TY[t]}${ms?' ('+ms+')':''} · شقة ${o.n}</b><i>pour</i></div>
<div class="rr"><i>في</i><b class="v">الدار البيضاء</b><i>الموافق</i><b class="v">${ar}</b><i>le</i><b class="v">${fr}</b></div>
<div class="rr rf"><span></span><span><i>الامضاء</i> <i>Signature</i></span></div></div>`};
async function prt(l,date){if(!l.length)return;date=date||today();const yy=date.slice(2,4),rows=[],mx=()=>Math.max(0,...S.rcs.filter(r=>r.no.startsWith(yy+'/')).map(r=>+r.no.split('/')[1]||0),...rows.map(r=>+r.no.split('/')[1]));
const hs=l.map(({o,t,a,ms})=>{const no=`${yy}/${mx()+1}`;rows.push({no,date,n:o.n,t,a});return rcHtml(o,t,a,date,no,ms)});
$('#pr').innerHTML=Array.from({length:Math.ceil(hs.length/3)},(_,i)=>`<div class="pg">${hs.slice(i*3,i*3+3).join('<div class="cut"></div>')}</div>`).join('');
try{await Q(SB.from('receipts').insert(rows));S.rcs.push(...rows)}catch(_){return}setTimeout(()=>window.print(),150)}
