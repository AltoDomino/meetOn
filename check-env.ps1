# Write-Host "=== Starting version check ===`n" -ForegroundColor Cyan

# function Safe-Run($label, $script) {
#     Write-Host "`n--- $label ---" -ForegroundColor Yellow
#     try {
#         $result = Invoke-Expression $script
#         if ($null -eq $result -or $result -eq "") {
#             Write-Host "⚠️ No output" -ForegroundColor DarkYellow
#         } else {
#             Write-Host $result
#         }
#     } catch {
#         Write-Host "❌ Error running $label: $($_.Exception.Message)" -ForegroundColor Red
#     }
# }

# Safe-Run "1️⃣ Expo SDK" "npx expo config --json | Select-String sdkVersion"
# Safe-Run "2️⃣ React Native" "npm list react-native"
# Safe-Run "3️⃣ Kotlin Version" "(npx expo config --json | ConvertFrom-Json).plugins | Where-Object { $_[0] -eq 'expo-build-properties' } | ForEach-Object { $_[1].android.kotlinVersion }"
# Safe-Run "4️⃣ Gradle Plugin" "(npx expo config --json | ConvertFrom-Json).plugins | Where-Object { $_[0] -eq 'expo-build-properties' } | ForEach-Object { $_[1].android.gradlePluginVersion }"
# Safe-Run "5️⃣ Gradle Wrapper" "(Get-Content 'android/gradle/wrapper/gradle-wrapper.properties' | Select-String 'distributionUrl').ToString()"
# Safe-Run "6️⃣ Java Version" "java -version 2>&1"

# Write-Host "`n=== Check complete ===" -ForegroundColor Cyan
