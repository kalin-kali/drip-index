
let D=null,tab=-1,query='',preset=null,shown=0,list=[];const PAGE=80;
/* scroll-reveal: stagger within a batch, play once, skipped under prefers-reduced-motion */
const RM=matchMedia('(prefers-reduced-motion: reduce)').matches;
const revealIO=RM?null:new IntersectionObserver((es,o)=>{let n=0;for(const e of es){if(!e.isIntersecting)continue;e.target.style.setProperty('--d',Math.min(n++,7)*60+'ms');e.target.classList.add('in');o.unobserve(e.target)}},{rootMargin:'0px 0px -8% 0px',threshold:.08});
function reveal(el){if(!el)return el;if(RM){el.classList.add('in');return el}el.classList.add('reveal');revealIO.observe(el);return el}
function revealAll(root){(root||document).querySelectorAll('.sh,.usp>div,.looks,.tilerow>*,.brandrow>*,.hrow>.card,footer .fgrid>div').forEach(reveal)}
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
const BRAND_IMG={"Essentials":"essentials.webp","Corteiz":"corteiz.webp","Trapstar":"trapstar.webp","Amiri":"amiri.webp","Chrome Hearts":"chromehearts.webp","Stussy":"stussy.webp","Hellstar":"hellstar.webp","Gallery Dept":"gallerydept.webp","Denim Tears":"denimtears.webp","Sp5der":"sp5der.webp","Bape":"bape.webp","Supreme":"supreme.webp","Moncler":"moncler.webp","Stone Island":"stoneisland.webp","The North Face":"northface.webp","Ralph Lauren":"ralphlauren.webp","Carhartt":"carhartt.webp","Nike":"nike.webp","Goyard":"goyard.webp","Louis Vuitton":"lv.webp","Gucci":"gucci.webp","Prada":"prada.webp","Dior":"dior.webp","Football kits":"fifa.webp"}; // brand name -> images/brands/<file>
const BRANDS=[['Essentials',/essentials|fear of god|\bfog\b/i],['Corteiz',/corteiz|crtz/i],['Trapstar',/trapstar/i],['Amiri',/amiri/i],['Chrome Hearts',/chrome ?hearts/i],
 ['Stussy',/stussy|stüssy/i],['Hellstar',/hellstar/i],['Gallery Dept',/gallery ?dept/i],['Denim Tears',/denim tears/i],['Sp5der',/sp5der/i],['Bape',/\bbape\b/i],
 ['Supreme',/supreme/i],['Moncler',/moncler/i],['Stone Island',/stone island/i],['The North Face',/north ?face|\btnf\b/i],['Ralph Lauren',/ralph lauren|\bpolo\b/i],
 ['Carhartt',/carhartt/i],['Nike',/\bnike\b/i],['Goyard',/goyard/i],['Louis Vuitton',/\blv\b|louis vuitton/i],['Gucci',/gucci/i],['Prada',/prada/i],['Dior',/dior/i],['Football kits',/jersey|\bkit\b|world cup/i]];
