Write-Host "Naprawa i przebudowa projektu Expo (Android)...`n"

# 1️⃣ Usuń cache Gradle
Write-Host "Czyszczenie cache Gradle..."
Remove-Item -Recurse -Force "$env:USERPROFILE\.gradle\caches" -ErrorAction SilentlyContinue
Remove-Item -Recurse -Force "$env:USERPROFILE\.gradle\daemon" -ErrorAction SilentlyContinue
Remove-Item -Recurse -Force "$env:USERPROFILE\.gradle\buildOutputCleanup" -ErrorAction SilentlyContinue
Remove-Item -Recurse -Force "$env:USERPROFILE\.gradle\notifications" -ErrorAction SilentlyContinue

# 2️⃣ Nadpisz gradle.properties
Write-Host "Nadpisywanie gradle.properties..."
@"
org.gradle.jvmargs=-Xmx4096m -Dkotlin.daemon.jvm.options=-Xmx2048m
org.gradle.parallel=true
android.useAndroidX=true
android.enablePngCrunchInReleaseBuilds=true
reactNativeArchitectures=armeabi-v7a,arm64-v8a,x86,x86_64
newArchEnabled=true
hermesEnabled=true
edgeToEdgeEnabled=true
expo.gif.enabled=true
expo.webp.enabled=true
expo.webp.animated=false
EX_DEV_CLIENT_NETWORK_INSPECTOR=true
expo.useLegacyPackaging=false
expo.edgeToEdgeEnabled=true
android.minSdkVersion=24
android.compileSdkVersion=35
android.targetSdkVersion=35
android.buildToolsVersion=36.0.0
android.kotlinVersion=1.9.24
kotlin.code.style=official
kotlin.incremental=true
"@ | Set-Content "android/gradle.properties" -Encoding UTF8

# 3️⃣ Nadpisz główny build.gradle
Write-Host "Nadpisywanie android/build.gradle..."
@"
buildscript {
    ext {
        kotlinVersion = '1.9.24'
    }
    repositories {
        google()
        mavenCentral()
    }
    dependencies {
        classpath('com.android.tools.build:gradle:8.5.2')
        classpath('com.facebook.react:react-native-gradle-plugin')
        classpath("org.jetbrains.kotlin:kotlin-gradle-plugin:1.9.24")
    }
}

allprojects {
    repositories {
        google()
        mavenCentral()
        maven { url 'https://www.jitpack.io' }
    }
}

apply plugin: "expo-root-project"
apply plugin: "com.facebook.react.rootproject"
"@ | Set-Content "android/build.gradle" -Encoding UTF8

# 4️⃣ Czyszczenie projektu
Write-Host "Uruchamianie gradlew clean..."
Set-Location "android"
./gradlew clean
Set-Location ".."

# 5️⃣ Prebuild i uruchomienie
Write-Host "Expo prebuild + build..."
npx expo prebuild --clean
npx expo run:android
