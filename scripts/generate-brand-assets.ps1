param(
    [string]$SourcePath = (Join-Path $PSScriptRoot '..\assets\images\logo.png'),
    [string]$AssetsPath = (Join-Path $PSScriptRoot '..\assets')
)

$ErrorActionPreference = 'Stop'
Add-Type -AssemblyName System.Drawing

$bg = [System.Drawing.Color]::FromArgb(10, 10, 15)

function Save-Png($bitmap, $path) {
    $bitmap.Save($path, [System.Drawing.Imaging.ImageFormat]::Png)
}

$source = [System.Drawing.Bitmap]::FromFile($SourcePath)
$cropRect = New-Object System.Drawing.Rectangle(200, 130, 854, 560)
$emblem = $source.Clone($cropRect, $source.PixelFormat)

function Draw-EmblemOnCanvas($size, $emblemScale, $opaqueBackground) {
    $canvas = New-Object System.Drawing.Bitmap($size, $size)
    $graphics = [System.Drawing.Graphics]::FromImage($canvas)
    $graphics.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
    if ($opaqueBackground) {
        $graphics.Clear($bg)
    } else {
        $graphics.Clear([System.Drawing.Color]::Transparent)
    }

    $targetWidth = [int]($size * $emblemScale)
    $targetHeight = [int]($targetWidth * $emblem.Height / $emblem.Width)
    $x = [int](($size - $targetWidth) / 2)
    $y = [int](($size - $targetHeight) / 2)
    $graphics.DrawImage($emblem, $x, $y, $targetWidth, $targetHeight)
    $graphics.Dispose()
    return $canvas
}

function New-Monochrome($size, $emblemScale) {
    $rendered = Draw-EmblemOnCanvas $size $emblemScale $true
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

$icon = Draw-EmblemOnCanvas 1024 0.56 $true
Save-Png $icon (Join-Path $AssetsPath 'icon.png')
$splash = Draw-EmblemOnCanvas 1024 0.62 $true
Save-Png $splash (Join-Path $AssetsPath 'splash-icon.png')
$foreground = Draw-EmblemOnCanvas 1024 0.48 $true
Save-Png $foreground (Join-Path $AssetsPath 'android-icon-foreground.png')
$background = New-Object System.Drawing.Bitmap(1024, 1024)
$backgroundGraphics = [System.Drawing.Graphics]::FromImage($background)
$backgroundGraphics.Clear($bg)
$backgroundGraphics.Dispose()
Save-Png $background (Join-Path $AssetsPath 'android-icon-background.png')
$monochrome = New-Monochrome 1024 0.48
Save-Png $monochrome (Join-Path $AssetsPath 'android-icon-monochrome.png')
$favicon = Draw-EmblemOnCanvas 48 0.56 $true
Save-Png $favicon (Join-Path $AssetsPath 'favicon.png')

$icon.Dispose()
$splash.Dispose()
$foreground.Dispose()
$background.Dispose()
$monochrome.Dispose()
$favicon.Dispose()
$emblem.Dispose()
$source.Dispose()

Write-Host "Generated Movie Cave brand assets in $AssetsPath"
