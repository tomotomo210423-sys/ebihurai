#!/usr/bin/env python3
import http.server
import socketserver
import urllib.parse
import json
import base64
import os
from pathlib import Path

PORT = 8000

class UploadHandler(http.server.SimpleHTTPRequestHandler):
    def do_GET(self):
        if self.path == '/':
            self.send_response(200)
            self.send_header('Content-type', 'text/html; charset=utf-8')
            self.end_headers()
            self.wfile.write(self.get_html().encode('utf-8'))
        else:
            super().do_GET()

    def do_POST(self):
        content_length = int(self.headers['Content-Length'])
        body = self.rfile.read(content_length)

        try:
            data = json.loads(body.decode('utf-8'))
            base64_data = data.get('image')
            expr = data.get('expr', 'unknown')

            if not base64_data:
                self.send_response(400)
                self.send_header('Content-type', 'application/json')
                self.end_headers()
                self.wfile.write(json.dumps({'error': 'No image data'}).encode())
                return

            # Save to file
            filename = f"/home/user/ebihurai/images/sprites/milka_{expr}.png"
            os.makedirs(os.path.dirname(filename), exist_ok=True)

            # Remove data URI prefix if present
            if base64_data.startswith('data:'):
                base64_data = base64_data.split(',', 1)[1]

            image_data = base64.b64decode(base64_data)
            with open(filename, 'wb') as f:
                f.write(image_data)

            self.send_response(200)
            self.send_header('Content-type', 'application/json')
            self.end_headers()
            self.wfile.write(json.dumps({
                'success': True,
                'message': f'milka_{expr}.png として保存されました！',
                'file': filename
            }).encode())
        except Exception as e:
            self.send_response(500)
            self.send_header('Content-type', 'application/json')
            self.end_headers()
            self.wfile.write(json.dumps({'error': str(e)}).encode())

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
    with socketserver.TCPServer(("", PORT), UploadHandler) as httpd:
        print(f"🚀 サーバー起動: http://localhost:{PORT}")
        print("スマホから http://[PCのIP]:{PORT} でアクセスしてください")
        try:
            httpd.serve_forever()
        except KeyboardInterrupt:
            print("\n🛑 サーバー停止")
