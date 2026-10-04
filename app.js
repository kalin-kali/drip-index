
let D=null,tab=-1,query='',preset=null,shown=0,list=[];const PAGE=80;
/* scroll-reveal: stagger within a batch, play once, skipped under prefers-reduced-motion */
const RM=matchMedia('(prefers-reduced-motion: reduce)').matches;
const revealIO=RM?null:new IntersectionObserver((es,o)=>{let n=0;for(const e of es){if(!e.isIntersecting)continue;e.target.style.setProperty('--d',Math.min(n++,7)*60+'ms');e.target.classList.add('in');o.unobserve(e.target)}},{rootMargin:'0px 0px -8% 0px',threshold:.08});
function reveal(el){if(!el)return el;if(RM){el.classList.add('in');return el}el.classList.add('reveal');revealIO.observe(el);return el}
/* belt and braces: whatever the observer misses (or a browser quirk swallows) gets shown
   as soon as it is anywhere near the viewport, so content can never stay invisible */
function sweep(){document.querySelectorAll('.reveal:not(.in)').forEach(e=>{const r=e.getBoundingClientRect();if(r.top<innerHeight*1.25&&r.bottom>-200)e.classList.add('in')})}
let sweepT;function revealFailsafe(){addEventListener('scroll',()=>{clearTimeout(sweepT);sweepT=setTimeout(sweep,80)},{passive:true});addEventListener('resize',sweep,{passive:true});[400,1200,3000].forEach(t=>setTimeout(sweep,t))}
function revealAll(root){(root||document).querySelectorAll('.sh,.usp>div,.looks,.bento>*,.hrow>.card,footer .fgrid>div').forEach(reveal);revealFailsafe()}
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

fetch('data.json').then(r=>r.json()).then(d=>{D=d;prep();const sk=$('#sk');if(sk)sk.remove();buildCats();buildHero();buildMarquee();buildLooks();buildTiles();buildWanted();buildRows();wireNav();applyURL();revealAll()});
function applyURL(){const u=new URLSearchParams(location.search);const t=u.get('tab'),c=u.get('c'),qq=u.get('q');
 let go=readURL(u);
 /* no size in the link -> use the size this visitor picked before */
 const prof=DripSize.profile();if(!u.get('size')&&prof&&prof.length)prof.forEach(k=>F.sizes.add(k));
 if(F.sizes.size&&![...F.sizes].some(k=>k[0]==='e'))SMODE='cl';
 if(c){const b=BRANDS.concat(MODELS.map(m=>[m[0],m[1]])).find(x=>x[0].toLowerCase()===c.toLowerCase());if(b){preset={name:b[0],rx:b[1]};go=true}}
 if(t!=null&&D.tabs[+t]){tab=+t;markCats();go=true}
 if(qq){q.value=qq;query=qq;go=true}
 render(go);
 if(location.hash==='#size'||(!prof&&!go))setTimeout(window.openSizePicker,location.hash==='#size'?200:1400)}

function match(rx){return D.items.filter(i=>rx.test(i[1]))}
function minPrice(l){let m=Infinity;for(const i of l)if(i[5]!=null&&i[5]<m)m=i[5];return m===Infinity?null:m}
function setPreset(name,rx){preset={name,rx};tab=-1;query='';q.value='';F.brands.clear();markCats();render(true)}
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

function buildMarquee(){const rows=[$('#mtrack'),$('#mtrack2')].filter(Boolean);if(!rows.length)return;
 const use=BRANDS.map(([n,rx])=>[n,rx,match(rx).length]).filter(([n,,c])=>BRAND_IMG[n]&&c);
 const half=Math.ceil(use.length/2);
 rows.forEach((t,ri)=>{const part=ri?use.slice(half):use.slice(0,half);
  t.innerHTML=part.map(([n,,c])=>'<button class="mb" type="button" data-b="'+n+'"><img src="images/brands/'+BRAND_IMG[n]+'" loading="lazy" alt="">'+n+'<small>'+c+'</small></button>').join('');
  /* delegated: the marquee clones its buttons, and clones don't carry per-button handlers */
  t.addEventListener('click',ev=>{const b=ev.target.closest('.mb');if(!b)return;const e=BRANDS.find(x=>x[0]===b.dataset.b);if(e)setPreset(e[0],e[1])})});}
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
function buildTiles(){const m=$('#models');if(!m)return;
 const SPAN=['w2 h2','w2','','','','','w2','','','','',''];
 MODELS.map(([name,rx,img])=>[name,rx,img,match(rx).length]).filter(x=>x[3]).slice(0,12).forEach(([name,rx,img,n],i)=>{
  const im=img?'images/models/'+img+'.webp':'images/'+match(rx)[0][0]+'_0.webp';
  const t=document.createElement('button');t.type='button';t.className='bt '+(SPAN[i]||'');
  t.innerHTML='<img src="'+im+'" loading="lazy" alt="" aria-hidden="true"><span class="shade"></span><span class="glow"></span><span class="lbl"><b>'+name+'</b><span>'+n+' listings</span></span>';
  t.onclick=()=>setPreset(name,rx);m.appendChild(t)});
}
/* "Most wanted": the sneaker run from the promo video — static cards, fx.js turns it into a pinned scroll scene */
const WANTED=[['Jordan 4','JORDAN','Air Jordan',/jordan 4|aj4|\bj4\b/i,'images/hero/jordan4.webp'],['Nike Dunk','DUNK','Nike',/dunk/i,'images/hero/dunk.webp'],['Adidas Samba','SAMBA','Adidas Originals',/samba|gazelle|spezial|campus/i,'images/hero/samba.webp'],['Yeezy 350','YEEZY','Adidas Yeezy',/yeezy/i,'images/hero/yeezy.webp'],['Balenciaga Track','TRACK','Balenciaga',/balenciaga/i,'images/hero/balenciaga.webp']];
function buildWanted(){const st=$('#wstage');if(!st)return;
 WANTED.forEach(([name,ghost,kick,rx,img],i)=>{const l=match(rx),mp=minPrice(l.filter(x=>x[2].includes(3)||SHOE.test(x[1])||x.kind==='shoe'));
  const el=document.createElement('button');el.type='button';el.className='wshoe';el.style.setProperty('--i',i);
  el.innerHTML='<span class="ghost" aria-hidden="true">'+ghost+'</span><img src="'+img+'" alt="" loading="lazy"><span class="wname">'+name+'</span><span class="wmeta mono">'+kick+' · '+l.length+' listings'+(mp?' · from <b>€'+mp.toFixed(2)+'</b>':'')+'</span><span class="wgo mono">Shop '+name+' →</span>';
  el.onclick=()=>setPreset(name,rx);st.appendChild(el)})}
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

