const SCRIPT = [

  // ── オープニング ──────────────────────────────────────────
  { cmd: 'bg', src: 'bg_cafe.jpg' },
  { cmd: 'fade_in', duration: 1200 },

  { cmd: 'narrate', text: '雨の音が、窓を叩いている。' },
  { cmd: 'narrate', text: '住宅街の奥にある小さなカフェ——\n「Rainy Milk」。' },
  { cmd: 'narrate', text: '疲れた足が、気づけばここに向かっていた。' },

  // ── 入店・ミルカ登場 ──────────────────────────────────────
  { cmd: 'fade_out', duration: 400 },
  { cmd: 'sprite', expr: 'normal' },
  { cmd: 'fade_in', duration: 700 },

  { cmd: 'text', name: 'ミルカ', text: 'こんにちは〜。' },
  { cmd: 'text', name: 'ミルカ', text: 'ゆっくりどうぞ。' },

  { cmd: 'narrate', text: 'やわらかい声が、疲れた頭にしみてくる。\n席に座ると、ミルクティーと焼き菓子の香りがした。' },

  // ── 注文 ─────────────────────────────────────────────────
  { cmd: 'text', name: 'ミルカ', text: 'ミルクティー、いかがですか？\nここのおすすめなんですよ〜。' },

  { cmd: 'narrate', text: '（断る理由が、見つからなかった。）' },

  // ── ミルカが気づく ────────────────────────────────────────
  { cmd: 'sprite', expr: 'sleepy' },
  { cmd: 'text', name: 'ミルカ', text: '……疲れてる？' },

  { cmd: 'narrate', text: '（気づかれた。\n何も言っていないのに、ただ見ているだけで。）' },

  { cmd: 'sprite', expr: 'normal' },
  { cmd: 'text', name: 'ミルカ', text: '無理してない？' },
  { cmd: 'text', name: 'ミルカ', text: '頑張るのも大事だけど、\n休むのも同じくらい大事なんだよ〜。' },
  { cmd: 'text', name: 'ミルカ', text: '大丈夫だよ。\n焦らなくても。' },

  { cmd: 'narrate', text: 'ゆっくりと、でも確かに——\nその言葉は、どこかを解きほぐした。' },

  // ── 選択 ─────────────────────────────────────────────────
  { cmd: 'text', name: 'ミルカ', text: 'ねぇ。\nもう少しだけ、ここにいない？' },

  { cmd: 'choice', options: [
    { text: '……少し、休んでいいですか。', jump: 'route_a' },
    { text: '大丈夫です、もう行きます。',  jump: 'route_b' },
  ]},

  // ── ルートA：ひざまくら ───────────────────────────────────
  { cmd: 'label', name: 'route_a' },

  { cmd: 'sprite', expr: 'smile' },
  { cmd: 'text', name: 'ミルカ', text: 'うん。\nゆっくり休んでいいよ。' },

  { cmd: 'narrate', text: '二人はミルカの自宅へ向かった。' },
  { cmd: 'narrate', text: 'やさしい雨音に包まれながら……' },

  { cmd: 'fade_out', duration: 600 },
  { cmd: 'bg', src: 'bg_living.jpg' },
  { cmd: 'hide_sprite' },
  { cmd: 'cg', src: 'milka_lap.png' },
  { cmd: 'fade_in', duration: 800 },

  { cmd: 'narrate', text: 'ミルカの膝が、思ったよりずっと柔らかかった。' },

  { cmd: 'text', name: 'ミルカ', text: 'ふふっ。\nすぐ眠れそう。' },
  { cmd: 'text', name: 'ミルカ', text: 'ちゃんと頑張ってるの知ってるよ。\nだから今は少し休も？' },
  { cmd: 'text', name: 'ミルカ', text: '……今日もおつかれさま。' },

  { cmd: 'narrate', text: '雨音と、やわらかい指の感触。\nゆっくりと、意識が溶けていく。' },

  { cmd: 'end' },

  // ── ルートB：別れ ────────────────────────────────────────
  { cmd: 'label', name: 'route_b' },

  { cmd: 'sprite', expr: 'normal' },
  { cmd: 'text', name: 'ミルカ', text: 'そっか……。\nまた来てね。' },

  { cmd: 'sprite', expr: 'smile' },
  { cmd: 'text', name: 'ミルカ', text: 'ふふっ、大丈夫だよぉ。' },

  { cmd: 'narrate', text: 'カフェを出ると、まだ雨が降っていた。\nでも——なぜか、少し軽くなった気がした。' },

  { cmd: 'end' },
];
