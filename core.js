const M=['يناير','فبراير','مارس','أبريل','ماي','يونيو','يوليوز','غشت','شتنبر','أكتوبر','نونبر','دجنبر'];
const TY={monthly:'اشتراك شهري',debt:'دين سابق',both:'شهري + دين سابق'},ST={paid:'مدفوع',pending:'معلق',late:'متأخر'};
const RT=['الأنترفون','الباب','الدرج','الكاميرا','السطح','الكهرباء','الصباغة'],EC=['نظافة','كهرباء','إصلاحات','أخرى'];
const RS=['مقترح','جاري','منجز'];
const $=s=>document.querySelector(s),sum=a=>a.reduce((x,y)=>x+y,0),f=n=>Math.round(n).toLocaleString('en-US'),fm=n=>f(n)+' د.م';
const e=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const pad=n=>String(n).padStart(2,'0'),today=()=>new Date().toISOString().slice(0,10);
const YR=2026,dueD=()=>S.due_day||8,effOf=p=>p.st==='paid'?'paid':(p.m!==null&&new Date()>new Date(YR,p.m,dueD(),23,59,59)?'late':p.st),delay=p=>{if(p.m===null||p.m===undefined)return 0;const du=new Date(YR,p.m,dueD()),en=p.st==='paid'&&p.date?new Date(p.date+'T12:00:00'):new Date();return Math.max(0,Math.floor((en-du)/864e5))};
const SB=supabase.createClient('https://rdsqtjalkacqluxogttl.supabase.co','sb_publishable_hqhlerZ_u_FnGbfyczHXgw_xMzs1bDx');
let S={prev:0,fee:50,rc:0,owners:[],pays:[],exps:[],reps:[],anns:[],rcs:[],debts:[],inm:[],stc:[],rv:[],rvt:[]};
const Q=async p=>{const r=await p;if(r.error){alert('خطأ: '+r.error.message);throw r.error}return r.data};
async function reload(){const adm=user.admin,T=t=>Q(SB.from(t).select('*'));
const[ow,pa,ex,rp,an,st,db,im,sc,rc,rv,rvt]=await Promise.all([T('owners'),T('payments'),T('expenses'),T('repairs'),T('announcements'),T('settings'),T('debts_total'),T('income_summary'),T('status_counts'),adm?T('receipts'):Promise.resolve([]),T('repair_votes'),T('repair_vote_totals')]);
S.owners=ow.map(o=>({...o,d0:+o.d0})).sort((a,b)=>a.n-b.n);S.pays=pa.map(p=>({...p,amt:+p.amt,dpart:+p.dpart,date:p.date||'',st:effOf(p)}));S.exps=ex.map(x=>({...x,amt:+x.amt,note:x.note||''}));
S.reps=rp.map(r=>({...r,desc:r.descr||'',cost:+r.cost,date:r.date||''}));S.anns=an.map(a=>({...a,date:a.date||'',time:a.time||'',link:a.link||'',body:a.body||'',place:a.place||''}));
st.forEach(x=>S[x.key]=+x.value);S.dt={debt_left:+db[0].debt_left,dues:+db[0].dues};S.inm=im.map(r=>({...r,total:+r.total,cnt:+r.cnt}));S.debts=S.owners.map(o=>{const s=OS(o);return{n:o.n,name:o.name,d0:o.d0,dp:s.dp,late:s.late}});S.stc=sc;S.rv=rv;S.rvt=rvt.map(t=>({...t,c:+t.c}));S.rcs=rc.sort((a,b)=>{const[x,y]=a.no.split('/'),[u,v]=b.no.split('/');return(+x-+u)||(+y-+v)||0})}
let user=null,UI={tab:'sum',charts:false,fo:'',fs:'',sort:'date',dir:-1,as:'',cr:{}},CH=[],W=null;
const role=()=>user.admin&&!UI.as?'admin':'owner',myN=()=>user.admin?+UI.as:user.n;
const OS=o=>{const my=S.pays.filter(p=>p.n===o.n),pd=my.filter(p=>p.st==='paid'),dp=sum(pd.map(p=>p.dpart||0));return{my,dp,dl:Math.max(0,o.d0-dp),late:sum(my.filter(p=>p.st!=='paid').map(p=>p.amt)),pd:sum(pd.map(p=>p.amt-(p.dpart||0)))}};
function calc(){const inc=sum(S.inm.map(r=>+r.total)),ex=sum(S.exps.map(x=>x.amt)),late=S.dt.dues,prev=S.dt.debt_left;return{inc,ex,net:inc-ex,cash:S.prev+inc-ex,debts:prev+late,late,debtPrev:prev}}
async function enter(sess){const{data:pr}=await SB.from('profiles').select('role,apt,email').eq('id',sess.user.id).single();if(!pr)return false;user={admin:pr.role==='admin',n:pr.apt,email:pr.email};UI.tab='sum';UI.as='';await reload();return true}
async function login(){let em=$('#le').value.trim().toLowerCase();const pin=$('#lp').value;if(/^\d{1,2}$/.test(em))em=lg(+em);$('#lm').textContent='...';const{data,error}=await SB.auth.signInWithPassword({email:em,password:pin});if(error||!data.session)return $('#lm').textContent='البريد أو الرمز السري غير صحيح';if(!await enter(data.session)){await SB.auth.signOut();return $('#lm').textContent='هذا الحساب غير مرتبط بأي شقة'}render()}
async function logout(){await SB.auth.signOut();user=null;S.owners=[];render()}
const T=(h,rows)=>`<div class="tw"><table><tr>${h.map(x=>`<th>${x}</th>`).join('')}</tr>${rows.map(r=>`<tr>${r.map(x=>`<td>${x}</td>`).join('')}</tr>`).join('')}</table></div>`;
const K=(l,v,c)=>`<div class="k" style="--c:var(--${c})"><b>${v}</b><span>${l}</span></div>`;
const bd=s=>`<span class="st ${s}">${ST[s]}</span>`;
const opts=(a,v)=>a.map(x=>`<option ${x===v?'selected':''}>${e(x)}</option>`).join('');
const oOpts=(v,all)=>(all?`<option value="">كل الملاك</option>`:'')+S.owners.map(o=>`<option value="${o.n}" ${+v===o.n?'selected':''}>${o.n} · ${e(o.name)}</option>`).join('');
const oname=n=>(S.owners.find(o=>o.n===n)||{}).name||'';
const ico=d=>`<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">${d}</svg>`;
const IC={tre:ico('<path d="M3 21h18M5 21V10m4 11V10m6 11V10m4 11V10M2 10l10-6 10 6"/>'),sum:ico('<rect x="3" y="3" width="7" height="9" rx="1"/><rect x="14" y="3" width="7" height="5" rx="1"/><rect x="14" y="12" width="7" height="9" rx="1"/><rect x="3" y="16" width="7" height="5" rx="1"/>'),pay:ico('<rect x="2" y="5" width="20" height="14" rx="2"/><path d="M2 10h20"/>'),own:ico('<path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.9M16 3.1a4 4 0 0 1 0 7.8"/>'),exp:ico('<path d="M22 17l-8.5-8.5-5 5L2 7"/><path d="M16 17h6v-6"/>'),rep:ico('<path d="M14.7 6.3a4 4 0 0 0-5.4 5.4L3 18l3 3 6.3-6.3a4 4 0 0 0 5.4-5.4l-2.5 2.5-2.4-.6-.6-2.4z"/>'),ann:ico('<path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9"/><path d="M10.3 21a1.9 1.9 0 0 0 3.4 0"/>'),rcp:ico('<path d="M14 3H6a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z"/><path d="M14 3v6h6M8 13h8M8 17h6"/>'),lgl:ico('<path d="M12 3l8 3v6c0 5-3.5 8-8 9-4.5-1-8-4-8-9V6z"/><path d="M12 8v4M12 16h.01"/>')};
const bgN=k=>k==='lgl'?new Set(S.pays.filter(p=>p.st==='late').map(p=>p.n)).size:k==='ann'?S.anns.filter(a=>a.date>=today()).length:0,BG=k=>{const n=bgN(k);return n?`<em class="bg">${n}</em>`:''};
const go=k=>{UI.tab=k;render()};
function placeGi(){const n=$('#gn'),g=$('#gi'),a=n&&n.querySelector('.gt.on');if(!a)return;if(UI.gx!=null){g.style.transition='none';g.style.width=UI.gw+'px';g.style.transform=`translateX(${UI.gx}px)`;g.getBoundingClientRect();g.style.transition=''}requestAnimationFrame(()=>{g.style.width=a.offsetWidth+'px';g.style.transform=`translateX(${a.offsetLeft}px)`;UI.gx=a.offsetLeft;UI.gw=a.offsetWidth})}
function modal(h){$('#mb').innerHTML=h;$('#md').classList.add('on')}const closeM=()=>$('#md').classList.remove('on');
function render(){CH.forEach(c=>c.destroy());CH=[];const A=$('#app');
if(!user){A.innerHTML=`<div class="gl lg"><h1>🏛️ المجمع العقاري البيضاء</h1><p class="sub">إقامة البيضاء سيدي مومن · العمارة 23</p><br>
<input id="le" type="text" inputmode="email" placeholder="البريد أو رقم الشقة" autocomplete="username" dir="ltr"><input id="lp" type="password" placeholder="الرمز السري (PIN)" autocomplete="current-password" dir="ltr" onkeydown="if(event.key==='Enter')login()">
<p class="msg" id="lm"></p><button class="b p" style="width:100%" onclick="login()">دخول</button><p class="sub" style="margin-top:10px">لا يوجد تسجيل ذاتي: يُنشئ المدير حساب كل مالك.</p></div>`;return}
const r=role(),tabs=[['sum','الملخص'],['tre','الخزينة'],['pay',r==='admin'?'الدفعات':'دفعاتي'],...(r==='admin'?[['own','الملاك']]:[]),['exp','المصاريف'],['rep','الإصلاحات'],['ann','الإعلانات'],...(r==='admin'?[['rcp','الإيصالات'],['lgl','الإشعار القانوني']]:[])];
A.innerHTML=`<div class="gl top"><div><h1>🏛️ العمارة 23</h1><p class="sub">المجمع العقاري البيضاء · إقامة البيضاء سيدي مومن</p></div>
<div class="top" style="gap:6px">${user.admin?`<select id="as" style="width:auto" onchange="UI.as=this.value;UI.tab='sum';render()"><option value="">وضع المدير</option>${S.owners.map(o=>`<option value="${o.n}" ${UI.as==o.n?'selected':''}>وضع المالك: شقة ${o.n}</option>`).join('')}</select>`:`<span class="sub">${e(oname(user.n))}</span>`}
${user.admin?`<button class="b s" onclick="go('set')">⚙️ الإعدادات</button>`:''}<button class="b d s" onclick="logout()">تسجيل الخروج</button></div></div>
<nav class="gn" id="gn"><i class="gi" id="gi"></i>${tabs.map(([k,l])=>`<button class="gt ${UI.tab===k?'on':''}" onclick="go('${k}')"><span class="ic">${IC[k]}</span><span class="lb">${l}</span>${BG(k)}</button>`).join('')}</nav><div id="v"></div>`;
({sum:vSum,pay:vPay,own:vOwn,exp:vExp,rep:vRep,rcp:vRcp,ann:vAnn,lgl:vLgl,set:vSet,tre:vTre})[UI.tab]();if(UI.tab==='lgl')upMail();
if(UI.tab==='sum'&&UI.charts)draw();placeGi()}
