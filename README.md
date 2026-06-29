# TurboModuleExample

Projeto de estudo de **Turbo Modules** na **Nova Arquitetura** do React Native.

A ideia é simples e proposital: implementar, do zero, um módulo nativo de _device info_ (`NativeAppDeviceInfo`) e atravessar **cada camada** que um Turbo Module envolve — da spec em TypeScript ao código nativo em Kotlin (Android) e Swift/Objective-C++ (iOS), passando pelo **Codegen**.

> 📖 Este repositório é o código que acompanha o artigo:
> **[Turbo Modules na Nova Arquitetura do React Native — entendendo cada camada na prática](https://medium.com/@murilo.castilho21/turbo-modules-na-nova-arquitetura-do-react-native-entendendo-cada-camada-na-pr%C3%A1tica-aee48b2d2dea)**

---

## O que o módulo faz

O módulo expõe quatro métodos, escolhidos de propósito para cobrir os **dois modos de chamada** de um Turbo Module — assíncrono (via `Promise`) e síncrono (retorno direto):

| Método               | Assinatura        | Modo       | Fonte nativa                              |
| -------------------- | ----------------- | ---------- | ----------------------------------------- |
| `getBatteryLevel()`  | `Promise<number>` | Assíncrono | iOS `UIDevice` · Android `BatteryManager` |
| `getBatteryState()`  | `Promise<string>` | Assíncrono | iOS `UIDevice` · Android `BatteryManager` |
| `getSystemVersion()` | `string`          | Síncrono   | iOS `UIDevice` · Android `Build`          |
| `getSystemName()`    | `string`          | Síncrono   | iOS `UIDevice` · Android (`"Android"`)    |

O app de exemplo (`App.tsx`) renderiza esses valores em cards, separando visualmente os blocos **ASYNC** e **SYNC**, com um botão de _refresh_.

---

## Por que Turbo Module (e não o bridge antigo)

Na arquitetura antiga, módulos nativos eram registrados em runtime e toda comunicação JS ⇄ nativo passava por um **bridge** assíncrono, serializando tudo em JSON. Isso impedia chamadas síncronas e adicionava overhead.

Turbo Modules, na Nova Arquitetura, mudam isso:

- **Lazy loading** — o módulo só é instanciado quando é usado pela primeira vez.
- **JSI (JavaScript Interface)** — o JS chama o código nativo **diretamente**, sem o bridge JSON. Isso viabiliza métodos **síncronos** (como `getSystemVersion()` aqui).
- **Type safety via Codegen** — a interface é declarada uma única vez em TypeScript e o **Codegen** gera o "contrato" nativo (C++/Java/ObjC) a partir dela, garantindo que JS e nativo nunca saiam de sincronia.

---

## As camadas, na prática

O fluxo de uma chamada (`NativeDeviceInfo.getBatteryLevel()`) atravessa:

```
App.tsx (JS/TS)
   │
   ▼
specs/NativeAppDeviceInfo.ts          ← a SPEC (contrato em TypeScript)
   │
   ▼  (Codegen lê o codegenConfig do package.json)
Interfaces nativas geradas
   ├── Android: NativeAppDeviceInfoSpec (Kotlin/Java)
   └── iOS:     NativeAppDeviceInfoSpec / ...SpecJSI (C++/ObjC)
   │
   ▼
Implementação nativa
   ├── Android: NativeAppDeviceInfoModule.kt
   └── iOS:     RCTNativeAppDeviceInfo.mm  →  NativeAppDeviceInfoImpl.swift
   │
   ▼
Registro
   ├── Android: NativeAppDeviceInfoPackage.kt + MainApplication.kt
   └── iOS:     RCT_EXPORT_MODULE + codegenConfig.ios.modulesProvider
```

### 1. A Spec (TypeScript) — `specs/NativeAppDeviceInfo.ts`

É a **fonte da verdade**. Estende `TurboModule` e é registrada com `TurboModuleRegistry.getEnforcing`. O Codegen usa este arquivo para gerar o contrato nativo.

```ts
import type { TurboModule } from 'react-native';
import { TurboModuleRegistry } from 'react-native';

export interface Spec extends TurboModule {
  getBatteryLevel(): Promise<number>;
  getBatteryState(): Promise<string>;
  getSystemVersion(): string;
  getSystemName(): string;
}

export default TurboModuleRegistry.getEnforcing<Spec>('NativeAppDeviceInfo');
```

> Convenção: o arquivo precisa começar com o prefixo `Native` para o Codegen reconhecê-lo como spec de Turbo Module.

### 2. Codegen — `package.json`

O `codegenConfig` diz ao Codegen **onde** estão as specs e **como** nomear/empacotar o código gerado:

```json
"codegenConfig": {
  "name": "NativeAppDeviceInfo",
  "type": "modules",
  "jsSrcsDir": "specs",
  "android": { "javaPackageName": "com.nativeappdeviceinfo" },
  "ios": {
    "modulesProvider": { "NativeAppDeviceInfo": "RCTNativeAppDeviceInfo" }
  }
}
```

O Codegen roda automaticamente durante o build (Gradle no Android, `pod install` no iOS) e produz as classes de spec que a implementação nativa irá estender.

### 3. Implementação Android (Kotlin)

- **`NativeAppDeviceInfoModule.kt`** — estende `NativeAppDeviceInfoSpec` (gerada pelo Codegen) e implementa os métodos. Métodos assíncronos recebem um `Promise`; síncronos retornam direto.
- **`NativeAppDeviceInfoPackage.kt`** — um `BaseReactPackage` que registra o módulo e marca `isTurboModule = true` no `ReactModuleInfo`.
- **`MainApplication.kt`** — adiciona o package à lista: `add(NativeAppDeviceInfoPackage())`.

### 4. Implementação iOS (Swift + Objective-C++)

A lógica de negócio fica em Swift, e a ponte com o React Native fica em ObjC++:

- **`NativeAppDeviceInfoImpl.swift`** — a implementação pura (`@objc public class`), usando `UIDevice`.
- **`RCTNativeAppDeviceInfo.h/.mm`** — conforma com `NativeAppDeviceInfoSpec`, instancia o `Impl` em Swift, faz `RCT_EXPORT_MODULE` e fornece o `getTurboModule:` retornando o `NativeAppDeviceInfoSpecJSI`.
- O `modulesProvider` no `codegenConfig` aponta o nome `NativeAppDeviceInfo` para a classe `RCTNativeAppDeviceInfo`.

> ℹ️ Os arquivos `RCTDeviceInfo.h/.mm` são código **legado** de uma iteração anterior (referenciam classes que não existem mais). O par ativo é `RCTNativeAppDeviceInfo`.

---

## Estrutura do projeto

```
TurboModuleExample/
├── specs/
│   └── NativeAppDeviceInfo.ts            # 1. Spec (contrato TS)
├── App.tsx                               # App de exemplo (ícones lucide)
├── AppSimple.tsx                         # Variante do app usando emojis
├── package.json                          # codegenConfig
│
├── android/app/src/main/java/
│   └── com/nativeappdeviceinfo/
│       ├── NativeAppDeviceInfoModule.kt  # 3. Implementação Kotlin
│       └── NativeAppDeviceInfoPackage.kt #    Registro do package
│   └── com/turbomoduleexample/
│       └── MainApplication.kt            #    add(NativeAppDeviceInfoPackage())
│
└── ios/NativeAppDeviceInfo/
    ├── NativeAppDeviceInfoImpl.swift     # 4. Lógica em Swift
    ├── RCTNativeAppDeviceInfo.h/.mm      #    Ponte ObjC++ (ativa)
    └── RCTDeviceInfo.h/.mm               #    (legado)
```

---

## Stack

- **React Native** 0.85.3 (Nova Arquitetura — `newArchEnabled=true`)
- **React** 19.2
- **Android:** Kotlin
- **iOS:** Swift + Objective-C++
- **UI:** `lucide-react-native`, `react-native-svg`, `react-native-safe-area-context`

---

## Como rodar

> Antes de tudo, conclua o guia oficial de [Set Up Your Environment](https://reactnative.dev/docs/set-up-your-environment).

### 1. Instalar dependências

```sh
npm install
```

### 2. Iniciar o Metro

```sh
npm start
```

### 3. Build e execução

**Android:**

```sh
npm run android
```

**iOS** (na primeira vez, e sempre que mudar deps nativas, instale os Pods — isso também dispara o Codegen):

```sh
bundle install          # apenas na primeira vez
bundle exec pod install
npm run ios
```

> 💡 Bateria é melhor testada em **dispositivo físico** — simulador/emulador costuma reportar nível/estado fixos ou indisponíveis.

### Rebuild após mexer na spec

Sempre que alterar `specs/NativeAppDeviceInfo.ts`, é preciso **regenerar o código** e recompilar o app nativo:

- **iOS:** `bundle exec pod install` e rebuild
- **Android:** rebuild pelo Gradle (`npm run android`)

---

## Testes

```sh
npm test
```

---

## Referência

Artigo completo, com o passo a passo e a explicação de cada camada:

**[Turbo Modules na Nova Arquitetura do React Native — entendendo cada camada na prática](https://medium.com/@murilo.castilho21/turbo-modules-na-nova-arquitetura-do-react-native-entendendo-cada-camada-na-pr%C3%A1tica-aee48b2d2dea)** — por Murilo Castilho.

Outras referências úteis:

- [Native Modules — The New Architecture (docs oficiais)](https://reactnative.dev/docs/the-new-architecture/pure-cxx-modules)
- [Codegen](https://reactnative.dev/docs/the-new-architecture/what-is-codegen)
