//
//  RCTTMDeviceInfo.mm
//  TurboModuleExample
//

#import "RCTNativeAppDeviceInfo.h"
#import "TurboModuleExample-Swift.h"

@implementation RCTNativeAppDeviceInfo {
    NativeAppDeviceInfoImpl *_impl;
}

RCT_EXPORT_MODULE(NativeDeviceInfo)

- (instancetype)init {
    self = [super init];
    _impl = [NativeAppDeviceInfoImpl new];
    NSLog(@"[RCTNativeAppMDeviceInfo] init called, _impl = %@", _impl);
    return self;
}

- (void)getBatteryLevel:(RCTPromiseResolveBlock)resolve
                 reject:(RCTPromiseRejectBlock)reject {
    NSLog(@"[RCTNativeAppMDeviceInfo] getBatteryLevel called");
    float level = [_impl getBatteryLevel];
    NSLog(@"[RCTNativeAppMDeviceInfo] battery level = %f", level);

    if (level < 0) {
        reject(@"BATTERY_ERROR", @"Could not get battery level", nil);
        return;
    }

    resolve(@(level));
}

- (void)getBatteryState:(RCTPromiseResolveBlock)resolve
                  reject:(RCTPromiseRejectBlock)reject {
    NSLog(@"[RCTNativeAppMDeviceInfo] getBatteryState called");
    resolve([_impl getBatteryState]);
}

- (NSString *)getSystemVersion {
    NSString *v = [_impl getSystemVersion];
    NSLog(@"[RCTNativeAppMDeviceInfo] getSystemVersion = %@", v);
    return v;
}

- (NSString *)getSystemName {
    NSString *n = [_impl getSystemName];
    NSLog(@"[RCTNativeAppMDeviceInfo] getSystemName = %@", n);
    return n;
}

- (std::shared_ptr<facebook::react::TurboModule>)getTurboModule:
    (const facebook::react::ObjCTurboModule::InitParams &)params {
    NSLog(@"[RCTNativeAppMDeviceInfo] getTurboModule called");
    return std::make_shared<facebook::react::NativeAppDeviceInfoSpecJSI>(params);
}

@end
