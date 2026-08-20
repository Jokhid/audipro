import { createContext } from "react";

export interface VerificationContextType {
  verifiedZeros: Record<string, boolean>;
  toggleVerifiedZero: (label: string) => void;
  clearVerifiedZero: (label: string) => void;
}

export const VerificationContext = createContext<VerificationContextType>({
  verifiedZeros: {},
  toggleVerifiedZero: () => {},
  clearVerifiedZero: () => {},
});
