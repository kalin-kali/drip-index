
let D=null,tab=-1,query='',preset=null,shown=0,list=[];const PAGE=80;
const $=s=>document.querySelector(s);
const grid=$('#grid'),cats=$('#cats'),q=$('#q'),srow=$('#srow'),more=$('#more'),clr=$('#clr');

/* ---- storefront config: hero slides, model tiles, brand chips, rows ---- */
const SHOE=/track|runner|triple|3xl|shoe|sneaker|trainer|jordan \d|dunk|yeezy \d|350|700|500|foam|balance|\bnb ?\d|\d{3,4}r?\b/i;
const HERO=[
 {kick:'Sneakers',title:'Balenciaga',rx:/balenciaga/i,img:'images/hero/balenciaga.webp'},
 {kick:'Sneakers',title:'Jordan 4',rx:/jordan 4|aj4|\bj4\b/i,img:'images/hero/jordan4.webp'},
 {kick:'Sneakers',title:'Yeezy',rx:/yeezy/i,img:'images/hero/yeezy.webp'},
 {kick:'Sneakers',title:'New Balance',rx:/new balance|\bnb ?\d/i,img:'images/hero/nb.webp'},
 {kick:'Sneakers',title:'Nike Dunk',rx:/dunk/i,img:'images/hero/dunk.webp'},
 {kick:'Sneakers',title:'Jordan 1',rx:/jordan 1|aj1/i,img:'images/hero/jordan1.webp'},
];
const MODELS=[ // [name, regex, images/models/<key>.webp]
 ['Jordan 4',/jordan 4|aj4|\bj4\b/i,'jordan4'],['Jordan 1',/jordan 1|aj1/i,'jordan1'],['Nike Dunk',/dunk/i,'dunk'],
 ['Yeezy 350',/yeezy/i,'yeezy'],['Balenciaga Track',/balenciaga/i,'balenciaga'],['New Balance',/new balance|\bnb ?\d/i,'nb'],
 ['Air Max / TN',/air max|\btn\b|vapormax/i,'airmax'],['Air Force 1',/air force|af1/i,'af1'],['Adidas Samba',/samba|gazelle|spezial|campus/i,'samba'],
 ['Dior B22 / B30',/dior.*(b22|b30)/i,'dior'],['LV Trainer',/(\blv\b|louis vuitton).*(trainer|skate|shoe|sneaker)/i,'lv'],['Louboutin',/louboutin/i,'louboutin'],
 ['Golden Goose',/golden goose/i,'goldengoose'],['Yeezy Slides',/yeezy.*(slide|foam)|foam runner/i,'yeezy-slide'],['Triple S',/triple s/i,'balenciaga-triples'],
];
const BRAND_IMG={}; // brand name -> images/brands/<file> (drop logo files here later)
const BRANDS=[['Essentials',/essentials|fear of god|\bfog\b/i],['Corteiz',/corteiz|crtz/i],['Trapstar',/trapstar/i],['Amiri',/amiri/i],['Chrome Hearts',/chrome ?hearts/i],
 ['Stussy',/stussy|stüssy/i],['Hellstar',/hellstar/i],['Gallery Dept',/gallery ?dept/i],['Denim Tears',/denim tears/i],['Sp5der',/sp5der/i],['Bape',/\bbape\b/i],
 ['Supreme',/supreme/i],['Moncler',/moncler/i],['Stone Island',/stone island/i],['The North Face',/north ?face|\btnf\b/i],['Ralph Lauren',/ralph lauren|\bpolo\b/i],
 ['Carhartt',/carhartt/i],['Nike',/\bnike\b/i],['Goyard',/goyard/i],['Louis Vuitton',/\blv\b|louis vuitton/i],['Gucci',/gucci/i],['Prada',/prada/i],['Dior',/dior/i],['Football kits',/jersey|\bkit\b|world cup/i]];
const ROWS=[[1,'Trending now'],[2,'Latest finds'],[3,'Sneakers'],[10,'2026 World Cup kits']];

fetch('data.json').then(r=>r.json()).then(d=>{D=d;buildCats();buildHero();buildTiles();buildRows();wireNav();applyURL()});
function applyURL(){const u=new URLSearchParams(location.search);const t=u.get('tab'),c=u.get('c'),qq=u.get('q');
 if(c){const b=BRANDS.concat(MODELS.map(m=>[m[0],m[1]])).find(x=>x[0].toLowerCase()===c.toLowerCase());if(b){setPreset(b[0],b[1]);return}}
 if(t!=null&&D.tabs[+t]){tab=+t;markCats();render(true);return}
 if(qq){q.value=qq;query=qq;render(true);return}
 render()}