const LOOKS=[ // [brand, image, caption, brand regex, product-pick regex]
 ['Corteiz','images/look/corteiz-2.webp','Pista velour tracksuit',/corteiz|crtz/i,/corteiz.*(track|jacket|set|suit)/i],
 ['Sp5der','images/look/sp5der-purple.webp','Sp5der web tracksuit',/sp5der/i,/sp5der.*(track|hoodie|sweat|set|pant)/i],
 ['Louis Vuitton','images/look/lv-naomi.webp','LV monogram look',/\blv\b|louis vuitton/i,/(\blv\b|louis vuitton).*(jacket|shirt|hoodie|tee|set)/i],
 ['Moncler','images/look/moncler-puffer.webp','Moncler down jacket',/moncler/i,/moncler.*(down|puffer|jacket)/i],
 ['Trapstar','images/look/trapstar-duo.webp','Trapstar tracksuits',/trapstar/i,/trapstar.*(hoodie|sweat|track|set|suit)/i],
 ['Stone Island','images/look/stoneisland-orange.webp','Stone Island shell jacket',/stone island/i,/stone island.*(jacket|coat|wind|shell|overshirt)/i],
 ['Balenciaga','images/look/balenciaga-track.webp','Balenciaga Track',/balenciaga/i,/balenciaga.*track/i],
 ['Essentials','images/look/essentials.webp','Fear of God Essentials hoodie',/essentials|fear of god|\bfog\b/i,/essentials.*hoodie|fog.*hoodie/i],
 ['Louis Vuitton','images/look/lv-bags.webp','LV monogram bags',/\blv\b|louis vuitton/i,/(\blv\b|louis vuitton).*(bag|keepall|speedy|neverfull|backpack)/i],
 ['Sp5der','images/look/sp5der-pink.webp','Sp5der pink set',/sp5der/i,/sp5der.*(pink|hoodie|set)/i],
 ['Moncler','images/look/moncler-maya.webp','Moncler Maya 70 reflective',/moncler/i,/moncler.*(maya|down|puffer)/i],
 ['Hellstar','images/look/hellstar.webp','Hellstar hoodie & sweatpants',/hellstar/i,/hellstar.*(hoodie|sweat|set|pant)/i],
 ['Stone Island','images/look/stoneisland-bomber.webp','Stone Island bomber',/stone island/i,/stone island.*(bomber|jacket)/i],
 ['Trapstar','images/look/trapstar-hoodie.webp','Trapstar hoodie',/trapstar/i,/trapstar.*(hoodie|sweat)/i],
 ['Louis Vuitton','images/look/lv-runway.webp','LV runway monogram',/\blv\b|louis vuitton/i,/(\blv\b|louis vuitton).*(jacket|shirt|hoodie|tee|set|bag)/i],
 ['Corteiz','images/look/corteiz-3.webp','Guerillaz camo field jacket',/corteiz|crtz/i,/corteiz.*(jacket|camo|cargo)/i],
 ['Moncler','images/look/moncler-palm.webp','Moncler x Palm Angels',/moncler/i,/moncler.*palm|palm angels/i],
 ['Gallery Dept','images/look/gallerydept.webp','Gallery Dept paint logo hoodie',/gallery ?dept/i,/gallery.*(hoodie|sweat)/i],
 ['Sp5der','images/look/sp5der-blue.webp','Sp5der blue hoodie',/sp5der/i,/sp5der.*(blue|hoodie)/i],
 ['Stone Island','images/look/stoneisland-navy.webp','Stone Island jacket',/stone island/i,/stone island.*(jacket|coat)/i],
 ['Amiri','images/look/amiri.webp','Amiri oversized tee',/amiri/i,/amiri.*(tee|t-?shirt)/i],
 ['Stussy','images/look/stussy.webp','Stussy hooded puffer',/stussy|stüssy/i,/stussy.*(puffer|jacket|down)/i],
 ['Sp5der','images/look/sp5der.webp','Sp5der tracksuit',/sp5der/i,/sp5der.*(track|hoodie|sweat|set|pant)/i],
 ['Corteiz','images/look/corteiz-1.webp','Corteiz sweats',/corteiz|crtz/i,/corteiz.*(sweat|hood|pant)/i],
];
const ROWS=[[1,'Trending now'],[2,'Latest finds'],[3,'Sneakers'],[10,'2026 World Cup kits']];

fetch('data.json').then(r=>r.json()).then(d=>{D=d;const sk=$('#sk');if(sk)sk.remove();buildCats();buildHero();buildLooks();buildTiles();buildRows();wireNav();applyURL();revealAll()});
function applyURL(){const u=new URLSearchParams(location.search);const t=u.get('tab'),c=u.get('c'),qq=u.get('q');
 if(c){const b=BRANDS.concat(MODELS.map(m=>[m[0],m[1]])).find(x=>x[0].toLowerCase()===c.toLowerCase());if(b){setPreset(b[0],b[1]);return}}
 if(t!=null&&D.tabs[+t]){tab=+t;markCats();render(true);return}
 if(qq){q.value=qq;query=qq;render(true);return}
 render()}

function match(rx){return D.items.filter(i=>rx.test(i[1]))}
function minPrice(l){let m=Infinity;for(const i of l)if(i[5]!=null&&i[5]<m)m=i[5];return m===Infinity?null:m}
function setPreset(name,rx){preset={name,rx};tab=-1;query='';q.value='';markCats();render(true)}
function markCats(){document.querySelectorAll('.cat').forEach((e,j)=>e.classList.toggle('on',(j-1)===tab||(tab===-1&&j===0)))}

const CAT_IMG={'-1':'models/jordan4','0':'models/dior','1':'7786621462_0','2':'7801942513_0','3':'models/balenciaga','4':'7630184358_0','5':'7629518828_0','6':'7629528692_0','7':'7630296264_0','8':'7630272600_0','9':'7821232575_0','10':'7710970001_0'};
const CAT_HUE=[14,262,340,200,32,150,48,290,180,220,95,120];
const CAT_LABEL={'Selected':'Selected','Trending Now':'Trending','Latest Finds':'New in','Shoes':'Sneakers','T-Shirt And Shorts':'Tees & Shorts','Hoodies And Pants':'Hoodies & Pants','Coats And Jackets':'Jackets','Accessories':'Accessories','Electronic Products':'Tech','Trendy Brands':'Trendy brands','2026 Fifa World Cup':'World Cup kits'};
function buildCats(){cats.innerHTML='';cats.appendChild(btn(-1,'All',D.items.length));
 D.tabs.forEach((t,i)=>{const n=D.items.filter(x=>x[2].includes(i)).length;if(n)cats.appendChild(btn(i,t,n))});carousel(cats,5000);}
