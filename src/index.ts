// Reexport the native module. On web, it will be resolved to KhaltiPaymentSdkModule.web.ts
// and on native platforms to KhaltiPaymentSdkModule.ts
export { default } from "./KhaltiPaymentSdkModule";
export { default as KhaltiPaymentSdkView } from "./KhaltiPaymentSdkView";
export * from "./KhaltiPaymentSdk.types";
