const cards=[...document.querySelectorAll('.card')];
const dots=[...document.querySelectorAll('.progress span')];
const state={step:0,from:'有人',to:'特别的你',date:'',time:'',activity:''};
const $=id=>document.getElementById(id);

function showStep(index){
  cards.forEach((card,i)=>{card.hidden=i!==index;card.classList.toggle('active',i===index)});
  dots.forEach((dot,i)=>dot.classList.toggle('active',i===index));
  state.step=index; window.scrollTo({top:0,behavior:'smooth'});
}

document.querySelectorAll('.next').forEach(button=>button.addEventListener('click',()=>showStep(state.step+1)));
$('yesButton').addEventListener('click',()=>showStep(2));

let noCount=0;
const noReplies=['先别急嘛','再考虑三秒？','小猫会难过的','真的不可以嘛','好吧…点这里也能拒绝'];
const noFaces=['⊙﹏⊙','˃̣̣̥᷄⌓˂̣̣̥᷅',' •́ ᴖ •̀ ','(｡•́︿•̀｡)','˶ᵔ ᵕ ᵔ˶'];
const noEffects=[['♡','✿','等等！'],['✦','？','再想想'],['🍓','♡','拜托啦'],['✿','！','最后一次']];

function burstAround(element,items){
  const rect=element.getBoundingClientRect();
  for(let i=0;i<12;i++){
    const sticker=document.createElement('span');
    sticker.className='effect-sticker';sticker.textContent=items[i%items.length];
    sticker.style.setProperty('--left',`${rect.left+rect.width/2}px`);
    sticker.style.setProperty('--top',`${rect.top+rect.height/2}px`);
    sticker.style.setProperty('--size',`${16+Math.random()*15}px`);
    const angle=(Math.PI*2*i)/12,distance=34+Math.random()*42;
    sticker.style.setProperty('--dx',`${Math.cos(angle)*distance}px`);
    sticker.style.setProperty('--dy',`${Math.sin(angle)*distance}px`);
    sticker.style.setProperty('--dx2',`${Math.cos(angle)*distance*1.5}px`);
    sticker.style.setProperty('--dy2',`${Math.sin(angle)*distance*1.5-25}px`);
    sticker.style.color=['#ef4b78','#e9a61a','#54aa84','#4ca7ba'][i%4];
    document.body.appendChild(sticker);setTimeout(()=>sticker.remove(),1200);
  }
}

function moveNoButton(){
  const zone=document.querySelector('.chase-zone'),button=$('noButton');
  button.classList.add('running');
  const maxX=Math.max(0,zone.clientWidth-button.offsetWidth);
  const maxY=Math.max(0,zone.clientHeight-button.offsetHeight);
  let x=0,y=0,tries=0;
  do{x=Math.random()*maxX;y=Math.random()*maxY;tries++}
  while(tries<15&&x<Math.min(185,zone.clientWidth*.48)&&y>25&&y<105);
  button.style.left=`${x}px`;button.style.top=`${y}px`;
}

$('noButton').addEventListener('click',event=>{
  if(noCount>=5){
    noCount=0;$('noButton').textContent='再想想';$('noButton').classList.remove('running','settled');
    $('noButton').style.left='';$('noButton').style.top='';$('yesButton').style.transform='';
    $('askCopy').textContent='我准备了一点期待，还有很多真心。';$('chaseHint').textContent='请凭第一直觉作答 ฅ՞•ﻌ•՞ฅ';$('mascotFace').textContent='˶ᵔ ᵕ ᵔ˶';
    showStep(0);return;
  }
  noCount++;
  if(noCount<5){
    burstAround(event.currentTarget,noEffects[noCount-1]);
    moveNoButton();
    $('noButton').textContent=noReplies[noCount-1];
    $('askCopy').textContent=['我还准备了一点点勇气，再考虑一下？','约会可以很短，快乐可以很久。','那就只吃一小块蛋糕，好不好？','这是最后一次撒娇了，尊重你的决定。'][Math.min(noCount-1,3)];
    $('yesButton').style.transform=`scale(${1+noCount*.08})`;
    $('mascotFace').textContent=noFaces[noCount-1];
    $('askMascot').classList.remove('reacting');void $('askMascot').offsetWidth;$('askMascot').classList.add('reacting');
    const card=document.querySelector('[data-step="1"]');card.classList.remove('wiggle');void card.offsetWidth;card.classList.add('wiggle');
  }else{
    burstAround(event.currentTarget,['♡','收到啦','✿']);
    $('chaseHint').textContent='收到你的心意啦，也谢谢你认真作答。';
    $('noButton').textContent='重新看看邀请';
    $('noButton').classList.add('settled');$('mascotFace').textContent=noFaces[4];
  }
});

