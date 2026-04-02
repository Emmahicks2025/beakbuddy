Add-Type -AssemblyName System.Drawing

$sourceDir = "c:\Users\Medicare\Desktop\Applications\Parrot\assets\species"
$maxSize = 1000
$quality = 85

Get-ChildItem -Path $sourceDir -Filter "*.jpg" | ForEach-Object {
    $img = [System.Drawing.Image]::FromFile($_.FullName)
    
    if ($img.Width -gt $maxSize -or $_.Length -gt 1MB) {
        Write-Host "Resizing $($_.Name)..."
        
        $newHeight = [int]($img.Height * ($maxSize / $img.Width))
        $resized = new-object System.Drawing.Bitmap($maxSize, $newHeight)
        $graph = [System.Drawing.Graphics]::FromImage($resized)
        $graph.CompositingQuality = [System.Drawing.Drawing2D.CompositingQuality]::HighQuality
        $graph.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::HighQuality
        $graph.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic

        $rect = new-object System.Drawing.Rectangle(0, 0, $maxSize, $newHeight)
        $graph.DrawImage($img, $rect)

        $img.Dispose()
        
        $codec = [System.Drawing.Imaging.ImageCodecInfo]::GetImageEncoders() | Where-Object { $_.MimeType -eq "image/jpeg" }
        $encoderParams = New-Object System.Drawing.Imaging.EncoderParameters(1)
        $encoderParams.Param[0] = New-Object System.Drawing.Imaging.EncoderParameter([System.Drawing.Imaging.Encoder]::Quality, $quality)
        
        $resized.Save($_.FullName, $codec, $encoderParams)
        $resized.Dispose()
        $graph.Dispose()
        
        Write-Host "Done."
    } else {
        $img.Dispose()
    }
}
