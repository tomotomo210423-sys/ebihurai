const engine = {
  index: 0,
  labels: {},
  isTyping: false,
  waitingForClick: false,
  fullText: '',
  typingTimer: null,
  spriteCache: {},
  useBlendMode: false,

  init() {
    SCRIPT.forEach((cmd, i) => {
      if (cmd.cmd === 'label') this.labels[cmd.name] = i;
    });

    document.getElementById('game-screen').addEventListener('click', (e) => {
      if (e.target.classList.contains('choice-btn')) return;
      this.handleClick();
    });

    document.addEventListener('keydown', (e) => {
      if (e.code === 'Space' || e.code === 'Enter') this.handleClick();
    });

    this.next();
  },

  handleClick() {
    if (this.isTyping) {
      this.skipTyping();
      return;
    }
    if (!this.waitingForClick) return;
    this.waitingForClick = false;
    document.getElementById('next-arrow').classList.remove('visible');
    this.next();
  },

  next() {
    if (this.index >= SCRIPT.length) {
      this.showEnd();
      return;
    }
    const cmd = SCRIPT[this.index++];
    this.execute(cmd);
  },

  execute(cmd) {
    switch (cmd.cmd) {
      case 'bg':
        this.setBg(cmd.src);
        this.next();
        break;
      case 'sprite':
        this.setSprite(cmd.expr);
        this.next();
        break;
      case 'hide_sprite':
        this.hideSprite();
        this.next();
        break;
      case 'cg':
        this.showCG(cmd.src);
        this.next();
        break;
      case 'hide_cg':
        this.hideCG();
        this.next();
        break;
      case 'text':
        this.showText(cmd.name || '', cmd.text);
        break;
      case 'narrate':
        this.showText('', cmd.text);
        break;
      case 'choice':
        this.showChoices(cmd.options);
        break;
      case 'label':
        this.next();
        break;
      case 'jump':
        this.jumpTo(cmd.label);
        break;
      case 'fade_in':
        this.fade('in', cmd.duration || 500, () => this.next());
        break;
      case 'fade_out':
        this.fade('out', cmd.duration || 500, () => this.next());
        break;
      case 'end':
        this.showEnd();
        break;
    }
  },

  // ── Background ──────────────────────────────────────────

  setBg(src) {
    const bg = document.getElementById('bg-layer');
    if (src) {
      bg.style.backgroundImage = `url('images/bg/${src}')`;
    } else {
      bg.style.backgroundImage = 'none';
    }
  },

  // ── Sprite with white-background removal ─────────────────

  async processSprite(src) {
    if (this.spriteCache[src] !== undefined) return this.spriteCache[src];

    return new Promise((resolve) => {
      const img = new Image();

      img.onload = () => {
        const canvas = document.createElement('canvas');
        canvas.width = img.naturalWidth;
        canvas.height = img.naturalHeight;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0);

        try {
          const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
          removeWhitePixels(imageData.data, canvas.width, canvas.height);
          ctx.putImageData(imageData, 0, 0);
          const dataUrl = canvas.toDataURL('image/png');
          this.spriteCache[src] = dataUrl;
          resolve(dataUrl);
        } catch (_) {
          // file:// CORS restriction — fall back to blend mode
          this.useBlendMode = true;
          this.spriteCache[src] = src;
          resolve(src);
        }
      };

      img.onerror = () => {
        this.spriteCache[src] = null;
        resolve(null);
      };

      img.src = src;
    });
  },

  setSprite(expr) {
    const src = `images/sprites/milka_${expr}.png`;
    const el = document.getElementById('sprite-milka');

    this.processSprite(src).then((processed) => {
      if (!processed) return;
      el.style.opacity = '0';
      if (this.useBlendMode) el.style.mixBlendMode = 'multiply';
      el.src = processed;
      el.style.display = 'block';
      requestAnimationFrame(() => {
        requestAnimationFrame(() => { el.style.opacity = '1'; });
      });
    });
  },

  hideSprite() {
    const el = document.getElementById('sprite-milka');
    el.style.opacity = '0';
  },

  // ── CG ──────────────────────────────────────────────────

  showCG(src) {
    const layer = document.getElementById('cg-layer');
    const img = document.getElementById('cg-img');
    img.src = `images/cg/${src}`;
    layer.style.opacity = '0';
    layer.style.display = 'flex';
    layer.style.transition = 'opacity 0.6s ease';
    requestAnimationFrame(() => {
      requestAnimationFrame(() => { layer.style.opacity = '1'; });
    });
  },

  hideCG() {
    const layer = document.getElementById('cg-layer');
    layer.style.opacity = '0';
    setTimeout(() => { layer.style.display = 'none'; }, 600);
  },

  // ── Text / Typewriter ─────────────────────────────────────

  showText(name, text) {
    document.getElementById('name-plate').textContent = name;
    const content = document.getElementById('text-content');
    content.textContent = '';
    document.getElementById('next-arrow').classList.remove('visible');

    this.fullText = text;
    this.isTyping = true;
    let i = 0;

    clearInterval(this.typingTimer);
    this.typingTimer = setInterval(() => {
      content.textContent += this.fullText[i];
      i++;
      if (i >= this.fullText.length) {
        clearInterval(this.typingTimer);
        this.isTyping = false;
        this.waitingForClick = true;
        document.getElementById('next-arrow').classList.add('visible');
      }
    }, 38);
  },

  skipTyping() {
    clearInterval(this.typingTimer);
    document.getElementById('text-content').textContent = this.fullText;
    this.isTyping = false;
    this.waitingForClick = true;
    document.getElementById('next-arrow').classList.add('visible');
  },

  // ── Choices ──────────────────────────────────────────────

  showChoices(options) {
    const container = document.getElementById('choices-container');
    container.innerHTML = '';
    document.getElementById('next-arrow').classList.remove('visible');
    this.waitingForClick = false;

    options.forEach(opt => {
      const btn = document.createElement('button');
      btn.className = 'choice-btn';
      btn.textContent = opt.text;
      btn.addEventListener('click', () => {
        container.innerHTML = '';
        this.jumpTo(opt.jump);
      });
      container.appendChild(btn);
    });
  },

  jumpTo(label) {
    if (this.labels[label] !== undefined) {
      this.index = this.labels[label];
      this.next();
    }
  },

  // ── Fade ─────────────────────────────────────────────────

  fade(direction, duration, callback) {
    const overlay = document.getElementById('fade-overlay');
    overlay.style.transition = `opacity ${duration}ms ease`;
    overlay.style.opacity = direction === 'out' ? '1' : '0';
    setTimeout(() => { if (callback) callback(); }, duration);
  },

  // ── End ──────────────────────────────────────────────────

  showEnd() {
    this.fade('out', 800, () => {
      const gameScreen = document.getElementById('game-screen');
      const endEl = document.createElement('div');
      endEl.id = 'end-screen';
      endEl.innerHTML = `
        <p class="end-title">― To Be Continued ―</p>
        <p class="end-credit">雨宮ミルカ　デモ版</p>
        <button class="replay-btn" onclick="location.reload()">もう一度</button>
      `;
      gameScreen.appendChild(endEl);
      this.fade('in', 800);
    });
  },
};