/* ================= filters: size (main), brand, price, category, sort =================
   State lives in F + tab/preset/query; every change re-renders and mirrors into the URL,
   so a filtered view can be shared or bookmarked. */
const F={types:new Set(),sizes:new Set(),brands:new Set(),min:null,max:null,sort:'rec',avail:false};
let SMODE='eu';const PCAP=400;
const FBRANDS=BRANDS.filter(b=>b[0]!=='Football kits').concat([['Balenciaga',/balenciaga/i],['Jordan',/jordan|\baj ?\d/i],['Adidas',/adidas|samba|gazelle|spezial|yeezy/i],['New Balance',/new balance|\bnb ?\d/i],['Off-White',/off.?white/i],['Golden Goose',/golden goose/i],['Louboutin',/louboutin/i],['Alexander McQueen',/mcqueen/i],['Asics',/asics/i],['Bottega Veneta',/bottega/i],['Burberry',/burberry/i],['Versace',/versace/i],['Palm Angels',/palm angels/i],['Balmain',/balmain/i],['Givenchy',/givenchy/i],['Celine',/celine/i],['Hermès',/herm[eè]s/i],['Rick Owens',/rick owens/i],["Arc'teryx",/arc.?teryx/i],['Canada Goose',/canada goose/i],['Lacoste',/lacoste/i],['Represent',/represent/i],['Miu Miu',/miu ?miu/i],['Loewe',/loewe/i],['Chanel',/chanel/i],['Fendi',/fendi/i],['Valentino',/valentino/i],['Birkenstock',/birc?k?enstock/i],['Crocs',/crocs/i],['Timberland',/timberland/i],['Salomon',/salomon/i],['Puma',/puma/i],['Vetements',/vetements/i],['Yeezy',/yeezy/i]]);
/* product type, read from the name (supplier tabs mix everything): [key, label, test] — first match wins */
const TYPES=[
 ['kits','Football kits',it=>it[2].includes(10)||/season|fan version|player version|kids kit|\bjersey\b/i.test(it[1])],
 ['slides','Slides & sandals',it=>/slide|sandal|slipper|sliper|flip.?flop|foam runner|birc?k?enstock|\bmule/i.test(it[1])],
 ['sneakers','Sneakers',it=>it.kind==='shoe'||it[2].includes(3)||/sneaker|trainer|\bshoes?\b|jordan|dunk|air max|air force|\baf1\b|yeezy (?:350|700|500|boost)|350 v2|new balance|\bnb ?\d|samba|gazelle|spezial|campus|runner|triple ?s|\bb2[23]\b|\bb30\b|skate|loafer|\bboots?\b|timberland|asics|salomon|vapormax|bapesta|converse|crocs|clog/i.test(it[1])],
 ['tees','T-shirts & tops',it=>/t-?shirt|\btees?\b|polo|\bshirt|tank ?top|\btop\b|long.?sleeve/i.test(it[1])],
 ['shorts','Shorts',it=>/shorts?\b|jorts/i.test(it[1])],
 ['sets','Tracksuits & sets',it=>/tracksuit|track suit|\bset\b|\bsuit\b/i.test(it[1])],
 ['hoodies','Hoodies & knits',it=>/hood|sweater|sweatshirt|crewneck|zip|knit|cardigan|pullover/i.test(it[1])],
 ['pants','Pants & jeans',it=>/pant|jeans?\b|trouser|jogger|cargo|denim/i.test(it[1])],
 ['jackets','Jackets & coats',it=>it[2].includes(6)||/jacket|coat|puffer|\bdown\b|parka|\bvest|gilet|windbreaker|bomber|fleece|shell|moncler/i.test(it[1])],
 ['bags','Bags & wallets',it=>/\bbags?\b|backpack|wallet|purse|tote|keepall|speedy|neverfull|card ?holder|pouch|luggage|suitcase|crossbody|messenger/i.test(it[1])],
 ['hats','Caps & hats',it=>/\bcaps?\b|\bhats?\b|beanie|balaclava|bucket/i.test(it[1])],
 ['jewellery','Jewellery & watches',it=>/\brings?\b|necklace|bracelet|earring|chain|pendant|watch|jewel|rolex|audemars|patek|tissot|omega|cartier|cross(?:es)?\b/i.test(it[1])],
 ['belts','Belts',it=>/\bbelts?\b/i.test(it[1])],
 ['eyewear','Eyewear',it=>/glasses|sunglass|eyewear|oakley/i.test(it[1])],
 ['tech','Tech',it=>it[2].includes(8)||/airpods|iphone|headphone|speaker|charger/i.test(it[1])],
 ['acc','Other accessories',it=>it[2].includes(7)||/socks?\b|scarf|gloves?|keychain|candle|perfume|stanley/i.test(it[1])]];
