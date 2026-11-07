# SnapReels - Android Native App

## Run Locally

**Prerequisites:**  [Android Studio](https://developer.android.com/studio)

1. Open Android Studio
2. Select **Open** and choose the directory containing this project
3. Allow Android Studio to fix any incompatibilities as it imports the project.
4. Remove this line from the app's uild.gradle.kts file: signingConfig = signingConfigs.getByName("debugConfig")
5. Run the app on an emulator or physical device

## Customization

To fully white-label this application for your brand, follow these steps:

### App Name
- Edit pp/src/main/res/values/strings.xml and update <string name="app_name">SnapReels</string>.

### Bundle Identifier / Package Name
- Edit pp/build.gradle.kts and change pplicationId = "com.devsnaplix.snapreels". Also update 
amespace.
- Refactor the package structure in Android Studio (Right-click > Refactor > Rename).

### Colors
- Edit pp/src/main/java/com/example/ui/theme/Color.kt and pp/src/main/res/values/colors.xml to modify the primary, secondary, and background colors.

### Logo and Icon
- Replace the mipmap icons in pp/src/main/res/mipmap-* using the Image Asset Studio in Android Studio.

### Splash Screen
- Edit pp/src/main/res/values/themes.xml and update the SplashTheme styles, or replace the splash drawable in pp/src/main/res/drawable/.

## Third-Party Integrations

### Ad Networks (AdMob & AppLovin)
**WARNING:** AdMob and AppLovin are external services which require separate account setups on their respective platforms. They involve their own revenue-sharing policies. 
Please note that these services are provided by external vendors and may carry their own usage-based costs or specific compliance requirements.

### Cloud and Services
*Note: Integration with external APIs (Firebase, etc.) and other cloud services are provided by external vendors and will incur their own separate usage-based costs.*
