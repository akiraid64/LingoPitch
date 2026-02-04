# AUTOMATED RLS TEST
$SUPABASE_URL = "https://zyuxjfztqwvegkslkjqd.supabase.co"
$ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inp5dXhqZnp0cXd2ZWdrc2xranFkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzAxMzk3ODIsImV4cCI6MjA4NTcxNTc4Mn0.ZkRRQi5Vk_VKiXXRjYAZhlfM_DKEGR031ACGqffyMGY"

Write-Host "GET YOUR AUTH TOKEN:" -ForegroundColor Yellow
Write-Host "Run this in browser console:" -ForegroundColor White
Write-Host "  JSON.parse(localStorage.getItem(Object.keys(localStorage).find(k => k.includes('auth-token')))).access_token" -ForegroundColor Green
Write-Host ""
Write-Host "Paste token here:" -ForegroundColor Yellow
$USER_ACCESS_TOKEN = Read-Host

if ([string]::IsNullOrWhiteSpace($USER_ACCESS_TOKEN)) {
    Write-Host "No token provided. Exiting." -ForegroundColor Red
    exit
}

$testUserId = "78d79bb7-0673-4f81-a910-9699e967aede"

Write-Host "`n[TEST 1] INSERT with ANON KEY ONLY (should fail)" -ForegroundColor Cyan
$headers1 = @{
    "apikey" = $ANON_KEY
    "Content-Type" = "application/json"
}

$body1 = @{
    name = "Test No Auth"
    slug = "test-no-auth"
    referral_code = "NOAUTH01"
    owner_id = $testUserId
} | ConvertTo-Json

try {
    Invoke-RestMethod -Uri "$SUPABASE_URL/rest/v1/organizations?select=id" -Method Post -Headers $headers1 -Body $body1 -ErrorAction Stop | Out-Null
    Write-Host "ERROR: INSERT succeeded without auth (RLS not working!)" -ForegroundColor Red
} catch {
    if ($_.Exception.Response.StatusCode.value__ -eq 403) {
        Write-Host "PASS: Got 403 Forbidden (RLS working)" -ForegroundColor Green
    } else {
        Write-Host "FAIL: Got status $($_.Exception.Response.StatusCode.value__)" -ForegroundColor Red
    }
}

Write-Host "`n[TEST 2] INSERT with ANON KEY + AUTH TOKEN (should succeed)" -ForegroundColor Cyan
$headers2 = @{
    "apikey" = $ANON_KEY
    "Authorization" = "Bearer $USER_ACCESS_TOKEN"
    "Content-Type" = "application/json"
}

$body2 = @{
    name = "Test With Auth"
    slug = "test-with-auth"
    referral_code = "WITHAUTH"
    owner_id = $testUserId
} | ConvertTo-Json

try {
    $response = Invoke-RestMethod -Uri "$SUPABASE_URL/rest/v1/organizations?select=id" -Method Post -Headers $headers2 -Body $body2 -ErrorAction Stop
    Write-Host "SUCCESS: INSERT worked!" -ForegroundColor Green
    Write-Host "Org ID: $($response.id)" -ForegroundColor White
    Write-Host "`nDIAGNOSIS: Supabase client is NOT sending auth headers!" -ForegroundColor Yellow
} catch {
    $statusCode = $_.Exception.Response.StatusCode.value__
    Write-Host "FAIL: Got status $statusCode" -ForegroundColor Red
    if ($statusCode -eq 403) {
        Write-Host "Auth token might be invalid or RLS has different issue" -ForegroundColor Yellow
    }
}

Write-Host "`nTest Complete`n" -ForegroundColor Cyan