function match(rx){return D.items.filter(i=>rx.test(i[1]))}
function minPrice(l){let m=Infinity;for(const i of l)if(i[5]!=null&&i[5]<m)m=i[5];return m===Infinity?null:m}
function setPreset(name,rx){preset={name,rx};tab=-1;query='';q.value='';markCats();render(true)}
function markCats(){document.querySelectorAll('.cat').forEach((e,j)=>e.classList.toggle('on',(j-1)===tab||(tab===-1&&j===0)))}

function buildCats(){cats.innerHTML='';cats.appendChild(btn(-1,'All',D.items.length));
 D.tabs.forEach((t,i)=>{const n=D.items.filter(x=>x[2].includes(i)).length;if(n)cats.appendChild(btn(i,t,n))});}
function btn(i,name,n){const b=document.createElement('button');b.className='cat'+(i===tab?' on':'');b.innerHTML=name+'<span class="n">'+n+'</span>';b.onclick=()=>{tab=i;preset=null;render(true);markCats()};return b}

function buildHero(){const s=$('#slides'),dots=$('#dots');let cur=0,timer;
 HERO.forEach((h,i)=>{const l=match(h.rx),mp=minPrice(l.filter(x=>x[2].includes(3)||SHOE.test(x[1])));const el=document.createElement('div');el.className='slide';
  el.innerHTML='<div class="txt"><div class="kick">'+h.kick+'</div><h2>'+h.title+'</h2><div class="sub"><b>'+l.length+' listings</b>'+(mp?' · from <b>€'+mp.toFixed(2)+'</b>':'')+'</div><button class="cta">Browse '+h.title+' <span>→</span></button></div><div class="pic"><img src="'+h.img+'" alt="'+h.title+'" '+(i?'loading="lazy"':'fetchpriority="high"')+'></div><div class="big">'+h.title+'</div>';
  el.querySelector('.cta').onclick=()=>setPreset(h.title,h.rx);s.appendChild(el);
  const d=document.createElement('button');d.textContent=i+1;d.onclick=()=>{go(i);restart()};dots.appendChild(d)});
 function go(i){cur=(i+HERO.length)%HERO.length;s.style.transform='translateX(-'+cur*100+'%)';dots.querySelectorAll('button').forEach((b,j)=>b.classList.toggle('on',j===cur))}
 function restart(){clearInterval(timer);timer=setInterval(()=>go(cur+1),6000)}
 go(0);restart();
 let x0=null;s.addEventListener('touchstart',e=>x0=e.touches[0].clientX,{passive:true});s.addEventListener('touchend',e=>{if(x0==null)return;const dx=e.changedTouches[0].clientX-x0;if(Math.abs(dx)>40){go(cur+(dx<0?1:-1));restart()}x0=null});}

function buildTiles(){const m=$('#models'),b=$('#brands');
 MODELS.forEach(([name,rx,img])=>{const l=match(rx);if(!l.length)return;const im=img?'images/models/'+img+'.webp':'images/'+l[0][0]+'_0.webp';
  const t=document.createElement('button');t.className='tile';t.innerHTML='<div class="ti"><img src="'+im+'" loading="lazy" alt=""></div><div class="tt"><b>'+name+'</b><span>'+l.length+'</span></div>';t.onclick=()=>setPreset(name,rx);m.appendChild(t)});
 BRANDS.forEach(([name,rx])=>{const l=match(rx);if(!l.length)return;const t=document.createElement('button');t.className='bchip';const im=BRAND_IMG[name]?'images/brands/'+BRAND_IMG[name]:'images/'+l[0][0]+'_0.webp';
  t.innerHTML='<div class="bi"><img src="'+im+'" loading="lazy" alt=""></div><div class="bt">'+name+'<small>'+l.length+'</small></div>';t.onclick=()=>setPreset(name,rx);b.appendChild(t)});
 carousel(m,4500);carousel(b,3500);}
function carousel(row,every){const wrap=row.parentElement;if(!wrap.classList.contains('carousel'))return;
 const step=()=>row.firstElementChild?row.firstElementChild.getBoundingClientRect().width+10:200;
 const go=d=>{const max=row.scrollWidth-row.clientWidth;let x=row.scrollLeft+d*step()*2;if(d>0&&row.scrollLeft>=max-4)x=0;if(d<0&&row.scrollLeft<=4)x=max;row.scrollTo({left:x,behavior:'smooth'})};
 wrap.querySelector('.arr.l').onclick=()=>{go(-1);arm()};wrap.querySelector('.arr.r').onclick=()=>{go(1);arm()};
 let t;const arm=()=>{clearInterval(t);t=setInterval(()=>{if(!document.hidden&&!wrap.matches(':hover'))go(1)},every)};arm();}

