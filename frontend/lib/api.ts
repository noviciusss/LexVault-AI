const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

export class ApiError extends Error {
  constructor(
    message: string,
    public status: number,
  ) {
    super(message);
    this.name = "ApiError";
  }
}

export async function fetchApi(endpoint: string, options: RequestInit = {}) {
  const token = typeof window !== "undefined" ? localStorage.getItem("lexvault_token") : null;
  const headers = new Headers(options.headers || {});

  if (token && !headers.has("Authorization")) {
    headers.set("Authorization", `Bearer ${token}`);
  }

  // If body is not FormData, default to application/json
  if (!(options.body instanceof FormData) && !headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }

  const res = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers,
  });

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({ detail: res.statusText }));
    throw new ApiError(
      typeof errorData.detail === "string"
        ? errorData.detail
        : "Please check your input and try again.",
      res.status,
    );
  }

  return res.json();
}

// Auth API
export const api = {
  workspace: {
    hearings: () => fetchApi("/api/workspace/hearings"),
    addHearing: (data: { title: string; court: string; date: string; note: string }) =>
      fetchApi("/api/workspace/hearings", { method: "POST", body: JSON.stringify(data) }),
    deleteHearing: (id: number) => fetchApi(`/api/workspace/hearings/${id}`, { method: "DELETE" }),
    threads: () => fetchApi("/api/workspace/threads"),
    saveThread: (id: string, data: { title: string; practiceArea: string; messages: unknown[] }) =>
      fetchApi(`/api/workspace/threads/${encodeURIComponent(id)}`, {
        method: "PUT",
        body: JSON.stringify(data),
      }),
    deleteThread: (id: string) =>
      fetchApi(`/api/workspace/threads/${encodeURIComponent(id)}`, { method: "DELETE" }),
  },
  auth: {
    login: (credentials: any) =>
      fetchApi("/api/auth/login", { method: "POST", body: JSON.stringify(credentials) }),
    getMe: () => fetchApi("/api/auth/me"),
  },
  capture: {
    submit: (formData: FormData) => fetchApi("/api/capture", { method: "POST", body: formData }),
  },
  pipeline: {
    retry: (jobId: string | number) => fetchApi(`/api/pipeline/${jobId}/retry`, { method: "POST" }),
    getJob: (jobId: string | number) => fetchApi(`/api/pipeline/${jobId}`),
  },
  approvals: {
    list: () => fetchApi("/api/approvals"),
    takeAction: (
      itemId: number,
      action: "approve" | "reject",
      editedText?: string,
      reason?: string,
    ) =>
      fetchApi(`/api/approvals/${itemId}/action`, {
        method: "POST",
        body: JSON.stringify({ action, edited_text: editedText, rejection_reason: reason }),
      }),
  },
  knowledge: {
    list: (params?: { practice_area?: string; q?: string }) => {
      const q = new URLSearchParams();
      if (params?.practice_area) q.append("practice_area", params.practice_area);
      if (params?.q) q.append("q", params.q);
      return fetchApi(`/api/knowledge?${q.toString()}`);
    },
    get: (id: number | string) => fetchApi(`/api/knowledge/${id}`),
    semanticSearch: async (query: string, practiceArea?: string) =>
      (
        await fetchApi("/api/knowledge/search", {
          method: "POST",
          body: JSON.stringify({ query, practice_area: practiceArea }),
        })
      ).results,
  },
  chat: {
    send: (question: string, practiceArea?: string, history?: any[], actionType?: string) =>
      fetchApi("/api/chat", {
        method: "POST",
        body: JSON.stringify({
          question,
          practice_area: practiceArea,
          history,
          action_type: actionType,
        }),
      }),
    stream: async (
      question: string,
      practiceArea?: string,
      history?: any[],
      actionType?: string,
      onToken?: (token: string) => void,
      onMeta?: (meta: any) => void,
      signal?: AbortSignal,
    ) => {
      const token = typeof window !== "undefined" ? localStorage.getItem("lexvault_token") : null;
      const headers: Record<string, string> = { "Content-Type": "application/json" };
      if (token) headers["Authorization"] = `Bearer ${token}`;

      const res = await fetch(`${API_BASE}/api/chat/stream`, {
        method: "POST",
        headers,
        signal,
        body: JSON.stringify({
          question,
          practice_area: practiceArea,
          history,
          action_type: actionType,
        }),
      });

      if (!res.ok) {
        throw new Error("Chat stream request failed");
      }

      const reader = res.body?.getReader();
      if (!reader) throw new Error("No response stream was received");
      const decoder = new TextDecoder("utf-8");
      let buffer = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split("\n\n");
        buffer = lines.pop() || "";

        for (const line of lines) {
          if (line.startsWith("data: ")) {
            try {
              const data = JSON.parse(line.slice(6));
              if (data.type === "metadata" && onMeta) {
                onMeta(data);
              } else if (data.type === "error") {
                throw new Error(data.message || "The stream was interrupted");
              } else if (data.type === "token" && onToken) {
                onToken(data.token);
              }
            } catch (e) {
              if (!(e instanceof SyntaxError)) throw e;
            }
          }
        }
      }
    },
    history: () => fetchApi("/api/chat/history"),
  },
  graph: {
    getGraph: () => fetchApi("/api/graph"),
  },
  admin: {
    getAuditLog: (action?: string, offset = 0, start?: string, end?: string) => {
      const q = new URLSearchParams({ offset: String(offset), limit: "50" });
      if (action) q.set("action", action);
      if (start) q.set("start", start);
      if (end) q.set("end", end);
      return fetchApi(`/api/admin/audit-log?${q}`);
    },
    getStats: () => fetchApi("/api/admin/stats"),
    getUsers: () => fetchApi("/api/admin/users"),
    reseed: () => fetchApi("/api/admin/reseed", { method: "POST" }),
  },
  constitution: {
    research: (
      question: string,
      articleNumbers: string[],
      language: string,
      signal?: AbortSignal,
    ) =>
      fetchApi("/api/constitution/research", {
        method: "POST",
        signal,
        body: JSON.stringify({ question, article_numbers: articleNumbers, language }),
      }),
    listParts: () => fetchApi("/api/constitution/parts"),
    listArticles: (params?: { part?: string; q?: string }) => {
      const q = new URLSearchParams();
      if (params?.part) q.append("part", params.part);
      if (params?.q) q.append("q", params.q);
      const queryStr = q.toString() ? `?${q.toString()}` : "";
      return fetchApi(`/api/constitution/articles${queryStr}`);
    },
    getArticle: (num: string) => fetchApi(`/api/constitution/articles/${encodeURIComponent(num)}`),
  },
  statutes: {
    listActs: () => fetchApi("/api/statutes/acts"),
    getBnsMap: (params?: { ipc?: string; bns?: string; act?: string; q?: string }) => {
      const q = new URLSearchParams();
      if (params?.ipc) q.append("ipc", params.ipc);
      if (params?.bns) q.append("bns", params.bns);
      if (params?.act) q.append("act", params.act);
      if (params?.q) q.append("q", params.q);
      const queryStr = q.toString() ? `?${q.toString()}` : "";
      return fetchApi(`/api/statutes/bns-map${queryStr}`);
    },
    resolveCitation: (cite: string) =>
      fetchApi(`/api/statutes/resolve?cite=${encodeURIComponent(cite)}`),
    listLibrary: (params?: { act?: string; q?: string; tag?: string }) => {
      const q = new URLSearchParams();
      if (params?.act) q.append("act", params.act);
      if (params?.q) q.append("q", params.q);
      if (params?.tag) q.append("tag", params.tag);
      const queryStr = q.toString() ? `?${q.toString()}` : "";
      return fetchApi(`/api/statutes/library${queryStr}`);
    },
    getLibrarySection: (actCode: string, section: string) =>
      fetchApi(
        `/api/statutes/library/${encodeURIComponent(actCode)}/${encodeURIComponent(section)}`,
      ),
  },
  tools: {
    getLimitationTypes: () => fetchApi("/api/tools/limitation/types"),
    calculateLimitation: (caseType: string, triggerDate: string) =>
      fetchApi(
        `/api/tools/limitation/calculate?case_type=${encodeURIComponent(caseType)}&trigger_date=${encodeURIComponent(triggerDate)}`,
      ),
    checkConflicts: (q: string) => fetchApi(`/api/tools/conflict-check?q=${encodeURIComponent(q)}`),
    summarizeJudgment: (data: { raw_judgment: string; case_title?: string; court?: string }) =>
      fetchApi("/api/tools/summarize-judgment", {
        method: "POST",
        body: JSON.stringify(data),
      }),
    getQuiz: () => fetchApi("/api/tools/quiz"),
  },
};
