/* =========================================================
   ui.js : 描画・操作 (Engine のイベントを購読)
   ========================================================= */
(function(){
  const $ = s => document.querySelector(s);
  const E = window.Engine;
  const SE = window.SE;

  /* ---------- プリファレンス ---------- */
  const PREF_KEY = 'honshitsu_pref_v1';
  const pref = Object.assign({
    textSpeed: 3,     // 0..5  (0=最速表示なし)
    autoSpeed: 2,
    sfxVol: 0.8, bgmVol: 0.35, sfxOn: true, bgmOn: true
  }, JSON.parse(localStorage.getItem(PREF_KEY) || '{}'));
  function savePref(){ try{ localStorage.setItem(PREF_KEY, JSON.stringify(pref)); }catch(e){} }

  const SPEED_MS = [8, 22, 38, 60, 90];   // index=速い→遅い
  const AUTO_MS = [1200, 1700, 2300, 3200, 4500];

  /* ---------- 状態 ---------- */
  const U = {
    screen: $('#screen'), title: $('#titleScreen'),
    bgImage: $('#bgImage'), bgTint: $('#bgTint'), fg: $('#fgLayer'),
    msgArea: $('#msgArea'), msgWindow: $('#msgWindow'), msgText: $('#msgText'),
    namePlate: $('#namePlate'), msgNext: $('#msgNext'),
    choiceLayer: $('#choiceLayer'), dateBox: $('#dateBox'),
    traceNote: $('#traceNote'), endStamp: $('#endStamp'),
    hud: $('#hud'), hudChapter: $('#hudChapter'), hudTrace: $('#hudTrace'),
    modalRoot: $('#modalRoot')
  };
  let typingTimer = null, autoTimer = null;
  let fullShown = true;      // テキスト全文表示済みか
  let busy = false;          // 演出中クリック無効
  let autoMode = false, skipMode = false;
  let curNode = null;
  let prevTrace = 0;
  let endShown = false;      // エンドカード表示中
  const backlog = [];
  let tempMsg = null;        // ログメッセージ

  const chars = window.CHARS || {};

  /* ---------- ユーティリティ ---------- */
  function esc(s){ return s.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;'); }
  function fmtText(s){
    // ✝本質✝ を強調
    let t = esc(s);
    t = t.replace(/✝本質✝/g, '<span class="honshitsu">✝本質✝</span>');
    return t;
  }
  function charColor(id){ return chars[id] ? chars[id].color : '#c9a227'; }
  function chapterTitleOf(id){
    const list = window.CHAPTER_LIST || [];
    for(const c of list) if(c.id===id) return (c.no||'') + '・' + c.title;
    const ends = window.ENDS || [];
    for(const e of ends) if(e.id===id) return '【' + e.rank + 'エンド】' + e.title;
    const m = E.metaOf(id); if(m && m.title) return m.title;
    return id;
  }

  /* ---------- モーダル ---------- */
  function openModal(header, bodyHTML, footHTML){
    closeModal();
    U.modalRoot.innerHTML =
      '<div class="modal"><div class="modal-head"><h2>'+header+'</h2><div class="spacer"></div>' +
      '<button class="modal-x" data-close>✕</button></div>' +
      '<div class="modal-body">'+bodyHTML+'</div>' +
      (footHTML ? '<div class="modal-foot">'+footHTML+'</div>' : '') +
      '</div>';
    U.modalRoot.classList.remove('hidden');
  }
  function closeModal(){ U.modalRoot.classList.add('hidden'); U.modalRoot.innerHTML=''; }
  /* モーダル内のクリックを一元管理(重複登録を防ぐ) */
  function modalOnClick(fn){
    if(U.modalRoot._h){ U.modalRoot.removeEventListener('click', U.modalRoot._h); }
    U.modalRoot._h = fn;
    U.modalRoot.addEventListener('click', fn);
  }
  document.addEventListener('click', e=>{
    if(e.target.closest('[data-close]')) closeModal();
  });

  /* ---------- 画面切替 ---------- */
  function goGame(){ U.title.classList.add('hidden'); U.screen.classList.remove('hidden'); U.hud.classList.remove('hidden'); endShown=false; }
  function goTitle(){
    U.screen.classList.add('hidden'); U.title.classList.remove('hidden');
    stopAllTimers(); closeModal(); endShown=false; hideSel(); hideNext();
    U.dateBox.classList.remove('show');
    SE.playBgm('title');
  }

  /* ---------- 背景 ---------- */
  const BG_STYLE = {
    classroom_day:   'linear-gradient(160deg,#6a5a3c 0%,#4a4232 45%,#2e2a20 100%)',
    classroom_sunset:'linear-gradient(165deg,#b0764a 0%,#7a4a34 35%,#32202a 75%,#141018 100%)',
    classroom_night: 'radial-gradient(ellipse at 30% 20%, #22304a 0%, #0c1220 55%, #05070f 100%)',
    corridor:        'linear-gradient(90deg,#2a2333 0%,#443952 30%,#3a3148 60%,#1c1626 100%)',
    festival:        'linear-gradient(180deg,#c77a3e 0%,#8a4a34 30%,#3a2840 100%)',
    library:         'linear-gradient(150deg,#4a3c2a 0%,#33281c 60%,#241a10 100%)',
    roof_day:        'linear-gradient(180deg,#7fb2d9 0%,#a8c8e0 45%,#d8c8a0 100%)',
    roof_night:      'radial-gradient(ellipse at 50% 0%, #1c2f55 0%, #0a1026 60%, #04060f 100%)',
    gym:             'linear-gradient(180deg,#5a4a3a 0%,#3a3026 60%,#221c14 100%)',
    schoolyard:      'linear-gradient(180deg,#9cc9e8 0%,#6fae8c 35%,#4a7a54 100%)',
    north:           'linear-gradient(180deg,#9db8d6 0%,#7a8fae 40%,#4a5a76 100%)',
    keiyaki:         'linear-gradient(180deg,#e8c08a 0%,#8a6a3a 45%,#2e2418 100%)',
    oldphoto:        'linear-gradient(160deg,#8a7a58 0%,#6a5c40 55%,#4a3e28 100%)'
  };
  function applyBgFinal(key, tint){
    const el = U.bgImage;
    if(!key){ el.classList.remove('visible'); return; }
    const url = 'images/bg_'+key+'.png';
    const probe = new Image();
    probe.onload = ()=>{ el.style.backgroundImage='url('+url+')'; el.style.background=''; el.classList.add('visible'); };
    probe.onerror = ()=>{ el.style.backgroundImage=''; el.style.background = BG_STYLE[key] ? BG_STYLE[key] : '#0c1220'; el.classList.add('visible'); };
    probe.src = url;
    U.bgTint.style.background = tint || '';
  }

  /* ---------- 立ち絵 ---------- */
  const spriteCache = {};   // cid -> {img:HTMLImageElement or null, url}
  function findFace(cid, face){
    const C = chars[cid];
    if(!C) return null;
    if(C.face[face]) return C.face[face];
    const keys = Object.keys(C.face);
    return keys.length ? C.face[keys[0]] : null;
  }
  function resolveSprite(cid, face){
    const C = chars[cid];
    if(!C) return {kind:'pcard'};
    const url = findFace(cid, face);
    if(url){
      return {kind:'img', url:url};
    }
    // 命名規則による自動検出 (images/ch_<id>_<face>.png)
    return {kind:'probe', url:'images/ch_'+cid+'_'+face+'.png', cid:cid, face:face};
  }
  function probeSprite(cid, face, url, cb){
    const img = new Image();
    img.onload = ()=>{ cb({kind:'img', url:url, img:img}); };
    img.onerror = ()=>{ cb({kind:'pcard'}); };
    img.src = url;
  }

  function renderSprite(item){
    // item: {kind, url?, cid, face}
    U.fg.innerHTML='';
    if(!item) return;
    const wrap = document.createElement('div');
    wrap.className='sprite';
    const C = item.cid ? chars[item.cid] : null;
    const color = C ? C.color : '#c9a227';
    const schoolLabel = C ? (C.school==='r'?'理数科':C.school==='n'?'中高一貫':C.school==='t'?'教員':'') : '';
    if(item.kind==='img' || item.kind==='probe-img'){
      const img = document.createElement('img');
      img.src = item.url;
      wrap.appendChild(img);
      U.fg.appendChild(wrap);
      requestAnimationFrame(()=>{ img.style.transition='opacity .4s'; img.style.opacity='1'; });
    } else {
      // カード表示 (立ち絵が未実装のキャラ)
      wrap.innerHTML =
        '<div class="pcard" style="background:linear-gradient(165deg,'+color+'33, '+color+'11 40%, #141018 100%);border-top:3px solid '+color+'">'+
          '<div class="pc-name" style="color:'+color+'">'+(C?C.name:'??')+'</div>'+
          (C&&C.tag?'<div class="pc-note">'+C.tag+'</div>':'')+
          (schoolLabel?'<div class="pc-tag" style="border-color:'+color+'88;color:'+color+'">'+schoolLabel+'</div>':'')+
        '</div>';
      U.fg.appendChild(wrap);
      requestAnimationFrame(()=>wrap.classList.add('show'));
    }
  }
  /* 話者スプライト更新 */
  function applySpeaker(charId, face){
    if(!charId){ return; }
    const C = chars[charId];
    if(!C) return;
    const res = resolveSprite(charId, face);
    if(res.kind==='img'){
      renderSprite({kind:'img', url:res.url});
    } else if(res.kind==='probe'){
      probeSprite(charId, face, res.url, r=>{ renderSprite({cid:charId, kind:r.kind==='img'?'probe-img':'pcard', url:res.url}); });
    } else {
      renderSprite({cid:charId, kind:'pcard'});
    }
  }
  function clearSprite(){ U.fg.innerHTML=''; }

  /* ---------- メッセージ ---------- */
  function stopTyping(){ if(typingTimer){ clearInterval(typingTimer); typingTimer=null; } }
  function stopAuto(){ if(autoTimer){ clearTimeout(autoTimer); autoTimer=null; } autoMode=false; updateBtns(); }
  function stopAllTimers(){ stopTyping(); stopAuto(); }
  function typewrite(node){
    stopTyping(); fullShown=false;
    U.msgText.innerHTML='';
    const html = fmtText(node.text);
    const spd = SPEED_MS[pref.textSpeed] || 22;
    if(pref.textSpeed===0 || html.length < 6){
      U.msgText.innerHTML = html; fullShown=true; showNext(); return;
    }
    // タグを壊さない文字送り
    let chars2 = 0;
    const walker = document.createTreeWalker(U.msgText);
    // 単純化: プレーンテキスト分割 → タグはまとめて出す
    let idx = 0;
    const total = node.text.length;
    typingTimer = setInterval(()=>{
      idx += (spd<14?2:1);
      U.msgText.innerHTML = fmtText(node.text.slice(0, idx)) + (idx<node.text.length?'<span style="opacity:.28">'+fmtText(node.text.slice(idx))+'</span>':'');
      if(idx>=node.text.length){
        stopTyping(); fullShown=true;
        U.msgText.innerHTML = html;
        showNext();
        if(skipMode){ autoTimer = setTimeout(()=>advanceSafe(), 60); }
        else if(autoMode){ armAuto(); }
      }
    }, spd);
  }
  function showNext(){ U.msgNext.classList.remove('hidden'); }
  function hideNext(){ U.msgNext.classList.add('hidden'); }

  function renderTextNode(p){
    curNode = p;
    busy=false;
    U.msgNext.classList.add('hidden');
    // 名前
    if(p.name){
      const cid = p.char;
      const col = cid ? charColor(cid) : '#c9a227';
      U.namePlate.textContent = p.name;
      U.namePlate.style.borderLeftColor = col;
      U.namePlate.classList.remove('hidden');
    } else {
      U.namePlate.classList.add('hidden');
    }
    // 立ち絵
    if(p.sp === 'none') clearSprite();
    else if(p.char) applySpeaker(p.char, p.face);
    else if(p.name) clearSprite();  // 未定義キャラ: 立ち絵を消す
    // 背景
    if(p.bg) applyBgFinal(p.bg, p.tint);
    // 音楽
    if(p.music) SE.playBgm(p.music);
    if(p.jingle) { const j=SE.sfx[p.jingle]; if(j) j(); }
    // バックログ
    const St = E.currentState();
    backlog.push({ch: St ? St.chapter : '', name:p.name, text:p.text});
    if(backlog.length>600) backlog.shift();
    E.setPreview({ch: St ? St.chapter : '', name:p.name, text:p.text});
    typewrite(p);
    stopAuto();
  }

  /* ---------- 選択肢 ---------- */
  function showSel(items, title, hint){
    curNode = null;
    stopAllTimers(); busy=false;
    U.choiceLayer.innerHTML = '';
    if(title){
      const tt = document.createElement('div');
      tt.className='sel-title';
      tt.textContent = title;
      U.choiceLayer.appendChild(tt);
    }
    if(hint){ const d=document.createElement('div'); d.className='hint'; d.innerHTML=fmtText(hint); U.choiceLayer.appendChild(d); }
    items.forEach((it, i)=>{
      const b = document.createElement('button');
      b.className = 'choice-item';
      b.innerHTML = (it.tag?'<span class="tag">'+esc(it.tag)+'</span>':'') + fmtText(it.text);
      b.addEventListener('click', ()=>{ chooseItem(i, it); });
      U.choiceLayer.appendChild(b);
      setTimeout(()=>b.classList.add('on'), 60+i*110);
      SE.sfx.click();
    });
    U.choiceLayer.classList.remove('hidden');
  }
  function chooseItem(idx, item){
    SE.sfx.decide();
    U.choiceLayer.classList.add('hidden');
    E.choose(idx);
    if(item && item.trace && item.trace>0){ setTimeout(pulseTrace, 80); }
  }
  function hideSel(){ U.choiceLayer.classList.add('hidden'); U.choiceLayer.innerHTML=''; }

  /* ---------- 痕跡表示 ---------- */
  function pulseTrace(){
    U.hudTrace.classList.remove('pulse');
    void U.hudTrace.offsetWidth;
    U.hudTrace.classList.add('pulse');
    U.traceNote.textContent = '✝本質✝の痕跡を記録した';
    U.traceNote.classList.add('show');
    setTimeout(()=>U.traceNote.classList.remove('show'), 1500);
  }
  function updateStats(st){
    if(st){ prevTrace = st.trace; }
    const S = E.currentState();
    if(!S){ return; }
    U.hudTrace.textContent = S.chapter && S.chapter.indexOf('ep_')===0 ? '' : '✝ 痕跡 '+S.trace+' / 7';
    U.hudChapter.textContent = chapterTitleOf(S.chapter).replace(/　/g,' ').slice(0,24);
  }

  /* ---------- 日時 / 章タイトル / CG ---------- */
  function showDate(p){
    busy=true;
    U.dateBox.innerHTML = (p.where?'<span class="d-where">'+esc(p.where)+'</span>':'') + esc(p.when||'');
    U.dateBox.classList.add('show');
    setTimeout(()=>{ busy=false; }, 120);
    // クリック待ちはadvanceSafeで処理(busyを下ろしてから)
  }
  function showTitleCard(p){
    busy=false;
    // 黒幕+タイトル表示
    const ov = document.createElement('div');
    ov.className = 'ch-title-card';
    ov.innerHTML =
      '<div class="ct-inner"><div class="ct-no">'+esc(p.no||'')+'</div>'+
      '<div class="ct-name">'+fmtText(p.chapter||'')+'</div>'+
      (p.ep?'<div class="ct-sub">'+esc(p.ep)+'</div>':'')+'</div>';
    U.screen.appendChild(ov);
    requestAnimationFrame(()=>ov.classList.add('show'));
    ov.addEventListener('click', function h(){
      ov.classList.remove('show');
      setTimeout(()=>{ ov.remove(); E.advance(); }, 350);
    }, {once:true});
  }
  function showCG(p){
    busy=false;
    const ov = document.createElement('div');
    ov.className='cg-overlay';
    const def = (window.CG_LIST||[]).find(c=>c.id===p.id);
    ov.innerHTML =
      '<div class="cg-frame"><div class="cg-title">'+esc(def?def.name:p.id)+'</div>'+
      '<div class="cg-stage"><div class="cg-ph">✝</div></div>'+
      '<div class="cg-cap">'+esc(def?def.desc:p.cap||'')+'</div>'+
      '<div class="cg-click">▼ クリックで進む</div></div>';
    U.screen.appendChild(ov);
    probeImage(ov.querySelector('.cg-stage'), 'images/'+p.id+'.png');
    requestAnimationFrame(()=>ov.classList.add('show'));
    ov.addEventListener('click', function h(){
      ov.classList.remove('show');
      setTimeout(()=>{ ov.remove(); E.advance(); }, 350);
    }, {once:true});
  }
  /* 画像プローブ: あれば<img>、なければ✝シンボルのまま */
  function probeImage(stage, url){
    if(!stage) return;
    const img = new Image();
    img.onload = ()=>{ stage.innerHTML=''; stage.appendChild(img); };
    img.onerror = ()=>{ stage.classList.add('noimg'); };
    img.src = url;
  }

  /* ---------- 送り・進行 ---------- */
  function advanceSafe(){
    if(busy || endShown) return;
    if(!E.currentState()) return;
    const n = E.current();
    if(!n) return;
    if(n.type==='sel'){ return; }
    if(n.type===undefined || n.type==='text'){
      if(!fullShown){ stopTyping(); U.msgText.innerHTML = fmtText(n.text); fullShown=true; showNext(); SE.sfx.page(); return; }
      hideNext(); E.advance(); return;
    }
    if(n.type==='date'){ U.dateBox.classList.remove('show'); E.advance(); return; }
    E.advance();
  }
  function armAuto(){
    stopAuto();
    if(!E.currentState()) return;
    const n = E.current();
    if(n && (n.type==='sel' || n.type==='title' || n.type==='cg')) return;
    autoMode = true;
    const ms = AUTO_MS[pref.autoSpeed] || 2500;
    autoTimer = setTimeout(()=>{ if(autoMode) advanceSafe(); }, ms);
    updateBtns();
  }
  function toggleAuto(){
    if(autoMode) stopAuto(); else { stopAuto(); armAuto(); }
  }
  function toggleSkip(){
    skipMode = !skipMode;
    updateBtns();
    if(skipMode){ stopAuto(); }
  }
  function updateBtns(){
    $('#btnAuto').classList.toggle('active', autoMode);
    $('#btnSkip').classList.toggle('active', skipMode);
  }

  /* ---------- クリック処理 ---------- */
  function onScreenClick(e){
    if(U.modalRoot && !U.modalRoot.classList.contains('hidden')) return;
    if(!U.screen.classList.contains('hidden') && E.currentState()){
      if(e.target.closest('.choice-item')) return;
      if(e.target.closest('.hud')) return;
      if(e.target.closest('.trace-note')) return;
      if(e.target.closest('.ch-title-card') || e.target.closest('.cg-overlay')) return;
      advanceSafe();
    }
  }

  /* ---------- エンド演出 ---------- */
  function showEndCard(endId, endTitle){
    endShown = true;
    SE.sfx.stamp();
    const def = (window.ENDS||[]).find(e=>e.id===endId);
    const rank = def?def.rank:'END';
    const ov = document.createElement('div');
    ov.className='end-card';
    ov.innerHTML =
      '<div class="end-rank">'+esc(rank)+' END</div>'+
      '<div class="end-big">'+fmtText(endTitle||'')+'</div>'+
      '<div class="end-note">この物語を読了しました。おまけ(ギャラリー)が更新されています。</div>'+
      '<button class="t-btn primary end-title-btn">タイトルへ戻る</button>';
    U.screen.appendChild(ov);
    requestAnimationFrame(()=>ov.classList.add('show'));
    ov.querySelector('.end-title-btn').addEventListener('click', ()=>{ ov.remove(); goTitle(); });
  }

  /* ---------- HUD・ボタン ---------- */
  function hudBtns(){
    $('#btnAuto').onclick = ()=>{ if(E.currentState()) toggleAuto(); };
    $('#btnSkip').onclick = ()=>{ if(E.currentState()) toggleSkip(); };
    $('#btnBacklog').onclick = ()=>{ if(E.currentState()) showBacklog(); };
    $('#btnSave').onclick = ()=>{ if(E.currentState()) showSlots('save'); };
    $('#btnLoad').onclick = ()=>{ if(E.currentState()) showSlots('load'); };
    $('#btnConfig').onclick = ()=>{ if(E.currentState()) showConfig(); };
    $('#btnTitle').onclick = ()=>{ if(confirm('タイトル画面に戻りますか？(未保存の進行は失われます)')) goTitle(); };
  }
  function titleBtns(){
    $('#tNew').onclick = ()=>{ SE.sfx.decide(); SE.playBgm('day'); goGame(); E.startNew(); };
    $('#tContinue').onclick = ()=>{ showSlots('load', true); };
    $('#tChapter').onclick = ()=>{ showChapterSelect(); };
    $('#tGallery').onclick = ()=>{ showGallery(); };
    $('#tConfig').onclick = ()=>{ showConfig(); };
  }
  /* ---------- チャプター選択(見たことのある章のみ) ---------- */
  function showChapterSelect(){
    const prof = E.getProfile();
    const list = window.CHAPTER_LIST || [];
    let rows = '';
    list.forEach(c=>{
      const visited = prof.visited[c.id] && Object.keys(prof.visited[c.id]).length>0;
      rows += '<div class="chapter-list"><div class="ch-row '+(visited?'open':'')+'">'+
        '<div class="no">'+esc(c.no||'')+'</div>'+
        '<div class="nm">'+esc(c.title)+'<div style="font-size:.68em;color:#8a8272;margin-top:.15em">'+esc(c.sub||'')+'</div></div>'+
        '<button data-ch="'+c.id+'" '+(visited?'':'disabled')+'>'+(visited?'この章から始める':'未読')+'</button>'+
        '</div></div>';
    });
    openModal('チャプター選択',
      rows + '<div style="font-size:.72em;color:#777;margin-top:1em">※ 見つけた章だけを選べます(記録が初期化されていない場合)。選択すると、その章から続きを読めます。各章の開始時の状況は、物語の「よくある進行」に合わせて補正されます。</div>');
    modalOnClick(e=>{
      const b = e.target.closest('[data-ch]');
      if(!b || b.disabled) return;
      closeModal(); goGame();
      SE.playBgm('day');
      E.startChapterReplay(b.dataset.ch);
    });
  }

  /* ---------- バックログ ---------- */
  function showBacklog(){
    const rows = backlog.slice().reverse().map(b=>
      '<div class="log-item '+(b.name?'':'narr')+'">'+(b.name?'<span class="l-name" style="color:'+charColorForName(b.name)+'">'+esc(b.name)+'</span>':'')+fmtText(b.text)+'</div>'
    ).join('');
    openModal('バックログ', rows || '<div style="color:#777">まだログがありません</div>');
    const mb = U.modalRoot.querySelector('.modal-body');
    mb.scrollTop = 0;
  }
  function charColorForName(name){
    if(!name) return '';
    for(const k in chars){ if(chars[k].name===name) return chars[k].color; }
    return '#c9a227';
  }

  /* ---------- セーブ / ロード ---------- */
  function slotMetaPreview(slot){
    if(!slot) return null;
    const p = slot.preview || {};
    const cn = chapterTitleOf(slot.chapter) || '';
    const d = new Date(slot.ts);
    const tim = ('0'+d.getHours()).slice(-2)+':'+('0'+d.getMinutes()).slice(-2)+' '+('0'+d.getMonth()+1).slice(-2)+'/'+('0'+d.getDate()).slice(-2);
    return { chapter:cn, text:(p.text||'').slice(0,44), name:p.name||'', tim:tim, ts:slot.ts };
  }
  function showSlots(mode, fromTitle){
    const slots = E.listSlots();
    let html = '<div class="slot-grid">';
    slots.forEach((sl, i)=>{
      const m = slotMetaPreview(sl);
      if(m){
        html += '<div class="slot">'+
          '<div class="s-chap">'+(sl.chapter.indexOf('ep_')===0?'【'+ ((window.ENDS||[]).find(e=>e.id===sl.chapter)||{}).rank +'エンド】':'')+esc(m.chapter)+'</div>'+
          '<div class="s-info">'+esc(m.tim)+'　'+(m.name?esc(m.name)+'：':'')+esc(m.text)+'…</div>'+
          '<div style="margin-top:.5em;display:flex;gap:.4em">'+
          (mode==='save'?'<button class="small-btn" data-save="'+i+'">上書き</button>':'')+
          '<button class="small-btn" data-load="'+i+'">ロード</button>'+
          '<button class="small-btn" data-del="'+i+'">削除</button></div></div>';
      } else {
        html += '<div class="slot empty">'+(mode==='save'?'<button class="small-btn" data-save="'+i+'" style="font-size:1.1em;padding:.5em 1.2em">このスロットに保存</button>':'空きスロット')+'</div>';
      }
    });
    html += '</div>';
    openModal(mode==='save'?'セーブ':'ロード', html);
    modalOnClick(e=>{
      const sv = e.target.closest('[data-save]');
      if(sv){ E.saveSlot(+sv.dataset.save); showSlots(mode, fromTitle); }
      const ld = e.target.closest('[data-load]');
      if(ld){
        closeModal();
        if(E.loadSlot(+ld.dataset.load)){
          goGame();
        } else alert('ロードできませんでした');
      }
      const dl = e.target.closest('[data-del]');
      if(dl){ try{ localStorage.removeItem('honshitsu_save_v1_'+dl.dataset.del); }catch(err){} showSlots(mode, fromTitle); }
    });
  }

  /* ---------- 設定 ---------- */
  function showConfig(){
    const r = v=>'<input type="range" min="0" max="4" value="'+v+'">';
    openModal('設定',
      '<div class="config-row"><div class="cl">文字速度</div><input type="range" min="0" max="4" value="'+pref.textSpeed+'" data-k="textSpeed"><div class="cv">'+pref.textSpeed+'</div></div>'+
      '<div class="config-row"><div class="cl">オート速度</div><input type="range" min="0" max="4" value="'+pref.autoSpeed+'" data-k="autoSpeed"><div class="cv">'+pref.autoSpeed+'</div></div>'+
      '<div class="config-row"><div class="cl">効果音</div><input type="range" min="0" max="10" value="'+Math.round(pref.sfxVol*10)+'" data-k="sfxVol"><div class="cv">'+Math.round(pref.sfxVol*10)+'</div></div>'+
      '<div class="config-row"><div class="cl">BGM音量</div><input type="range" min="0" max="10" value="'+Math.round(pref.bgmVol*10)+'" data-k="bgmVol"><div class="cv">'+Math.round(pref.bgmVol*10)+'</div></div>'+
      '<div class="config-row"><div class="cl">効果音</div><button class="small-btn" data-tsfx>'+(pref.sfxOn?'ON':'OFF')+'</button><span style="font-size:.8em;color:#777">クリック音などを鳴らします</span></div>'+
      '<div class="config-row"><div class="cl">BGM</div><button class="small-btn" data-tbgm>'+(pref.bgmOn?'ON':'OFF')+'</button><span style="font-size:.8em;color:#777">環境音楽(WebAudio合成)</span></div>'+
      '<div class="config-row"><div class="cl">進行データ</div><button class="small-btn" data-delall>全セーブ削除</button><button class="small-btn" data-delprof>記録(エンド/CG)リセット</button></div>');
    const mb = U.modalRoot.querySelector('.modal-body');
    mb.addEventListener('input', e=>{
      const t = e.target.closest('input[data-k]');
      if(!t) return;
      pref[t.dataset.k] = +t.value;
      if(t.dataset.k==='sfxVol'){ pref.sfxVol = +t.value/10; SE.setSfxVol(pref.sfxVol); }
      if(t.dataset.k==='bgmVol'){ pref.bgmVol = +t.value/10; SE.setBgmVol(pref.bgmVol); }
      const row = t.closest('.config-row');
      if(row){ const cv = row.querySelector('.cv'); if(cv) cv.textContent = t.value; }
      savePref();
    });
    mb.addEventListener('click', e=>{
      if(e.target.closest('[data-tsfx]')){ pref.sfxOn=!pref.sfxOn; SE.setSfxOn(pref.sfxOn); savePref(); showConfig(); }
      if(e.target.closest('[data-tbgm]')){ pref.bgmOn=!pref.bgmOn; SE.setBgmOn(pref.bgmOn); savePref(); showConfig(); }
      if(e.target.closest('[data-delall]')){ if(confirm('全セーブを削除しますか？')){ for(let i=0;i<8;i++){ try{localStorage.removeItem('honshitsu_save_v1_'+i);}catch(e2){} } showConfig(); } }
      if(e.target.closest('[data-delprof]')){ if(confirm('エンド・CGなどの記録をリセットしますか？')){ localStorage.removeItem('honshitsu_profile_v1'); location.reload(); } }
    });
    SE.setSfxVol(pref.sfxVol); SE.setBgmVol(pref.bgmVol);
    SE.setSfxOn(pref.sfxOn); SE.setBgmOn(pref.bgmOn);
  }

  /* ---------- おまけ ---------- */
  function showGallery(){
    const tabRow =
      '<div class="tab-row">'+
      '<button class="tab-btn active" data-tab="cg">CG鑑賞</button>'+
      '<button class="tab-btn" data-tab="ends">エンド回想</button>'+
      '<button class="tab-btn" data-tab="terms">用語集</button>'+
      '<button class="tab-btn" data-tab="chars">キャラクター</button></div>';
    openModal('おまけ', tabRow + '<div id="galBody"></div>');
    const root = U.modalRoot;
    function renderTab(which){
      const body = root.querySelector('#galBody');
      root.querySelectorAll('.tab-row .tab-btn').forEach(x=>x.classList.toggle('active', x.dataset.tab===which));
      if(which==='cg') body.innerHTML = cgTab();
      else if(which==='ends') body.innerHTML = endsTab();
      else if(which==='terms') body.innerHTML = termsTab();
      else if(which==='chars') body.innerHTML = charsTab();
      bindGallery(root, which);
      if(which==='cg') probeGallery();
    }
    modalOnClick(e=>{
      const tb = e.target.closest('[data-tab]');
      if(tb){ renderTab(tb.dataset.tab); return; }
      const ep = e.target.closest('[data-endplay]');
      if(ep && !ep.disabled){ closeModal(); goGame(); E.startEndReplay(ep.dataset.endplay); return; }
      const cv = e.target.closest('.cgview');
      if(cv){ showCgLarge(cv.dataset.id); }
    });
    renderTab('cg');
  }
  function probeGallery(){
    const body = U.modalRoot.querySelector('.modal-body');
    if(!body) return;
    body.querySelectorAll('[data-url]').forEach(el=>{
      const img = new Image();
      img.onload = ()=>{ const ph=el.querySelector('.ph'); if(ph) ph.outerHTML=''; el.insertBefore(img, el.firstChild); };
      img.onerror = ()=>{};
      img.src = el.dataset.url;
    });
  }
  function showCgLarge(id){
    const ov = document.createElement('div');
    ov.className='cg-overlay show';
    const def = (window.CG_LIST||[]).find(c=>c.id===id);
    ov.innerHTML='<div class="cg-frame"><div class="cg-title">'+esc(def?def.name:id)+'</div>'+
      '<div class="cg-stage"><div class="cg-ph">✝</div></div>'+
      (def?'<div class="cg-cap">'+esc(def.desc)+'</div>':'')+
      '<div class="cg-click">▼ クリックで閉じる</div></div>';
    document.body.appendChild(ov);
    probeImage(ov.querySelector('.cg-stage'), 'images/'+id+'.png');
    ov.addEventListener('click', ()=>ov.remove());
  }
  function imgHtml(id){
    return '<img src="images/'+id+'.png" alt="" loading="lazy">';
  }
  function cgTab(){
    const prof = E.getProfile();
    let h='<div class="grid">';
    (window.CG_LIST||[]).forEach(c=>{
      if(c.cat && c.cat!=='cg') return;   // 背景定義はコレクションに含めない
      const open = prof.cgs.indexOf(c.id)>=0;
      if(!open){ h+='<div class="grid-item locked"></div>'; return; }
      h+='<div class="grid-item cgview" data-id="'+c.id+'" data-url="images/'+c.id+'.png">'+
         '<div class="ph">✝</div><div class="cap">'+esc(c.name)+'</div></div>';
    });
    h+='</div><div style="margin-top:.8em;font-size:.75em;color:#777;line-height:1.7">※ 未収録CGは✝で表示されます。画像を images/ に追加すると自動で切り替わります(命名: cg_<名前>.png)。</div>';
    return h;
  }
  function endsTab(){
    const prof = E.getProfile();
    let h='<div class="end-list">';
    (window.ENDS||[]).forEach(e=>{
      const open = prof.ends[e.id];
      h+='<div class="end-row '+(open?'open':'')+'"><div class="st">'+esc(e.rank)+'</div><div class="nm">'+fmtText(e.title)+'</div>'+
         '<button data-endplay="'+e.id+'" '+(open?'':'disabled')+'>'+(open?'回想を再生':'未到達')+'</button></div>';
    });
    h+='</div>';
    return h;
  }
  function termsTab(){
    let h='<div class="term-list">';
    (window.TERMS||[]).forEach(t=>{
      h+='<div class="term"><div class="t-name">'+fmtText(t.name)+'</div><div class="t-body">'+fmtText(t.body)+'</div>'+(t.origin?'<div class="t-origin">— '+esc(t.origin)+'</div>':'')+'</div>';
    });
    h+='</div>';
    return h;
  }
  function charsTab(){
    let h='<div class="char-grid">';
    Object.keys(chars).forEach(k=>{
      const c = chars[k];
      const url = c.face ? Object.values(c.face)[0] : null;
      h+='<div class="char-card"><div class="cv">'+(url?'<img src="'+url+'">':'<div class="pcard" style="background:linear-gradient(165deg,'+c.color+'44, #141018);width:70%;aspect-ratio:2/3;border-radius:6px;display:flex;align-items:center;justify-content:center;color:'+c.color+';font-size:2.2em">✝</div>')+'</div>'+
         '<div class="ci"><div class="cn" style="color:'+c.color+'">'+esc(c.name)+'</div><div class="cs">'+(c.school==='r'?'理数科':c.school==='n'?'中高一貫(内進)':c.school==='t'?'教員':'')+'・'+esc(c.tag||'')+'</div></div></div>';
    });
    h+='</div>';
    return h;
  }
  function bindGallery(root, which){
    // タブ切替・エンド再生・CG拡大は modalOnClick で処理済み
  }

  /* ---------- エンジンイベント購読 ---------- */
  E.on('node', d=>{
    if(!d) return;
    switch(d.type){
      case 'text': renderTextNode(d); break;
      case 'sel':
        hideNext(); showSel(d.items, d.title, d.hint); break;
      case 'date': showDate(d); break;
      case 'title': showTitleCard(d); break;
      case 'cg': showCG(d); break;
    }
    const S = E.currentState();
    if(S) updateStats();
  });
  E.on('stats', d=>{
    const St = E.currentState();
    if(St && d && typeof d.trace === 'number' && d.trace > prevTrace && St.chapter.indexOf('ep_')!==0 && !endShown){
      SE.sfx.trace();
      pulseTrace();
    }
    if(d) prevTrace = (typeof d.trace==='number') ? d.trace : prevTrace;
    updateStats(d);
  });
  E.on('chapterStart', d=>{
    U.hudChapter.textContent = chapterTitleOf(d.id);
    updateStats();
  });
  E.on('chapterEnd', d=>{
    if(d && d.end){
      stopAllTimers(); hideSel(); hideNext();
      showEndCard(d.endId, d.endTitle);
    }
  });
  E.on('scenarioEnd', ()=>{ goTitle(); });

  /* ---------- キー操作 ---------- */
  document.addEventListener('keydown', e=>{
    if(e.target && (e.target.tagName==='INPUT'||e.target.tagName==='TEXTAREA')) return;
    if(e.key===' '||e.key==='Enter'){ e.preventDefault(); onScreenClick({target:document.body}); }
    if(e.key==='Escape'){ closeModal(); }
    if(e.key==='a'){ toggleAuto(); }
    if(e.key==='s'){ toggleSkip(); }
  });

  /* ---------- 初期化 ---------- */
  function init(){
    hudBtns(); titleBtns();
    document.querySelector('#screen').addEventListener('click', onScreenClick);
    SE.setSfxVol(pref.sfxVol); SE.setBgmVol(pref.bgmVol);
    SE.setSfxOn(pref.sfxOn); SE.setBgmOn(pref.bgmOn);
    // タイトル初期表示
    goTitle();
    SE.playBgm('title');
  }
  window.addEventListener('DOMContentLoaded', init);
})();
