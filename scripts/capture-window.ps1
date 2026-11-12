# Sizes an app's window to 1600 x 1000 pixels and saves a PNG of it, for screenshots on the site.
# Usage: powershell -File scripts\capture-window.ps1 -Process glide -Out src\assets\glide\windows-memories.png
param(
  [Parameter(Mandatory)] [string] $Process,
  [Parameter(Mandatory)] [string] $Out,
  [int] $Width = 1600,
  [int] $Height = 1000,
  [switch] $ResizeOnly
)

Add-Type -AssemblyName System.Drawing
Add-Type @'
using System;
using System.Runtime.InteropServices;
public static class Win {
  [StructLayout(LayoutKind.Sequential)] public struct RECT { public int Left, Top, Right, Bottom; }
  [DllImport("user32.dll")] public static extern bool SetProcessDPIAware();
  [DllImport("user32.dll")] public static extern bool SetWindowPos(IntPtr h, IntPtr after, int x, int y, int cx, int cy, uint flags);
  [DllImport("user32.dll")] public static extern bool ShowWindow(IntPtr h, int cmd);
  [DllImport("user32.dll")] public static extern bool SetForegroundWindow(IntPtr h);
  [DllImport("user32.dll")] public static extern bool PrintWindow(IntPtr h, IntPtr dc, uint flags);
  [DllImport("dwmapi.dll")] public static extern int DwmGetWindowAttribute(IntPtr h, int attr, out RECT r, int size);
}
'@
[Win]::SetProcessDPIAware() | Out-Null

$p = Get-Process $Process -ErrorAction Stop | Where-Object { $_.MainWindowHandle -ne 0 } | Select-Object -First 1
if (-not $p) { throw "No window found for $Process" }
$h = $p.MainWindowHandle

[Win]::ShowWindow($h, 9) | Out-Null # restore if maximised or minimised
[Win]::SetForegroundWindow($h) | Out-Null

# Size the visible frame (without the invisible resize borders) to exactly Width x Height.
function Get-Frame { $r = New-Object Win+RECT; [Win]::DwmGetWindowAttribute($h, 9, [ref]$r, 16) | Out-Null; $r }
$f = Get-Frame
[Win]::SetWindowPos($h, [IntPtr]::Zero, $f.Left, $f.Top, $Width, $Height, 0x0014) | Out-Null
Start-Sleep -Milliseconds 300
$f = Get-Frame
$dw = $Width - ($f.Right - $f.Left); $dh = $Height - ($f.Bottom - $f.Top)
if ($dw -ne 0 -or $dh -ne 0) {
  [Win]::SetWindowPos($h, [IntPtr]::Zero, 0, 0, $Width + $dw, $Height + $dh, 0x0016) | Out-Null
}
if ($ResizeOnly) { Write-Output "Resized $Process to ${Width}x$Height"; return }
Start-Sleep -Milliseconds 800 # let the app redraw at the new size

$f = Get-Frame
$bmp = New-Object System.Drawing.Bitmap ($f.Right - $f.Left), ($f.Bottom - $f.Top)
$g = [System.Drawing.Graphics]::FromImage($bmp)
$g.CopyFromScreen($f.Left, $f.Top, 0, 0, $bmp.Size)
$g.Dispose()
$dir = Split-Path -Parent $Out
if ($dir) { New-Item -ItemType Directory -Force $dir | Out-Null }
if (-not [IO.Path]::IsPathRooted($Out)) { $Out = Join-Path (Get-Location).Path $Out }
$bmp.Save($Out, [System.Drawing.Imaging.ImageFormat]::Png)
$bmp.Dispose()
Write-Output "Saved $Out ($($f.Right - $f.Left)x$($f.Bottom - $f.Top))"
