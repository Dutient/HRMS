$env:GEMINI_API_KEY = Get-Content .env.local | Select-String "GEMINI_API_KEY" | ForEach-Object { $_.ToString().Split('=')[1].Trim() }

if (-not $env:GEMINI_API_KEY) {
    Write-Host "Error: GEMINI_API_KEY not found in .env.local"
    exit 1
}

Write-Host "Listing Models for Key: $($env:GEMINI_API_KEY.Substring(0, 5))..."

$url = "https://generativelanguage.googleapis.com/v1beta/models?key=$($env:GEMINI_API_KEY)"

try {
    $response = Invoke-RestMethod -Uri $url -Method Get -ErrorAction Stop
    $models = $response.models | Where-Object { $_.supportedGenerationMethods -contains "generateContent" }
    
    if ($models.Count -eq 0) {
        Write-Host "⚠️ No models found with 'generateContent' capability."
    } else {
        Write-Host "✅ Available Models:"
        foreach ($model in $models) {
            Write-Host "- $($model.name.Replace('models/', '')) (Version: $($model.version))"
        }
    }
} catch {
    Write-Host "❌ Failed to list models."
    Write-Host $_.Exception.Message
    if ($_.Exception.Response) {
        $stream = $_.Exception.Response.GetResponseStream()
        $reader = New-Object System.IO.StreamReader($stream)
        Write-Host $reader.ReadToEnd()
    }
}
