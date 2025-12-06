// Shim for @privy-io/react-auth to satisfy imports when not using Privy
export const usePrivy = () => ({ user: null, authenticated: false, ready: false });
export const useCrossAppAccounts = () => ({ accounts: [], loading: false });
export const useWallets = () => ({ wallets: [], loading: false });
export const PrivyProvider = ({ children }: { children: any }) => children as any;
export default {};
export const noop = () => {};