function btn(i,name,n){const b=document.createElement('button');b.className='cat'+(i===tab?' on':'');b.style.setProperty('--h',CAT_HUE[i+1]);
 const im=CAT_IMG[i]||(D.items.find(x=>x[2][0]===i)||[''])[0]+'_0';
 b.innerHTML='<span class="ci"><img src="images/'+im+'.webp" loading="lazy" alt=""></span><span class="ct"><b>'+(CAT_LABEL[name]||name)+'</b><span class="n">'+n.toLocaleString()+' items</span></span>';b.onclick=()=>{tab=i;preset=null;render(true);markCats()};return b}

function buildHero(){const s=$('#slides'),dots=$('#dots');let cur=0,timer;
 HERO.forEach((h,i)=>{const l=match(h.rx),mp=minPrice(l.filter(x=>x[2].includes(3)||SHOE.test(x[1])));const el=document.createElement('div');el.className='slide';
  el.innerHTML='<div class="txt"><div class="kick">'+h.kick+'</div><h2>'+h.title+'</h2><div class="sub"><b>'+l.length+' listings</b>'+(mp?' · from <b>€'+mp.toFixed(2)+'</b>':'')+'</div><button class="cta">Browse '+h.title+' <span>→</span></button></div><div class="pic"><img src="'+h.img+'" alt="'+h.title+'" '+(i?'loading="lazy"':'fetchpriority="high"')+'></div><div class="big">'+h.title+'</div>';
  el.querySelector('.cta').onclick=()=>setPreset(h.title,h.rx);el.querySelectorAll('.txt>*').forEach((x,j)=>x.style.setProperty('--i',j));if(!i&&!RM)el.classList.add('first');s.appendChild(el);
  const d=document.createElement('button');d.textContent=i+1;d.setAttribute('aria-label','Show '+h.title+' slide');d.onclick=()=>{go(i);restart()};dots.appendChild(d)});
 function go(i){cur=(i+HERO.length)%HERO.length;s.style.transform='translateX(-'+cur*100+'%)';dots.querySelectorAll('button').forEach((b,j)=>b.classList.toggle('on',j===cur));s.querySelectorAll('.slide').forEach((el,j)=>el.classList.toggle('on',j===cur))}
 function restart(){clearInterval(timer);if(!RM)timer=setInterval(()=>go(cur+1),6000)}
 go(0);restart();
 let x0=null;s.addEventListener('touchstart',e=>x0=e.touches[0].clientX,{passive:true});s.addEventListener('touchend',e=>{if(x0==null)return;const dx=e.changedTouches[0].clientX-x0;if(Math.abs(dx)>40){go(cur+(dx<0?1:-1));restart()}x0=null});}

function buildLooks(){const s=$('#looks');let cur=0,timer;const usedP=new Set();
 LOOKS.forEach((L,i)=>{const [brand,img,cap,rx,prx]=L;const all=match(rx);const fresh=f=>all.find(x=>f(x)&&!usedP.has(x[0]));const p=fresh(x=>prx.test(x[1])&&x[5]!=null)||fresh(x=>x[5]!=null)||all.find(x=>prx.test(x[1])&&x[5]!=null)||all[0];if(!p)return;usedP.add(p[0]);
  const el=document.createElement('div');el.className='look';
  el.innerHTML='<div class="ph"><img class="bg" src="'+img+'" loading="'+(i?'lazy':'eager')+'" alt="" aria-hidden="true"><img class="fg" src="'+img+'" loading="'+(i?'lazy':'eager')+'" alt="'+brand+'"><span class="tag">'+brand+'</span><div class="cap">'+cap+'<small>'+all.length+' '+brand.toUpperCase()+' LISTINGS IN THE INDEX</small></div></div>'+
   '<div class="pd"><div class="pim"><img src="images/'+p[0]+'_0.webp" loading="lazy" alt=""></div><div class="pn">'+p[1]+'</div>'+(p[5]!=null?'<div class="lprice">'+(p[6]!=null?'from ':'')+'€'+p[5].toFixed(2)+'<small>INCL. VAT</small></div>':'')+(p[3]?'<div class="szl">Sizes '+p[3]+'</div>':'')+
   '<div class="btns"><a href="product/'+p[0]+'.html">View item →</a><button>All '+brand+'</button></div></div>';
  el.querySelector('button').onclick=()=>setPreset(brand,rx);s.appendChild(el)});
 const n=s.children.length;const go=i=>{cur=(i+n)%n;s.style.transform='translateX(-'+cur*100+'%)'};const restart=()=>{clearInterval(timer);if(!RM)timer=setInterval(()=>{if(!document.hidden)go(cur+1)},7000)};
 $('#lkl').onclick=()=>{go(cur-1);restart()};$('#lkr').onclick=()=>{go(cur+1);restart()};go(0);restart();
 let x0=null;s.addEventListener('touchstart',e=>x0=e.touches[0].clientX,{passive:true});s.addEventListener('touchend',e=>{if(x0==null)return;const dx=e.changedTouches[0].clientX-x0;if(Math.abs(dx)>40){go(cur+(dx<0?1:-1));restart()}x0=null});}
