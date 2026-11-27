"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
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
import { completeSiteContract } from "@/lib/data/contract-client";
import { isApiAuthError, type ApiAuthStatus } from "@/lib/data/api-errors";
import {
  createDemoSiteViaApi,
  deleteCustomerViaApi,
  deleteDemoSiteViaApi,
  fetchCustomersFromApi,
  fetchDemoSitesFromApi,
  isSupabaseConfigured,
  updateDemoSiteViaApi,
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
  hydrated: boolean;
  authError: ApiAuthStatus | null;
  reportAuthError: (error: unknown) => void;
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
  addDemoSite: (input: DemoSiteFormInput) => Promise<CreateDemoSiteResult>;
  publishSite: (demoSiteId: string, form: PublishSiteForm) => Promise<PublishSiteResult>;
  convertToContract: (
    demoSiteId: string,
    form: ConvertToContractForm
  ) => Promise<ConvertToContractResult>;
  markAsLost: (demoSiteId: string) => Promise<void>;
  isSlugTaken: (slug: string, excludeDemoId?: string) => boolean;
  getDemoSite: (id: string) => DemoSite | undefined;
  getDemoSiteBySlug: (slug: string) => DemoSite | undefined;
  applySavedSite: (saved: DemoSite) => void;
  saveDemoSite: (updated: DemoSite) => Promise<DemoSite>;
  deleteDemoSite: (demoSiteId: string) => Promise<void>;
};

const OperatorAdminContext = createContext<OperatorAdminContextValue | null>(null);

function redirectToLogin(status: ApiAuthStatus) {
  const url = new URL("/login", window.location.origin);
  if (status === 403) {
    url.searchParams.set("error", "forbidden");
  } else {
    url.searchParams.set("next", `${window.location.pathname}${window.location.search}`);
  }
  window.location.assign(url.toString());
}

