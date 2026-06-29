package com.nativeappdeviceinfo

import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.Promise
import com.nativeappdeviceinfo.NativeAppDeviceInfoSpec
import android.os.BatteryManager
import android.content.Intent
import android.content.IntentFilter
import android.os.Build

class NativeAppDeviceInfoModule(reactContext: ReactApplicationContext) : NativeAppDeviceInfoSpec(reactContext) {

    override fun getName() = NAME

    override fun getBatteryLevel(promise: Promise) {
        val intent = reactApplicationContext.registerReceiver(
            null,
            IntentFilter(Intent.ACTION_BATTERY_CHANGED)
        )
        val level = intent?.getIntExtra(BatteryManager.EXTRA_LEVEL, -1) ?: -1
        val scale = intent?.getIntExtra(BatteryManager.EXTRA_SCALE, -1) ?: -1

        if (level == -1 || scale == -1) {
            promise.reject("BATTERY_ERROR", "Could not get battery level")
            return
        }

        promise.resolve((level.toFloat() / scale.toFloat() * 100).toDouble())
    }

    override fun getBatteryState(promise: Promise) {
        val intent = reactApplicationContext.registerReceiver(
            null,
            IntentFilter(Intent.ACTION_BATTERY_CHANGED)
        )
        val status = intent?.getIntExtra(BatteryManager.EXTRA_STATUS, -1) ?: -1

        val state = when (status) {
            BatteryManager.BATTERY_STATUS_CHARGING -> "charging"
            BatteryManager.BATTERY_STATUS_FULL -> "full"
            BatteryManager.BATTERY_STATUS_DISCHARGING -> "unplugged"
            else -> "unknown"
        }

        promise.resolve(state)
    }

    override fun getSystemVersion(): String {
        return Build.VERSION.RELEASE
    }

    override fun getSystemName(): String {
        return "Android"
    }

    companion object {
        const val NAME = "NativeAppDeviceInfo"
    }
}