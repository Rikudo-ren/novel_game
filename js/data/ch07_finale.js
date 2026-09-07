/* =========================================================
   終章 ――✝の行方――
   視点: 両馬二郎 (桐葉祭・二日目 深夜)
   ※ この章の最後に分岐判定し、各エンディングへ
   ========================================================= */
SCENES.ch07 = {
  meta: {
    id:'ch07',
    next: S=>'ep_'+(S.vars.endTarget||'normal'),
    title:'終章 ――✝の行方――',
    ensure: S=>{ S.trace = 7; S.flags.note = true; S.flags.panf = true; S.flags.heikatsu_know = true; S.flags.photo_shared = true; S.flags.hidden_gate = true; }
  },
  start:'t1',
  flow: [
    't1','d1','n1','n2','n3','n4','n5','n6','n7','n8','n9',
    'sel1','r1','r2','r3',
    'compute','n10','n11','n12'
  ],
  nodes: {
    t1: { type:'title', no:'終', chapter:'終章　――✝の行方――', ep:'桐葉祭・二日目(土曜) 深夜' },
    d1: { type:'date', when:'桐葉祭・二日目 午後十一時', where:'桐葉高校 北棟2階 理数科B組教室' },
    n1: { bg:'classroom_night', music:'night', text:'――文化祭が、終わった。\n中庭の明かりも消えて、学校には、しんと静かな夜が来ていた。' },
    n2: { name:'両馬二郎', text:'(教室に、一人でいた)\n……眠れなくてな。\n明日の片付けの前に、ノートを、ここに返しに来た。' },
    n3: { name:'両馬二郎', text:'(机の上に、古いノートを置く)\n……「本質とは、何か」。\n……二十五年前の誰かが、この教室で、同じことを考えてた。' },
    n4: { name:'両馬二郎', text:'(心の中で)……俺の✝本質✝は、受け売りだったのかもしれない。\n……でも。\n……三年間、俺が✝本質✝って言ってきたことは、本物だ。' },
    n5: { name:'両馬二郎', text:'(心の中で)……受け売りでも、もらったものは、返さないといけない。\n……もらった✝を、次の誰かに、返す。\n……それが、✝の返し方だ。' },
    n6: { name:'両馬二郎', text:'(ノートを開いて)\n……よし。', face:'normal' },
    n7: { name:'両馬二郎', text:'(心の中で)……でも、その前に。\n……今夜、この教室で、俺は最後の問いを出さなきゃいけない。' },
    n8: { name:'両馬二郎', text:'(ノートの、白いページを見つめて)\n……「✝本質✝って、何なんだ」。', face:'normal' },
    n9: { text:'(――その時。\n教室のドアが、静かに開いた。)' },
    sel1: {
      type:'sel',
      title:'✝の行方',
      hint:'文化祭最後の夜。ノートを手に、君は――',
      items: [
        { text:'みんなの✝をノートに書き足し、ロッカーに戻す', goto:'r1' },
        { text:'ノートは元のロッカーに戻す。今夜のことは、胸にしまう', goto:'r2' },
        { text:'(屋上に行こう。あの人は、きっとそこにいる)', cond:'flags.hidden_gate && flags.heikatsu_know', goto:'r3' }
      ]
    },
    r1: { name:'両馬二郎', text:'(ノートの新しいページに、ペンを走らせる)\n……✝。\n……よし。\n(心の中で)これで、俺たちの分も、この教室に置いていける。', face:'normal', next:'r1b' },
    r1b: { type:'set', fn:S=>{ S.vars.endPath='write'; }, next:'compute' },
    r2: { name:'両馬二郎', text:'(ノートを閉じて、そっとロッカーに戻す)\n……ごめんな、ノートの主。\n……今夜のことは、俺の胸にしまっておく。', face:'normal', next:'r2b' },
    r2b: { type:'set', fn:S=>{ S.vars.endPath='close'; }, next:'compute' },
    r3: { name:'両馬二郎', text:'(ノートを鞄にしまい、屋上への階段を上る)\n……あの人は、きっと、そこにいる。', face:'normal', next:'r3b' },
    r3b: { type:'set', fn:S=>{ S.vars.endPath='roof'; }, next:'compute' },
    compute: {
      type:'set',
      fn:S=>{
        const t = S.trace;
        const badpot = S.vars.badpot||0;
        const path = S.vars.endPath;
        if(path==='roof' && S.flags.hidden_gate && S.flags.heikatsu_know && t>=6){ S.vars.endTarget='hidden'; }
        else if(path==='write' && S.flags.heikatsu_know && t>=5){ S.vars.endTarget='true'; }
        else if(path!=='write' && badpot>=1){ S.vars.endTarget='bad'; }
        else if(path==='write' && t>=4){ S.vars.endTarget='good'; }
        else if(t>=4){ S.vars.endTarget='good'; }
        else { S.vars.endTarget='normal'; }
      }
    },
    n10: { name:'両馬二郎', text:'(心の中で)……さて。\n……今夜の俺は、どっちの俺になるんだろう。', face:'normal' },
    n11: { text:'(夜の学校は、静かだった。\n――どこからか、古い校舎の、木の音が聞こえる。\n……それは、この教室が、長い時間をかけて呼吸している音のようだった。)' },
    n12: { name:'両馬二郎', text:'(呟く)\n……✝本質✝。\n……お前は、本当に、この教室にいるんだな。\n……今夜、俺は、お前に会いに行く。', face:'normal' }
  }
};
