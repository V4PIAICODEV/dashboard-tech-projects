import { describe, it, expect, vi, beforeEach, afterAll } from "vitest";
import type { WebhookGroupResult } from "./types";

// Mock config module to provide test URLs
vi.mock("@/lib/config", () => ({
  WEBHOOK_URLS: {
    grupo1: "https://test.example.com/webhook/grupo1",
    grupo2: "https://test.example.com/webhook/grupo2",
    grupo3: "https://test.example.com/webhook/grupo3",
    grupo4: "https://test.example.com/webhook/grupo4",
  },
  PROJECT_NAMES: {
    a6eb735f: "Handover Aquisicao",
    "91e5abc2": "Handover Monetizacao",
    "1522051f": "BANT",
    "9902ec09": "Sales Coach AI",
    "81034bbc": "Account Coach AI",
    ddf44dbe: "Auditoria do Saber",
    "7fd3b921": "Banco de Dados de Midia",
  },
  PROJECT_GROUPS: {
    a6eb735f: 1,
    "91e5abc2": 1,
    "1522051f": 1,
    "9902ec09": 2,
    "81034bbc": 2,
    ddf44dbe: 3,
    "7fd3b921": 4,
  },
  FIELD_LABELS: {
    a6eb735f: { workspace_ekyte: "Workspace Ekyte criado?" },
    "91e5abc2": {},
    "1522051f": {},
    "9902ec09": { resumo_reuniao: "Resumo da Reuniao" },
    "81034bbc": {},
    ddf44dbe: {},
    "7fd3b921": {},
  },
}));

// Mock adapters to isolate fetcher logic
vi.mock("./adapters", () => ({
  adaptGrupo1: vi.fn((arr: unknown[]) =>
    arr.map((item: any) => ({
      projectId: item.project_id,
      projectName: "Test",
      webhookGroup: 1,
      date: item.data,
      identifiers: {},
      metadata: [],
      rawData: item,
    }))
  ),
  adaptGrupo2: vi.fn((arr: unknown[]) =>
    arr.map((item: any) => ({
      projectId: item.project_id,
      projectName: "Test",
      webhookGroup: 2,
      date: item.data,
      identifiers: {},
      metadata: [],
      rawData: item,
    }))
  ),
  adaptGrupo3: vi.fn((arr: unknown[]) =>
    arr.map((item: any) => ({
      projectId: item.project_id,
      projectName: "Test",
      webhookGroup: 3,
      date: item.data,
      identifiers: {},
      metadata: [],
      rawData: item,
    }))
  ),
  adaptGrupo4: vi.fn((arr: unknown[]) =>
    arr.map((item: any) => ({
      projectId: item.project_id,
      projectName: "Test",
      webhookGroup: 4,
      date: item.date,
      identifiers: {},
      metadata: [],
      rawData: item,
    }))
  ),
}));

// Store original fetch
const originalFetch = globalThis.fetch;

beforeEach(() => {
  vi.restoreAllMocks();
  // Re-mock fetch before each test
  globalThis.fetch = vi.fn();
});

// Restore fetch after all tests
afterAll(() => {
  globalThis.fetch = originalFetch;
});

// Import after mocks are set up
import { fetchGrupo1, fetchGrupo2, fetchGrupo3, fetchGrupo4 } from "./fetchers";
import { adaptGrupo1, adaptGrupo2, adaptGrupo3, adaptGrupo4 } from "./adapters";

// Helper to create a mock Response
function mockResponse(body: unknown, status = 200): Response {
  return {
    ok: status >= 200 && status < 300,
    status,
    json: () => Promise.resolve(body),
  } as Response;
}

describe("fetchGrupo1", () => {
  it("returns WebhookGroupResult with executions on success", async () => {
    const rawData = [
      { project_id: "a6eb735f", data: "2026-03-25", id_kommo: "123", status: "ok", metadado: {} },
    ];
    vi.mocked(globalThis.fetch).mockResolvedValue(mockResponse(rawData));

    const result: WebhookGroupResult = await fetchGrupo1();

    expect(result.group).toBe(1);
    expect(result.executions.length).toBe(1);
    expect(result.error).toBeNull();
    expect(result.lastFetched).toBeInstanceOf(Date);
    expect(globalThis.fetch).toHaveBeenCalledWith("https://test.example.com/webhook/grupo1");
    expect(adaptGrupo1).toHaveBeenCalledWith(rawData);
  });

  it("returns error on network failure (does not throw)", async () => {
    vi.mocked(globalThis.fetch).mockRejectedValue(new Error("Network error"));

    const result: WebhookGroupResult = await fetchGrupo1();

    expect(result.group).toBe(1);
    expect(result.executions).toEqual([]);
    expect(result.error).toBeInstanceOf(Error);
    expect(result.error!.message).toBe("Network error");
    expect(result.lastFetched).toBeNull();
  });

  it("returns error on HTTP 500", async () => {
    vi.mocked(globalThis.fetch).mockResolvedValue(mockResponse(null, 500));

    const result: WebhookGroupResult = await fetchGrupo1();

    expect(result.group).toBe(1);
    expect(result.executions).toEqual([]);
    expect(result.error).toBeInstanceOf(Error);
    expect(result.error!.message).toContain("500");
    expect(result.lastFetched).toBeNull();
  });

  it("returns error when response is not an array", async () => {
    vi.mocked(globalThis.fetch).mockResolvedValue(mockResponse({ not: "array" }));

    const result: WebhookGroupResult = await fetchGrupo1();

    expect(result.group).toBe(1);
    expect(result.executions).toEqual([]);
    expect(result.error).toBeInstanceOf(Error);
    expect(result.error!.message).toContain("expected array");
    expect(result.lastFetched).toBeNull();
  });

  it("returns error when adapter throws (Zod failure)", async () => {
    vi.mocked(globalThis.fetch).mockResolvedValue(mockResponse([{ invalid: true }]));
    vi.mocked(adaptGrupo1).mockImplementation(() => {
      throw new Error("Zod validation failed");
    });

    const result: WebhookGroupResult = await fetchGrupo1();

    expect(result.group).toBe(1);
    expect(result.executions).toEqual([]);
    expect(result.error).toBeInstanceOf(Error);
    expect(result.error!.message).toBe("Zod validation failed");
    expect(result.lastFetched).toBeNull();
  });
});

