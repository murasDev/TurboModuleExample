//
//  NativeDeviceInfoImpl.swift
//  TurboModuleExample
//
//  Created by Murilo Castilho on 31/05/26.
//

import UIKit

@objc public class NativeAppDeviceInfoImpl: NSObject {

    @objc public func getBatteryLevel() -> Float {
        print("[NativeAppDeviceInfoImpl] getBatteryLevel called")
        UIDevice.current.isBatteryMonitoringEnabled = true
        let level = UIDevice.current.batteryLevel
        print("[NativeDeviceInfoImpl] raw batteryLevel = \(level)")
        return level < 0 ? -1 : level * 100
    }

    @objc public func getBatteryState() -> String {
        print("[NativeAppDeviceInfoImpl] getBatteryState called")
        UIDevice.current.isBatteryMonitoringEnabled = true
        switch UIDevice.current.batteryState {
        case .charging:  return "charging"
        case .full:      return "full"
        case .unplugged: return "unplugged"
        default:         return "unknown"
        }
    }

    @objc public func getSystemVersion() -> String {
        let v = UIDevice.current.systemVersion
        print("[NativeAppDeviceInfoImpl] getSystemVersion = \(v)")
        return v
    }

    @objc public func getSystemName() -> String {
        let n = UIDevice.current.systemName
        print("[NativeAppDeviceInfoImpl] getSystemName = \(n)")
        return n
    }
}