// ── Pixel processing: flood-fill from edges ────────────────
// エッジから内側に向かってflood-fillで背景白を除去。
// キャラクター内部の白/銀髪は保護される。

function removeWhitePixels(data, width, height) {
  const visited = new Uint8Array(width * height);
  const stack = [];

  // エッジ全ピクセルをスタックに積む
  for (let x = 0; x < width; x++) {
    stack.push(x, 0);
    stack.push(x, height - 1);
  }
  for (let y = 1; y < height - 1; y++) {
    stack.push(0, y);
    stack.push(width - 1, y);
  }

  while (stack.length > 0) {
    const y = stack.pop();
    const x = stack.pop();
    const idx = y * width + x;
    if (visited[idx]) continue;
    visited[idx] = 1;

    const p = idx * 4;
    const r = data[p], g = data[p + 1], b = data[p + 2];

    // 白に近いピクセルだけを背景とみなして透明化
    if (r >= 228 && g >= 228 && b >= 228) {
      const brightness = (r + g + b) / 3;
      // 明るいほど透明。ソフトエッジ
      data[p + 3] = Math.round(Math.max(0, (255 - brightness) * 3.5));

      if (x > 0)         stack.push(x - 1, y);
      if (x < width - 1) stack.push(x + 1, y);
      if (y > 0)         stack.push(x, y - 1);
      if (y < height - 1) stack.push(x, y + 1);
    }
  }
}

// ── Title → Game transition ───────────────────────────────

function startGame() {
  const title = document.getElementById('title-screen');
  title.style.opacity = '0';
  setTimeout(() => {
    title.style.display = 'none';
    document.getElementById('game-screen').style.display = 'block';
    engine.init();
  }, 600);
}