describe("fetchGrupo2", () => {
  it("returns WebhookGroupResult with group=2 on success", async () => {
    const rawData = [
      { project_id: "9902ec09", data: "2026-03-25", tag: "t", email: "e@e.com", score: "10", metadado: {} },
    ];
    vi.mocked(globalThis.fetch).mockResolvedValue(mockResponse(rawData));

    const result: WebhookGroupResult = await fetchGrupo2();

    expect(result.group).toBe(2);
    expect(result.executions.length).toBe(1);
    expect(result.error).toBeNull();
    expect(result.lastFetched).toBeInstanceOf(Date);
    expect(globalThis.fetch).toHaveBeenCalledWith("https://test.example.com/webhook/grupo2");
    expect(adaptGrupo2).toHaveBeenCalledWith(rawData);
  });

  it("returns error on network failure (does not throw)", async () => {
    vi.mocked(globalThis.fetch).mockRejectedValue(new Error("Timeout"));

    const result: WebhookGroupResult = await fetchGrupo2();

    expect(result.group).toBe(2);
    expect(result.executions).toEqual([]);
    expect(result.error).toBeInstanceOf(Error);
    expect(result.lastFetched).toBeNull();
  });
});

describe("fetchGrupo3", () => {
  it("returns WebhookGroupResult with group=3 on success", async () => {
    const rawData = [
      {
        project_id: "ddf44dbe",
        data: "2026-03-25",
        id_kommo: "456",
        status_id: "s1",
        fase: "fase1",
        status: "active",
        metadado: {},
      },
    ];
    vi.mocked(globalThis.fetch).mockResolvedValue(mockResponse(rawData));

    const result: WebhookGroupResult = await fetchGrupo3();

    expect(result.group).toBe(3);
    expect(result.executions.length).toBe(1);
    expect(result.error).toBeNull();
    expect(result.lastFetched).toBeInstanceOf(Date);
    expect(globalThis.fetch).toHaveBeenCalledWith("https://test.example.com/webhook/grupo3");
    expect(adaptGrupo3).toHaveBeenCalledWith(rawData);
  });

  it("returns error on HTTP 403", async () => {
    vi.mocked(globalThis.fetch).mockResolvedValue(mockResponse(null, 403));

    const result: WebhookGroupResult = await fetchGrupo3();

    expect(result.group).toBe(3);
    expect(result.executions).toEqual([]);
    expect(result.error).toBeInstanceOf(Error);
    expect(result.error!.message).toContain("403");
    expect(result.lastFetched).toBeNull();
  });
});

describe("fetchGrupo4", () => {
  it("returns WebhookGroupResult with group=4 on success", async () => {
    const rawData = [
      {
        project_id: "7fd3b921",
        date: "2026-03-25",
        client_name: "Client A",
        ekyte_id: "ek1",
        account_id: "acc1",
        type: "video",
        status: ["Sucessos: 5", "Falhas: 0"],
      },
    ];
    vi.mocked(globalThis.fetch).mockResolvedValue(mockResponse(rawData));

    const result: WebhookGroupResult = await fetchGrupo4();

    expect(result.group).toBe(4);
    expect(result.executions.length).toBe(1);
    expect(result.error).toBeNull();
    expect(result.lastFetched).toBeInstanceOf(Date);
    expect(globalThis.fetch).toHaveBeenCalledWith("https://test.example.com/webhook/grupo4");
    expect(adaptGrupo4).toHaveBeenCalledWith(rawData);
  });

  it("returns error when adapter throws", async () => {
    vi.mocked(globalThis.fetch).mockResolvedValue(mockResponse([{ bad: "data" }]));
    vi.mocked(adaptGrupo4).mockImplementation(() => {
      throw new Error("Schema validation failed");
    });

    const result: WebhookGroupResult = await fetchGrupo4();

    expect(result.group).toBe(4);
    expect(result.executions).toEqual([]);
    expect(result.error).toBeInstanceOf(Error);
    expect(result.error!.message).toBe("Schema validation failed");
    expect(result.lastFetched).toBeNull();
  });
});