let BRANDLIST=[],EUALL=[],CLALL=[],TYPELIST=[];
function prep(){const DS=window.DripSize;const eu={},cl={};
 for(const it of D.items){const m=DS.meta(it[4]);it.kind=m.kind;it.sk=m.keys;for(const k of m.keys)(k[0]==='e'?eu:cl)[k]=(k[0]==='e'?eu:cl)[k]+1||1;
  it.br=[];for(const [n,rx] of FBRANDS)if(rx.test(it[1]))it.br.push(n);
  it.ty=(TYPES.find(t=>t[2](it))||[''])[0]}
 const tyc={};for(const it of D.items)tyc[it.ty]=(tyc[it.ty]||0)+1;const ORD=['sneakers','slides','tees','shorts','hoodies','pants','jackets','sets','kits','bags','hats','jewellery','belts','eyewear','tech','acc'];TYPELIST=TYPES.filter(t=>tyc[t[0]]>=3).sort((a,b)=>ORD.indexOf(a[0])-ORD.indexOf(b[0])).map(t=>[t[0],t[1]]);
 EUALL=Object.keys(eu).filter(k=>eu[k]>=4).sort((a,b)=>parseFloat(a.slice(3))-parseFloat(b.slice(3)));
 CLALL=DS.CL.map(c=>'cl:'+c).filter(k=>cl[k]>=4);
 const bc={};for(const it of D.items)for(const b of it.br)bc[b]=(bc[b]||0)+1;
 BRANDLIST=Object.keys(bc).filter(b=>bc[b]>=3).sort((a,b)=>bc[b]-bc[a]);
 const nb=$('#nbrands'),np=$('#npieces');if(nb){const v=Math.floor(BRANDLIST.length/5)*5;nb.dataset.count=v;nb.textContent=v}if(np){np.dataset.count=D.items.length;np.textContent=D.items.length.toLocaleString('en')}}

function pass(it,skip,W){
 if(skip!=='tab'&&tab>=0&&!it[2].includes(tab))return false;
 if(preset&&!preset.rx.test(it[1]))return false;
 if(W.length){const n=norm(it[1]);const sz=(it[4]||[]).map(norm);for(const x of W)if(!n.includes(x)&&!sz.includes(x))return false}
 if(skip!=='type'&&F.types.size&&!F.types.has(it.ty))return false;
 if(skip!=='size'&&F.sizes.size){let ok=false;for(const k of F.sizes)if(it.sk.has(k)){ok=true;break}if(!ok)return false}
 if(skip!=='brand'&&F.brands.size){let ok=false;for(const b of it.br)if(F.brands.has(b)){ok=true;break}if(!ok)return false}
 if(skip!=='price'&&(F.min!=null||F.max!=null)){const p=it[5];if(p==null)return false;if(F.min!=null&&p<F.min)return false;if(F.max!=null&&p>F.max)return false}
 if(F.avail&&it[5]==null)return false;
 return true}
const words=()=>norm(query).split(' ').filter(Boolean);
function filter(){const W=words();list=D.items.filter(it=>pass(it,'',W));
 const pr=x=>x[5]==null?Infinity:x[5];
 if(F.sort==='pa')list.sort((a,b)=>pr(a)-pr(b));else if(F.sort==='pd')list.sort((a,b)=>(b[5]??-1)-(a[5]??-1));else if(F.sort==='az')list.sort((a,b)=>a[1].localeCompare(b[1]))}
function facet(skip){const W=words();return D.items.filter(it=>pass(it,skip,W))}
function nFilters(){return F.types.size+F.sizes.size+F.brands.size+(F.min!=null||F.max!=null?1:0)+(F.avail?1:0)+(tab>=0?1:0)}