function buildRows(){const wrap=$('#rows');
 const used=new Set();ROWS.forEach(([ti,title])=>{const l=D.items.filter(i=>i[2][0]===ti&&i[5]!=null&&!used.has(i[0])).slice(0,14);l.forEach(i=>used.add(i[0]));if(!l.length)return;
  const sec=document.createElement('section');sec.className='row';sec.innerHTML='<div class="sh"><h2>'+title+'</h2><a>See all '+D.items.filter(i=>i[2].includes(ti)).length+' →</a></div>';
  sec.querySelector('a').onclick=()=>{tab=ti;preset=null;markCats();render(true)};
  const h=document.createElement('div');h.className='hrow';l.forEach((it,i)=>h.appendChild(card(it,i)));sec.appendChild(h);wrap.appendChild(sec)});}

function wireNav(){document.querySelectorAll('[data-tab]').forEach(a=>a.onclick=e=>{e.preventDefault();tab=+a.dataset.tab;preset=null;markCats();render(true)});
 document.querySelectorAll('[data-q]').forEach(a=>a.onclick=e=>{e.preventDefault();const b=BRANDS.concat(MODELS.map(m=>[m[0],m[1]])).find(x=>x[0].toLowerCase()===a.dataset.q.toLowerCase()||a.dataset.q.toLowerCase().includes(x[0].toLowerCase()));if(b)setPreset(b[0],b[1]);else{q.value=a.dataset.q;query=a.dataset.q;preset=null;render(true)}});}

function norm(s){return s.toLowerCase()}
function filter(){const w=norm(query).split(' ').filter(Boolean);list=[];for(const it of D.items){if(tab>=0&&!it[2].includes(tab))continue;if(preset&&!preset.rx.test(it[1]))continue;if(w.length){const n=norm(it[1]);const sz=(it[4]||[]).map(norm);let ok=true;for(const x of w)if(!n.includes(x)&&!sz.includes(x)){ok=false;break}if(!ok)continue}list.push(it)}}
function card(it,idx){const a=document.createElement('a');a.className='card';a.href='product/'+it[0]+'.html';
 const im=document.createElement('div');im.className='im';const img=document.createElement('img');img.loading='lazy';img.decoding='async';img.src='images/'+it[0]+'_0.webp';img.alt=it[1];im.appendChild(img);
 const num=document.createElement('div');num.className='num mono';num.textContent=String(idx+1).padStart(4,'0');im.appendChild(num);const bm=/og batch|top batch|best batch|pk batch|top quality|1:1/i.exec(it[1]);if(bm){const b=document.createElement('div');b.className='badge mono';b.textContent=bm[0].toUpperCase().replace('BEST BATCH','TOP BATCH').replace('TOP QUALITY','TOP BATCH').replace('1:1','1:1 BATCH');im.appendChild(b)}a.appendChild(im);
 const info=document.createElement('div');info.className='info';const tag=document.createElement('div');tag.className='tag';tag.textContent=D.tabs[it[2][0]];const nm=document.createElement('div');nm.className='nm';nm.textContent=it[1];info.appendChild(tag);info.appendChild(nm);if(it[3]){const sr=document.createElement('div');sr.className='szr';sr.textContent=/sizes$/.test(it[3])?it[3].toUpperCase():'SIZES '+it[3];info.appendChild(sr)}if(it[5]!=null){const pr=document.createElement('div');pr.className='pr';pr.innerHTML=(it[6]!=null?'<small>FROM</small>':'')+'€'+it[5].toFixed(2);info.appendChild(pr)}a.appendChild(info);return a}
function page(){const f=document.createDocumentFragment();for(let i=shown;i<Math.min(shown+PAGE,list.length);i++)f.appendChild(card(list[i],i));grid.appendChild(f);shown=Math.min(shown+PAGE,list.length);more.hidden=shown>=list.length;more.textContent='Load more ('+(list.length-shown).toLocaleString()+')'}
function render(scroll){filter();grid.innerHTML='';shown=0;
 if(!list.length){grid.innerHTML='<div class="empty">No items found.</div>';srow.textContent='0 items';more.hidden=true}
 else{page();srow.textContent=list.length.toLocaleString()+' items'+(tab>=0?' · '+D.tabs[tab]:'')+(preset?' · '+preset.name:'')+(query?' · "'+query+'"':'')}
 clr.hidden=!(preset||tab>=0||query);
 if(scroll)window.scrollTo({top:document.querySelector('#catalogue').offsetTop-110,behavior:'smooth'})}
more.onclick=page;clr.onclick=()=>{preset=null;tab=-1;query='';q.value='';markCats();render(false)};
new IntersectionObserver(e=>{if(e[0].isIntersecting&&!more.hidden)page()},{rootMargin:'1000px'}).observe(more);
let deb;q.addEventListener('input',()=>{clearTimeout(deb);deb=setTimeout(()=>{query=q.value;preset=null;render(query.length>0)},130)});
document.addEventListener('keydown',e=>{if(e.key==='/'&&document.activeElement!==q){e.preventDefault();q.focus()}});
