import type { CpuCharacter } from './cpuCharacters';

// 対戦相手16人。台詞はこのゲーム用に書いたもの（ボイスは public/audio/voice/<id>_<場面>_<n>.mp3 と <id>_chain<段>.mp3）
export const CPU_CHARACTER_DATA: CpuCharacter[] = [
  {
    id: 'oto',
    name: '於兎',
    kana: 'おと',
    tagline: '甲賀・土',
    icon: 'https://vibe.co.jp/luna-occulta/media/img/canon/oto_icon.webp',
    cutins: [
      'https://kura.vibe.co.jp/ult/cutin_anim_oto_s1_v3.webp',
      'https://kura.vibe.co.jp/ult/cutin_anim_oto_s2_v3.webp',
      'https://kura.vibe.co.jp/ult/cutin_anim_oto_s3_v3.webp',
      'https://kura.vibe.co.jp/ult/cutin_anim_oto_s4_v3.webp',
      'https://kura.vibe.co.jp/ult/cutin_anim_oto_s5_v5.webp'
    ],
    bgm: 'https://vibe.co.jp/luna-occulta/media/music/akarui_kakari.mp3',
    lines: {
      intro: ['あるじどの、いっしょに遊ぼ？ 負けないもん', '今日はね、本気だよ？ 手かげんしないもん'],
      attack: ['えいっ！ 地面ごと、揺らしちゃうよ？', 'どーんっ！ 月までとどけっ！'],
      attacked: ['わわっ、そんなの、ずるいもん……！', 'うぅ、ぐらぐらする……まだだもん！'],
      damaged: ['わぁっ', 'ひゃうっ'],
      pinch: ['あわわ、いっぱいだよぉ', 'まだ、まだだもん！'],
      win: ['やったぁ！ あるじどの、もう一回やる？', 'えへへ、勝っちゃった。あるじどの、なでてくれる？'],
      lose: ['むぅ……。つぎは、負けない、もん', 'あるじどの、つよいね……。くやしい、もん']
    },
    chain: ['えいっ', 'それっ', 'もういっちょ！', 'ぴょーんっ！', '月兎の、大地ゆらしっ！']
  },
  {
    id: 'sakuya',
    name: '咲耶',
    kana: 'さくや',
    tagline: '甲賀・火',
    icon: 'https://vibe.co.jp/luna-occulta/media/img/canon/sakuya_icon.webp',
    cutins: [
      'https://kura.vibe.co.jp/ult/cutin_anim_sakuya_s1_v3.webp',
      'https://kura.vibe.co.jp/ult/cutin_anim_sakuya_s2_v4.webp',
      'https://kura.vibe.co.jp/ult/cutin_anim_sakuya_s3_v3.webp',
      'https://kura.vibe.co.jp/ult/cutin_anim_sakuya_s4_v3.webp',
      'https://kura.vibe.co.jp/ult/cutin_anim_sakuya_s5_v3.webp'
    ],
    bgm: 'https://vibe.co.jp/luna-occulta/media/music/muyou_no_hi.mp3',
    lines: {
      intro: ['あんたとの手合わせ、楽しみにしてたんだよね', '手加減はなし。あたしも全力でいくからさ'],
      attack: ['いくよっ！ 緋桜、受けてみな！', '散りな！ 夜に春を咲かせるよ！'],
      attacked: ['やるじゃん、あんた！ でも、まだまだでしょ', 'っ、効いたぁ……！ あんた、腕上げたね'],
      damaged: ['くっ', 'っとと'],
      pinch: ['まずいね、詰まってきた', 'まだ振れる、まだ！'],
      win: ['あたしの勝ち！ ……いい勝負だったよ', 'へへっ、いただき！ あんた、次も付き合いなよ'],
      lose: ['くっ……あんたの勝ちだよ。次は負けないからね', '参った！ ……悔しいけど、今のは見事だったよ']
    },
    chain: ['はっ！', 'せいっ！', 'まだまだっ！', '燃えてきた！', '緋桜、咲き乱れっ！']
  },
  {
    id: 'naruka',
    name: 'ナルカ',
    kana: 'なるか',
    tagline: '伊賀・木',
    icon: 'https://vibe.co.jp/luna-occulta/media/img/canon/naruka_icon.webp',
    cutins: [
      'https://kura.vibe.co.jp/ult/cutin_anim_naruka_s1_v3.webp',
      'https://kura.vibe.co.jp/ult/cutin_anim_naruka_s2_v3.webp',
      'https://kura.vibe.co.jp/ult/cutin_anim_naruka_s3_v4.webp',
      'https://kura.vibe.co.jp/ult/cutin_anim_naruka_s4_v3.webp',
      'https://kura.vibe.co.jp/ult/cutin_anim_naruka_s5_v3.webp'
    ],
    bgm: 'https://vibe.co.jp/luna-occulta/media/music/kitan_maintheme.mp3',
    lines: {
      intro: ['わたくしに挑むおつもり？ よろしくてよ。上から全部、見えていますわ', '手加減は不要でしてよ。存分にかかっていらして'],
      attack: ['わたくしの空からは、すべて丸見えでしてよ！', '金の眼から、逃げられませんわ！'],
      attacked: ['あら……少しはやりますのね', 'っ……やってくれましたわね、あなた'],
      damaged: ['きゃっ', 'なっ……'],
      pinch: ['こ、これしきのこと……', 'まだ飛べますわ！'],
      win: ['当然の結果ですわ。……コツなら、特別に教えて差し上げてもよろしくてよ？', '見下ろせば、勝ち筋など一目瞭然ですわ。また挑んでいらして'],
      lose: ['……っ、み、認めて差し上げますわ。あなた、なかなかでしてよ', 'わたくしが落とされるなんて……。つ、次は負けませんわ！']
    },
    chain: ['ふっ！', 'そこですわ', '舞い上がりますわ', '見えていますわ！', '金眼の鉄扇、受けなさい！']
  },
  {
    id: 'nemu',
    name: 'ネム',
    kana: 'ねむ',
    tagline: '甲賀・水',
    icon: 'https://vibe.co.jp/luna-occulta/media/img/canon/nemu_icon.webp',
    cutins: [
      'https://kura.vibe.co.jp/ult/cutin_anim_nemu_s1_v3.webp',
      'https://kura.vibe.co.jp/ult/cutin_anim_nemu_s2_v3.webp',
      'https://kura.vibe.co.jp/ult/cutin_anim_nemu_s3_v3.webp',
      'https://kura.vibe.co.jp/ult/cutin_anim_nemu_s4_v3.webp',
      'https://kura.vibe.co.jp/ult/cutin_anim_nemu_s5_v3.webp'
    ],
    bgm: 'https://vibe.co.jp/luna-occulta/media/music/freehand.mp3',
    lines: {
      intro: ['ん……あるじどの、あそぶ？ ちょっとだけね', 'ふぁ……ねむい。でも、まけないよ'],
      attack: ['にひひ、ぬりつぶしちゃえ', '筆、走れ……ぜんぶ極彩色'],
      attacked: ['ん……？ えのぐ、こぼれた……', 'にゃ……それ、ずるい。ネム、起きちゃった'],
      damaged: ['にゃっ', 'んぅっ'],
      pinch: ['ん……もう、はみでる', 'まって、まだ描ける'],
      win: ['にひひ、ネムの勝ち。……ねてもいい？', 'あるじどの、いい顔してる。あとで描かせて'],
      lose: ['ん……まけた。……ふて寝する', 'あるじどの、つよい……。次は、ちゃんと起きてる']
    },
    chain: ['ぺたっ', 'すいっ', 'にひひ、それ', '筆がのってきた', '極彩色、ぜんぶ起きろ']
  },
  {
    id: 'izuna',
    name: 'イズナ',
    kana: 'いずな',
    tagline: '甲賀・金',
    icon: 'https://vibe.co.jp/luna-occulta/media/img/canon/izuna_icon.webp',
    cutins: [
      'https://kura.vibe.co.jp/ult/cutin_anim_izuna_s1_v3.webp',
      'https://kura.vibe.co.jp/ult/cutin_anim_izuna_s2_v3.webp',
      'https://kura.vibe.co.jp/ult/cutin_anim_izuna_s3_v3.webp',
      'https://kura.vibe.co.jp/ult/cutin_anim_izuna_s4_v3.webp',
      'https://kura.vibe.co.jp/ult/cutin_anim_izuna_s5_v3.webp'
    ],
    bgm: 'https://vibe.co.jp/luna-occulta/media/music/nightcap.mp3',
    lines: {
      intro: ['あら、お手合わせ？ ふふ、優しくはしないわよ', '宇迦が見ているから、少し張り切っちゃうかしら'],
      attack: ['黒狐の神通、受けてごらんなさい', 'ごめんなさいね、本気よ！'],
      attacked: ['まあ……やるのね、あなた。少し驚いたわ', 'あらあら、困ったわね。宇迦には内緒よ？'],
      damaged: ['あらっ', 'きゃっ'],
      pinch: ['これは……困ったわね', 'まだ、慌てる時じゃないわ'],
      win: ['ふふ、私の勝ちね。痛いところはない？ 診てあげる', 'いい勝負だったわ。宇迦にも、あなたの話をしなくちゃ'],
      lose: ['あら……負けちゃった。あなた、本当に強いのね', 'ふふ、参りました。……宇迦に笑われてしまうかしら']
    },
    chain: ['そっと', 'ほら、ね', 'まだ続くわよ', '鎮まりなさい', '黒狐の神通、夜を宥めて']
  },
  {
    id: 'uka',
    name: '宇迦',
    kana: 'うか',
    tagline: '甲賀・火',
    icon: 'https://vibe.co.jp/luna-occulta/media/img/canon/uka_icon.webp',
    cutins: [
      'https://kura.vibe.co.jp/ult/cutin_anim_uka_s1_v3.webp',
      'https://kura.vibe.co.jp/ult/cutin_anim_uka_s2_v3.webp',
      'https://kura.vibe.co.jp/ult/cutin_anim_uka_s3_v3.webp',
      'https://kura.vibe.co.jp/ult/cutin_anim_uka_s4_v3.webp',
      'https://kura.vibe.co.jp/ult/cutin_anim_uka_s5_v5.webp'
    ],
    bgm: 'https://vibe.co.jp/luna-occulta/media/music/hand_me_down.mp3',
    lines: {
      intro: ['ふふん、あたしに挑むなんて、いい度胸じゃない', '勝ったら油揚げ、おごりなさいよね'],
      attack: ['九尾の焔、まとめて燃えちゃえ！', 'ふふん、見とれてなさい！'],
      attacked: ['ちょっ、なによそれ！ 聞いてないんだけど！', 'ふ、ふん！ ちょっと油断しただけでしょ！'],
      damaged: ['ひゃっ', 'ちょっ'],
      pinch: ['う、嘘でしょ、もう上まで？', 'ま、まだ燃えてるんだから！'],
      win: ['ふふん、当然でしょ？ あたしの焔、きれいだったでしょ', 'べ、別にあんたが弱いんじゃないわよ。あたしが強いだけ'],
      lose: ['な、なによ……！ 今のは、たまたまでしょ！', '……ふん。あんた、ちょっとだけ、やるじゃない']
    },
    chain: ['ふふん', 'それっ', 'まだまだよ！', '尻尾が騒ぐわ！', '九つの尾、燃え盛れっ！']
  },
  {
    id: 'emma',
    name: 'エマ',
    kana: 'えま',
    tagline: '甲賀・金',
    icon: 'https://vibe.co.jp/luna-occulta/media/img/canon/emma_icon.webp',
    cutins: [
      'https://kura.vibe.co.jp/ult/cutin_anim_emma_s1_v3.webp',
      'https://kura.vibe.co.jp/ult/cutin_anim_emma_s2_v3.webp',
      'https://kura.vibe.co.jp/ult/cutin_anim_emma_s3_v3.webp',
      'https://kura.vibe.co.jp/ult/cutin_anim_emma_s4_v3.webp',
      'https://kura.vibe.co.jp/ult/cutin_anim_emma_s5_v3.webp'
    ],
    bgm: 'https://vibe.co.jp/luna-occulta/media/music/rinkaku.mp3',
    lines: {
      intro: ['ね、きみ。エマのこと、ずーっと見ててくれる？', 'かわいいだけじゃないよ？ 本気のエマ、見せてあげる'],
      attack: ['みーつけた！ もう、逃がさないよ！', 'いくよ、槍でひと突き！'],
      attacked: ['えーっ、ひどーい！ エマ、泣いちゃうよ？', 'やだやだ、目が回る……！ きみ、いじわるでしょ？'],
      damaged: ['ひゃんっ', 'いたぁい'],
      pinch: ['やだ、うまっちゃう！', 'まって、まってぇ！'],
      win: ['やったぁ！ ね、勝ったエマ、かわいかったでしょ？', 'ちゃんと見ててくれて、ありがと。またあそぼ？'],
      lose: ['えーん、負けちゃった……。でも、見ててくれた？', 'むー、きみ強すぎ！ 次はエマが、みーつけるからね']
    },
    chain: ['えいっ', 'えいえいっ', 'こっち見て！', 'まだまだだよ！', 'みーつけた、ひと突き！']
  },
  {
    id: 'shion',
    name: '紫苑',
    kana: 'しおん',
    tagline: '伊賀・木',
    icon: 'https://vibe.co.jp/luna-occulta/media/img/canon/shion_icon.webp',
    cutins: [
      'https://kura.vibe.co.jp/ult/cutin_anim_shion_s1_v3.webp',
      'https://kura.vibe.co.jp/ult/cutin_anim_shion_s2_v3.webp',
      'https://kura.vibe.co.jp/ult/cutin_anim_shion_s3_v4.webp',
      'https://kura.vibe.co.jp/ult/cutin_anim_shion_s4_v3.webp',
      'https://kura.vibe.co.jp/ult/cutin_anim_shion_s5_v3.webp'
    ],
    bgm: 'https://vibe.co.jp/luna-occulta/media/music/kizutsuita_shika.mp3',
    lines: {
      intro: ['……来い。月が、見ている', '……お前か。手は、抜かない'],
      attack: ['……影より、咲け', '夜叉薊……一閃'],
      attacked: ['……ほう。やる', '……っ。深いな、今のは'],
      damaged: ['……っ', 'くっ'],
      pinch: ['……まだだ', '……詰んでは、いない'],
      win: ['……済んだ。悪くなかった', '……お前の手、覚えておく'],
      lose: ['……そうか。私の負けだ', '……見事だ。次は、こうはいかない']
    },
    chain: ['……ふっ', '……そこ', '……まだ、咲く', '……影が、満ちる', '夜叉薊、影咲きの刃']
  },
  {
    id: 'shinra',
    name: 'シンラ',
    kana: 'しんら',
    tagline: '根の国・土',
    icon: 'https://vibe.co.jp/luna-occulta/media/img/canon/shinra_icon.webp',
    cutins: [
      'https://kura.vibe.co.jp/ult/cutin_anim_shinra_s1_v3.webp',
      'https://kura.vibe.co.jp/ult/cutin_anim_shinra_s2_v3.webp',
      'https://kura.vibe.co.jp/ult/cutin_anim_shinra_s3_v3.webp',
      'https://kura.vibe.co.jp/ult/cutin_anim_shinra_s4_v3.webp',
      'https://kura.vibe.co.jp/ult/cutin_anim_shinra_s5_v4.webp'
    ],
    bgm: 'https://vibe.co.jp/luna-occulta/media/music/pilot_light.mp3',
    lines: {
      intro: ['用件は対戦。手短に済ませる', '機巧兜、起動。……あとは任せた'],
      attack: ['演算完了。最適解、射出', '機巧兜、全出力。……行って'],
      attacked: ['……想定外。データを取り直す', '非効率な被弾。……覚えた'],
      damaged: ['……っ', 'むぅ'],
      pinch: ['……容量、限界', '非効率。……再計算'],
      win: ['予測どおり。……以上。帰って寝る', 'いい試行だった。……今の連鎖、図にしていい？ 構造が、美しくて'],
      lose: ['……負け。原因は解析中', 'その組み方、どういう理屈？ 教えて。今すぐ。メモ取るから']
    },
    chain: ['実行', '二段', '効率、上昇', '出力、最大', '機巧兜、全弾投射']
  },
  {
    id: 'aun',
    name: 'アウン',
    kana: 'あうん',
    tagline: '風魔・土',
    icon: 'https://vibe.co.jp/luna-occulta/media/img/canon/aun_icon.webp',
    cutins: [
      'https://kura.vibe.co.jp/ult/cutin_anim_aun_s1_v3.webp',
      'https://kura.vibe.co.jp/ult/cutin_anim_aun_s2_v3.webp',
      'https://kura.vibe.co.jp/ult/cutin_anim_aun_s3_v3.webp',
      'https://kura.vibe.co.jp/ult/cutin_anim_aun_s4_v3.webp',
      'https://kura.vibe.co.jp/ult/cutin_anim_aun_s5_v3.webp'
    ],
    bgm: 'https://vibe.co.jp/luna-occulta/media/music/yuki_no_onryou.mp3',
    lines: {
      intro: ['……よ、よろしく、お願いします。……がんばり、ます', '……あの。姉さまが見てます。負けません'],
      attack: ['……え、えいっ。……届いて！', '姉さまの妹です。いきます！'],
      attacked: ['……ひゃ。……す、すごい、です', '……あぅ。……あなた、強い、です'],
      damaged: ['……ぁっ', 'ひぅっ'],
      pinch: ['……ど、どうしよう……', '……まだ、です。まだ……'],
      win: ['……あ。勝て、ました。……姉さまに、報告します', '……ありがとう、ございました。……楽しかった、です'],
      lose: ['……負け、ました。……あなた、すごい、です', '……姉さまに、叱られちゃう。……もう一回、だめ、ですか']
    },
    chain: ['……えい', '……やっ', '……まだ、です', '姉さま、見てて！', '風魔の鬼、地鳴りです！']
  },
  {
    id: 'torika',
    name: '酉花',
    kana: 'とりか',
    tagline: '伊賀・木',
    icon: 'https://vibe.co.jp/luna-occulta/media/img/canon/torika_icon.webp',
    cutins: [
      'https://kura.vibe.co.jp/ult/cutin_anim_torika_s1_v3.webp',
      'https://kura.vibe.co.jp/ult/cutin_anim_torika_s2_v3.webp',
      'https://kura.vibe.co.jp/ult/cutin_anim_torika_s3_v3.webp',
      'https://kura.vibe.co.jp/ult/cutin_anim_torika_s4_v3.webp',
      'https://kura.vibe.co.jp/ult/cutin_anim_torika_s5_v4.webp'
    ],
    bgm: 'https://vibe.co.jp/luna-occulta/media/music/nigai_niwa.mp3',
    lines: {
      intro: ['……あ。あなた、今日はつぼみの顔。ふふ', '……あそぶ？ わたしの花畑、ひろいよ'],
      attack: ['……咲いて。ぜんぶ、咲いて', '毒にも薬にも……なあれ'],
      attacked: ['……わ。あなた、満開だ', '……ちょうちょ、いっぱい……目がまわる'],
      damaged: ['……あっ', 'ふぇっ'],
      pinch: ['……花、咲きすぎちゃった', '……あれ。すきま、ない'],
      win: ['……ふふ。わたしの花、きれいに咲いた', '……あなた、しおれないでね。お水、あげる'],
      lose: ['……あ。散っちゃった。……あなたの、勝ち', '……ふしぎ。負けたのに、あなたの花、きれい']
    },
    chain: ['……ぽん', '……ぽぽん', '……ひらいた', '……満開、かも', '月下の毒花畑……咲け']
  },
  {
    id: 'anne',
    name: '餡音',
    kana: 'あんね',
    tagline: '伊賀・木',
    icon: 'https://vibe.co.jp/luna-occulta/media/img/canon/anne_icon.webp',
    cutins: [
      'https://kura.vibe.co.jp/ult/cutin_anim_anne_s1_v3.webp',
      'https://kura.vibe.co.jp/ult/cutin_anim_anne_s2_v4.webp',
      'https://kura.vibe.co.jp/ult/cutin_anim_anne_s3_v3.webp',
      'https://kura.vibe.co.jp/ult/cutin_anim_anne_s4_v3.webp',
      'https://kura.vibe.co.jp/ult/cutin_anim_anne_s5_v3.webp'
    ],
    bgm: 'https://vibe.co.jp/luna-occulta/media/music/kitan_maintheme.mp3',
    lines: {
      intro: ['あるじどの、いらっしゃい。お団子賭けて、勝負だよう', 'のんびりしてるけど、手は抜かないよう'],
      attack: ['お団子、どーんと召し上がれ！', 'えへへ、ひと串まるごとだよう！'],
      attacked: ['わわ、そんなにいっぺんに食べられないよう', 'あらら、おなか……じゃなくて、盤面いっぱいだねえ'],
      damaged: ['わわっ', 'あいたっ'],
      pinch: ['あわわ、あふれちゃうよう', 'えへへ……ちょっと、まずいねえ'],
      win: ['勝っちゃったねえ。あるじどの、お団子いっしょに食べよう', 'えへへ、わたしの勝ちだよう。また寄っていってねえ'],
      lose: ['あらら、負けちゃったよう。えへへ', 'あるじどの、つよいねえ。お団子、ひとつおまけだよう']
    },
    chain: ['ほいっ', 'もひとつ', 'どんどんいくよう', 'まだまだあるよう', '三色団子、ぜんぶ乗せ！']
  },
  {
    id: 'yui',
    name: '結',
    kana: 'ゆい',
    tagline: '伊賀・火',
    icon: 'https://vibe.co.jp/luna-occulta/media/img/canon/yui_icon.webp',
    cutins: [
      'https://kura.vibe.co.jp/ult/cutin_anim_yui_s1_v3.webp',
      'https://kura.vibe.co.jp/ult/cutin_anim_yui_s2_v3.webp',
      'https://kura.vibe.co.jp/ult/cutin_anim_yui_s3_v4.webp',
      'https://kura.vibe.co.jp/ult/cutin_anim_yui_s4_v3.webp',
      'https://kura.vibe.co.jp/ult/cutin_anim_yui_s5_v3.webp'
    ],
    bgm: 'https://vibe.co.jp/luna-occulta/media/music/tsuki_ga_kakureru_made_wa.mp3',
    lines: {
      intro: ['対局、始めます。手数はすべて記録しますから', '遅れは許しません。では、始めましょう'],
      attack: ['数え終わりました。返します！', '扇ひと振り、帳尻合わせです！'],
      attacked: ['……今の連鎖、帳面に書き留めます', 'っ、想定より多いですね。数え直します'],
      damaged: ['っ……', 'くっ'],
      pinch: ['……余白、残りわずかです', '落ち着いて。数えます'],
      win: ['以上で終了です。勝敗は、帳面のとおりです', 'よく粘りました。次はもっと詰めてきてください'],
      lose: ['……認めます。あなたの勝ちです。記録しておきます', '数え違いはありません。……悔しいですが、完敗です']
    },
    chain: ['一つ', '二つ', '三つ、四つ', '数え切れますか', '扇、締めの一振り！']
  },
  {
    id: 'nekomata',
    name: '猫又',
    kana: 'ねこまた',
    tagline: '雑賀・金',
    icon: 'https://vibe.co.jp/luna-occulta/media/img/canon/nekomata_icon.webp',
    cutins: [
      'https://kura.vibe.co.jp/ult/cutin_anim_nekomata_s1_v4.webp',
      'https://kura.vibe.co.jp/ult/cutin_anim_nekomata_s2_v3.webp',
      'https://kura.vibe.co.jp/ult/cutin_anim_nekomata_s3_v4.webp',
      'https://kura.vibe.co.jp/ult/cutin_anim_nekomata_s4_v3.webp',
      'https://kura.vibe.co.jp/ult/cutin_anim_nekomata_s5_v3.webp'
    ],
    bgm: 'https://vibe.co.jp/luna-occulta/media/music/kitan_maintheme.mp3',
    lines: {
      intro: ['おや、おまえさん。あたいと遊んでくれるのかい', 'この子が疼いてるのさ。ひと勝負いこうか'],
      attack: ['見えたよ、隙が。……斬る！', '村正、出番だよ！'],
      attacked: ['おっと、毛が逆立ったね。やるじゃないか', 'にゃっ……おまえさん、爪を隠してたね'],
      damaged: ['にゃっ', 'おっと'],
      pinch: ['ちっ、しっぽが詰まるね', 'まだ、この子は抜けるさ'],
      win: ['勝負あり、さね。おまえさん、筋は悪くないよ', 'ふふ、この子も満足さ。……ほら、なでてもいいよ'],
      lose: ['やられたね。……おまえさんの勝ちさ、潔く認めるよ', 'この子が拗ねちまう。……次は譲らないよ']
    },
    chain: ['ふっ', 'しゃっ', 'まだ斬れるさ', 'この子が鳴くね', '妖刀村正、一の太刀']
  },
  {
    id: 'shiba',
    name: '柴',
    kana: 'しば',
    tagline: '雑賀・水',
    icon: 'https://vibe.co.jp/luna-occulta/media/img/canon/shiba_icon.webp',
    cutins: [
      'https://kura.vibe.co.jp/ult/cutin_anim_shiba_s1_v3.webp',
      'https://kura.vibe.co.jp/ult/cutin_anim_shiba_s2_v4.webp',
      'https://kura.vibe.co.jp/ult/cutin_anim_shiba_s3_v3.webp',
      'https://kura.vibe.co.jp/ult/cutin_anim_shiba_s4_v3.webp',
      'https://kura.vibe.co.jp/ult/cutin_anim_shiba_s5_v3.webp'
    ],
    bgm: 'https://vibe.co.jp/luna-occulta/media/music/tsuki_ga_kakureru_made_wa.mp3',
    lines: {
      intro: ['……お相手、いたします。全力で', '……しっぽが、揺れてしまいます。楽しみで'],
      attack: ['わんっ！ 水遁、拳の一打！', 'わおーんっ！ 押し流します！'],
      attacked: ['……っ。耳が、伏せてしまいました', '……お見事です。まだ、立てます'],
      damaged: ['きゃんっ', '……っ'],
      pinch: ['……くぅん。苦しい、です', '……まだ、踏ん張れます'],
      win: ['……勝ちました。……あの、なでて、いただけますか', 'お相手、ありがとうございました。……しっぽが、止まりません'],
      lose: ['……負けました。あなたは、強いです', '……くぅん。次は、もっと鍛えてきます']
    },
    chain: ['はっ', 'せいっ', 'まだ、です！', '水よ、続け！', 'わおん！ 水遁、渦の拳']
  },
  {
    id: 'atoza',
    name: 'アトザ',
    kana: 'あとざ',
    tagline: '風魔・金',
    icon: 'https://vibe.co.jp/luna-occulta/media/img/canon/atoza_icon.webp',
    cutins: [
      'https://kura.vibe.co.jp/ult/cutin_anim_atoza_s1_v3.webp',
      'https://kura.vibe.co.jp/ult/cutin_anim_atoza_s2_v3.webp',
      'https://kura.vibe.co.jp/ult/cutin_anim_atoza_s3_v3.webp',
      'https://kura.vibe.co.jp/ult/cutin_anim_atoza_s4_v3.webp',
      'https://kura.vibe.co.jp/ult/cutin_anim_atoza_s5_v3.webp'
    ],
    bgm: 'https://vibe.co.jp/luna-occulta/media/music/kitan_maintheme.mp3',
    lines: {
      intro: ['あたしに挑むのかい。……いいね、来な', '風魔の頭が相手さ。手加減は期待しないことだね'],
      attack: ['金棒、振り下ろすよ。……覚悟しな', '静かにしな。……これで終いさ'],
      attacked: ['へえ……。あんた、いい腕してるじゃないか', '効いたね。……面白くなってきたよ'],
      damaged: ['ちっ', 'ぐっ'],
      pinch: ['積もったね。……上等さ', 'まだ折れやしないよ'],
      win: ['勝負ありだ。あんた、なかなか骨があったよ', 'アウンが見てたら、喜んだろうね。……また来な'],
      lose: ['……やるね。負けは負けさ、認めるよ', 'いい負け方をさせてもらった。……次は、あたしが取るよ']
    },
    chain: ['ふん', 'そらっ', 'まだ続くよ', '風魔の流儀さ', '鬼の金棒、地を割りな']
  }
];
