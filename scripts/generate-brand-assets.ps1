param(
    [string]$SourcePath = (Join-Path $PSScriptRoot '..\assets\images\movie-cave-app-icon-source.png'),
    [string]$AssetsPath = (Join-Path $PSScriptRoot '..\assets')
)

$ErrorActionPreference = 'Stop'
Add-Type -AssemblyName System.Drawing

if (-not (Test-Path $SourcePath)) {
    throw "Approved app icon source not found: $SourcePath"
}

function Save-Png($bitmap, $path) {
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

function Get-CornerBackgroundColor($bitmap) {
    $width = $bitmap.Width - 1
    $height = $bitmap.Height - 1
    $pixels = @(
        $bitmap.GetPixel(0, 0),
        $bitmap.GetPixel($width, 0),
        $bitmap.GetPixel(0, $height),
        $bitmap.GetPixel($width, $height)
    )

    $red = [int][Math]::Round(($pixels | ForEach-Object { $_.R } | Measure-Object -Average).Average)
    $green = [int][Math]::Round(($pixels | ForEach-Object { $_.G } | Measure-Object -Average).Average)
    $blue = [int][Math]::Round(($pixels | ForEach-Object { $_.B } | Measure-Object -Average).Average)

    return [System.Drawing.Color]::FromArgb($red, $green, $blue)
}

function ColorTo-Hex($color) {
    return '#' + $color.R.ToString('X2') + $color.G.ToString('X2') + $color.B.ToString('X2')
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
$backgroundColor = Get-CornerBackgroundColor $source
$icon = Resize-Square $source 1024

Save-Png $icon (Join-Path $AssetsPath 'icon.png')
Save-Png $icon (Join-Path $AssetsPath 'android-icon-foreground.png')

$background = New-Object System.Drawing.Bitmap(1024, 1024)
$backgroundGraphics = [System.Drawing.Graphics]::FromImage($background)
$backgroundGraphics.Clear($backgroundColor)
$backgroundGraphics.Dispose()
Save-Png $background (Join-Path $AssetsPath 'android-icon-background.png')

$monochrome = New-Monochrome $source 1024
Save-Png $monochrome (Join-Path $AssetsPath 'android-icon-monochrome.png')

$favicon = Resize-Square $source 48
Save-Png $favicon (Join-Path $AssetsPath 'favicon.png')

$icon.Dispose()
$background.Dispose()
$monochrome.Dispose()
$favicon.Dispose()
$source.Dispose()

Write-Host "Generated Movie Cave launcher assets from approved source."
Write-Host "Adaptive icon background color: $(ColorTo-Hex $backgroundColor)"