function card(it,idx){const a=document.createElement('a');a.className='card';a.href='product/'+it[0]+'.html';
 const im=document.createElement('div');im.className='im';const img=document.createElement('img');img.loading='lazy';img.decoding='async';img.width=400;img.height=400;img.src='images/'+it[0]+'_0.webp';img.alt=it[1];im.appendChild(img);
 const num=document.createElement('div');num.className='num mono';num.textContent=String(idx+1).padStart(4,'0');im.appendChild(num);const bm=/og batch|top batch|best batch|pk batch|top quality|1:1/i.exec(it[1]);if(bm){const b=document.createElement('div');b.className='badge mono';b.textContent=bm[0].toUpperCase().replace('BEST BATCH','TOP BATCH').replace('TOP QUALITY','TOP BATCH').replace('1:1','1:1 BATCH');im.appendChild(b)}
 /* your size is in stock: say so on the card */
 if(F.sizes.size){const hit=[...F.sizes].filter(k=>it.sk.has(k));if(hit.length){const y=document.createElement('div');y.className='yours mono';y.textContent='✓ '+hit.map(DripSize.label).join(' · ');im.appendChild(y)}}
 a.appendChild(im);
 const info=document.createElement('div');info.className='info';const tag=document.createElement('div');tag.className='tag';tag.textContent=D.tabs[it[2][0]];const nm=document.createElement('div');nm.className='nm';nm.textContent=it[1];info.appendChild(tag);info.appendChild(nm);if(it[3]){const sr=document.createElement('div');sr.className='szr';sr.textContent=/sizes$/.test(it[3])?it[3].toUpperCase():'SIZES '+it[3];info.appendChild(sr)}if(it[5]!=null){const pr=document.createElement('div');pr.className='pr';pr.innerHTML=(it[6]!=null?'<small>FROM</small>':'')+'€'+it[5].toFixed(2);info.appendChild(pr)}a.appendChild(info);return a}
function page(){const f=document.createDocumentFragment();for(let i=shown;i<Math.min(shown+PAGE,list.length);i++)f.appendChild(reveal(card(list[i],i)));grid.appendChild(f);shown=Math.min(shown+PAGE,list.length);more.hidden=shown>=list.length;more.textContent='Load more ('+(list.length-shown).toLocaleString()+')'}
function render(scroll){filter();grid.innerHTML='';shown=0;
 if(!list.length){grid.innerHTML='<div class="empty"><b>Nothing matches all of that.</b><span>Try another size or drop a filter.</span><button type="button" class="mono" id="emptyclr">Clear all filters</button></div>';more.hidden=true;$('#emptyclr').onclick=clearAll}
 else page();
 srow.innerHTML='<b>'+list.length.toLocaleString()+'</b> '+(list.length===1?'piece':'pieces')+(F.sizes.size?' in your size':'');
 clr.hidden=!(preset||tab>=0||query||nFilters());
 paintActive();paintSizebar();paintPill();if(fd&&!fd.hidden)paintDrawer();syncURL();
 if(window.fxGrid)window.fxGrid(grid);
 if(scroll)window.scrollTo({top:document.querySelector('#catalogue').offsetTop-110,behavior:RM?'auto':'smooth'})}
function clearAll(){preset=null;tab=-1;query='';q.value='';F.types.clear();F.sizes.clear();F.brands.clear();F.min=F.max=null;F.avail=false;DripSize.saveProfile([]);markCats();render(false)}
more.onclick=page;clr.onclick=clearAll;
new IntersectionObserver(e=>{if(e[0].isIntersecting&&!more.hidden)page()},{rootMargin:'1000px'}).observe(more);
let deb;q.addEventListener('input',()=>{clearTimeout(deb);deb=setTimeout(()=>{query=q.value;preset=null;render(query.length>0)},130)});

/* ---- URL <-> state ---- */
function syncURL(){const u=new URLSearchParams();if(tab>=0)u.set('tab',tab);if(preset)u.set('c',preset.name);if(query)u.set('q',query);
 if(F.types.size)u.set('type',[...F.types].join(','));if(F.sizes.size)u.set('size',[...F.sizes].join(','));if(F.brands.size)u.set('brand',[...F.brands].join(','));
 if(F.min!=null)u.set('min',F.min);if(F.max!=null)u.set('max',F.max);if(F.sort!=='rec')u.set('sort',F.sort);if(F.avail)u.set('avail','1');
 const s=u.toString();const url=location.pathname+(s?'?'+s:'')+location.hash;if(url!==location.pathname+location.search+location.hash)history.replaceState(null,'',url)}
function readURL(u){(u.get('type')||'').split(',').filter(t=>TYPELIST.some(x=>x[0]===t)).forEach(t=>F.types.add(t));
 (u.get('size')||'').split(',').filter(k=>/^(eu|cl):/.test(k)).forEach(k=>F.sizes.add(k));
 (u.get('brand')||'').split(',').filter(b=>BRANDLIST.includes(b)).forEach(b=>F.brands.add(b));
 if(u.get('min'))F.min=+u.get('min');if(u.get('max'))F.max=+u.get('max');if(['pa','pd','az'].includes(u.get('sort')))F.sort=u.get('sort');F.avail=u.get('avail')==='1';
 return F.types.size||F.sizes.size||F.brands.size||F.min!=null||F.max!=null||F.avail}

