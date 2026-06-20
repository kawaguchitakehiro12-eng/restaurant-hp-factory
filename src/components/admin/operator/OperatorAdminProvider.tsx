"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { getStoreBySlug } from "@/data/stores";
import { initialDemoCustomers, initialDemoSites } from "@/data/admin/demo-mock";
import {
  convertDemoToContract,
  createDemoSiteFromForm,
  markDemoAsLost,
} from "@/lib/admin/demo-create";
import {
  isReservedSlug,
  loadDemoSitesFromStorage,
  saveDemoSitesToStorage,
} from "@/lib/stores/demo-site-registry";
import type { CustomerAccount } from "@/types/admin";
import type {
  ConvertToContractForm,
  ConvertToContractResult,
  CreateDemoSiteResult,
  DemoSite,
  DemoSiteFormInput,
} from "@/types/demo";

type OperatorAdminContextValue = {
  demoSites: DemoSite[];
  customers: CustomerAccount[];
  demoModalOpen: boolean;
  convertModalDemoId: string | null;
  openDemoModal: () => void;
  closeDemoModal: () => void;
  openConvertModal: (demoSiteId: string) => void;
  closeConvertModal: () => void;
  addDemoSite: (input: DemoSiteFormInput) => CreateDemoSiteResult;
  convertToContract: (
    demoSiteId: string,
    form: ConvertToContractForm
  ) => ConvertToContractResult;
  markAsLost: (demoSiteId: string) => void;
  isSlugTaken: (slug: string, excludeDemoId?: string) => boolean;
  getDemoSite: (id: string) => DemoSite | undefined;
  getDemoSiteBySlug: (slug: string) => DemoSite | undefined;
  saveDemoSite: (updated: DemoSite) => void;
  deleteDemoSite: (demoSiteId: string) => void;
};

const OperatorAdminContext = createContext<OperatorAdminContextValue | null>(null);

export function OperatorAdminProvider({ children }: { children: ReactNode }) {
  const [demoSites, setDemoSites] = useState<DemoSite[]>(initialDemoSites);
  const [customers, setCustomers] = useState<CustomerAccount[]>(initialDemoCustomers);
  const [demoModalOpen, setDemoModalOpen] = useState(false);
  const [convertModalDemoId, setConvertModalDemoId] = useState<string | null>(null);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    setDemoSites(loadDemoSitesFromStorage(initialDemoSites));
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    saveDemoSitesToStorage(demoSites);
  }, [demoSites, hydrated]);

  const isSlugTaken = useCallback(
    (slug: string, excludeDemoId?: string) => {
      const normalized = slug.toLowerCase();
      if (isReservedSlug(normalized)) return true;
      if (getStoreBySlug(normalized)) return true;
      return demoSites.some(
        (d) =>
          d.storeSlug.toLowerCase() === normalized &&
          d.id !== excludeDemoId
      );
    },
    [demoSites]
  );

  const getDemoSiteBySlug = useCallback(
    (slug: string) =>
      demoSites.find((d) => d.storeSlug.toLowerCase() === slug.toLowerCase()),
    [demoSites]
  );

  const saveDemoSite = useCallback((updated: DemoSite) => {
    setDemoSites((prev) =>
      prev.map((d) => (d.id === updated.id ? { ...updated, isNewlyCreated: false } : d))
    );
  }, []);

  const getDemoSite = useCallback(
    (id: string) => demoSites.find((d) => d.id === id),
    [demoSites]
  );

  const addDemoSite = useCallback((input: DemoSiteFormInput): CreateDemoSiteResult => {
    const { demoSite, result } = createDemoSiteFromForm(input);
    setDemoSites((prev) => [demoSite, ...prev]);
    return result;
  }, []);

  const convertToContract = useCallback(
    (demoSiteId: string, form: ConvertToContractForm): ConvertToContractResult => {
      const target = demoSites.find((d) => d.id === demoSiteId);
      if (!target) throw new Error("Demo site not found");

      const { demoSite, customer, result } = convertDemoToContract(target, form);
      setDemoSites((prev) => prev.map((d) => (d.id === demoSiteId ? demoSite : d)));

      setCustomers((prev) => {
        const exists = prev.some((c) => c.id === customer.id);
        if (exists) {
          return prev.map((c) => (c.id === customer.id ? customer : c));
        }
        return [customer, ...prev];
      });

      return result;
    },
    [demoSites]
  );

  const markAsLost = useCallback((demoSiteId: string) => {
    setDemoSites((prev) =>
      prev.map((d) => (d.id === demoSiteId ? markDemoAsLost(d) : d))
    );
  }, []);

  const deleteDemoSite = useCallback((demoSiteId: string) => {
    setDemoSites((prev) => {
      const target = prev.find((d) => d.id === demoSiteId);
      if (target?.customerId) {
        setCustomers((customers) =>
          customers.filter((c) => c.id !== target.customerId)
        );
      }
      return prev.filter((d) => d.id !== demoSiteId);
    });
  }, []);

  const value = useMemo(
    () => ({
      demoSites,
      customers,
      demoModalOpen,
      convertModalDemoId,
      openDemoModal: () => setDemoModalOpen(true),
      closeDemoModal: () => setDemoModalOpen(false),
      openConvertModal: (demoSiteId: string) => setConvertModalDemoId(demoSiteId),
      closeConvertModal: () => setConvertModalDemoId(null),
      addDemoSite,
      convertToContract,
      markAsLost,
      isSlugTaken,
      getDemoSite,
      getDemoSiteBySlug,
      saveDemoSite,
      deleteDemoSite,
    }),
    [
      demoSites,
      customers,
      demoModalOpen,
      convertModalDemoId,
      addDemoSite,
      convertToContract,
      markAsLost,
      isSlugTaken,
      getDemoSite,
      getDemoSiteBySlug,
      saveDemoSite,
      deleteDemoSite,
    ]
  );

  return (
    <OperatorAdminContext.Provider value={value}>{children}</OperatorAdminContext.Provider>
  );
}

export function useOperatorAdmin(): OperatorAdminContextValue {
  const ctx = useContext(OperatorAdminContext);
  if (!ctx) {
    throw new Error("useOperatorAdmin must be used within OperatorAdminProvider");
  }
  return ctx;
}
