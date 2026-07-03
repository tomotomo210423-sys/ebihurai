const engine = {
  index: 0,
  labels: {},
  isTyping: false,
  waitingForClick: false,
  fullText: '',
  typingTimer: null,
  spriteCache: {},
  useBlendMode: false,
  
  // ── セーブ・ロード機能 ──
  saves: [],
  currentSave: null,
  
  // ── バックログ機能 ──
  backlog: [],
  
  // ── 設定 ──
  settings: {
    textSpeed: 38,
    volume: 1.0,
    autoPlay: false,
    skipRead: false
  },

  init() {
    SCRIPT.forEach((cmd, i) => {
      if (cmd.cmd === 'label') this.labels[cmd.name] = i;
    });

    // セーブデータを読み込む
    this.loadSettings();

    document.getElementById('game-screen').addEventListener('click', (e) => {
      if (e.target.classList.contains('choice-btn')) return;
      if (e.target.classList.contains('menu-btn')) return;
      this.handleClick();
    });

    document.addEventListener('keydown', (e) => {
      if (e.code === 'Space' || e.code === 'Enter') this.handleClick();
      if (e.code === 'KeyS') this.toggleMenu();
      if (e.code === 'KeyL') this.showLoadScreen();
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

    // バックログに追加
    this.backlog.push({ name, text });

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
    }, this.settings.textSpeed);
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

  // ── セーブ・ロード ───────────────────────────────────────

  saveGame(slot) {
    const save = {
      index: this.index,
      timestamp: new Date().toLocaleString('ja-JP'),
      backlog: [...this.backlog]
    };
    this.saves[slot] = save;
    localStorage.setItem(`rainy_milk_save_${slot}`, JSON.stringify(save));
  },

  loadGame(slot) {
    const saveData = localStorage.getItem(`rainy_milk_save_${slot}`);
    if (saveData) {
      const save = JSON.parse(saveData);
      this.index = save.index;
      this.backlog = save.backlog;
      this.next();
      this.hideMenu();
    }
  },

  // ── 設定 ──────────────────────────────────────────────────

  loadSettings() {
    const saved = localStorage.getItem('rainy_milk_settings');
    if (saved) {
      this.settings = JSON.parse(saved);
    }
  },

  saveSettings() {
    localStorage.setItem('rainy_milk_settings', JSON.stringify(this.settings));
  },

  toggleMenu() {
    const menu = document.getElementById('game-menu');
    if (menu && menu.style.display !== 'none') {
      this.hideMenu();
    } else {
      this.showMenu();
    }
  },

  showMenu() {
    let menu = document.getElementById('game-menu');
    if (!menu) {
      menu = document.createElement('div');
      menu.id = 'game-menu';
      menu.className = 'game-menu';
      menu.innerHTML = `
        <div class="menu-content">
          <h2>メニュー</h2>
          <div class="menu-section">
            <label>テキスト速度: <span id="speed-value">${this.settings.textSpeed}</span>ms</label>
            <input type="range" id="text-speed" min="10" max="100" value="${this.settings.textSpeed}">
          </div>
          <div class="menu-section">
            <label>音量: <span id="volume-value">${Math.round(this.settings.volume * 100)}</span>%</label>
            <input type="range" id="volume" min="0" max="100" value="${this.settings.volume * 100}">
          </div>
          <div class="menu-buttons">
            <button class="menu-btn" onclick="engine.showSaveScreen()">セーブ</button>
            <button class="menu-btn" onclick="engine.showLoadScreen()">ロード</button>
            <button class="menu-btn" onclick="engine.showBacklog()">バックログ</button>
            <button class="menu-btn" onclick="engine.hideMenu()">閉じる</button>
          </div>
        </div>
      `;
      document.getElementById('game-screen').appendChild(menu);

      document.getElementById('text-speed').addEventListener('change', (e) => {
        this.settings.textSpeed = parseInt(e.target.value);
        document.getElementById('speed-value').textContent = this.settings.textSpeed;
        this.saveSettings();
      });

      document.getElementById('volume').addEventListener('change', (e) => {
        this.settings.volume = parseInt(e.target.value) / 100;
        document.getElementById('volume-value').textContent = parseInt(e.target.value);
        this.saveSettings();
      });
    }
    menu.style.display = 'flex';
  },

  hideMenu() {
    const menu = document.getElementById('game-menu');
    if (menu) menu.style.display = 'none';
  },

  showSaveScreen() {
    let screen = document.getElementById('save-screen');
    if (!screen) {
      screen = document.createElement('div');
      screen.id = 'save-screen';
      screen.className = 'modal-screen';
      let html = '<div class="modal-content"><h2>セーブ</h2><div class="save-slots">';
      for (let i = 0; i < 5; i++) {
        const save = this.saves[i];
        const saveInfo = save ? `<small>${save.timestamp}</small>` : '<small>空のスロット</small>';
        html += `<button class="save-slot" onclick="engine.saveGame(${i}); engine.hideSaveScreen();">スロット ${i + 1}<br>${saveInfo}</button>`;
      }
      html += '</div><button class="menu-btn" onclick="engine.hideSaveScreen()">キャンセル</button></div>';
      screen.innerHTML = html;
      document.getElementById('game-screen').appendChild(screen);
    }
    screen.style.display = 'flex';
  },

  hideSaveScreen() {
    const screen = document.getElementById('save-screen');
    if (screen) screen.style.display = 'none';
  },

  showLoadScreen() {
    let screen = document.getElementById('load-screen');
    if (!screen) {
      screen = document.createElement('div');
      screen.id = 'load-screen';
      screen.className = 'modal-screen';
      let html = '<div class="modal-content"><h2>ロード</h2><div class="save-slots">';
      for (let i = 0; i < 5; i++) {
        const save = this.saves[i];
        if (save) {
          html += `<button class="save-slot" onclick="engine.loadGame(${i});">スロット ${i + 1}<br><small>${save.timestamp}</small></button>`;
        }
      }
      html += '</div><button class="menu-btn" onclick="engine.hideLoadScreen()">キャンセル</button></div>';
      screen.innerHTML = html;
      document.getElementById('game-screen').appendChild(screen);
    }
    screen.style.display = 'flex';
  },

  hideLoadScreen() {
    const screen = document.getElementById('load-screen');
    if (screen) screen.style.display = 'none';
  },

  showBacklog() {
    let screen = document.getElementById('backlog-screen');
    if (!screen) {
      screen = document.createElement('div');
      screen.id = 'backlog-screen';
      screen.className = 'modal-screen';
      let html = '<div class="modal-content"><h2>バックログ</h2><div class="backlog-content">';
      for (let i = Math.max(0, this.backlog.length - 20); i < this.backlog.length; i++) {
        const entry = this.backlog[i];
        const name = entry.name ? `<strong>${entry.name}:</strong> ` : '';
        html += `<p>${name}${entry.text}</p>`;
      }
      html += '</div><button class="menu-btn" onclick="engine.hideBacklog()">閉じる</button></div>';
      screen.innerHTML = html;
      document.getElementById('game-screen').appendChild(screen);
    }
    screen.style.display = 'flex';
  },

  hideBacklog() {
    const screen = document.getElementById('backlog-screen');
    if (screen) screen.style.display = 'none';
  },

  // ── End ──────────────────────────────────────────────────

  showEnd() {
    this.fade('out', 800, () => {
      const gameScreen = document.getElementById('game-screen');
      const endEl = document.createElement('div');
      endEl.id = 'end-screen';
      endEl.innerHTML = `
        <p class="end-title">― To Be Continued ―</p>
        <p class="end-credit">雨宮ミルカ　製品版 v1.0</p>
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