/* ---- active filter chips ---- */
function paintActive(){const a=$('#actrow');if(!a)return;const ch=[];
 if(tab>=0)ch.push([CAT_LABEL[D.tabs[tab]]||D.tabs[tab],()=>{tab=-1;markCats()}]);
 if(preset)ch.push([preset.name,()=>{preset=null}]);
 if(query)ch.push(['“'+query+'”',()=>{query='';q.value=''}]);
 F.types.forEach(t=>ch.push([TYPELIST.find(x=>x[0]===t)[1],()=>F.types.delete(t)]));
 F.sizes.forEach(k=>ch.push([DripSize.label(k),()=>{F.sizes.delete(k);DripSize.saveProfile([...F.sizes])},'mine']));
 F.brands.forEach(b=>ch.push([b,()=>F.brands.delete(b)]));
 if(F.min!=null||F.max!=null)ch.push([(F.min!=null?'€'+F.min:'€0')+' – '+(F.max!=null?'€'+F.max:'any'),()=>{F.min=F.max=null}]);
 if(F.avail)ch.push(['Orderable now',()=>{F.avail=false}]);
 a.innerHTML='';ch.forEach(([t,fn,c])=>{const b=document.createElement('button');b.type='button';b.className='achip'+(c?' '+c:'');b.innerHTML='<span></span><i aria-hidden="true">✕</i>';b.firstChild.textContent=t;b.setAttribute('aria-label','Remove filter '+t);b.onclick=()=>{fn();render(false)};a.appendChild(b)})}

/* ---- the size bar: the main filter, always one tap away ---- */
const sbar=$('#sizebar');
function paintSizebar(){if(!sbar)return;
 if(!sbar.dataset.built){sbar.dataset.built=1;
  sbar.innerHTML='<div class="typerow" id="typerow" role="group" aria-label="Type"></div><div class="sbin"><span class="sbl mono">Your size</span><div class="seg" role="tablist" aria-label="Size type"><button type="button" role="tab" data-m="eu">Sneakers <small>EU</small></button><button type="button" role="tab" data-m="cl">Clothing</button></div><div class="sbchips" id="sbchips" role="group" aria-label="Sizes"></div><div class="sbtools"><label class="sortw"><span class="mono">Sort</span><select id="sort" aria-label="Sort"><option value="rec">Recommended</option><option value="pa">Price: low to high</option><option value="pd">Price: high to low</option><option value="az">Name A–Z</option></select></label><button type="button" class="fbtn brb" id="brbtn">Brand<b id="brn"></b></button><button type="button" class="fbtn" id="fbtn"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 6h10M18 6h2M4 12h4M12 12h8M4 18h12M20 18h0"/><circle cx="16" cy="6" r="2"/><circle cx="10" cy="12" r="2"/><circle cx="18" cy="18" r="2"/></svg>Filters<b id="fbn"></b></button></div></div>';
  sbar.querySelectorAll('.seg button').forEach(b=>b.onclick=()=>{SMODE=b.dataset.m;paintSizebar()});
  $('#sort').onchange=e=>{F.sort=e.target.value;render(false)};$('#fbtn').onclick=()=>openDrawer(true);$('#brbtn').onclick=()=>{openDrawer(true);const x=$('#fbrand');if(x)x.scrollIntoView({block:'start'});setTimeout(()=>{const i=$('#bsearch');if(i)i.focus({preventScroll:true})},320)}}
 sbar.querySelectorAll('.seg button').forEach(b=>{b.classList.toggle('on',b.dataset.m===SMODE);b.setAttribute('aria-selected',b.dataset.m===SMODE)});
 $('#sort').value=F.sort;const n=nFilters();$('#fbn').textContent=n?n:'';$('#brn').textContent=F.brands.size?F.brands.size:'';
 const yc={};for(const it of facet('type'))yc[it.ty]=(yc[it.ty]||0)+1;const tr=$('#typerow');
 tr.innerHTML='<button type="button" class="ty'+(F.types.size?'':' on')+'" data-ty="">All</button>'+TYPELIST.map(([k,t])=>'<button type="button" class="ty'+(F.types.has(k)?' on':'')+(yc[k]?'':' zero')+'" data-ty="'+k+'" aria-pressed="'+F.types.has(k)+'">'+t+'<small>'+(yc[k]||0)+'</small></button>').join('');
 tr.querySelectorAll('.ty').forEach(x=>x.onclick=()=>{if(!x.dataset.ty)F.types.clear();else toggleType(x.dataset.ty);render(false)});
 const cnt={};for(const it of facet('size'))for(const k of it.sk)cnt[k]=(cnt[k]||0)+1;
 const keys=SMODE==='eu'?EUALL:CLALL;const box=$('#sbchips');
 box.innerHTML=keys.map(k=>'<button type="button" class="szc'+(F.sizes.has(k)?' on':'')+(cnt[k]?'':' zero')+'" data-k="'+k+'" aria-pressed="'+F.sizes.has(k)+'"><b>'+k.slice(3)+'</b><small>'+(cnt[k]||0)+'</small></button>').join('');
 box.querySelectorAll('.szc').forEach(b=>b.onclick=()=>{toggleSize(b.dataset.k);render(false)});
 const on=box.querySelector('.on');if(on&&!sbar.dataset.scrolled){sbar.dataset.scrolled=1;box.scrollLeft=on.offsetLeft-box.clientWidth/2}}
