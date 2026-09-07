/* =========================================================
   common : キャラクター定義 / 画像マニフェスト / CG / 用語
   ========================================================= */
window.SCENES = window.SCENES || {};

/* ---------- キャラクター定義 ---------- */
// color : 名前・カードのテーマ色
// school: 'r'(理数科) / 'n'(内進) / 't'(教師) / '?'(その他)
window.CHARS = {
  ryouma : { id:'ryouma', name:'両馬二郎', school:'r', color:'#d9683f',
    face:{ normal:'images/ryouma_normal.png', excited:'images/ryouma_excited.png' },
    tag:'✝本質✝の申し子', note:'理数科B組。三年間「✝本質✝」を言い続ける男。この物語の発端にして、謎の当事者。' },
  mie    : { id:'mie', name:'三重県臣', school:'r', color:'#5f83b8',
    face:{ normal:'images/mie_normal.png', ha:'images/mie_ha.png' },
    tag:'否定の守護者', note:'理数科B組。冷笑系を自認するが、教室の中心で「は？」を吐き続ける男。' },
  terachi: { id:'terachi', name:'寺地星', school:'r', color:'#4f9c86',
    face:{ normal:'images/terachi_normal.png', frozen:'images/terachi_frozen.png' },
    tag:'本質配信の巫女(自称ペットボトル)', note:'理数科B組。底辺YouTuber。紙に書き、声に出し、世界に還元する男。' },
  rei    : { id:'rei', name:'数理零', school:'r', color:'#9a6fc0',
    face:{ normal:'images/rei_normal.png' },
    tag:'面白さの王', note:'理数科B組。全科目首席。「面白い」が最高評価の、この教室で最も本質に近い男。' },
  satou  : { id:'satou', name:'砂糖東洋', school:'r', color:'#6f9a4e',
    face:{},
    tag:'沈黙の観察者', note:'理数科B組。窓の外を見ない(見ている)。ゲーム画面の向こう側に地理がある男。' },
  izaki  : { id:'izaki', name:'伊崎', school:'r', color:'#4e8f96',
    face:{},
    tag:'まとめ役', note:'理数科B組。文化祭実行委員。このクラスで唯一、全員の話を聞ける男。' },
  izumi  : { id:'izumi', name:'伊豆見', school:'r', color:'#c08a3a',
    face:{},
    tag:'大喜利司会', note:'理数科B組。伊崎の右腕だった男。少しずつ自分の足で立ち始めている。' },
  meshino: { id:'meshino', name:'召野カイト', school:'r', color:'#c2609c',
    face:{},
    tag:'人妻の使徒', note:'理数科B組。二見先生に捧げる忠誠と英語力。心と体は別の✝本質✝。' },
  kuraishi:{ id:'kuraishi', name:'倉石暁', school:'r', color:'#b0425e',
    face:{},
    tag:'信徒一号', note:'理数科一年。✝本質✝の狂信者。両馬を「教祖」と呼ぶが、両馬は否定している。' },
  sakura : { id:'sakura', name:'櫻優', school:'n', color:'#8a6bb8',
    face:{},
    tag:'恋愛学者', note:'内進二年。恋愛学の研究者。シュレディンガーの好意と、未解決の理論を抱える男。' },
  mimine : { id:'mimine', name:'三峰瑠衣', school:'n', color:'#d46a96',
    face:{ normal:'images/mimine_normal.png', smile:'images/mimine_smile.png', laugh:'images/mimine_laugh.png',
           blush:'images/mimine_blush.png', sharp:'images/mimine_sharp.png' },
    tag:'は？の第二声部', note:'内進二年。常識の塊で直球。櫻の恋愛理論に唯一ツッコめる女。三重とは「は？」のハモリ仲間。' },
  ran    : { id:'ran', name:'内藤蘭', school:'n', color:'#6aa8c9',
    face:{ normal:'images/ran_normal.png', shy:'images/ran_shy.png', smile:'images/ran_smile.png',
           special:'images/ran_special.png', surprised:'images/ran_surprised.png' },
    tag:'消しゴム事象', note:'内進二年。図書委員。本質配信を「意味はわからないけど安心する」と言う女。' },
  heikatsu:{ id:'heikatsu', name:'塀勝也', school:'t', color:'#8a6a3c',
    face:{},
    tag:'ヘイカツ', note:'地理科教諭。地形図を広げ、窓の外を見て、何かを呟く。この物語の、もう一人の当事者。' },
  futami : { id:'futami', name:'二見玲子', school:'t', color:'#3e8a92',
    face:{},
    tag:'副担任', note:'英語科教諭・理数科B組副担任。結婚指輪が光るたびに、ある生徒の心臓が止まる。' },
  all    : { id:'all', name:'一同', school:'?', color:'#c9a227', face:{}, tag:'', note:'' }
};

