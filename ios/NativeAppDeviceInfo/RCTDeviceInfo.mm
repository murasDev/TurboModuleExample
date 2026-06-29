//
//  RCTDeviceInfo.mm
//  TurboModuleExample
//
//  Created by Murilo Castilho on 31/05/26.
//

#import "RCTDeviceInfo.h"
#import "TurboModuleExample-Swift.h"

@implementation RCTDeviceInfo {
    NativeDeviceInfoImpl *_impl;
}

- (instancetype)init {
    self = [super init];
    _impl = [NativeDeviceInfoImpl new];
    NSLog(@"[RCTDeviceInfo] init called, _impl = %@", _impl);
    return self;
}

- (void)getBatteryLevel:(RCTPromiseResolveBlock)resolve
                 reject:(RCTPromiseRejectBlock)reject {
    NSLog(@"[RCTDeviceInfo] getBatteryLevel called");
    float level = [_impl getBatteryLevel];
    NSLog(@"[RCTDeviceInfo] battery level = %f", level);

    if (level < 0) {
        NSLog(@"[RCTDeviceInfo] rejecting: level < 0");
        reject(@"BATTERY_ERROR", @"Could not get battery level", nil);
        return;
    }

    resolve(@(level));
}

- (void)getBatteryState:(RCTPromiseResolveBlock)resolve
                  reject:(RCTPromiseRejectBlock)reject {
    NSLog(@"[RCTDeviceInfo] getBatteryState called");
    resolve([_impl getBatteryState]);
}

- (NSString *)getSystemVersion {
    NSString *v = [_impl getSystemVersion];
    NSLog(@"[RCTDeviceInfo] getSystemVersion = %@", v);
    return v;
}

- (NSString *)getSystemName {
    NSString *n = [_impl getSystemName];
    NSLog(@"[RCTDeviceInfo] getSystemName = %@", n);
    return n;
}

- (std::shared_ptr<facebook::react::TurboModule>)getTurboModule:
    (const facebook::react::ObjCTurboModule::InitParams &)params {
    NSLog(@"[RCTDeviceInfo] getTurboModule called");
    return std::make_shared<facebook::react::NativeDeviceInfoSpecJSI>(params);
}

@end
