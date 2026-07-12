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
import { PublishSiteError, publishDemoSite } from "@/lib/admin/demo-publish";
import {
  createDemoSiteViaApi,
  deleteCustomerViaApi,
  deleteDemoSiteViaApi,
  fetchCustomersFromApi,
  fetchDemoSitesFromApi,
  isSupabaseConfigured,
  updateDemoSiteViaApi,
  upsertCustomerViaApi,
} from "@/lib/data/site-data-client";
import {
  isReservedSlug,
  loadDemoSitesFromStorage,
  saveDemoSitesToStorage,
} from "@/lib/stores/demo-site-registry";
import {
  loadCustomersFromStorage,
  saveCustomersToStorage,
} from "@/lib/stores/customer-registry";
import type { CustomerAccount } from "@/types/admin";
import type {
  ConvertToContractForm,
  ConvertToContractResult,
  CreateDemoSiteResult,
  DemoSite,
  DemoSiteFormInput,
  PublishSiteForm,
  PublishSiteResult,
} from "@/types/demo";

type OperatorAdminContextValue = {
  demoSites: DemoSite[];
  customers: CustomerAccount[];
  demoModalOpen: boolean;
  publishModalDemoId: string | null;
  convertModalDemoId: string | null;
  shareModalDemoId: string | null;
  shareDataVersion: number;
  openDemoModal: () => void;
  closeDemoModal: () => void;
  openPublishModal: (demoSiteId: string) => void;
  closePublishModal: () => void;
  openConvertModal: (demoSiteId: string) => void;
  closeConvertModal: () => void;
  openShareModal: (demoSiteId: string) => void;
  closeShareModal: () => void;
  refreshShareData: () => void;
  addDemoSite: (input: DemoSiteFormInput) => CreateDemoSiteResult;
  publishSite: (demoSiteId: string, form: PublishSiteForm) => PublishSiteResult;
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
  const [publishModalDemoId, setPublishModalDemoId] = useState<string | null>(null);
  const [convertModalDemoId, setConvertModalDemoId] = useState<string | null>(null);
  const [shareModalDemoId, setShareModalDemoId] = useState<string | null>(null);
  const [shareDataVersion, setShareDataVersion] = useState(0);
  const [hydrated, setHydrated] = useState(false);
  const useRemote = isSupabaseConfigured();

  useEffect(() => {
    let cancelled = false;

    async function hydrate() {
      if (useRemote) {
        try {
          const [sites, customerList] = await Promise.all([
            fetchDemoSitesFromApi(),
            fetchCustomersFromApi(),
          ]);
          if (!cancelled) {
            setDemoSites(sites.length > 0 ? sites : initialDemoSites);
            setCustomers(customerList);
          }
        } catch (error) {
          console.error("[OperatorAdminProvider] Supabase load failed, using localStorage", error);
          if (!cancelled) {
            setDemoSites(loadDemoSitesFromStorage(initialDemoSites));
            setCustomers(loadCustomersFromStorage(initialDemoCustomers));
          }
        }
      } else {
        setDemoSites(loadDemoSitesFromStorage(initialDemoSites));
        setCustomers(loadCustomersFromStorage(initialDemoCustomers));
      }
      if (!cancelled) setHydrated(true);
    }

    void hydrate();
    return () => {
      cancelled = true;
    };
  }, [useRemote]);

  useEffect(() => {
    if (!hydrated || useRemote) return;
    saveDemoSitesToStorage(demoSites);
  }, [demoSites, hydrated, useRemote]);

  useEffect(() => {
    if (!hydrated || useRemote) return;
    saveCustomersToStorage(customers);
  }, [customers, hydrated, useRemote]);

  const persistDemoSite = useCallback(
    (site: DemoSite) => {
      if (!useRemote) return;
      void updateDemoSiteViaApi(site).catch((error) => {
        console.error("[OperatorAdminProvider] Failed to persist demo site", error);
      });
    },
    [useRemote]
  );

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

  const saveDemoSite = useCallback(
    (updated: DemoSite) => {
      const normalized = { ...updated, isNewlyCreated: false };
      setDemoSites((prev) =>
        prev.map((d) => (d.id === normalized.id ? normalized : d))
      );
      persistDemoSite(normalized);
    },
    [persistDemoSite]
  );

  const getDemoSite = useCallback(
    (id: string) => demoSites.find((d) => d.id === id),
    [demoSites]
  );

  const addDemoSite = useCallback(
    (input: DemoSiteFormInput): CreateDemoSiteResult => {
      const { demoSite, result } = createDemoSiteFromForm(input);
      setDemoSites((prev) => [demoSite, ...prev]);
      if (useRemote) {
        void createDemoSiteViaApi(demoSite).catch((error) => {
          console.error("[OperatorAdminProvider] Failed to create demo site", error);
        });
      }
      return result;
    },
    [useRemote]
  );

  const upsertCustomer = useCallback(
    (customer: CustomerAccount, initialPassword?: string) => {
      setCustomers((prev) => {
        const exists = prev.some((c) => c.id === customer.id);
        if (exists) {
          return prev.map((c) => (c.id === customer.id ? customer : c));
        }
        return [customer, ...prev];
      });
      if (useRemote) {
        void upsertCustomerViaApi(customer, initialPassword).catch((error) => {
          console.error("[OperatorAdminProvider] Failed to persist customer", error);
        });
      }
    },
    [useRemote]
  );

  const publishSite = useCallback(
    (demoSiteId: string, form: PublishSiteForm): PublishSiteResult => {
      const target = demoSites.find((d) => d.id === demoSiteId);
      if (!target) throw new PublishSiteError("案件が見つかりません");

      const normalizedSlug = form.storeSlug.trim().toLowerCase();
      if (isSlugTaken(normalizedSlug, demoSiteId)) {
        throw new PublishSiteError(
          "このURLはすでに使用されています",
          "storeSlug"
        );
      }

      const { demoSite, customer, result } = publishDemoSite(target, {
        ...form,
        storeSlug: normalizedSlug,
      });

      setDemoSites((prev) => prev.map((d) => (d.id === demoSiteId ? demoSite : d)));
      upsertCustomer(customer, demoSite.initialPassword);
      persistDemoSite(demoSite);

      return result;
    },
    [demoSites, isSlugTaken, persistDemoSite, upsertCustomer]
  );

  const convertToContract = useCallback(
    (demoSiteId: string, form: ConvertToContractForm): ConvertToContractResult => {
      const target = demoSites.find((d) => d.id === demoSiteId);
      if (!target) throw new Error("Demo site not found");

      const { demoSite, customer, result } = convertDemoToContract(target, form);
      setDemoSites((prev) => prev.map((d) => (d.id === demoSiteId ? demoSite : d)));
      upsertCustomer(customer, demoSite.initialPassword);
      persistDemoSite(demoSite);

      return result;
    },
    [demoSites, persistDemoSite, upsertCustomer]
  );

  const markAsLost = useCallback(
    (demoSiteId: string) => {
      setDemoSites((prev) =>
        prev.map((d) => {
          if (d.id !== demoSiteId) return d;
          const lost = markDemoAsLost(d);
          persistDemoSite(lost);
          return lost;
        })
      );
    },
    [persistDemoSite]
  );

  const deleteDemoSite = useCallback(
    (demoSiteId: string) => {
      setDemoSites((prev) => {
        const target = prev.find((d) => d.id === demoSiteId);
        if (target?.customerId) {
          setCustomers((customerList) =>
            customerList.filter((c) => c.id !== target.customerId)
          );
          if (useRemote && target.customerId) {
            void deleteCustomerViaApi(target.customerId).catch((error) => {
              console.error("[OperatorAdminProvider] Failed to delete customer", error);
            });
          }
        }
        return prev.filter((d) => d.id !== demoSiteId);
      });
      if (useRemote) {
        void deleteDemoSiteViaApi(demoSiteId).catch((error) => {
          console.error("[OperatorAdminProvider] Failed to delete demo site", error);
        });
      }
    },
    [useRemote]
  );

  const value = useMemo(
    () => ({
      demoSites,
      customers,
      demoModalOpen,
      publishModalDemoId,
      convertModalDemoId,
      shareModalDemoId,
      shareDataVersion,
      openDemoModal: () => setDemoModalOpen(true),
      closeDemoModal: () => setDemoModalOpen(false),
      openPublishModal: (demoSiteId: string) => setPublishModalDemoId(demoSiteId),
      closePublishModal: () => setPublishModalDemoId(null),
      openConvertModal: (demoSiteId: string) => setConvertModalDemoId(demoSiteId),
      closeConvertModal: () => setConvertModalDemoId(null),
      openShareModal: (demoSiteId: string) => setShareModalDemoId(demoSiteId),
      closeShareModal: () => setShareModalDemoId(null),
      refreshShareData: () => setShareDataVersion((v) => v + 1),
      addDemoSite,
      publishSite,
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
      publishModalDemoId,
      convertModalDemoId,
      shareModalDemoId,
      shareDataVersion,
      addDemoSite,
      publishSite,
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

export { PublishSiteError };
