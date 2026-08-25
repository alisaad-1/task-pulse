import UIKit
import Capacitor
import WebKit

// Helper class to remove the empty keyboard accessory bar above iOS keyboard in WKWebView
class KeyboardAccessoryBarRemover: NSObject {
    static func remove() {
        guard let targetClass = NSClassFromString("WKContentView") else { return }
        
        let originalMethod = class_getInstanceMethod(targetClass, #selector(getter: UIResponder.inputAccessoryView))
        let swizzledMethod = class_getInstanceMethod(KeyboardAccessoryBarRemover.self, #selector(getter: KeyboardAccessoryBarRemover.customInputAccessoryView))
        
        if let originalMethod = originalMethod, let swizzledMethod = swizzledMethod {
            method_exchangeImplementations(originalMethod, swizzledMethod)
        }
    }
    
    @objc dynamic var customInputAccessoryView: UIView? {
        return nil
    }
}

@UIApplicationMain
class AppDelegate: UIResponder, UIApplicationDelegate {

    var window: UIWindow?

    func application(_ application: UIApplication, didFinishLaunchingWithOptions launchOptions: [UIApplication.LaunchOptionsKey: Any]?) -> Bool {
        // Remove empty keyboard accessory bar above keyboard
        KeyboardAccessoryBarRemover.remove()
        return true
    }

    func applicationWillResignActive(_ application: UIApplication) {
    }

    func applicationDidEnterBackground(_ application: UIApplication) {
    }

    func applicationWillEnterForeground(_ application: UIApplication) {
    }

    func applicationDidBecomeActive(_ application: UIApplication) {
    }

    func applicationWillTerminate(_ application: UIApplication) {
    }

    func application(_ application: UIApplication,
                     configurationForConnecting connectingSceneSession: UISceneSession,
                     options: UIScene.ConnectionOptions) -> UISceneConfiguration {
        let config = UISceneConfiguration(name: "Default Configuration",
                                          sessionRole: connectingSceneSession.role)
        config.delegateClass = SceneDelegate.self
        return config
    }
}
