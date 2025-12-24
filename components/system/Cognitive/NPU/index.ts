/**
 * NPU (Neural Processing Unit) Module
 * 
 * Exports the NPU driver and related types for use throughout the application.
 */

export { NPUDriver, getNPU } from "./NPUDriver";
export * from "./types";
export { WebLLMBackend } from "./backends/WebLLMBackend";
export { PromptAPIBackend } from "./backends/PromptAPIBackend";
