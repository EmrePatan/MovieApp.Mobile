param(
    [Parameter(Mandatory = $true)]
    [string]$SourcePath,
    [string]$AssetsPath = (Join-Path $PSScriptRoot '..\assets'),
    [switch]$AllowOverwrite
)

$ErrorActionPreference = 'Stop'
Add-Type -AssemblyName System.Drawing

if (-not $AllowOverwrite) {
    throw @"
Launcher assets are maintained manually in this repo.
To regenerate from a source PNG, pass -AllowOverwrite and -SourcePath explicitly.
This script overwrites icon.png, favicon.png, and assets/branding adaptive icons.
"@
}

if (-not (Test-Path $SourcePath)) {
    throw "Source artwork not found: $SourcePath"
}

function Save-Png($bitmap, $path) {
    $directory = Split-Path $path -Parent
    if ($directory -and -not (Test-Path $directory)) {
        New-Item -ItemType Directory -Path $directory -Force | Out-Null
    }
    $bitmap.Save($path, [System.Drawing.Imaging.ImageFormat]::Png)
}

function Resize-Square($bitmap, $size) {
    $canvas = New-Object System.Drawing.Bitmap($size, $size)
    $graphics = [System.Drawing.Graphics]::FromImage($canvas)
    $graphics.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
    $graphics.PixelOffsetMode = [System.Drawing.Drawing2D.PixelOffsetMode]::HighQuality
    $graphics.CompositingQuality = [System.Drawing.Drawing2D.CompositingQuality]::HighQuality
    $graphics.DrawImage($bitmap, 0, 0, $size, $size)
    $graphics.Dispose()
    return $canvas
}

function New-Monochrome($bitmap, $size) {
    $rendered = Resize-Square $bitmap $size
    $mono = New-Object System.Drawing.Bitmap($size, $size)

    for ($y = 0; $y -lt $size; $y++) {
        for ($x = 0; $x -lt $size; $x++) {
            $pixel = $rendered.GetPixel($x, $y)
            $luminance = 0.299 * $pixel.R + 0.587 * $pixel.G + 0.114 * $pixel.B
            if ($luminance -gt 60) {
                $mono.SetPixel($x, $y, [System.Drawing.Color]::White)
            }
        }
    }

    $rendered.Dispose()
    return $mono
}

$source = [System.Drawing.Bitmap]::FromFile($SourcePath)
$icon = Resize-Square $source 1024

Save-Png $icon (Join-Path $AssetsPath 'icon.png')
Save-Png $icon (Join-Path $AssetsPath 'branding\adaptive-icon-foreground.png')

$monochrome = New-Monochrome $source 1024
Save-Png $monochrome (Join-Path $AssetsPath 'branding\monochrome-icon.png')

$favicon = Resize-Square $source 48
Save-Png $favicon (Join-Path $AssetsPath 'favicon.png')

$icon.Dispose()
$monochrome.Dispose()
$favicon.Dispose()
$source.Dispose()

Write-Host 'Generated launcher assets (icon, favicon, branding adaptive/monochrome).'
Write-Host 'Android adaptive background remains app.config.ts android.adaptiveIcon.backgroundColor.'
