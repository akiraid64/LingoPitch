# RLS INSERT Test - PowerShell Script
# This tests if we can INSERT into organizations with the anon key + auth token

# STEP 1: Replace these with your actual values from frontend/.env
$SUPABASE_URL = "YOUR_SUPABASE_URL"  # e.g., https://xxx.supabase.co
$ANON_KEY = "YOUR_ANON_KEY"
$USER_ACCESS_TOKEN = "YOUR_USER_ACCESS_TOKEN"  # Get from browser DevTools → Application → Local Storage → supabase.auth.token

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "RLS INSERT Test" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan

# Test 1: Try INSERT with just anon key (should fail with 403 if RLS is working)
Write-Host "`n[TEST 1] INSERT with ANON KEY ONLY (should fail)" -ForegroundColor Yellow
$headers1 = @{
    "apikey" = $ANON_KEY
    "Content-Type" = "application/json"
    "Prefer" = "return=representation"
}

$body1 = @{
    name = "Test Org PowerShell"
    slug = "test-org-ps"
    referral_code = "TESTPS01"
    owner_id = "78d79bb7-0673-4f81-a910-9699e967aede"
} | ConvertTo-Json

try {
    $response1 = Invoke-RestMethod -Uri "$SUPABASE_URL/rest/v1/organizations" -Method Post -Headers $headers1 -Body $body1
    Write-Host "✅ INSERT succeeded (unexpected!)" -ForegroundColor Green
    Write-Host $response1 | ConvertTo-Json
} catch {
    Write-Host "❌ INSERT failed (expected): $($_.Exception.Message)" -ForegroundColor Red
}

# Test 2: Try INSERT with anon key + Authorization header (should succeed)
Write-Host "`n[TEST 2] INSERT with ANON KEY + AUTH TOKEN (should succeed)" -ForegroundColor Yellow
$headers2 = @{
    "apikey" = $ANON_KEY
    "Authorization" = "Bearer $USER_ACCESS_TOKEN"
    "Content-Type" = "application/json"
    "Prefer" = "return=representation"
}

$body2 = @{
    name = "Test Org Auth"
    slug = "test-org-auth"
    referral_code = "TESTAUTH"
    owner_id = "78d79bb7-0673-4f81-a910-9699e967aede"
} | ConvertTo-Json

try {
    $response2 = Invoke-RestMethod -Uri "$SUPABASE_URL/rest/v1/organizations" -Method Post -Headers $headers2 -Body $body2
    Write-Host "✅ INSERT succeeded!" -ForegroundColor Green
    Write-Host $response2 | ConvertTo-Json
} catch {
    Write-Host "❌ INSERT failed: $($_.Exception.Message)" -ForegroundColor Red
    Write-Host "Response: $($_.Exception.Response)" -ForegroundColor Red
}

Write-Host "`n========================================" -ForegroundColor Cyan
Write-Host "INSTRUCTIONS:" -ForegroundColor Cyan
Write-Host "1. Edit this file and replace SUPABASE_URL and ANON_KEY" -ForegroundColor White
Write-Host "2. Get USER_ACCESS_TOKEN from browser:" -ForegroundColor White
Write-Host "   - Open DevTools (F12)" -ForegroundColor Gray
Write-Host "   - Go to Application tab → Local Storage" -ForegroundColor Gray
Write-Host "   - Find 'supabase.auth.token' key" -ForegroundColor Gray
Write-Host "   - Copy the 'access_token' value" -ForegroundColor Gray
Write-Host "3. Run: .\test_rls_insert.ps1" -ForegroundColor White
Write-Host "========================================" -ForegroundColor Cyan
