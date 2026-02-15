$env:GEMINI_API_KEY = Get-Content .env.local | Select-String "GEMINI_API_KEY" | ForEach-Object { $_.ToString().Split('=')[1].Trim() }

if (-not $env:GEMINI_API_KEY) {
    Write-Host "Error: GEMINI_API_KEY not found in .env.local"
    exit 1
}

Write-Host "Testing API Key: $($env:GEMINI_API_KEY.Substring(0, 5))..."

$models = @("gemini-1.5-flash", "gemini-1.5-pro", "gemini-2.0-flash-exp")

foreach ($model in $models) {
    Write-Host "Trying model: $model"
    $url = "https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=$($env:GEMINI_API_KEY)"
    
    $body = @{
        contents = @(
            @{
                parts = @(
                    @{ text = "Hello" }
                )
            }
        )
    } | ConvertTo-Json -Depth 5

    try {
        $response = Invoke-RestMethod -Uri $url -Method Post -Body $body -ContentType "application/json" -ErrorAction Stop
        Write-Host "✅ Success! Response: $($response.candidates[0].content.parts[0].text)"
        exit 0
    } catch {
        Write-Host "❌ Failed for $model"
        Write-Host $_.Exception.Message
        # Print details if available
        if ($_.Exception.Response) {
            $stream = $_.Exception.Response.GetResponseStream()
            $reader = New-Object System.IO.StreamReader($stream)
            Write-Host $reader.ReadToEnd()
        }
    }
}
