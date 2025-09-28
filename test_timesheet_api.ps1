# Test script for Timesheet Entry API endpoints
Write-Host "Testing Timesheet Entry API..." -ForegroundColor Green

# Base URL
$baseUrl = "http://localhost:5089/api/timesheetentry"

try {
    # Test 1: Get Period Info for Weekly
    Write-Host "`n1. Testing Period Info (Weekly)..." -ForegroundColor Yellow
    $periodInfoUrl = "$baseUrl/period-info?periodType=1&year=2025&month=9&weekNumber=1"
    Write-Host "GET: $periodInfoUrl"

    # Test 2: Get Period Info for Monthly
    Write-Host "`n2. Testing Period Info (Monthly)..." -ForegroundColor Yellow
    $monthlyPeriodUrl = "$baseUrl/period-info?periodType=3&year=2025&month=9"
    Write-Host "GET: $monthlyPeriodUrl"

    # Test 3: Test Auto-Fill Hours
    Write-Host "`n3. Testing Auto-Fill..." -ForegroundColor Yellow
    $autoFillUrl = "$baseUrl/auto-fill"
    $autoFillBody = @{
        periodType = 1
        year = 2025
        month = 9
        weekNumber = 1
        hoursPerDay = 8
        weekdaysOnly = $true
    } | ConvertTo-Json
    Write-Host "POST: $autoFillUrl"
    Write-Host "Body: $autoFillBody"

    # Test 4: Check Draft Endpoint
    Write-Host "`n4. Testing Get Draft..." -ForegroundColor Yellow
    $draftUrl = "$baseUrl/draft?periodType=1&year=2025&month=9&weekNumber=1"
    Write-Host "GET: $draftUrl"

    Write-Host "`n✅ API Test URLs Generated Successfully!" -ForegroundColor Green
    Write-Host "Frontend: http://localhost:4201" -ForegroundColor Cyan
    Write-Host "Backend API: http://localhost:5089" -ForegroundColor Cyan
    Write-Host "Navigate to: http://localhost:4201/employee/timesheet-entry" -ForegroundColor Magenta

} catch {
    Write-Host "Error: $_" -ForegroundColor Red
}

Write-Host "`n🎯 Manual Testing Instructions:" -ForegroundColor Green
Write-Host "1. Open browser to http://localhost:4201/employee/timesheet-entry"
Write-Host "2. Test period type switching (Weekly/Bi-Weekly/Monthly)"
Write-Host "3. Test month/year selection"
Write-Host "4. Test Auto-Fill 8h/day button (should fill weekdays only)"
Write-Host "5. Test Clear All button"
Write-Host "6. Enter some hours and test Save Draft"
Write-Host "7. Test Submit Timesheet functionality"
Write-Host "8. Verify validation (0-24 hours per day)"