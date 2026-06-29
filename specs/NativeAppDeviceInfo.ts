import type { TurboModule } from 'react-native';
import { TurboModuleRegistry } from 'react-native';

export interface Spec extends TurboModule {
  getBatteryLevel(): Promise<number>;
  getBatteryState(): Promise<string>;
  getSystemVersion(): string;
  getSystemName(): string;
}

export default TurboModuleRegistry.getEnforcing<Spec>('NativeAppDeviceInfo');