/* 既存画像の明示マニフェスト (新規追加は README の命名規則で自動検出されます) */
window.CH_IMG = window.CHARS;

/* ---------- プロローグ/本編・エンド章メタ ---------- */
// meta.end が存在する章 = エンド章(回想対象)
window.ENDS = [
  { id:'ep_normal', rank:'ノーマル', title:'文化祭は、終わった', ch:'終章より', color:'#8a938a' },
  { id:'ep_bad',    rank:'バッド',   title:'教祖は、生まれなかった', ch:'終章より', color:'#7a4a52' },
  { id:'ep_good',   rank:'グッド',   title:'見えないものを見る教室', ch:'終章より', color:'#5f83b8' },
  { id:'ep_true',   rank:'トゥルー', title:'✝の系譜', ch:'真エンド', color:'#c9a227' },
  { id:'ep_hidden', rank:'隠し',     title:'地形図の向こう側', ch:'?????', color:'#9aa' }
];

/* ---------- ギャラリーCG定義 ---------- */
window.CG_LIST = [
  { id:'cg_note',   name:'ロッカーのノート', desc:'表紙に✝だけが書かれた、古いノート。', cat:'cg' },
  { id:'cg_panf',   name:'第24回桐葉祭パンフレット', desc:'「✝本質✝を探せ」。色あせた文字。', cat:'cg' },
  { id:'cg_board',  name:'黒板の裏', desc:'誰かが彫った文字の残骸。', cat:'cg' },
  { id:'cg_photo',  name:'二十五年前の写真', desc:'看板の前に並ぶ、制服の生徒たち。', cat:'cg' },
  { id:'cg_nightroom', name:'夜の教室', desc:'誰もいない教室に、誰かの時間が残っている。', cat:'cg' },
  { id:'cg_keiyaki2', name:'裏庭のケヤキ', desc:'夕暮れ。✝が彫られた大ケヤキと、地理教師。', cat:'cg' },
  { id:'cg_roof',   name:'屋上からの星空', desc:'文化祭最後の夜。星と、花火。', cat:'cg' },
  { id:'bg_classroom_day',   name:'教室(昼)', desc:'理数科B組の教室。', cat:'bg' },
  { id:'bg_classroom_sunset',name:'教室(夕暮れ)', desc:'文化祭準備の放課後。', cat:'bg' },
  { id:'bg_classroom_night', name:'教室(夜)', desc:'鍵のかかった教室。', cat:'bg' },
  { id:'bg_corridor',        name:'北棟の廊下', desc:'えんじのネクタイが行き交う。', cat:'bg' },
  { id:'bg_festival',        name:'文化祭の渡り廊下', desc:'のぼりと歓声。', cat:'bg' },
  { id:'bg_library',         name:'図書室', desc:'文化祭アーカイブの段ボール。', cat:'bg' },
  { id:'bg_roof_day',        name:'屋上', desc:'文化祭の喧騒が遠い。', cat:'bg' },
  { id:'bg_gym',             name:'体育館', desc:'閉会式のマイク。', cat:'bg' },
  { id:'bg_schoolyard',      name:'中庭', desc:'屋台の並ぶ並木道。', cat:'bg' }
];