function toggleType(k){F.types.has(k)?F.types.delete(k):F.types.add(k);
 /* switch the size bar to the size system that fits what they're looking at */
 if(F.types.size&&[...F.types].every(t=>t==='sneakers'||t==='slides'))SMODE='eu';else if(F.types.size&&[...F.types].every(t=>['tees','shorts','sets','hoodies','pants','jackets','kits'].includes(t)))SMODE='cl'}
function toggleSize(k){F.sizes.has(k)?F.sizes.delete(k):F.sizes.add(k);DripSize.saveProfile([...F.sizes])}

/* ---- phones: floating "Filter & sort" pill while the catalogue is on screen ---- */
const fpill=document.createElement('button');fpill.type='button';fpill.className='fpill';fpill.innerHTML='<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 6h10M18 6h2M4 12h4M12 12h8M4 18h12"/><circle cx="16" cy="6" r="2"/><circle cx="10" cy="12" r="2"/><circle cx="18" cy="18" r="2"/></svg>Filter &amp; sort<b></b><small></small>';
fpill.onclick=()=>openDrawer(true);document.body.appendChild(fpill);
{let inCat=false,barOut=false;const upd=()=>fpill.classList.toggle('on',inCat&&barOut);
 new IntersectionObserver(e=>{inCat=e[0].isIntersecting;upd()},{rootMargin:'-40% 0px -20% 0px'}).observe($('#grid'));
 if(sbar)new IntersectionObserver(e=>{barOut=!e[0].isIntersecting;upd()}).observe(sbar)}
function paintPill(){const n=nFilters();fpill.querySelector('b').textContent=n||'';fpill.querySelector('small').textContent=list.length.toLocaleString()}
/* ---- filter drawer (side panel on desktop, bottom sheet on phones) ---- */
let fd=null,fdb=null;
function openDrawer(on){if(!fd){fd=document.createElement('aside');fd.className='fdrawer';fd.hidden=true;fd.setAttribute('aria-label','Filters');fd.setAttribute('role','dialog');
  fd.innerHTML='<div class="fdh"><b>Filter &amp; sort</b><button type="button" class="fdx" aria-label="Close filters">✕</button></div><div class="fdb" id="fdbody"></div><div class="fdf"><button type="button" class="fdclr mono">Clear all</button><button type="button" class="fdgo">Show <b id="fdn"></b></button></div>';
  document.body.appendChild(fd);fdb=document.createElement('div');fdb.className='fdback';document.body.appendChild(fdb);
  fd.querySelector('.fdx').onclick=()=>openDrawer(false);fdb.onclick=()=>openDrawer(false);fd.querySelector('.fdgo').onclick=()=>{openDrawer(false);render(true)};fd.querySelector('.fdclr').onclick=clearAll;
  addEventListener('keydown',e=>{if(e.key==='Escape'&&fd&&!fd.hidden)openDrawer(false)})}
 if(on){paintDrawer();fd.hidden=false;fdb.hidden=false;requestAnimationFrame(()=>{fd.classList.add('on');fdb.classList.add('on')});document.documentElement.classList.add('lock');fd.querySelector('.fdx').focus()}
 else{fd.classList.remove('on');fdb.classList.remove('on');document.documentElement.classList.remove('lock');setTimeout(()=>{fd.hidden=true;fdb.hidden=true},RM?0:300)}}
