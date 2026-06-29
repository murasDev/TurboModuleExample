package com.nativeappdeviceinfo

import com.facebook.react.BaseReactPackage
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.NativeModule
import com.facebook.react.module.model.ReactModuleInfo
import com.facebook.react.module.model.ReactModuleInfoProvider
import com.nativeappdeviceinfo.NativeAppDeviceInfoModule

class NativeAppDeviceInfoPackage : BaseReactPackage() { 

    override fun getModule(name: String, reactContext: ReactApplicationContext): NativeModule? =
        if (name == NativeAppDeviceInfoModule.NAME) NativeAppDeviceInfoModule(reactContext) else null

    override fun getReactModuleInfoProvider() = ReactModuleInfoProvider {
        mapOf(
            NativeAppDeviceInfoModule.NAME to ReactModuleInfo(
                name = NativeAppDeviceInfoModule.NAME,
                className = NativeAppDeviceInfoModule.NAME,
                canOverrideExistingModule = false,
                needsEagerInit = false,
                isCxxModule = false,
                isTurboModule = true
            )
        )
    }
}