# ぬばたま落とし単独サイトの タブのアイコン・ホーム画面のアイコン・OGP 画像を作り直す。
# 原画は nubatama/brand.html（ゲームの部品そのもので描く）。Chrome を画面なしで1枚ずつ開いて撮り、
# 左上から切り抜いて public/images/nubatama/ に置く。
#
# 使い方（先に別の窓で `npm run dev:nubatama -- --port 3016` を立てておく）:
#   powershell -ExecutionPolicy Bypass -File scripts/nubatama-brand.ps1 -Icon a
# -Icon は a（月とぬばたま）/ b（ぬばたまと鬼火）/ c（鬼火3色とぬばたま）。
param(
  [ValidateSet('a', 'b', 'c')][string]$Icon = 'a',
  [int]$Port = 3016,
  [string]$Chrome = 'C:\Program Files\Google\Chrome\Application\chrome.exe'
)
$ErrorActionPreference = 'Stop'
Add-Type -AssemblyName System.Drawing

$root = Split-Path -Parent $PSScriptRoot
$out = Join-Path $root 'public\images\nubatama'
New-Item -ItemType Directory -Force $out | Out-Null
$tmp = Join-Path ([IO.Path]::GetTempPath()) 'nubatama-brand'
New-Item -ItemType Directory -Force $tmp | Out-Null
$prof = Join-Path $tmp 'chrome-profile'  # いつもの Chrome とは別の設定で開く（開いている窓に混ざらないように）

function Shot([string]$query, [int]$w, [int]$h, [int]$cw, [int]$ch, [string]$name, [bool]$clear) {
  $raw = Join-Path $tmp "raw_$name"
  $cargs = @('--headless=new', '--disable-gpu', '--hide-scrollbars', '--no-first-run', "--user-data-dir=$prof",
    "--window-size=$w,$h", '--virtual-time-budget=8000', "--screenshot=$raw", "http://localhost:$Port/brand.html?$query")
  if ($clear) { $cargs = @('--default-background-color=00000000') + $cargs }
  # Chrome は無害なエラーを標準エラーに出すので、ここだけ止めない
  $ErrorActionPreference = 'Continue'
  & $Chrome @cargs 2>&1 | Out-Null
  $ErrorActionPreference = 'Stop'
  if (-not (Test-Path $raw)) { throw "撮れなかった: $query（開発サーバーは $Port 番で立っているか）" }
  $src = [System.Drawing.Bitmap]::FromFile($raw)
  $crop = $src.Clone((New-Object System.Drawing.Rectangle 0, 0, $cw, $ch), [System.Drawing.Imaging.PixelFormat]::Format32bppArgb)
  $src.Dispose()
  if ($name.EndsWith('.jpg')) {
    # OGP は写真に近い絵なので JPEG（品質 90）。PNG だと 1.3MB になる
    $enc = [System.Drawing.Imaging.ImageCodecInfo]::GetImageEncoders() | Where-Object { $_.MimeType -eq 'image/jpeg' }
    $ps = New-Object System.Drawing.Imaging.EncoderParameters 1
    $ps.Param[0] = New-Object System.Drawing.Imaging.EncoderParameter ([System.Drawing.Imaging.Encoder]::Quality), 90L
    $crop.Save((Join-Path $out $name), $enc, $ps)
  } else {
    $crop.Save((Join-Path $out $name), [System.Drawing.Imaging.ImageFormat]::Png)
  }
  $crop.Dispose()
  Remove-Item $raw
  Write-Host "  $name ($cw x $ch)"
}

Write-Host "アイコン案 $Icon と OGP を撮る"
# 窓は 512 角より小さくできないので、小さいアイコンも 512 の窓で描いて左上を切る
Shot "m=$Icon&s=32" 512 512 32 32 'icon-32.png' $true
Shot "m=$Icon&s=192" 512 512 192 192 'icon-192.png' $true
Shot "m=$Icon&s=512" 512 512 512 512 'icon-512.png' $true
Shot "m=$Icon&s=180&sq=1" 512 512 180 180 'apple-touch-icon.png' $false
Shot 'm=og' 1200 630 1200 630 'ogp.jpg' $false
Write-Host "置いた先: $out"
