#!/usr/bin/env python3
import http.server
import socketserver
import json
import base64
import os

PORT = 8000
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
MAX_UPLOAD = 20 * 1024 * 1024  # 20MB

# アップロード先のホワイトリスト（パストラバーサル対策）
# 背景は images/bg/、CGは images/cg/ に正しく保存する
ALLOWED_DESTS = {
    'normal':    'images/sprites/milka_normal.png',
    'angry':     'images/sprites/milka_angry.png',
    'sad':       'images/sprites/milka_sad.png',
    'surprised': 'images/sprites/milka_surprised.png',
    'blush':     'images/sprites/milka_blush.png',
    'smile':     'images/sprites/milka_smile.png',
    'sleepy':    'images/sprites/milka_sleepy.png',
    'bg_cafe':   'images/bg/bg_cafe.jpg',
    'bg_living': 'images/bg/bg_living.jpg',
    'milka_lap': 'images/cg/milka_lap.png',
}

IMAGE_SIGNATURES = (
    b'\x89PNG\r\n\x1a\n',  # PNG
    b'\xff\xd8\xff',        # JPEG
    b'GIF87a', b'GIF89a',   # GIF
)


def is_image_data(data):
    if data.startswith(IMAGE_SIGNATURES):
        return True
    # WebP: RIFF....WEBP
    return len(data) >= 12 and data[:4] == b'RIFF' and data[8:12] == b'WEBP'


