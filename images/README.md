# images/ 素材ガイド ―― 桐葉祭の✝本質✝

このフォルダに入れた画像は、ゲームから自動で使われます。
**ファイル名さえ守れば、設定ファイルの変更は不要**です(存在しない画像は✝シンボル/グラデ背景に自動フォールバックします)。

---

## 命名規則

| 種類 | ルール | 例 | 推奨サイズ |
|---|---|---|---|
| キャラ立ち絵(既存マップ) | `images/<id>_<face>.png` | `ryouma_excited.png` | 縦長 2:3〜3:4 (高さ1000px〜) |
| キャラ立ち絵(自動検出) | `images/ch_<id>_<face>.png` | `ch_heikatsu_normal.png` | 縦長 2:3〜3:4 |
| 背景 | `images/bg_<名前>.png` | `bg_classroom_night.png` | 横長 16:9 (1920x1080) |
| イベントCG | `images/cg_<名前>.png` | `cg_roof.png` | 横長 16:9 (1920x1080) |

キャラID: `ryouma`(両馬) / `mie`(三重) / `terachi`(寺地) / `rei`(数理零) / `satou`(砂糖) / `izaki`(伊崎) / `izumi`(伊豆見) / `meshino`(召野) / `kuraishi`(倉石) / `sakura`(櫻) / `mimine`(三峰) / `ran`(内藤) / `heikatsu`(塀) / `futami`(二見)

※ 立ち絵は「ひざ下くらいまで見切れた全身よりのカット」。瞳のハイライトを残したセミリアル〜ライトノベル調。学ラン(男子)・セーラー/ブレザー(女子)の桐葉高校制服で統一してください。

---

## 現在ある画像(使用中)

- `ryouma_normal.png` / `ryouma_excited.png` … 両馬二郎
- `mie_normal.png` / `mie_ha.png` … 三重県臣
- `terachi_normal.png` / `terachi_frozen.png` … 寺地星
- `rei_normal.png` … 数理零
- `mimine_normal/smile/laugh/blush/sharp.png` … 三峰瑠衣
- `ran_normal/shy/smile/special/surprised.png` … 内藤蘭

---

## 不足画像リスト(追加推奨・優先度順)

### A. 立ち絵(いま未収録の主要キャラ)

1. **`ch_heikatsu_normal.png`** — 塀勝也(地理科教諭・40代)。スーツに地理の教科書。窓の外を見る横顔。物憂げで静かな眼差し。(重要・トゥルー/隠しエンドで出番多数)
2. **`ch_satou_normal.png`** — 砂糖東洋(理数科・無口な男子)。教室の窓際、頬杖。視線は画面の外(地図の向こう側)。
3. **`ch_kuraishi_normal.png`** — 倉石暁(一年・狂信的な後輩)。学ランに「✝」の手書き紙。目が輝いている。
4. **`ch_izaki_normal.png`** — 伊崎(実行委員・まとめ役)。学ラン、名簿とホイッスル。面倒見のいい笑顔。
5. **`ch_izumi_normal.png`** — 伊豆見(大喜利担当)。笑顔でハンドマイク。
6. **`ch_sakura_normal.png`** — 櫻優(内進・恋愛理論家)。眼鏡、ノートとペン。
7. **`ch_meshino_normal.png`** — 召野カイト(英語担当)。英和辞典を構えてキザな笑顔。
8. **`ch_futami_normal.png`** — 二見玲子(英語科教諭・副担任)。カーディガン、左手薬指の指輪が光る。

### B. 立ち絵(表情差分・任意)

- `ch_ryouma_normal.png`… 既存 `ryouma_normal.png` と同じ規格で差し替え可
- `rei_smile.png` / `rei_sharp.png` … 数理零の「面白い」笑顔 / 観察モード
- `terachi_smile.png` … 寺地の照れ笑い
- `mie_shock.png` … 三重の「は?」を超えた絶句

### C. イベントCG(ギャラリー収録)

1. **`cg_note.png`** — 夜の教室。一番奥の空きロッカー。扉の隙間から古いノートの角が覗く。埃が舞う。
2. **`cg_panf.png`** — 色あせた文化祭パンフレットを開いたページ。「✝本質✝を探せ」の手書き文字(25年前の印刷物風セピア)。
3. **`cg_board.png`** — 外された黒板の裏。「ほんしつは、ここにある」+ 小さな✝の刻み。スマホのライトで照らされる。
4. **`cg_keiyaki2.png`** — 夕暮れの裏庭。幹に✝を彫られた大ケヤキ。その前に立つ地理教師の後ろ姿。
5. **`cg_photo.png`** — 25年前の集合写真風(色あせたプリント)。「✝本質✝を探せ」の看板の前に並ぶ制服の生徒たち。中央に若い塀勝也(※本人には内緒)。
6. **`cg_nightroom.png`** — 夜の教室。机の上に開かれたノート、✝を書く手元。月明かり。
7. **`cg_roof.png`** — 文化祭最後の夜の屋上。星空と遠くの花火、二人のシルエット(両馬と塀)。

### D. 背景

- `bg_classroom_day.png` / `bg_classroom_sunset.png` / `bg_classroom_night.png` … 理数科B組教室(昼/夕/夜)
- `bg_corridor.png` … 北棟の廊下(夕方・夜)
- `bg_festival.png` … 文化祭の渡り廊下(のぼり・歓声)
- `bg_library.png` … 図書室(アーカイブ段ボール)
- `bg_gym.png` … 体育館(閉会式)
- `bg_roof_night.png` … 屋上からの星空と夜景
- `bg_oldphoto.png` … セピアの写真紙面(回想演出用)
- `bg_keiyaki.png` … 裏庭のケヤキ(昼)

---

### 補足

- ファイルが無い間は、キャラはカラーパネル(✝)、背景は色グラデで表示されます。ストーリーは画像なしでも最後まで遊べます。
- 追加した画像はページを開き直すだけで反映されます。