const today=new Date();
today.setMinutes(today.getMinutes()-today.getTimezoneOffset());
$('dateInput').min=today.toISOString().slice(0,10);
$('whenForm').addEventListener('submit',event=>{
  event.preventDefault();
  state.date=$('dateInput').value;
  state.time=new FormData(event.currentTarget).get('time');
  showStep(3);
});

document.querySelectorAll('#activityGrid button').forEach(button=>button.addEventListener('click',()=>{
  document.querySelectorAll('#activityGrid button').forEach(item=>item.classList.remove('selected'));
  button.classList.add('selected'); state.activity=button.dataset.value; $('activityNext').disabled=false;
}));

$('activityNext').addEventListener('click',()=>{
  const date=new Date(`${state.date}T12:00:00`);
  $('resultDate').textContent=new Intl.DateTimeFormat('zh-CN',{month:'long',day:'numeric',weekday:'short'}).format(date);
  $('resultTime').textContent=state.time; $('resultActivity').textContent=state.activity;
  $('finalFrom').textContent=state.from; $('finalTo').textContent=state.to;
  $('ticketNo').textContent=state.date.replaceAll('-','').slice(4);
  showStep(4); celebrate();
});

$('restartButton').addEventListener('click',()=>{
  state.date=state.time=state.activity=''; $('whenForm').reset();
  document.querySelectorAll('#activityGrid button').forEach(item=>item.classList.remove('selected'));
  $('activityNext').disabled=true; showStep(2);
});

$('copyButton').addEventListener('click',async()=>{
  const text=`💌 ${state.from} 和 ${state.to} 的约会成立啦！\n📅 ${$('resultDate').textContent} ${state.time}\n🎈 约会计划：${state.activity}\n期待见面，也期待所有还没发生的小事。`;
  try{await navigator.clipboard.writeText(text);$('copyStatus').textContent='复制好啦，快把约会票发出去吧！'}
  catch{window.prompt('复制下面的约会信息：',text)}
});

const dialog=$('customizeDialog');
$('customizeButton').addEventListener('click',()=>dialog.showModal());
$('customizeForm').addEventListener('submit',event=>{
  event.preventDefault();
  state.from=$('fromInput').value.trim()||'有人'; state.to=$('toInput').value.trim()||'特别的你';
  $('fromName').textContent=state.from; $('toName').textContent=state.to; dialog.close();
});

function celebrate(){
  const wrap=$('confetti'),colors=['#ef4b78','#ffd862','#a9dfc5','#82cde0','#ff9e89']; wrap.innerHTML='';
  for(let i=0;i<55;i++){
    const piece=document.createElement('i'); piece.className='confetti-piece';
    piece.style.left=`${Math.random()*100}%`;piece.style.background=colors[i%colors.length];
    piece.style.setProperty('--drift',`${Math.random()*180-90}px`);piece.style.animationDelay=`${Math.random()*.8}s`;
    piece.style.borderRadius=i%3===0?'50%':'2px';wrap.appendChild(piece);
  }
  setTimeout(()=>wrap.innerHTML='',3900);
}

let audio;
$('musicButton').addEventListener('click',()=>{
  if(!audio){
    const ctx=new (window.AudioContext||window.webkitAudioContext)();let timer,index=0;
    const melody=[659.25,783.99,880,783.99,659.25,523.25,587.33,659.25,523.25,659.25,783.99,1046.5,880,783.99,659.25,587.33];
    const bass=[261.63,220,174.61,196];
    const tone=(frequency,duration=.2,volume=.035,type='triangle')=>{const now=ctx.currentTime,osc=ctx.createOscillator(),gain=ctx.createGain();osc.type=type;osc.frequency.setValueAtTime(frequency,now);gain.gain.setValueAtTime(.001,now);gain.gain.exponentialRampToValueAtTime(volume,now+.015);gain.gain.exponentialRampToValueAtTime(.001,now+duration);osc.connect(gain).connect(ctx.destination);osc.start(now);osc.stop(now+duration+.02)};
    audio={ctx,playing:false,start(){ctx.resume();this.playing=true;const beat=()=>{if(!this.playing)return;tone(melody[index%melody.length],.19,.032,'triangle');if(index%2===0)tone(melody[index%melody.length]/2,.14,.012,'sine');if(index%4===0)tone(bass[(index/4)%bass.length],.38,.025,'sine');index++};beat();timer=setInterval(beat,235)},stop(){this.playing=false;clearInterval(timer)}};
  }
  if(audio.playing){audio.stop();$('musicButton').classList.remove('on');$('musicButton').setAttribute('aria-label','开启背景音乐')}
  else{audio.start();$('musicButton').classList.add('on');$('musicButton').setAttribute('aria-label','关闭背景音乐')}
});

const params=new URLSearchParams(location.search);
if(params.get('from')||params.get('to')){
  state.from=params.get('from')||state.from;state.to=params.get('to')||state.to;
  $('fromName').textContent=state.from;$('toName').textContent=state.to;
}
