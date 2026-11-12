function ledger(){const r=[];
if(role()==='admin')S.pays.filter(p=>p.st==='paid').forEach(x=>r.push({d:x.date||'',lb:x.date||'',k:'in',t:`${TY[x.type]}${x.m!==null&&x.type!=='debt'?' — '+M[x.m]:''} · شقة ${x.n} · ${oname(x.n)}`,a:x.amt,id:'p'+x.id}));
else S.inm.forEach((x,i)=>r.push({d:x.ym?x.ym+'-01':'',lb:x.ym||'',k:'in',t:`${x.kind==='debt'?'تسديد ديون سابقة':'اشتراكات شهرية'} (${x.cnt} دفعة)`,a:x.total,id:'p'+i}));
S.exps.forEach(x=>r.push({d:x.date,lb:x.date,k:'out',t:`${x.cat}${x.note?' — '+x.note:''}`,a:x.amt,id:'x'+x.id}));
r.sort((a,b)=>a.d.localeCompare(b.d)||a.id.localeCompare(b.id));let b=S.prev;r.forEach(x=>{b+=x.k==='in'?x.a:-x.a;x.b=b});return r}
const missing=()=>{if(new Date().getFullYear()!==YR)return[];const cm=new Date().getMonth(),r=[];S.owners.forEach(o=>{for(let i=0;i<=cm;i++)if(!S.pays.some(p=>p.n===o.n&&p.m===i))r.push({n:o.n,m:i})});return r};
async function genDues(){const l=missing();if(!l.length)return alert('كل المستحقات الشهرية مُصدرة');if(!confirm(`إصدار ${l.length} مستحقًا شهريًا بقيمة ${fm(l.length*S.fee)} حتى ${M[new Date().getMonth()]}؟`))return;await Q(SB.from('payments').insert(l.map(x=>({n:x.n,m:x.m,amt:S.fee,dpart:0,type:'monthly',date:`${YR}-${pad(x.m+1)}-${pad(S.due_day||8)}`,st:'pending'}))));await reload();render()}
async function setDate(id){const d=prompt('تاريخ القبض (YYYY-MM-DD)',today());if(!d)return;if(!/^\d{4}-\d{2}-\d{2}$/.test(d))return alert('صيغة غير صحيحة');await Q(SB.from('payments').update({date:d}).eq('id',id));await reload();render()}
function auditBox(){const pd=S.pays.filter(p=>p.st==='paid'),k={},L=[];S.pays.filter(p=>p.m!==null).forEach(p=>k[p.n+'-'+p.m]=(k[p.n+'-'+p.m]||0)+1);
const dup=Object.values(k).filter(v=>v>1).length,ov=S.debts.filter(d=>d.dp>d.d0).length,und=pd.filter(p=>!p.date),fut=pd.filter(p=>p.date>today()),mis=missing(),od=S.pays.filter(p=>p.st==='late'),odn=new Set(od.map(p=>p.n)).size,fe=pd.filter(p=>p.type==='monthly'&&p.amt!==S.fee).length;
L.push([!dup,dup?`${dup} شهرًا مسجّلًا أكثر من مرة لنفس المالك`:'لا توجد دفعات مكررة لنفس المالك والشهر']);
L.push([!ov,ov?`${ov} مالكًا سدّد من الدين أكثر من أصله`:'لا يوجد تسديد زائد في الديون السابقة']);
L.push([!und.length,und.length?`${und.length} دفعة مقبوضة بلا تاريخ (تدخل الخزينة لكن لا تظهر في الرسم الشهري): ${und.map(p=>`<button class="b s" onclick="setDate(${p.id})">شقة ${p.n} · ${fm(p.amt)} · تعيين التاريخ</button>`).join(' ')}`:'كل الدفعات المقبوضة مؤرّخة']);
L.push([!fut.length,fut.length?`${fut.length} دفعة بتاريخ مستقبلي`:'لا توجد دفعات بتاريخ مستقبلي']);
L.push([!mis.length,mis.length?`${mis.length} مستحقًا شهريًا لم يُصدر بعد (${fm(mis.length*S.fee)}) <button class="b s p" onclick="genDues()">إصدار المستحقات</button>`:'كل المستحقات الشهرية حتى الشهر الحالي مُصدرة']);
L.push([!od.length,od.length?`${od.length} دفعة متأخرة عن وقتها لدى ${odn} مالكًا بقيمة ${fm(sum(od.map(p=>p.amt)))} (تتحول تلقائيًا إلى «متأخر» بعد يوم ${S.due_day||8} من شهرها)`:'لا توجد دفعات متأخرة']);
L.push([!fe,fe?`${fe} دفعة شهرية مبلغها يختلف عن الاشتراك (${fm(S.fee)})`:'كل الدفعات الشهرية بقيمة الاشتراك']);
return`<div class="gl"><h2>تدقيق الحسابات</h2>${L.map(([ok,t])=>`<p>${ok?'✅':'⚠️'} ${t}</p>`).join('')}</div>`}
function vTre(){const c=calc(),L=ledger(),end=L.length?L[L.length-1].b:S.prev,ok=Math.round(end)===Math.round(c.cash);
$('#v').innerHTML=`<div class="kp">${K('الرصيد السابق (أمانة الصندوق)',fm(S.prev),'t')}${K('+ المداخيل المحصّلة',fm(c.inc),'ok')}${K('− المصاريف',fm(c.ex),'am')}${K('= الرصيد الحالي',fm(c.cash),c.cash>=0?'ok':'bad')}</div>
<p class="sub">النتيجة (مداخيل − مصاريف): <b>${fm(c.net)}</b> · ${role()==='admin'?`غير محصّل: مستحقات ${fm(c.late)} + ديون سابقة ${fm(c.debtPrev)} = ${fm(c.debts)}`:`إجمالي الديون والمستحقات غير المحصّلة: ${fm(c.debts)}`} (لا تدخل الخزينة إلا عند القبض)</p>
${role()==='admin'?auditBox():''}
<div class="gl"><h2>دفتر الخزينة</h2>${T(['التاريخ','البيان','مدخول','مصروف','الرصيد'],[['—','رصيد سابق (أمانة الصندوق)','','',fm(S.prev)],...L.map(r=>[r.lb||'<span class="sub">بدون تاريخ</span>',e(r.t),r.k==='in'?fm(r.a):'',r.k==='out'?fm(r.a):'',fm(r.b)]),['','<b>الرصيد الحالي</b>',`<b>${fm(c.inc)}</b>`,`<b>${fm(c.ex)}</b>`,`<b>${fm(end)} ${ok?'✓':'⚠'}</b>`]])}
<p class="sub">${ok?'✓ مجموع الدفتر يطابق رصيد الخزينة.':'⚠ مجموع الدفتر لا يطابق رصيد الخزينة!'} ${role()==='admin'?'تواريخ الدفعات القديمة تقريبية (أول الشهر).':'المداخيل معروضة مجمّعة حسب الشهر دون تفاصيل الملاك.'}</p></div>`}