function buildTiles(){const m=$('#models'),b=$('#brands');
 MODELS.forEach(([name,rx,img])=>{const l=match(rx);if(!l.length)return;const im=img?'images/models/'+img+'.webp':'images/'+l[0][0]+'_0.webp';
  const t=document.createElement('button');t.className='tile';t.innerHTML='<div class="ti"><img src="'+im+'" loading="lazy" alt=""></div><div class="tt"><b>'+name+'</b><span>'+l.length+'</span></div>';t.onclick=()=>setPreset(name,rx);m.appendChild(t)});
 BRANDS.forEach(([name,rx])=>{const l=match(rx);if(!l.length)return;const t=document.createElement('button');t.className='bchip';const im=BRAND_IMG[name]?'images/brands/'+BRAND_IMG[name]:'images/'+l[0][0]+'_0.webp';
  t.innerHTML='<div class="bi"><img src="'+im+'" loading="lazy" alt=""></div><div class="bt">'+name+'<small>'+l.length+'</small></div>';t.onclick=()=>setPreset(name,rx);b.appendChild(t)});
 carousel(m,4500);carousel(b,3500);}
function carousel(row,every){const wrap=row.parentElement;if(!wrap.classList.contains('carousel'))return;
 const step=()=>row.firstElementChild?row.firstElementChild.getBoundingClientRect().width+(parseFloat(getComputedStyle(row).columnGap)||10):200;
 const go=d=>{const max=row.scrollWidth-row.clientWidth;let x=row.scrollLeft+d*step()*2;if(d>0&&row.scrollLeft>=max-4)x=0;if(d<0&&row.scrollLeft<=4)x=max;row.scrollTo({left:x,behavior:'smooth'})};
 wrap.querySelector('.arr.l').onclick=()=>{go(-1);arm()};wrap.querySelector('.arr.r').onclick=()=>{go(1);arm()};
 let t;const arm=()=>{clearInterval(t);if(!RM)t=setInterval(()=>{if(!document.hidden&&!wrap.matches(':hover'))go(1)},every)};arm();}

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
function page(){const f=document.createDocumentFragment();for(let i=shown;i<Math.min(shown+PAGE,list.length);i++)f.appendChild(reveal(card(list[i],i)));grid.appendChild(f);shown=Math.min(shown+PAGE,list.length);more.hidden=shown>=list.length;more.textContent='Load more ('+(list.length-shown).toLocaleString()+')'}
function render(scroll){filter();grid.innerHTML='';shown=0;
 if(!list.length){grid.innerHTML='<div class="empty">No items found.</div>';srow.textContent='0 items';more.hidden=true}
 else{page();srow.textContent=list.length.toLocaleString()+' items'+(tab>=0?' · '+D.tabs[tab]:'')+(preset?' · '+preset.name:'')+(query?' · "'+query+'"':'')}
 clr.hidden=!(preset||tab>=0||query);
 if(scroll)window.scrollTo({top:document.querySelector('#catalogue').offsetTop-110,behavior:'smooth'})}
more.onclick=page;clr.onclick=()=>{preset=null;tab=-1;query='';q.value='';markCats();render(false)};
new IntersectionObserver(e=>{if(e[0].isIntersecting&&!more.hidden)page()},{rootMargin:'1000px'}).observe(more);
let deb;q.addEventListener('input',()=>{clearTimeout(deb);deb=setTimeout(()=>{query=q.value;preset=null;render(query.length>0)},130)});
document.addEventListener('keydown',e=>{if(e.key==='/'&&document.activeElement!==q){e.preventDefault();q.focus()}});
