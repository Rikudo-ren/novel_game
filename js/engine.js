/* =========================================================
   Engine : ノベルゲーム状態機械 (DOM非依存)
   ノード定義は js/data/ 配下の SCENES[id] を参照する。
   ========================================================= */
window.Engine = (function(){
  const SAVE_KEY = 'honshitsu_save_v1';
  const PROFILE_KEY = 'honshitsu_profile_v1';

  /* ---------- プロフィール(永続) ---------- */
  let profile = null;
  function defaultProfile(){
    return {
      ends:{},          // endId -> {seen:1, at:timestamp}
      cgs:[],           // 解放済みCG id
      terms:[],
      visited:{},       // chapterId -> {label:true}
      texts:0,
      endsSeen:0,
      playSec:0,
      createdAt: Date.now()
    };
  }
  function loadProfile(){
    try{
      const p = localStorage.getItem(PROFILE_KEY);
      profile = p ? Object.assign(defaultProfile(), JSON.parse(p)) : defaultProfile();
    }catch(e){ profile = defaultProfile(); }
  }
  function saveProfile(){
    try{ localStorage.setItem(PROFILE_KEY, JSON.stringify(profile)); }catch(e){}
  }
  function markVisited(ch, label){
    if(!profile.visited[ch]) profile.visited[ch] = {};
    profile.visited[ch][label] = true;
  }
  function unlockCg(id){
    if(id && profile.cgs.indexOf(id) < 0){ profile.cgs.push(id); saveProfile(); }
  }
  function unlockEnd(endId){
    if(!profile.ends[endId]){ profile.ends[endId] = {seen:1, at:Date.now()}; profile.endsSeen++; }
    else profile.ends[endId].seen++;
    saveProfile();
  }

  /* ---------- 実行状態 ---------- */
  let S = null;   // { chapter, label, flags, trace, rel, vars }
  let started = false;

  function chapter(id){ return window.SCENES ? window.SCENES[id] : null; }
  function cur(){ return chapter(S.chapter); }
  function node(){ const c=cur(); return c ? c.nodes[S.label] : null; }

  function newState(){ return { chapter:null, label:null, flags:{}, trace:0, rel:0, vars:{} }; }
  function resetS(){ S = newState(); }

  /* 条件式評価 */
  function evalExpr(expr){
    if(expr == null) return true;
    if(typeof expr === 'function') return !!expr(S);
    try{
      const f = new Function('S','flags','trace','rel','vars','return ('+expr+');');
      return !!f(S, S.flags, S.trace, S.rel, S.vars);
    }catch(e){ console.error('expr error:', expr, e); return false; }
  }

  /* ---------- ノード処理 ---------- */
  function charIdFor(name){
    if(!name) return null;
    const cs = window.CHARS || {};
    for(const k in cs){ if(cs[k].name === name) return cs[k].id; }
    return null;
  }

  function setLabel(lbl, noEmit){
    if(lbl == null){ endFlow(); return; }
    if(!cur().nodes[lbl]){ console.error('missing label', S.chapter, lbl); return; }
    S.label = lbl;
    markVisited(S.chapter, lbl);
    if(!noEmit) run();
  }

  /* 線形進行: 現在ラベルの次へ */
  function nextLabel(){
    const c = cur();
    const curNd = node();
    // ノードが next を明示していれば優先
    if(curNd && curNd.next){
      const t = typeof curNd.next === 'function' ? curNd.next(S) : curNd.next;
      setLabel(t);
      return;
    }
    const i = c.flow.indexOf(S.label);
    const nxt = c.flow[i+1];
    setLabel(nxt == null ? null : nxt);
  }

  function run(){
    if(!S || !S.chapter) return;
    const n = node();
    if(!n){ endFlow(); return; }
    switch(n.type){
      case undefined:
      case 'text':
        profile.texts++;
        emit('node', payload(n));
        break;
      case 'title':   // 章タイトル(クリック待ち)
        emit('node', {type:'title', chapter:n.chapter, ep:n.ep, no:n.no});
        break;
      case 'date':
        emit('node', {type:'date', when:n.when, where:n.where, sub:n.sub});
        break;
      case 'cg':
        unlockCg(n.id);
        emit('node', {type:'cg', id:n.id, cap:n.cap, bg:n.bg});
        break;
      case 'sel':
        emit('node', {type:'sel', title:n.title||'', hint:n.hint||null, items: n.items.filter(it=>evalExpr(it.cond)).map(it=>({
            text:it.text, tag:it.tag||null, goto:it.goto||null, trace:it.trace||0, rel:it.rel||0,
            set:it.set||null, info:it.info||null
        }))});
        break;
      case 'if':
        if(evalExpr(n.cond)) setLabel(n.then);
        else setLabel(n.else);
        break;
      case 'set':
        if(n.fn) n.fn(S);
        emit('stats', {trace:S.trace, rel:S.rel});
        nextLabel();
        break;
      case 'goto':
        setLabel(n.to);
        break;
      case 'end':
        handleEnd(n);
        break;
      default:
        console.error('unknown node type', n.type);
        nextLabel();
    }
  }

  function handleEnd(n){
    const c = cur();
    if(c.meta && c.meta.end){ // エンド専用章: ep_*
      unlockEnd(c.meta.end.endId);
      emit('chapterEnd', {end:true, endId:c.meta.end.endId, endTitle:c.meta.end.title});
      return;
    }
    // 通常章内で終了(使わない想定だが保険)
    unlockEnd(n.endId || '?');
    emit('chapterEnd', {end:true, endId:n.endId, endTitle:n.title});
  }

  /* 章フロー完了 */
  function endFlow(){
    const c = cur();
    const meta = c ? c.meta : null;
    if(meta && meta.end){           // エンド章の完走
      unlockEnd(meta.end.endId);
      emit('chapterEnd', {end:true, endId:meta.end.endId, endTitle:meta.end.title});
    } else if(meta && meta.next){
      const nxt = typeof meta.next === 'function' ? meta.next(S) : meta.next;
      if(nxt) startChapter(nxt, null, {auto:true});
      else emit('scenarioEnd', {});
    } else {
      emit('scenarioEnd', {});
    }
  }

  /* ---------- 公開操作 ---------- */
  function payload(n){
    let cid = n.char || charIdFor(n.name) || null;
    if(cid && !(window.CHARS||{})[cid]) cid = null;
    return {
      type:'text',
      name:n.name||null,
      char:cid,
      face:n.face||'normal',
      text:n.text||'',
      bg:n.bg||null,
      tint:n.tint||null,
      music:n.music||null,
      jingle:n.jingle||null,
      sp:n.sp||null,          // 'none' で立ち絵クリア / 未指定は話者
      pcard:n.pcard!==false
    };
  }

  function startChapter(id, label, opts){
    const c = chapter(id);
    if(!c){ console.error('no chapter', id); return; }
    if(!opts || !opts.keepState){
      if(!started || (opts && opts.fresh)){ resetS(); }
    }
    started = true;
    S.chapter = id;
    // ensure(再開用の状態補正)は、章選択からの再生時のみ適用する
    if(opts && opts.replay && c.meta && c.meta.ensure){ try{ c.meta.ensure(S); }catch(e){ console.error(e); } }
    S.label = null;
    setLabel(label || c.start);
    emit('chapterStart', {id:id, meta:c.meta});
    return S;
  }

  function startNew(){
    started = true;
    const fresh = newState();
    S = fresh;
    startChapter('ch00', null, {fresh:false, keepState:true});
  }

  /* エンド回想の再生 (独立コンテキスト) */
  function startEndReplay(endId){
    const ep = chapter(endId);
    if(!ep) return;
    resetS();
    started = true;
    startChapter(endId, null, {keepState:true});
  }
  /* チャプター選択からの再生 (ensure適用) */
  function startChapterReplay(id){
    const c = chapter(id);
    if(!c) return;
    resetS();
    started = true;
    startChapter(id, null, {keepState:true, replay:true});
  }

  function advance(){
    if(!S || !S.chapter) return;
    const n = node();
    if(!n){ endFlow(); return; }
    if(n.type === undefined || n.type === 'text' || n.type === 'title' || n.type === 'date' || n.type === 'cg'){
      if(n.type === undefined || n.type === 'text'){ profile.texts++; }
      nextLabel();
    }
  }
  /* タイトル/日付はクリックで次へ(cgも) */

  function choose(idx){
    const n = node();
    if(!n || n.type !== 'sel') return;
    const item = n.items.filter(it=>evalExpr(it.cond))[idx];
    if(!item){ return; }
    // 効果
    if(item.trace){ S.trace += item.trace; if(S.trace<0)S.trace=0; }
    if(item.rel){ S.rel += item.rel; if(S.rel<0)S.rel=0; }
    if(item.set){ item.set(S); }
    emit('stats', {trace:S.trace, rel:S.rel});
    if(item.goto) setLabel(item.goto);
    else nextLabel();
  }

  /* ---------- セーブ ---------- */
  function slotKey(i){ return SAVE_KEY+'_'+i; }
  function saveSlot(i, note){
    const data = {
      chapter:S.chapter, label:S.label, flags:S.flags, trace:S.trace, rel:S.rel, vars:S.vars,
      preview: lastPreview || {},
      note: note || '',
      ts: Date.now()
    };
    try{ localStorage.setItem(slotKey(i), JSON.stringify(data)); return true; }
    catch(e){ return false; }
  }
  function listSlots(){
    const out=[];
    for(let i=0;i<8;i++){
      try{
        const raw = localStorage.getItem(slotKey(i));
        out.push(raw ? JSON.parse(raw) : null);
      }catch(e){ out.push(null); }
    }
    return out;
  }
  function loadSlot(i){
    try{
      const raw = localStorage.getItem(slotKey(i));
      if(!raw) return false;
      const data = JSON.parse(raw);
      S = { chapter:data.chapter, label:data.label, flags:data.flags||{}, trace:data.trace||0, rel:data.rel||0, vars:data.vars||{} };
      started = true;
      // ラベルが無効な場合は章頭へ
      const c = chapter(S.chapter);
      if(!c || !c.nodes[S.label]){ startChapter(S.chapter, null, {keepState:true}); }
      else setLabel(S.label);
      return true;
    }catch(e){ return false; }
  }
  function currentState(){ return S; }
  function isStarted(){ return started; }

  let lastPreview = null;
  function setPreview(p){ lastPreview = p; }

  /* 章の最初のラベル取得(セーブプレビュー用) */
  function chapterStartLabel(id){ const c=chapter(id); return c ? c.start : null; }
  function metaOf(id){ const c=chapter(id); return c ? c.meta : null; }
  function isEndChapter(id){ const c=chapter(id); return c && c.meta && c.meta.end ? true : false; }

  /* ---------- イベント ---------- */
  const listeners = {};
  function emit(ev, data){
    (listeners[ev]||[]).forEach(fn=>{ try{ fn(data); }catch(e){ console.error(e); } });
  }
  function on(ev, fn){
    (listeners[ev] = listeners[ev]||[]).push(fn);
  }
  function off(ev, fn){
    listeners[ev] = (listeners[ev]||[]).filter(f=>f!==fn);
  }

  loadProfile();

  return {
    profile, saveProfile,
    startNew, startChapter, startEndReplay, startChapterReplay, startChapterFromSave:null,
    advance, choose, run, current:()=>node(), currentState,
    evalExpr,
    saveSlot, loadSlot, listSlots, setPreview,
    chapterStartLabel, metaOf, isEndChapter,
    markVisited, unlockCg, unlockEnd,
    on, off, emit,
    getProfile:()=>profile
  };
})();
