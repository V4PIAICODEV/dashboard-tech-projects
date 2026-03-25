// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { createElement } from "react";
import type { WebhookGroupResult } from "@/lib/data/types";

// Create mock fetcher functions
const mockFetchGrupo1 = vi.fn();
const mockFetchGrupo2 = vi.fn();
const mockFetchGrupo3 = vi.fn();
const mockFetchGrupo4 = vi.fn();

vi.mock("@/lib/data/fetchers", () => ({
  fetchGrupo1: (...args: unknown[]) => mockFetchGrupo1(...args),
  fetchGrupo2: (...args: unknown[]) => mockFetchGrupo2(...args),
  fetchGrupo3: (...args: unknown[]) => mockFetchGrupo3(...args),
  fetchGrupo4: (...args: unknown[]) => mockFetchGrupo4(...args),
}));

// Import after mocks
import { useAllProjects } from "./useAllProjects";

/** Helper to create a QueryClientProvider wrapper for renderHook */
function createWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  return ({ children }: { children: React.ReactNode }) =>
    createElement(QueryClientProvider, { client: queryClient }, children);
}

/** Helper to create a successful WebhookGroupResult */
function makeSuccessResult(
  group: 1 | 2 | 3 | 4,
  count: number
): WebhookGroupResult {
  return {
    group,
    executions: Array.from({ length: count }, (_, i) => ({
      projectId: `proj-${group}-${i}`,
      projectName: `Project ${group}-${i}`,
      webhookGroup: group,
      date: "2026-03-25",
      identifiers: {},
      metadata: [],
      rawData: {},
    })),
    error: null,
    lastFetched: new Date(),
  };
}

/** Helper to create a failed WebhookGroupResult */
function makeErrorResult(
  group: 1 | 2 | 3 | 4,
  message: string
): WebhookGroupResult {
  return {
    group,
    executions: [],
    error: new Error(message),
    lastFetched: null,
  };
}

beforeEach(() => {
  vi.clearAllMocks();
});

describe("useAllProjects", () => {
  it("returns AllProjectsResult with combined executions when all 4 groups succeed", async () => {
    mockFetchGrupo1.mockResolvedValue(makeSuccessResult(1, 2));
    mockFetchGrupo2.mockResolvedValue(makeSuccessResult(2, 2));
    mockFetchGrupo3.mockResolvedValue(makeSuccessResult(3, 2));
    mockFetchGrupo4.mockResolvedValue(makeSuccessResult(4, 2));

    const { result } = renderHook(() => useAllProjects(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.allExecutions.length).toBe(8);
    expect(result.current.failedGroups.length).toBe(0);
    expect(result.current.successfulGroups.length).toBe(4);
    expect(result.current.groups.length).toBe(4);
  });

  it("isolates partial failure -- 1 group fails, 3 succeed (DATA-10)", async () => {
    mockFetchGrupo1.mockResolvedValue(makeSuccessResult(1, 2));
    mockFetchGrupo2.mockResolvedValue(makeErrorResult(2, "Network error"));
    mockFetchGrupo3.mockResolvedValue(makeSuccessResult(3, 2));
    mockFetchGrupo4.mockResolvedValue(makeSuccessResult(4, 2));

    const { result } = renderHook(() => useAllProjects(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    // 3 successful groups x 2 executions = 6 total
    expect(result.current.allExecutions.length).toBe(6);
    expect(result.current.failedGroups.length).toBe(1);
    expect(result.current.failedGroups[0].group).toBe(2);
    expect(result.current.successfulGroups.length).toBe(3);
    expect(result.current.groups.length).toBe(4);
  });

  it("shows isLoading=true while queries are pending", () => {
    // Use never-resolving promises
    mockFetchGrupo1.mockReturnValue(new Promise(() => {}));
    mockFetchGrupo2.mockReturnValue(new Promise(() => {}));
    mockFetchGrupo3.mockReturnValue(new Promise(() => {}));
    mockFetchGrupo4.mockReturnValue(new Promise(() => {}));

    const { result } = renderHook(() => useAllProjects(), {
      wrapper: createWrapper(),
    });

    expect(result.current.isLoading).toBe(true);
  });

  it("groups array always has 4 entries with correct group numbers", async () => {
    mockFetchGrupo1.mockResolvedValue(makeSuccessResult(1, 1));
    mockFetchGrupo2.mockResolvedValue(makeSuccessResult(2, 1));
    mockFetchGrupo3.mockResolvedValue(makeSuccessResult(3, 1));
    mockFetchGrupo4.mockResolvedValue(makeSuccessResult(4, 1));

    const { result } = renderHook(() => useAllProjects(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.groups.length).toBe(4);
    expect(result.current.groups[0].group).toBe(1);
    expect(result.current.groups[1].group).toBe(2);
    expect(result.current.groups[2].group).toBe(3);
    expect(result.current.groups[3].group).toBe(4);
  });
});