class UploadHandler(http.server.SimpleHTTPRequestHandler):
    def do_GET(self):
        if self.path == '/':
            self.send_response(200)
            self.send_header('Content-type', 'text/html; charset=utf-8')
            self.end_headers()
            self.wfile.write(self.get_html().encode('utf-8'))
        else:
            super().do_GET()

    def send_json(self, status, payload):
        body = json.dumps(payload).encode('utf-8')
        self.send_response(status)
        self.send_header('Content-type', 'application/json')
        self.send_header('Content-Length', str(len(body)))
        self.end_headers()
        self.wfile.write(body)

    def do_POST(self):
        try:
            content_length = int(self.headers.get('Content-Length') or 0)
        except ValueError:
            self.send_json(400, {'error': 'Invalid Content-Length'})
            return
        if content_length <= 0:
            self.send_json(411, {'error': 'Content-Length required'})
            return
        if content_length > MAX_UPLOAD:
            self.send_json(413, {'error': 'ファイルが大きすぎます（最大20MB）'})
            return
        body = self.rfile.read(content_length)

        try:
            data = json.loads(body.decode('utf-8'))
        except (ValueError, UnicodeDecodeError):
            self.send_json(400, {'error': '不正なJSONです'})
            return
        if not isinstance(data, dict):
            self.send_json(400, {'error': '不正なJSONです'})
            return

        try:
            base64_data = data.get('image')
            expr = data.get('expr')

            if not base64_data or not isinstance(base64_data, str):
                self.send_json(400, {'error': 'No image data'})
                return

            # ホワイトリスト照合（クライアント入力をパスに使わない）
            rel_path = ALLOWED_DESTS.get(expr) if isinstance(expr, str) else None
            if not rel_path:
                self.send_json(400, {'error': '不明な保存先です。表情/背景/CGを選択してください'})
                return

            # Remove data URI prefix if present
            if base64_data.startswith('data:'):
                parts = base64_data.split(',', 1)
                if len(parts) != 2:
                    self.send_json(400, {'error': '不正な画像データです'})
                    return
                base64_data = parts[1]

            try:
                image_data = base64.b64decode(base64_data, validate=True)
            except (ValueError, TypeError):
                self.send_json(400, {'error': '不正な画像データです'})
                return

            # 画像のマジックバイト検証（HTML/SVG等のアップロードを拒否）
            if not is_image_data(image_data):
                self.send_json(400, {'error': '画像ファイル（PNG/JPEG/GIF/WebP）のみアップロードできます'})
                return

            filename = os.path.join(BASE_DIR, rel_path)
            os.makedirs(os.path.dirname(filename), exist_ok=True)

            # 一時ファイル経由で書き込み、途中失敗で壊れたファイルを残さない
            tmp_path = filename + '.tmp'
            with open(tmp_path, 'wb') as f:
                f.write(image_data)
            os.replace(tmp_path, filename)

            self.send_json(200, {
                'success': True,
                'message': f'{os.path.basename(rel_path)} として保存されました！',
                'file': rel_path
            })
        except Exception as e:
            # 詳細はサーバー側ログのみに残す（クライアントへの情報漏えい防止）
            print(f"アップロードエラー: {e!r}")
            self.send_json(500, {'error': 'サーバー内部エラーが発生しました'})

    def get_html(self):
        return '''<!DOCTYPE html>
<html lang="ja">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>ミルカ画像アップロード</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
      background: linear-gradient(135deg, #d8b5f0 0%, #a8d8f0 100%);
      min-height: 100vh;
      display: flex;
      justify-content: center;
      align-items: center;
      padding: 1rem;
    }
    .container {
      background: white;
      border-radius: 16px;
      box-shadow: 0 20px 60px rgba(0,0,0,0.15);
      padding: 2.5rem;
      max-width: 500px;
      width: 100%;
    }
    h1 {
      font-size: 1.8rem;
      margin-bottom: 0.5rem;
      color: #333;
      text-align: center;
    }
    .subtitle {
      text-align: center;
      color: #999;
      font-size: 0.9rem;
      margin-bottom: 2rem;
    }
    .upload-area {
      border: 2px dashed #a8d8f0;
      border-radius: 12px;
      padding: 2.5rem;
      text-align: center;
      margin-bottom: 2rem;
      background: #f5fbff;
      cursor: pointer;
      transition: all 0.3s;
    }
    .upload-area:hover {
      border-color: #d8b5f0;
      background: #faf5ff;
    }
    .upload-area.dragover {
      border-color: #d8b5f0;
      background: #faf5ff;
      transform: scale(1.02);
    }
    #fileInput { display: none; }
    .upload-text {
      color: #666;
      font-size: 1rem;
      line-height: 1.6;
    }
    .preview {
      max-width: 100%;
      max-height: 200px;
      border-radius: 8px;
      margin-bottom: 1.5rem;
      display: none;
    }
    .expr-select {
      width: 100%;
      padding: 0.8rem;
      margin-bottom: 1rem;
      border: 1px solid #ddd;
      border-radius: 8px;
      font-size: 1rem;
      font-family: inherit;
    }
    .button-group {
      display: flex;
      gap: 0.8rem;
    }
    button {
      flex: 1;
      padding: 1rem;
      border: none;
      border-radius: 8px;
      font-size: 1rem;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.3s;
    }
    .upload-btn {
      background: linear-gradient(135deg, #d8b5f0 0%, #a8d8f0 100%);
      color: white;
    }
    .upload-btn:hover:not(:disabled) {
      transform: translateY(-2px);
      box-shadow: 0 8px 20px rgba(216, 181, 240, 0.4);
    }
    .upload-btn:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }
    .clear-btn {
      background: #e2e8f0;
      color: #333;
    }
    .clear-btn:hover {
      background: #cbd5e0;
    }
    .status {
      margin-top: 1.5rem;
      padding: 1rem;
      border-radius: 8px;
      text-align: center;
      display: none;
      font-size: 0.95rem;
    }
    .status.success {
      background: #c6f6d5;
      color: #22543d;
      display: block;
    }
    .status.error {
      background: #fed7d7;
      color: #742a2a;
      display: block;
    }
    .info {
      font-size: 0.85rem;
      color: #666;
      margin-top: 1.5rem;
      padding: 1rem;
      background: #f0f2ff;
      border-radius: 8px;
      line-height: 1.8;
    }
  </style>
</head>
<body>

<div class="container">
  <h1>🖼️ ミルカ画像アップロード</h1>
  <p class="subtitle">立ち絵・背景・CGをアップロード</p>

  <div class="upload-area" id="uploadArea">
    <input type="file" id="fileInput" accept="image/*">
    <div class="upload-text">
      📁 ここをタップして画像を選択<br>
      <small>またはドラッグ&ドロップ</small>
    </div>
  </div>

  <img id="preview" class="preview" alt="">

  <select id="exprSelect" class="expr-select">
    <option value="">--- 表情を選択 ---</option>
    <optgroup label="立ち絵">
      <option value="normal">通常</option>
      <option value="angry">怒り</option>
      <option value="sad">泣きそう</option>
      <option value="surprised">驚き</option>
      <option value="blush">照れ</option>
      <option value="smile">目閉じ微笑み</option>
      <option value="sleepy">眠そう</option>
    </optgroup>
    <optgroup label="背景">
      <option value="bg_cafe">カフェ背景</option>
      <option value="bg_living">リビング背景</option>
    </optgroup>
    <optgroup label="CG">
      <option value="milka_lap">ひざまくらCG</option>
    </optgroup>
  </select>

  <div class="button-group">
    <button class="upload-btn" id="uploadBtn" disabled>📤 アップロード</button>
    <button class="clear-btn" id="clearBtn">🗑️ クリア</button>
  </div>

  <div id="status" class="status"></div>

  <div class="info">
    ✅ <strong>使い方：</strong><br>
    1. 画像をタップして選択<br>
    2. 表情/背景/CGを選択<br>
    3. 「アップロード」をタップ<br>
    4. 全部で 10 枚アップロード
  </div>
</div>

<script>
const uploadArea = document.getElementById('uploadArea');
const fileInput = document.getElementById('fileInput');
const preview = document.getElementById('preview');
const exprSelect = document.getElementById('exprSelect');
const uploadBtn = document.getElementById('uploadBtn');
const clearBtn = document.getElementById('clearBtn');
const statusEl = document.getElementById('status');

uploadArea.addEventListener('click', () => fileInput.click());

uploadArea.addEventListener('dragover', (e) => {
  e.preventDefault();
  uploadArea.classList.add('dragover');
});

uploadArea.addEventListener('dragleave', () => {
  uploadArea.classList.remove('dragover');
});

uploadArea.addEventListener('drop', (e) => {
  e.preventDefault();
  uploadArea.classList.remove('dragover');
  fileInput.files = e.dataTransfer.files;
  updatePreview();
});

fileInput.addEventListener('change', updatePreview);
exprSelect.addEventListener('change', () => {
  uploadBtn.disabled = !fileInput.files[0] || !exprSelect.value;
});

function updatePreview() {
  const file = fileInput.files[0];
  if (!file) return;
  if (!file.type.startsWith('image/')) {
    showStatus('画像ファイルを選択してください', 'error');
    fileInput.value = '';
    return;
  }

  const reader = new FileReader();
  reader.onload = (e) => {
    preview.src = e.target.result;
    preview.style.display = 'block';
    uploadBtn.disabled = !exprSelect.value;
  };
  reader.readAsDataURL(file);
}

uploadBtn.addEventListener('click', upload);

function upload() {
  const file = fileInput.files[0];
  const expr = exprSelect.value;

  if (!file || !expr) {
    showStatus('画像と表情を選択してください', 'error');
    return;
  }

  const reader = new FileReader();
  reader.onload = (e) => {
    const base64 = e.target.result;

    fetch('/', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ image: base64, expr })
    })
    .then(r => r.json())
    .then(data => {
      if (data.success) {
        showStatus(`✅ ${data.message}`, 'success');
        fileInput.value = '';
        exprSelect.value = '';
        preview.style.display = 'none';
        uploadBtn.disabled = true;
      } else {
        showStatus('❌ エラー: ' + data.error, 'error');
      }
    })
    .catch(e => showStatus('❌ アップロード失敗: ' + e, 'error'));
  };
  reader.readAsDataURL(file);
}

clearBtn.addEventListener('click', () => {
  fileInput.value = '';
  exprSelect.value = '';
  preview.style.display = 'none';
  uploadBtn.disabled = true;
  statusEl.style.display = 'none';
});

function showStatus(msg, type) {
  statusEl.textContent = msg;
  statusEl.className = `status ${type}`;
}
</script>

</body>
</html>'''

if __name__ == '__main__':
    os.chdir(BASE_DIR)  # ゲームファイルの配信ルートをスクリプトの場所に固定

    class Server(socketserver.ThreadingTCPServer):
        allow_reuse_address = True  # 再起動時の "Address already in use" を防ぐ
        daemon_threads = True

    # 注意: スマホからのアクセス用に全インターフェースで待ち受ける（ローカル開発専用）
    with Server(("", PORT), UploadHandler) as httpd:
        print(f"🚀 サーバー起動: http://localhost:{PORT}")
        print(f"スマホから http://[PCのIP]:{PORT} でアクセスしてください")
        try:
            httpd.serve_forever()
        except KeyboardInterrupt:
            print("\n🛑 サーバー停止")
