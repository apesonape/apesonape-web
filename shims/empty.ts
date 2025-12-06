// Empty shim for optional modules in browser builds
export default {};
export const noop = () => {};
// Minimal named exports some libs expect from Privy
export const usePrivy = () => ({ user: null, authenticated: false, ready: false });
export const PrivyProvider = ({ children }: { children: any }) => children as any;
// Minimal named exports some libs expect from wagmi (privy wrapper)
export const createConfig = (..._args: any[]) => ({});
export const WagmiProvider = ({ children }: { children: any }) => children as any;
export const useConfig = () => ({});


