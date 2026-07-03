const SCRIPT = [

  // ── オープニング ──────────────────────────────────────────
  { cmd: 'bg', src: 'bg_street_rain.png' },
  { cmd: 'fade_in', duration: 1200 },

  { cmd: 'narrate', text: '雨の音が、窓を叩いている。' },
  { cmd: 'narrate', text: '住宅街の奥にある小さなカフェ——\n「Rainy Milk」。' },
  { cmd: 'narrate', text: '疲れた足が、気づけばここに向かっていた。' },

  // ── 入店・ミルカ登場 ──────────────────────────────────────
  { cmd: 'fade_out', duration: 400 },
  { cmd: 'bg', src: 'bg_cafe.jpg' },
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
    { text: 'ミルカさんのことを、もっと知りたい。',  jump: 'route_b' },
    { text: '大丈夫です、もう行きます。',  jump: 'route_c' },
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

  { cmd: 'narrate', text: '目覚めたとき、外の雨は止んでいた。\nでも、ここにいたいという気持ちは\n何も変わっていなかった。' },

  { cmd: 'fade_out', duration: 600 },
  { cmd: 'hide_cg' },
  { cmd: 'sprite', expr: 'smile' },
  { cmd: 'fade_in', duration: 600 },

  { cmd: 'text', name: 'ミルカ', text: '目覚めた？\nお水、飲む？' },
  { cmd: 'text', name: 'ミルカ', text: 'ここは……いつでも君の場所だよ。' },

  { cmd: 'narrate', text: 'その言葉が、全てだった。' },

  { cmd: 'end' },

  // ── ルートB：ミルカを知る ────────────────────────────────
  { cmd: 'label', name: 'route_b' },

  { cmd: 'sprite', expr: 'blush' },
  { cmd: 'text', name: 'ミルカ', text: 'あ、私のこと？\nふふ、何か聞きたいことあるのかな。' },

  { cmd: 'sprite', expr: 'normal' },
  { cmd: 'text', name: 'ミルカ', text: 'そっか。\nじゃあ、このカフェで話そうか。' },

  { cmd: 'narrate', text: 'ミルカは席に座り、窓の外の雨を眺めた。' },

  { cmd: 'sprite', expr: 'sleepy' },
  { cmd: 'text', name: 'ミルカ', text: '私ね、昔はもっと……\nぎゅっと何かを握りしめてた。' },
  { cmd: 'text', name: 'ミルカ', text: 'でも、ある日気づいたんだよ。\n握りしめるより、\n手を広げることの方が大切だって。' },

  { cmd: 'sprite', expr: 'smile' },
  { cmd: 'text', name: 'ミルカ', text: 'だからね、このカフェを作ったの。\n誰もが、ここで少し休める場所。\nそういう場所が、あってもいいと思ったから。' },

  { cmd: 'narrate', text: 'その瞬間、ミルカの姿が違って見えた。\n単なる店員ではなく、\n何か大切なものを守ろうとしている人。' },

  { cmd: 'sprite', expr: 'blush' },
  { cmd: 'text', name: 'ミルカ', text: 'あ、でも……\n君の話も聞きたいな。\nどうして、そんなに疲れてるの？' },

  { cmd: 'choice', options: [
    { text: 'ミルカさんと話していたら、少し楽になった。', jump: 'route_b_end_a' },
    { cmd: 'text', name: 'ミルカ', text: 'ふふっ、そっか。\nなら、また明日も来てね。' },
    { text: 'ここで、もう少し一緒にいたい。', jump: 'route_b_end_b' },
  ]},

  { cmd: 'label', name: 'route_b_end_a' },
  { cmd: 'sprite', expr: 'smile' },
  { cmd: 'text', name: 'ミルカ', text: 'ふふっ。\nそれなら、また明日も来てね。' },
  { cmd: 'text', name: 'ミルカ', text: 'ここは、いつでも君を待ってるから。' },
  { cmd: 'narrate', text: 'カフェを出るとき、心は少し軽くなっていた。\nミルカの言葉が、心に残っていた。' },
  { cmd: 'end' },

  { cmd: 'label', name: 'route_b_end_b' },
  { cmd: 'sprite', expr: 'blush' },
  { cmd: 'text', name: 'ミルカ', text: 'ふふ……いいよ。\nいつまででも。' },
  { cmd: 'fade_out', duration: 600 },
  { cmd: 'cg', src: 'milka_cooking.png' },
  { cmd: 'fade_in', duration: 800 },
  { cmd: 'narrate', text: 'ミルカが、キッチンで何かを作り始めた。\n雨の音と、調理の音が、心地よく重なる。' },
  { cmd: 'text', name: 'ミルカ', text: 'ホットミルク、作ろうか。\n君の好きな、甘さで。' },
  { cmd: 'narrate', text: 'その時、初めて気づいた。\nこの人は、相手を知ろうとしている。\n本当に、心から。' },
  { cmd: 'end' },

  // ── ルートC：別れ ────────────────────────────────────────
  { cmd: 'label', name: 'route_c' },

  { cmd: 'sprite', expr: 'normal' },
  { cmd: 'text', name: 'ミルカ', text: 'そっか……。\nまた来てね。' },

  { cmd: 'sprite', expr: 'smile' },
  { cmd: 'text', name: 'ミルカ', text: 'ふふっ、大丈夫だよぉ。\nいつでも、ここにいるから。' },

  { cmd: 'narrate', text: 'カフェを出ると、まだ雨が降っていた。\nでも——なぜか、少し軽くなった気がした。' },

  { cmd: 'narrate', text: 'ミルカの言葉が、心に残っていた。\n「また来てね」と。' },

  { cmd: 'narrate', text: 'その約束が、明日への理由になった。' },

  { cmd: 'end' },
];
