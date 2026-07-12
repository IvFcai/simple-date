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
  const card=document.querySelector('[data-step="1"]'),button=$('noButton');
  button.classList.add('running');
  const bounds=card.getBoundingClientRect(),yes=$('yesButton').getBoundingClientRect();
  const old=button.getBoundingClientRect(),margin=18;
  let x=0,y=0,tries=0;
  do{
    x=bounds.left+margin+Math.random()*Math.max(0,bounds.width-button.offsetWidth-margin*2);
    y=Math.max(12,bounds.top+margin)+Math.random()*Math.max(0,Math.min(innerHeight,bounds.bottom)-button.offsetHeight-Math.max(12,bounds.top+margin)-margin);
    tries++;
  }while(tries<40&&(
    Math.hypot(x-old.left,y-old.top)<110||
    (x<yes.right+18&&x+button.offsetWidth>yes.left-18&&y<yes.bottom+18&&y+button.offsetHeight>yes.top-18)
  ));
  button.style.position='fixed';button.style.right='auto';
  button.style.left=`${x}px`;button.style.top=`${y}px`;
}

$('noButton').addEventListener('click',event=>{
  if(noCount>=5){
    noCount=0;$('noButton').textContent='再想想';$('noButton').classList.remove('running','settled');
    $('noButton').style.position='';$('noButton').style.right='';$('noButton').style.left='';$('noButton').style.top='';$('yesButton').style.transform='';
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
    $('noButton').style.position='';$('noButton').style.right='';$('noButton').style.left='';$('noButton').style.top='';
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

let ticketBlob=null,ticketObjectUrl='';

$('activityNext').addEventListener('click',()=>{
  const date=new Date(`${state.date}T12:00:00`);
  $('resultDate').textContent=new Intl.DateTimeFormat('zh-CN',{month:'long',day:'numeric',weekday:'short'}).format(date);
  $('resultTime').textContent=state.time; $('resultActivity').textContent=state.activity;
  $('finalFrom').textContent=state.from; $('finalTo').textContent=state.to;
  $('ticketNo').textContent=state.date.replaceAll('-','').slice(4);
  ticketBlob=null;showStep(4);celebrate();
  makeTicketImage().then(blob=>{ticketBlob=blob});
});

$('restartButton').addEventListener('click',()=>{
  state.date=state.time=state.activity=''; $('whenForm').reset();
  ticketBlob=null;
  document.querySelectorAll('#activityGrid button').forEach(item=>item.classList.remove('selected'));
  $('activityNext').disabled=true; showStep(2);
});

function ticketText(){return `💌 给 ${state.from} 的约会回执\n${state.to} 接受了你的邀请！\n📅 ${$('resultDate').textContent} ${state.time}\n🎈 约会计划：${state.activity}\n约好了，不见不散 ♡`}

function makeTicketImage(){
  return new Promise(resolve=>{
    const canvas=document.createElement('canvas'),ctx=canvas.getContext('2d');canvas.width=1080;canvas.height=1350;
    ctx.fillStyle='#fff7e8';ctx.fillRect(0,0,1080,1350);
    ctx.fillStyle='#ef4b78';ctx.fillRect(70,70,940,180);
    ctx.fillStyle='#fff';ctx.font='900 42px serif';ctx.fillText('DATE TICKET  ·  ADMIT TWO',120,150);
    ctx.font='900 30px serif';ctx.fillText('一张认真生效的约会回执  ♡',120,210);
    ctx.fillStyle='#fffdf7';ctx.strokeStyle='#342824';ctx.lineWidth=8;ctx.beginPath();ctx.roundRect(70,250,940,980,35);ctx.fill();ctx.stroke();
    ctx.fillStyle='#c72f5d';ctx.font='900 38px serif';ctx.fillText('约会确认成功',135,355);
    ctx.fillStyle='#342824';ctx.font='900 72px "Noto Serif SC",serif';ctx.fillText(`${state.to}  ×  ${state.from}`,135,475);
    ctx.setLineDash([20,14]);ctx.lineWidth=4;ctx.beginPath();ctx.moveTo(135,545);ctx.lineTo(945,545);ctx.stroke();ctx.setLineDash([]);
    const rows=[['DATE / 日期',$('resultDate').textContent],['TIME / 时间',state.time],['PLAN / 计划',state.activity]];
    rows.forEach(([label,value],i)=>{const y=650+i*175;ctx.fillStyle='#9c7667';ctx.font='900 25px sans-serif';ctx.fillText(label,135,y);ctx.fillStyle='#342824';ctx.font='900 48px "Noto Serif SC",serif';ctx.fillText(value,135,y+65)});
    ctx.fillStyle='#ffd862';ctx.fillRect(120,1135,840,4);ctx.fillStyle='#c72f5d';ctx.font='36px "Noto Serif SC",serif';ctx.fillText('约好了，不见不散  ♡',330,1195);
    ctx.fillStyle='#8c7469';ctx.font='24px monospace';ctx.fillText(`NO. ${$('ticketNo').textContent}  ·  KEEP THIS MOMENT`,300,1285);
    canvas.toBlob(resolve,'image/png');
  });
}

const shareDialog=$('shareDialog');
function openSharePanel(blob){
  if(ticketObjectUrl)URL.revokeObjectURL(ticketObjectUrl);
  ticketObjectUrl=URL.createObjectURL(blob);$('sharePreview').src=ticketObjectUrl;
  $('shareStatus').textContent='';shareDialog.showModal();
}

$('saveTicketButton').addEventListener('click',()=>{
  if(!ticketObjectUrl)return;
  const link=document.createElement('a');link.href=ticketObjectUrl;link.download=`约会回执-${state.to}-${state.from}.png`;link.click();
  $('shareStatus').textContent='已请求下载；如果相册里没有，请长按上方图片选择“保存到相册”。';
});

$('copyTicketButton').addEventListener('click',async()=>{
  try{await navigator.clipboard.writeText(ticketText());$('shareStatus').textContent='回执文字已复制 ♡'}
  catch{window.prompt('复制下面的约会回执：',ticketText())}
});

$('copyButton').addEventListener('click',async()=>{
  const button=$('copyButton');button.disabled=true;button.textContent='正在制作约会票…';
  const text=ticketText(),blob=ticketBlob||await makeTicketImage();ticketBlob=blob;
  const file=new File([blob],`约会回执-${state.to}-${state.from}.png`,{type:'image/png'});
  try{
    if(navigator.share&&navigator.canShare?.({files:[file]})){
      await navigator.share({title:'约会回执',text,files:[file]});
      $('copyStatus').textContent='约会回执已经出发啦 ♡';
    }else{
      openSharePanel(blob);
      $('copyStatus').textContent='请长按票据图片，或保存后发送给邀请人。';
    }
  }catch(error){
    if(error.name==='AbortError')$('copyStatus').textContent='已取消分享，需要时可以再点一次。';
    else{openSharePanel(blob);$('copyStatus').textContent='浏览器未能调起分享，请从票据面板发送。'}
  }
  finally{button.disabled=false;button.textContent='生成并转发约会票'}
});

const dialog=$('customizeDialog');
$('customizeButton').addEventListener('click',()=>dialog.showModal());
let generatedInviteUrl='';

async function copyInviteLink(){
  if(!generatedInviteUrl)return;
  try{await navigator.clipboard.writeText(generatedInviteUrl);$('inviteStatus').textContent='专属链接已复制，粘贴发给对方即可！'}
  catch{window.prompt('复制这条专属邀请链接：',generatedInviteUrl)}
}

$('copyInviteButton').addEventListener('click',copyInviteLink);
$('shareInviteButton').addEventListener('click',async()=>{
  if(!generatedInviteUrl)return;
  const text=`💌 ${state.from} 想邀请 ${state.to} 赴一场小约会，点开看看吧！`;
  try{
    if(navigator.share){await navigator.share({title:'有一封约会邀请',text,url:generatedInviteUrl});$('inviteStatus').textContent='邀请已经发出啦 ♡'}
    else{await copyInviteLink();$('inviteStatus').textContent='当前浏览器不支持直接分享，链接已复制，请粘贴发给对方。'}
  }catch(error){if(error.name!=='AbortError'){await copyInviteLink();$('inviteStatus').textContent='未能调起分享，链接已复制，请粘贴发给对方。'}}
});

$('customizeForm').addEventListener('submit',event=>{
  event.preventDefault();
  state.from=$('fromInput').value.trim();state.to=$('toInput').value.trim();
  $('fromName').textContent=state.from; $('toName').textContent=state.to;
  const inviteUrl=new URL(location.href);inviteUrl.search='';inviteUrl.hash='';inviteUrl.searchParams.set('from',state.from);inviteUrl.searchParams.set('to',state.to);
  generatedInviteUrl=inviteUrl.href;
  try{history.replaceState({},'',inviteUrl.href)}catch{}
  $('inviteActions').hidden=false;$('customizeForm').classList.add('invite-ready');
  $('generateInviteButton').textContent='名字已保存 ✓';
  $('inviteStatus').textContent='专属邀请已生成，请选择发送方式。';
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

let audio,musicEnabled=true;
function ensureAudio(){
  if(!audio){
    const ctx=new (window.AudioContext||window.webkitAudioContext)();let timer,index=0;
    const melody=[659.25,783.99,880,783.99,659.25,523.25,587.33,659.25,523.25,659.25,783.99,1046.5,880,783.99,659.25,587.33];
    const bass=[261.63,220,174.61,196];
    const tone=(frequency,duration=.2,volume=.035,type='triangle')=>{const now=ctx.currentTime,osc=ctx.createOscillator(),gain=ctx.createGain();osc.type=type;osc.frequency.setValueAtTime(frequency,now);gain.gain.setValueAtTime(.001,now);gain.gain.exponentialRampToValueAtTime(volume,now+.015);gain.gain.exponentialRampToValueAtTime(.001,now+duration);osc.connect(gain).connect(ctx.destination);osc.start(now);osc.stop(now+duration+.02)};
    audio={ctx,playing:false,start(){ctx.resume();this.playing=true;const beat=()=>{if(!this.playing)return;tone(melody[index%melody.length],.19,.032,'triangle');if(index%2===0)tone(melody[index%melody.length]/2,.14,.012,'sine');if(index%4===0)tone(bass[(index/4)%bass.length],.38,.025,'sine');index++};beat();timer=setInterval(beat,235)},stop(){this.playing=false;clearInterval(timer)}};
  }
  return audio;
}

function updateMusicButton(){
  $('musicButton').classList.toggle('on',musicEnabled);
  $('musicButton').setAttribute('aria-label',musicEnabled?'关闭背景音乐':'开启背景音乐');
  $('musicButton').title=musicEnabled?'背景音乐已开启':'背景音乐已关闭';
}

function startDefaultMusic(event){
  if(event.target.closest('#musicButton')||!musicEnabled)return;
  ensureAudio().start();
  document.removeEventListener('pointerdown',startDefaultMusic);
}
document.addEventListener('pointerdown',startDefaultMusic);

$('musicButton').addEventListener('click',()=>{
  musicEnabled=!musicEnabled;
  if(musicEnabled)ensureAudio().start();else if(audio)audio.stop();
  updateMusicButton();
});

const params=new URLSearchParams(location.search);
if(params.get('from')||params.get('to')){
  state.from=params.get('from')||state.from;state.to=params.get('to')||state.to;
  $('fromName').textContent=state.from;$('toName').textContent=state.to;
  $('fromInput').value=state.from==='有人'?'':state.from;$('toInput').value=state.to==='特别的你'?'':state.to;
}