/* ---------- 用語集 ---------- */
window.TERMS = [
  { name:'✝本質✝', body:'両馬二郎が不定期に投下する謎の記号と語。文脈はあったりなかったりする。定義は不可能であり、定義できた瞬間に✝本質✝ではなくなる、とされる。『✝に〈何が〉はない』が基本教義。', origin:'一年生編・第一章' },
  { name:'「は？」', body:'三重県臣の口癖。両馬の✝本質✝発言に対して発動する。三峰瑠衣にも同型の反応が確認され、「ハモリ」と呼ばれることがあるが、本人たちは否定している。', origin:'一年生編・第一章' },
  { name:'ヘイカツ', body:'塀勝也(地理科教諭)の愛称。両馬が匿名掲示板に書き込んだことが発端。地形図の向こう側を見る男。窓の外を見て何かを呟く癖があり、その内容を聞き取れた者はいない。', origin:'一年生編・第一章' },
  { name:'本質配信', body:'寺地星のYouTubeチャンネル『星と地面とせいちちゃんねる』内の企画。LINEオープンチャット『✝本質✝募集所』に集まった✝本質✝を紙に書いて読み上げる。登録者は千四百人に達したが、寺地本人に実感はない。', origin:'一年生編・第三章' },
  { name:'コーンスープの不在', body:'北棟の自販機で三ヶ月間補充されなかったコーンスープ。誰も原因を知らない。「あるときより、ないときの方が本質である」(砂糖東洋)。のちに復活した。', origin:'一年生編・序章' },
  { name:'地形図の向こう側', body:'塀勝也の視線の先にあるもの。匿名掲示板の住人が初めて言葉にした。地面は人間の判断の記録であり、地図は時間を内包している、という考え方。', origin:'一年生編・第七章' },
  { name:'地面は忘れない', body:'ハワイ・ダイヤモンドヘッドで塀勝也が放った言葉。活動を終えた火山も、その形に記憶を留める。「地図は忘れる。人間も忘れる。でも地面は忘れない」。', origin:'二年生編・第九章' },
  { name:'シュレディンガーの好意', body:'櫻優による恋愛発生の理論。好意は観測されない限り量子的に重ね合わさっており、告白(観測)によって波動関数が崩壊する。告白後の減衰は「古典的恋愛」として別途定義される。', origin:'一年生編・第六章' },
  { name:'否定の守護者', body:'倉石暁が三重県臣に与えた役職名。三重の「は？」が✝本質✝の暴走を防ぐ防波堤である、という倉石の独自解釈。三重は認めていない。', origin:'三年生編・序章' },
  { name:'フェイカツ', body:'両馬二郎が受験情報掲示板で使う偽アカウント名。偽のヘイカツ。✝がついているため、全人類に両馬だとバレている。', origin:'三年生編・序章' },
  { name:'第24回桐葉祭', body:'本編から約二十五年前に行われた桐葉祭。理数科(当時の北棟二年)の出し物は「✝本質✝を探せ」。詳細は、誰も覚えていない。', origin:'番外編・第一章' },
  { name:'ロッカーのノート', body:'理数科B組・一番奥の空きロッカーから発見された古いノート。表紙に鉛筆で「✝」とだけ書かれている。', origin:'番外編・プロローグ' },
  { name:'桐葉祭', body:'桐葉高校の文化祭。例年九月下旬に二日間開催される。南棟(内進)と北棟(理数科)がそれぞれ展示・模擬店を出す。', origin:'番外編' }
];

/* ---------- チャプターリスト(選択用) ---------- */
window.CHAPTER_LIST = [
  { id:'ch00', no:'序', title:'プロローグ ――教室に棲む記号――', sub:'両馬二郎の視点' },
  { id:'ch01', no:'一', title:'第一章 ――図書室の幽霊――', sub:'寺地星の視点' },
  { id:'ch02', no:'二', title:'第二章 ――三重県臣、沈黙する――', sub:'三重県臣の視点' },
  { id:'ch03', no:'三', title:'第三章 ――黒板の裏側の幾何学――', sub:'数理零の視点' },
  { id:'ch04', no:'四', title:'第四章 ――砂糖東洋、窓の外を見る――', sub:'砂糖東洋の視点' },
  { id:'ch05', no:'五', title:'第五章 ――消しゴム事象・文化祭――', sub:'内藤蘭の視点' },
  { id:'ch06', no:'六', title:'第六章 ――桐葉祭、二日間――', sub:'文化祭・前編' },
  { id:'ch07', no:'終', title:'終章 ――✝の行方――', sub:'文化祭・後編 / 分岐' }
];