let bsearch='';
function paintDrawer(){const b=$('#fdbody');const keepScroll=b.scrollTop;
 const sc={};for(const it of facet('size'))for(const k of it.sk)sc[k]=(sc[k]||0)+1;
 const bc={};for(const it of facet('brand'))for(const x of it.br)bc[x]=(bc[x]||0)+1;
 const tc={};const tl=facet('tab');for(const it of tl)for(const t of it[2])tc[t]=(tc[t]||0)+1;
 const pl=facet('price').map(i=>i[5]).filter(x=>x!=null);const BINS=32,hist=new Array(BINS).fill(0);pl.forEach(p=>hist[Math.min(BINS-1,Math.floor(p/PCAP*BINS))]++);const hm=Math.max(1,...hist);
 const lo=F.min??0,hi=F.max??PCAP;
 const szb=keys=>keys.map(k=>'<button type="button" class="szc'+(F.sizes.has(k)?' on':'')+(sc[k]?'':' zero')+'" data-k="'+k+'" aria-pressed="'+F.sizes.has(k)+'"><b>'+k.slice(3)+'</b>'+(k[0]==='e'&&DripSize.CM[k.slice(3)]?'<em>'+DripSize.CM[k.slice(3)]+' cm</em>':'')+'<small>'+(sc[k]||0)+'</small></button>').join('');
 const szEu='<section><h3 class="mono">Sneaker size <span>EU · foot length</span></h3><div class="szgrid">'+szb(EUALL)+'</div></section>',szCl='<section><h3 class="mono">Clothing size</h3><div class="szgrid cl">'+szb(CLALL)+'</div></section>';
 const brands=BRANDLIST.filter(x=>(bc[x]||F.brands.has(x))&&(!bsearch||x.toLowerCase().includes(bsearch))).sort((a,c)=>(F.brands.has(c)-F.brands.has(a))||((bc[c]||0)-(bc[a]||0)));
 const yc={};for(const it of facet('type'))yc[it.ty]=(yc[it.ty]||0)+1;
 b.innerHTML=
  '<section><h3 class="mono">What are you after</h3><div class="pills">'+TYPELIST.map(([k,t])=>'<button type="button" class="pill'+(F.types.has(k)?' on':'')+(yc[k]?'':' zero')+'" data-ty="'+k+'">'+t+' <small>'+(yc[k]||0)+'</small></button>').join('')+'</div></section>'+
  '<section><h3 class="mono">Sort</h3><div class="pills">'+[['rec','Recommended'],['pa','Price ↑'],['pd','Price ↓'],['az','A–Z']].map(([v,t])=>'<button type="button" class="pill'+(F.sort===v?' on':'')+'" data-sort="'+v+'">'+t+'</button>').join('')+'</div></section>'+
  (SMODE==='cl'?szCl+szEu:szEu+szCl)+
  '<section><h3 class="mono">Price <span id="prl">€'+lo+' – '+(hi>=PCAP?'€'+PCAP+'+':'€'+hi)+'</span></h3><div class="hist" aria-hidden="true">'+hist.map((h,i)=>'<i style="height:'+(6+h/hm*94)+'%"'+((i+1)/BINS*PCAP<=lo||i/BINS*PCAP>=hi?' class="out"':'')+'></i>').join('')+'</div>'+
   '<div class="range"><input type="range" id="rlo" min="0" max="'+PCAP+'" step="5" value="'+lo+'" aria-label="Minimum price"><input type="range" id="rhi" min="0" max="'+PCAP+'" step="5" value="'+hi+'" aria-label="Maximum price"></div>'+
   '<div class="pills">'+[[null,50,'Under €50'],[50,100,'€50–100'],[100,200,'€100–200'],[200,null,'€200+']].map(([a,c,t])=>'<button type="button" class="pill'+(F.min===a&&F.max===c?' on':'')+'" data-min="'+(a??'')+'" data-max="'+(c??'')+'">'+t+'</button>').join('')+'</div></section>'+
  '<section id="fbrand"><h3 class="mono">Brand</h3><input class="bsearch" id="bsearch" type="search" placeholder="Find a brand" value="'+bsearch.replace(/"/g,'&quot;')+'" aria-label="Find a brand"><div class="blist">'+brands.map(x=>'<label class="bk'+(F.brands.has(x)?' on':'')+'"><input type="checkbox" data-b="'+x+'"'+(F.brands.has(x)?' checked':'')+'><span>'+x+'</span><small>'+(bc[x]||0)+'</small></label>').join('')+(brands.length?'':'<div class="none mono">No brand matches</div>')+'</div></section>'+
  '<section><h3 class="mono">Category</h3><div class="pills">'+D.tabs.map((t,i)=>tc[i]||tab===i?'<button type="button" class="pill'+(tab===i?' on':'')+'" data-tab="'+i+'">'+(CAT_LABEL[t]||t)+' <small>'+(tc[i]||0)+'</small></button>':'').join('')+'</div></section>'+
  '<section><label class="tog"><input type="checkbox" id="avail"'+(F.avail?' checked':'')+'><span class="sw" aria-hidden="true"></span><span>Only pieces you can order now</span></label></section>';
 b.scrollTop=keepScroll;$('#fdn').textContent=list.length.toLocaleString()+' '+(list.length===1?'piece':'pieces');
 b.querySelectorAll('[data-ty]').forEach(x=>x.onclick=()=>{toggleType(x.dataset.ty);render(false)});
 b.querySelectorAll('[data-sort]').forEach(x=>x.onclick=()=>{F.sort=x.dataset.sort;render(false)});
 b.querySelectorAll('.szc').forEach(x=>x.onclick=()=>{toggleSize(x.dataset.k);render(false)});
 b.querySelectorAll('[data-min]').forEach(x=>x.onclick=()=>{const a=x.dataset.min===''?null:+x.dataset.min,c=x.dataset.max===''?null:+x.dataset.max;if(F.min===a&&F.max===c){F.min=F.max=null}else{F.min=a;F.max=c}render(false)});
 b.querySelectorAll('[data-b]').forEach(x=>x.onchange=()=>{x.checked?F.brands.add(x.dataset.b):F.brands.delete(x.dataset.b);render(false)});
 b.querySelectorAll('[data-tab]').forEach(x=>x.onclick=()=>{tab=tab===+x.dataset.tab?-1:+x.dataset.tab;preset=null;markCats();render(false)});
 $('#avail').onchange=e=>{F.avail=e.target.checked;render(false)};
 const bs=$('#bsearch');bs.oninput=()=>{bsearch=bs.value.trim().toLowerCase();const pos=bs.selectionStart;paintDrawer();const n=$('#bsearch');n.focus();n.setSelectionRange(pos,pos)};
 const rlo=$('#rlo'),rhi=$('#rhi');let pt;
 const onr=()=>{let a=+rlo.value,c=+rhi.value;if(a>c-10){if(document.activeElement===rlo)a=c-10;else c=a+10;rlo.value=a;rhi.value=c}
  $('#prl').textContent='€'+a+' – '+(c>=PCAP?'€'+PCAP+'+':'€'+c);clearTimeout(pt);pt=setTimeout(()=>{F.min=a>0?a:null;F.max=c<PCAP?c:null;filter();$('#fdn').textContent=list.length.toLocaleString()+' pieces';
   b.querySelectorAll('.hist i').forEach((h,i)=>h.classList.toggle('out',(i+1)/32*PCAP<=a||i/32*PCAP>=c))},60)};
 rlo.oninput=onr;rhi.oninput=onr;rlo.onchange=rhi.onchange=()=>render(false)}

/* ---- "What's your size?" — asked once, on the first visit (like a real sneaker shop) ---- */
function sizePicker(){if($('#szmodal'))return $('#szmodal');
 const m=document.createElement('div');m.id='szmodal';m.className='szmodal';m.hidden=true;m.setAttribute('role','dialog');m.setAttribute('aria-modal','true');m.setAttribute('aria-labelledby','szmt');
 const cnt={};for(const it of D.items)for(const k of it.sk)cnt[k]=(cnt[k]||0)+1;
 const grid=keys=>keys.map(k=>'<button type="button" class="szp" data-k="'+k+'"><b>'+DripSize.label(k)+'</b>'+(k[0]==='e'&&DripSize.CM[k.slice(3)]?'<em>≈ '+DripSize.CM[k.slice(3)]+' cm</em>':'')+'<small>'+cnt[k]+' pieces</small></button>').join('');
 m.innerHTML='<div class="szbox"><button type="button" class="szx" aria-label="Close">✕</button><div class="kick mono"><i></i>Before you browse</div><h2 id="szmt"><span>What’s</span> <span>your</span> <span class="o">size?</span></h2>'+
  '<p>Pick it once — we show only pieces we can get you in that size, and remember it next time. You can pick a sneaker size and a clothing size.</p>'+
  '<div class="seg" role="tablist"><button type="button" class="on" data-m="eu">Sneakers · EU</button><button type="button" data-m="cl">Clothing</button></div>'+
  '<div class="szpg" data-g="eu">'+grid(EUALL)+'</div><div class="szpg cl" data-g="cl" hidden>'+grid(CLALL)+'</div>'+
  '<div class="szf"><button type="button" class="szskip mono">Skip — show everything →</button><button type="button" class="szgo" disabled>Show my size</button></div></div>';
 document.body.appendChild(m);const pick=new Set(F.sizes);
 const sync=()=>{m.querySelectorAll('.szp').forEach(b=>b.classList.toggle('on',pick.has(b.dataset.k)));const go=m.querySelector('.szgo');go.disabled=!pick.size;go.textContent=pick.size?'Show '+[...pick].map(DripSize.label).join(' + ')+' →':'Show my size'};
 m.querySelectorAll('.seg button').forEach(b=>b.onclick=()=>{m.querySelectorAll('.seg button').forEach(x=>x.classList.toggle('on',x===b));m.querySelectorAll('.szpg').forEach(g=>g.hidden=g.dataset.g!==b.dataset.m)});
 m.querySelectorAll('.szp').forEach(b=>b.onclick=()=>{const k=b.dataset.k;if(pick.has(k))pick.delete(k);else{[...pick].forEach(x=>{if(x[0]===k[0])pick.delete(x)});pick.add(k)}sync()});
 const close=()=>{m.classList.remove('on');document.documentElement.classList.remove('lock');setTimeout(()=>m.hidden=true,RM?0:280)};
 m.querySelector('.szgo').onclick=()=>{F.sizes=new Set(pick);DripSize.saveProfile([...pick]);SMODE=[...pick].some(k=>k[0]==='e')?'eu':'cl';close();render(true)};
 m.querySelector('.szskip').onclick=()=>{if(!DripSize.profile())DripSize.saveProfile([]);close()};
 m.querySelector('.szx').onclick=m.querySelector('.szskip').onclick;
 m.addEventListener('click',e=>{if(e.target===m)m.querySelector('.szskip').click()});
 addEventListener('keydown',e=>{if(e.key==='Escape'&&!m.hidden)m.querySelector('.szskip').click()});
 m.sync=()=>{pick.clear();F.sizes.forEach(k=>pick.add(k));sync()};return m}
window.openSizePicker=function(){if(!D)return;const m=sizePicker();m.sync();m.hidden=false;document.documentElement.classList.add('lock');requestAnimationFrame(()=>m.classList.add('on'));if(window.fxModal)window.fxModal(m);setTimeout(()=>{const f=m.querySelector('.szp.on')||m.querySelector('.szp');if(f)f.focus({preventScroll:true})},50)};
