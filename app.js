
let D=null,tab=-1,query='',shown=0,list=[];const PAGE=80;
const $=s=>document.querySelector(s);
const grid=$('#grid'),cats=$('#cats'),q=$('#q'),srow=$('#srow'),more=$('#more');
fetch('data.json').then(r=>r.json()).then(d=>{D=d;buildCats();render()});
function buildCats(){cats.innerHTML='';const all=btn(-1,'All',D.items.length);cats.appendChild(all);
 D.tabs.forEach((t,i)=>{const n=D.items.filter(x=>x[2].includes(i)).length;if(n)cats.appendChild(btn(i,t,n))});}
function btn(i,name,n){const b=document.createElement('button');b.className='cat'+(i===tab?' on':'');b.innerHTML=name+'<span class="n">'+n+'</span>';b.onclick=()=>{tab=i;render(true);document.querySelectorAll('.cat').forEach((e,j)=>e.classList.toggle('on',(j-1)===i||(i===-1&&j===0)))};return b}
function norm(s){return s.toLowerCase()}
function filter(){const w=norm(query).split(' ').filter(Boolean);list=[];for(const it of D.items){if(tab>=0&&!it[2].includes(tab))continue;if(w.length){const n=norm(it[1]);let ok=true;for(const x of w)if(!n.includes(x)){ok=false;break}if(!ok)continue}list.push(it)}}
function card(it,idx){const a=document.createElement('a');a.className='card';a.href='product/'+it[0]+'.html';
 const im=document.createElement('div');im.className='im';const img=document.createElement('img');img.loading='lazy';img.decoding='async';img.src='images/'+it[0]+'_t.webp';img.alt=it[1];im.appendChild(img);
 const num=document.createElement('div');num.className='num mono';num.textContent=String(idx+1).padStart(4,'0');im.appendChild(num);a.appendChild(im);
 const info=document.createElement('div');info.className='info';const tag=document.createElement('div');tag.className='tag';tag.textContent=D.tabs[it[2][0]];const nm=document.createElement('div');nm.className='nm';nm.textContent=it[1];info.appendChild(tag);info.appendChild(nm);a.appendChild(info);return a}
function page(){const f=document.createDocumentFragment();for(let i=shown;i<Math.min(shown+PAGE,list.length);i++)f.appendChild(card(list[i],i));grid.appendChild(f);shown=Math.min(shown+PAGE,list.length);more.hidden=shown>=list.length;more.textContent='Load more ('+(list.length-shown).toLocaleString()+')'}
function render(scroll){filter();grid.innerHTML='';shown=0;
 if(!list.length){grid.innerHTML='<div class="empty">No items found.</div>';srow.textContent='0 items';more.hidden=true}
 else{page();srow.textContent=list.length.toLocaleString()+' items'+(tab>=0?' · '+D.tabs[tab]:'')+(query?' · "'+query+'"':'')}
 if(scroll)window.scrollTo({top:document.querySelector('.cats').offsetTop-60,behavior:'instant'})}
more.onclick=page;
new IntersectionObserver(e=>{if(e[0].isIntersecting&&!more.hidden)page()},{rootMargin:'1000px'}).observe(more);
let deb;q.addEventListener('input',()=>{clearTimeout(deb);deb=setTimeout(()=>{query=q.value;render()},130)});
document.addEventListener('keydown',e=>{if(e.key==='/'&&document.activeElement!==q){e.preventDefault();q.focus()}});
