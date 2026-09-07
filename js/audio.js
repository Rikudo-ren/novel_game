/* =========================================================
   Audio : WebAudio による効果音 + 簡易アンビエントBGM
   (外部音源不要・軽量合成)
   ========================================================= */
window.SE = (function(){
  let ctx = null;
  let master = null;
  let sfxVol = 0.8;
  let bgmVol = 0.35;
  let bgmOn = true;
  let sfxOn = true;
  let currentBgm = null;      // プリセット名
  let timerId = null;
  let stepTimer = null;

  function ensure(){
    if(!ctx){
      const AC = window.AudioContext || window.webkitAudioContext;
      if(!AC) return null;
      ctx = new AC();
      master = ctx.createGain();
      master.gain.value = 1;
      master.connect(ctx.destination);
    }
    if(ctx.state === 'suspended') ctx.resume();
    return ctx;
  }

  /* ---- 効果音 ---- */
  function tone(freq, dur, type, vol, delay, glideTo){
    if(!sfxOn) return;
    const c = ensure(); if(!c) return;
    const t0 = c.currentTime + (delay||0);
    const o = c.createOscillator();
    const g = c.createGain();
    o.type = type || 'sine';
    o.frequency.setValueAtTime(freq, t0);
    if(glideTo) o.frequency.exponentialRampToValueAtTime(glideTo, t0+dur);
    g.gain.setValueAtTime(0.0001, t0);
    g.gain.exponentialRampToValueAtTime(vol||0.3, t0+0.012);
    g.gain.exponentialRampToValueAtTime(0.0001, t0+dur);
    o.connect(g); g.connect(master);
    o.start(t0); o.stop(t0+dur+0.05);
  }
  function noise(dur, vol, delay){
    if(!sfxOn) return;
    const c = ensure(); if(!c) return;
    const t0 = c.currentTime + (delay||0);
    const len = Math.floor(c.sampleRate * dur);
    const buf = c.createBuffer(1, len, c.sampleRate);
    const d = buf.getChannelData(0);
    for(let i=0;i<len;i++) d[i] = (Math.random()*2-1) * (1-i/len);
    const src = c.createBufferSource();
    src.buffer = buf;
    const g = c.createGain();
    g.gain.value = vol||0.12;
    const f = c.createBiquadFilter(); f.type='lowpass'; f.frequency.value=900;
    src.connect(f); f.connect(g); g.connect(master);
    src.start(t0);
  }
  const sfx = {
    click(){ tone(880,0.05,'triangle',0.12); },
    select(){ tone(660,0.07,'triangle',0.16,0,0.001); tone(1320,0.08,'sine',0.08,0.03); },
    page(){ noise(0.07,0.05); tone(420,0.04,'sine',0.05); },
    decide(){ tone(523,0.09,'triangle',0.2); tone(659,0.09,'triangle',0.2,0.06); tone(784,0.14,'triangle',0.22,0.12); },
    trace(){ tone(392,0.5,'sine',0.1); tone(523,0.6,'sine',0.09,0.12); tone(659,0.8,'sine',0.08,0.24); tone(784,1.1,'sine',0.06,0.38); },
    badend(){ tone(220,0.9,'sawtooth',0.06); tone(174,1.4,'sawtooth',0.05,0.2); },
    goodend(){ tone(523,0.5,'triangle',0.16); tone(659,0.5,'triangle',0.16,0.14); tone(784,0.5,'triangle',0.16,0.28); tone(1047,1.4,'triangle',0.18,0.42); },
    trueend(){ tone(523,0.7,'sine',0.12); tone(659,0.7,'sine',0.12,0.2); tone(784,0.7,'sine',0.12,0.4); tone(1047,2.2,'sine',0.1,0.6); tone(1319,2.6,'sine',0.07,0.9); },
    stamp(){ noise(0.12,0.2); tone(160,0.25,'square',0.12,0.02); },
  };

  /* ---- アンビエントBGM ---- */
  // プリセット: 和音進行(コード)と音色で雰囲気を作る
  const BGM = {
    title: { // 静かな星
      tempo: 3.2,
      chords: [ [261.6,329.6,392.0,523.3], [220.0,329.6,440.0], [174.6,261.6,349.2,523.3], [196.0,293.7,392.0] ],
      shape:'sine', gain:0.05
    },
    day: { // 教室の日常
      tempo: 1.7,
      chords: [ [261.6,329.6,392.0], [220.0,277.2,329.6], [196.0,293.7,392.0], [196.0,246.9,293.7] ],
      shape:'triangle', gain:0.045
    },
    festival: { // 文化祭
      tempo: 1.15,
      chords: [ [261.6,329.6,440.0,523.3], [293.7,369.9,440.0], [329.6,415.3,493.9], [246.9,311.1,392.0] ],
      shape:'triangle', gain:0.05
    },
    mystery: { // 謎
      tempo: 2.4,
      chords: [ [130.8,196.0,261.6,311.1], [123.5,185.0,246.9,293.7], [110.0,164.8,220.0,277.2], [146.8,220.0,293.7,349.2] ],
      shape:'sine', gain:0.05
    },
    night: { // 夜
      tempo: 3.6,
      chords: [ [98.0,196.0,293.7,392.0], [87.3,174.6,261.6,349.2], [82.4,164.8,246.9,329.6], [110.0,220.0,329.6,440.0] ],
      shape:'sine', gain:0.055
    },
    true: { // 温かい
      tempo: 2.2,
      chords: [ [261.6,329.6,392.0,523.3], [329.6,415.3,493.9], [293.7,369.9,440.0], [196.0,293.7,392.0,493.9] ],
      shape:'triangle', gain:0.055
    }
  };
  function playBgm(name){
    const c = ensure();
    if(currentBgm === name && timerId) return;
    stopBgm();
    if(!bgmOn) { currentBgm = name; return; }
    if(!c) { currentBgm = name; return; }
    const p = BGM[name];
    if(!p){ currentBgm=name; return; }
    currentBgm = name;
    let idx = 0;
    function stepChord(){
      if(currentBgm !== name) return;
      const chord = p.chords[idx % p.chords.length];
      idx++;
      // リバーブ無し・複数オシレータで和音をゆっくり
      chord.forEach((f, i) => {
        const t0 = c.currentTime;
        const o = c.createOscillator();
        const g = c.createGain();
        o.type = p.shape;
        o.frequency.value = f;
        const dur = p.tempo * 0.95;
        g.gain.setValueAtTime(0.0001, t0);
        g.gain.linearRampToValueAtTime(p.gain, t0 + dur*0.3);
        g.gain.linearRampToValueAtTime(0.0001, t0 + dur);
        // うねり
        const lfo = c.createOscillator(); const lg = c.createGain();
        lfo.frequency.value = 0.15 + i*0.05; lg.gain.value = p.gain*0.35;
        lfo.connect(lg); lg.connect(g.gain);
        o.connect(g); g.connect(master);
        o.start(t0); o.stop(t0 + dur + 0.1); lfo.start(t0); lfo.stop(t0+dur+0.1);
      });
      stepTimer = setTimeout(stepChord, p.tempo*1000);
    }
    stepChord();
  }
  function stopBgm(){
    currentBgm = null;
    if(stepTimer){ clearTimeout(stepTimer); stepTimer=null; }
  }

  function setSfxVol(v){ sfxVol=v; }
  function setBgmVol(v){ bgmVol=v; if(master && ctx){ /*マスターはそのまま、gain調整*/ } }
  function setSfxOn(b){ sfxOn=b; }
  function setBgmOn(b){
    bgmOn=b;
    if(!b) stopBgm();
    else if(currentBgm) playBgm(currentBgm);
  }

  return {
    ensure, sfx, playBgm, stopBgm,
    setSfxVol, setBgmVol, setSfxOn, setBgmOn,
    get bgmOn(){return bgmOn}, get sfxOn(){return sfxOn},
    get bgmName(){return currentBgm}
  };
})();