export function OperatorAdminProvider({ children }: { children: ReactNode }) {
  const pendingCreate=useRef<{key:string;prepared:ReturnType<typeof createDemoSiteFromForm>}|null>(null);
  const useRemote = isSupabaseConfigured();
  const [demoSites, setDemoSites] = useState<DemoSite[]>(useRemote ? [] : initialDemoSites);
  const [customers, setCustomers] = useState<CustomerAccount[]>(
    useRemote ? [] : initialDemoCustomers
  );
  const [demoModalOpen, setDemoModalOpen] = useState(false);
  const [publishModalDemoId, setPublishModalDemoId] = useState<string | null>(null);
  const [convertModalDemoId, setConvertModalDemoId] = useState<string | null>(null);
  const [shareModalDemoId, setShareModalDemoId] = useState<string | null>(null);
  const [shareDataVersion, setShareDataVersion] = useState(0);
  const [hydrated, setHydrated] = useState(false);
  const [authError, setAuthError] = useState<ApiAuthStatus | null>(null);
  const [loadFailed, setLoadFailed] = useState(false);

  const reportAuthError = useCallback((error: unknown) => {
    if (isApiAuthError(error)) setAuthError(error.status);
  }, []);

  /** 認証エラーは画面に通知したうえで呼び出し元へ再送出する（成功表示をさせないため） */
  const runRemote = useCallback(
    async <T,>(task: () => Promise<T>): Promise<T> => {
      try {
        const result = await task();
        setAuthError(null);
        return result;
      } catch (error) {
        reportAuthError(error);
        throw error;
      }
    },
    [reportAuthError]
  );

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
            setDemoSites(sites);
            setCustomers(customerList);
          }
        } catch (error) {
          if (isApiAuthError(error)) {
            redirectToLogin(error.status);
            return;
          }
          if (!cancelled) {
            setDemoSites([]);
            setCustomers([]);
            setLoadFailed(true);
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
    async (site: DemoSite) => {
      if (!useRemote) throw new Error("サーバー保存先が未設定です。画面上だけの保存は行いません。");
      return runRemote(() => updateDemoSiteViaApi(site));
    },
    [useRemote, runRemote]
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

  const applySavedSite=useCallback((saved:DemoSite)=>setDemoSites(prev=>prev.map(site=>site.id===saved.id?saved:site)),[]);

  const saveDemoSite = useCallback(
    async (updated: DemoSite) => {
      const normalized = { ...updated, isNewlyCreated: false };
      const saved=await persistDemoSite(normalized);
      setDemoSites((prev) =>
        prev.map((d) => (d.id === saved.id ? saved : d))
      );
      return saved;
    },
    [persistDemoSite]
  );

  const getDemoSite = useCallback(
    (id: string) => demoSites.find((d) => d.id === id),
    [demoSites]
  );

  const addDemoSite = useCallback(
    async (input: DemoSiteFormInput): Promise<CreateDemoSiteResult> => {
      const key=JSON.stringify(input);
      if(!pendingCreate.current || pendingCreate.current.key!==key)pendingCreate.current={key,prepared:createDemoSiteFromForm(input)};
      const {demoSite,result}=pendingCreate.current.prepared;
      const saved=useRemote?await runRemote(()=>createDemoSiteViaApi(demoSite)):demoSite;
      setDemoSites(prev=>[saved,...prev.filter(site=>site.id!==saved.id)]);
      pendingCreate.current=null;
      return result;
    },[useRemote,runRemote]);

  const publishSite = useCallback(
    async (demoSiteId: string, form: PublishSiteForm): Promise<PublishSiteResult> => {
      const target = demoSites.find((d) => d.id === demoSiteId);
      if (!target) throw new PublishSiteError("案件が見つかりません");

      const normalizedSlug = form.storeSlug.trim().toLowerCase();
      if (isSlugTaken(normalizedSlug, demoSiteId)) {
        throw new PublishSiteError(
          "このURLはすでに使用されています",
          "storeSlug"
        );
      }

      const { demoSite, result } = publishDemoSite(target, {
        ...form,
        storeSlug: normalizedSlug,
      });

      if (useRemote) {
        const saved = await runRemote(() => completeSiteContract(demoSiteId, { ...form, storeSlug: demoSite.storeSlug }));
        setCustomers((prev) => [...prev.filter((c) => c.id !== saved.customer.id), saved.customer]);
        setDemoSites((prev) => prev.map((d) => d.id === demoSiteId ? saved.site : d));
        return result;
      }
      throw new Error("公開・契約切り替えにはSupabaseの接続設定が必要です。");

    },
    [demoSites, isSlugTaken, useRemote, runRemote]
  );

  const convertToContract = useCallback(
    async (
      demoSiteId: string,
      form: ConvertToContractForm
    ): Promise<ConvertToContractResult> => {
      const target = demoSites.find((d) => d.id === demoSiteId);
      if (!target) throw new Error("Demo site not found");

      const { demoSite, result } = convertDemoToContract(target, form);
      if (useRemote) {
        const saved = await runRemote(() => completeSiteContract(demoSiteId, { ...form, storeSlug: demoSite.storeSlug }));
        setCustomers((prev) => [...prev.filter((c) => c.id !== saved.customer.id), saved.customer]);
        setDemoSites((prev) => prev.map((d) => d.id === demoSiteId ? saved.site : d));
        return result;
      }
      throw new Error("公開・契約切り替えにはSupabaseの接続設定が必要です。");

    },
    [demoSites, useRemote, runRemote]
  );

  const markAsLost = useCallback(
    async (demoSiteId: string) => {
      const target = demoSites.find((d) => d.id === demoSiteId);
      if (!target) return;
      const lost = markDemoAsLost(target);
      await persistDemoSite(lost);
      setDemoSites((prev) => prev.map((d) => (d.id === demoSiteId ? lost : d)));
    },
    [demoSites, persistDemoSite]
  );

  const deleteDemoSite = useCallback(
    async (demoSiteId: string) => {
      const target = demoSites.find((d) => d.id === demoSiteId);
      if (useRemote) {
        await runRemote(() => deleteDemoSiteViaApi(demoSiteId));
        if (target?.customerId) {
          const customerId = target.customerId;
          await runRemote(() => deleteCustomerViaApi(customerId));
        }
      }
      if (target?.customerId) {
        setCustomers((customerList) =>
          customerList.filter((c) => c.id !== target.customerId)
        );
      }
      setDemoSites((prev) => prev.filter((d) => d.id !== demoSiteId));
    },
    [demoSites, useRemote, runRemote]
  );

  const value = useMemo(
    () => ({
      demoSites,
      customers,
      hydrated,
      authError,
      reportAuthError,
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
      applySavedSite,
      deleteDemoSite,
    }),
    [
      demoSites,
      customers,
      hydrated,
      authError,
      reportAuthError,
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
      applySavedSite,
      deleteDemoSite,
    ]
  );

  if(loadFailed) return <div className="admin-edit-empty" role="alert"><h1>管理データに接続できません</h1><p>通信状況と設定を確認してください。</p><button type="button" className="admin-btn admin-btn--primary" onClick={()=>window.location.reload()}>再読み込み</button></div>;
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
