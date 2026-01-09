# create-test-data.ps1
Write-Host "🚀 Creating Test Data for DonateHub" -ForegroundColor Cyan
Write-Host "="*50

# 1. Login
Write-Host "`n1️⃣ Logging in..." -ForegroundColor Yellow
try {
    $loginResponse = Invoke-RestMethod -Uri "http://localhost:5000/api/auth/login" `
        -Method Post `
        -ContentType "application/json" `
        -Body '{"email":"admin@donatehub.com","password":"admin123"}' `
        -ErrorAction Stop
    
    $token = $loginResponse.token
    Write-Host "   ✅ Logged in as: $($loginResponse.user.email)" -ForegroundColor Green
    Write-Host "   Role: $($loginResponse.user.role)" -ForegroundColor Yellow
} catch {
    Write-Host "   ❌ Login failed: $_" -ForegroundColor Red
    exit
}

# 2. Create Donation
Write-Host "`n2️⃣ Creating Blood Donation..." -ForegroundColor Yellow
try {
    $donationBody = @{
        type = "blood"
        title = "Blood Donation Camp"
        description = "Weekly blood donation camp at City Hospital"
        quantity = 1
        location = "New York, NY"
        bloodType = "O+"
        lastDonation = "2024-01-01"
    } | ConvertTo-Json
    
    $donationResponse = Invoke-RestMethod -Uri "http://localhost:5000/api/donations" `
        -Method Post `
        -Headers @{
            "Authorization" = "Bearer $token"
            "Content-Type" = "application/json"
        } `
        -Body $donationBody `
        -ErrorAction Stop
    
    Write-Host "   ✅ Donation created!" -ForegroundColor Green
    Write-Host "   Title: $($donationResponse.donation.title)" -ForegroundColor White
    Write-Host "   Type: $($donationResponse.donation.type)" -ForegroundColor White
    Write-Host "   Location: $($donationResponse.donation.location)" -ForegroundColor White
} catch {
    Write-Host "   ❌ Failed to create donation: $_" -ForegroundColor Red
}

# 3. Create Item
Write-Host "`n3️⃣ Creating Item Listing..." -ForegroundColor Yellow
try {
    $itemBody = @{
        title = "Winter Jacket"
        description = "Warm winter jacket in excellent condition"
        category = "clothing"
        price = 0
        isFree = $true
        condition = "like-new"
        quantity = 1
        location = "Chicago, IL"
    } | ConvertTo-Json
    
    $itemResponse = Invoke-RestMethod -Uri "http://localhost:5000/api/items" `
        -Method Post `
        -Headers @{
            "Authorization" = "Bearer $token"
            "Content-Type" = "application/json"
        } `
        -Body $itemBody `
        -ErrorAction Stop
    
    Write-Host "   ✅ Item created!" -ForegroundColor Green
    Write-Host "   Title: $($itemResponse.item.title)" -ForegroundColor White
    Write-Host "   Price: $(if($itemResponse.item.isFree){'FREE'}else{'$'+$itemResponse.item.price})" -ForegroundColor White
    Write-Host "   Location: $($itemResponse.item.location)" -ForegroundColor White
} catch {
    Write-Host "   ❌ Failed to create item: $_" -ForegroundColor Red
}

# 4. Create More Test Data
Write-Host "`n4️⃣ Creating Additional Test Data..." -ForegroundColor Yellow

# Another donation
try {
    $donation2Body = @{
        type = "food"
        title = "Food Drive for Homeless"
        description = "Non-perishable food items collection"
        quantity = 100
        location = "Los Angeles, CA"
        foodType = "Non-perishable"
    } | ConvertTo-Json
    
    # ⚠ FIX: Output not needed → send to $null
    $null = Invoke-RestMethod -Uri "http://localhost:5000/api/donations" `
        -Method Post `
        -Headers @{
            "Authorization" = "Bearer $token"
            "Content-Type" = "application/json"
        } `
        -Body $donation2Body
    
    Write-Host "   ✅ Food donation created" -ForegroundColor Green
} catch {
    Write-Host "   ⚠️ Could not create food donation" -ForegroundColor Yellow
}

# Another item
try {
    $item2Body = @{
        title = "Mathematics Tutor"
        description = "Online math tutoring for high school students"
        category = "services"
        price = 15
        condition = "new"
        quantity = 1
        location = "Online"
    } | ConvertTo-Json
    
    # ⚠ FIX: Output not needed → send to $null
    $null = Invoke-RestMethod -Uri "http://localhost:5000/api/items" `
        -Method Post `
        -Headers @{
            "Authorization" = "Bearer $token"
            "Content-Type" = "application/json"
        } `
        -Body $item2Body
    
    Write-Host "   ✅ Service listing created" -ForegroundColor Green
} catch {
    Write-Host "   ⚠️ Could not create service listing" -ForegroundColor Yellow
}

Write-Host "`n🎉 Test Data Creation Complete!" -ForegroundColor Green
Write-Host "="*50
Write-Host "`n📊 Check your application:" -ForegroundColor Cyan
Write-Host "   Frontend: http://localhost:3000" -ForegroundColor White
Write-Host "   Listings: http://localhost:3000/listings" -ForegroundColor White
Write-Host "   Admin Panel: http://localhost:3000/admin" -ForegroundColor White
Write-Host "`n🔄 Refresh your browser to see new data!" -ForegroundColor Yellow
