// Minimal browser shim for optional Solana system program import
// Provides the named export expected by upstream libs.
// If executed at runtime, it will throw to indicate unsupported usage.
export function getTransferSolInstruction(..._args: unknown[]): never {
	throw new Error('Solana transfer is not supported in this web build.');
}

// Keep a default export to satisfy any default import patterns.
export default {};


