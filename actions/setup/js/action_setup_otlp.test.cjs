// @ts-check
import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { createRequire } from "module";

// Use CJS require so we share the same module cache as action_setup_otlp.cjs
const req = createRequire(import.meta.url);

// Load the real send_otlp_span module and capture original functions for teardown
const sendOtlpModule = req("./send_otlp_span.cjs");
const originalSendJobSetupSpan = sendOtlpModule.sendJobSetupSpan;
const originalIsValidTraceId = sendOtlpModule.isValidTraceId;
const originalIsValidSpanId = sendOtlpModule.isValidSpanId;

// Load the fs module — same object the source file uses so spies intercept calls
const fsMod = req("fs");

// Load the module under test — it holds a reference to the same sendOtlpModule object
const { run } = req("./action_setup_otlp.cjs");

const VALID_TRACE_ID = "0af7651916cd43dd8448eb211c80319c";
const VALID_SPAN_ID = "b7ad6b7169203331";

// Shared mock function — patched onto the module exports in beforeEach
const mockSendJobSetupSpan = vi.fn();

describe("action_setup_otlp.cjs", () => {
  /** @type {Record<string, string | undefined>} */
  let originalEnv;

  beforeEach(() => {
    vi.clearAllMocks();
    vi.spyOn(console, "log").mockImplementation(() => {});
    vi.spyOn(fsMod, "appendFileSync").mockImplementation(() => {});

    // Default mock: return valid trace/span IDs
    mockSendJobSetupSpan.mockResolvedValue({ traceId: VALID_TRACE_ID, spanId: VALID_SPAN_ID });

    // Patch the shared CJS exports object — run() accesses these at call time
    sendOtlpModule.sendJobSetupSpan = mockSendJobSetupSpan;
    sendOtlpModule.isValidTraceId = /** @param {string} id */ id => /^[0-9a-f]{32}$/.test(id);
    sendOtlpModule.isValidSpanId = /** @param {string} id */ id => /^[0-9a-f]{16}$/.test(id);

    originalEnv = {
      OTEL_EXPORTER_OTLP_ENDPOINT: process.env.OTEL_EXPORTER_OTLP_ENDPOINT,
      SETUP_START_MS: process.env.SETUP_START_MS,
      GITHUB_OUTPUT: process.env.GITHUB_OUTPUT,
      GITHUB_ENV: process.env.GITHUB_ENV,
      INPUT_TRACE_ID: process.env.INPUT_TRACE_ID,
      INPUT_JOB_NAME: process.env.INPUT_JOB_NAME,
      "INPUT_TRACE-ID": process.env["INPUT_TRACE-ID"],
      "INPUT_JOB-NAME": process.env["INPUT_JOB-NAME"],
    };

    delete process.env.OTEL_EXPORTER_OTLP_ENDPOINT;
    delete process.env.SETUP_START_MS;
    delete process.env.GITHUB_OUTPUT;
    delete process.env.GITHUB_ENV;
    delete process.env.INPUT_TRACE_ID;
    delete process.env.INPUT_JOB_NAME;
    delete process.env["INPUT_TRACE-ID"];
    delete process.env["INPUT_JOB-NAME"];
  });

  afterEach(() => {
    vi.restoreAllMocks();
    sendOtlpModule.sendJobSetupSpan = originalSendJobSetupSpan;
    sendOtlpModule.isValidTraceId = originalIsValidTraceId;
    sendOtlpModule.isValidSpanId = originalIsValidSpanId;

    for (const [key, value] of Object.entries(originalEnv)) {
      if (value !== undefined) {
        process.env[key] = value;
      } else {
        delete process.env[key];
      }
    }
  });

  it("should export run as a function", () => {
    expect(typeof run).toBe("function");
  });

  describe("when OTEL_EXPORTER_OTLP_ENDPOINT is not set", () => {
    it("should log that the endpoint is not set", async () => {
      await run();
      expect(console.log).toHaveBeenCalledWith("[otlp] OTEL_EXPORTER_OTLP_ENDPOINT not set, skipping setup span");
    });

    it("should still call sendJobSetupSpan to resolve traceId for output correlation", async () => {
      await run();
      expect(mockSendJobSetupSpan).toHaveBeenCalledOnce();
    });

    it("should not log 'setup span sent' when endpoint is not set", async () => {
      await run();
      const calls = /** @type {string[][]} */ console.log.mock.calls;
      const sentMsg = calls.flat().some(msg => msg.includes("setup span sent"));
      expect(sentMsg).toBe(false);
    });
  });

  describe("when OTEL_EXPORTER_OTLP_ENDPOINT is set", () => {
    beforeEach(() => {
      process.env.OTEL_EXPORTER_OTLP_ENDPOINT = "http://localhost:4318";
    });

    it("should log the endpoint URL in the sending message", async () => {
      await run();
      expect(console.log).toHaveBeenCalledWith(expect.stringContaining("http://localhost:4318"));
    });

    it("should call sendJobSetupSpan once", async () => {
      await run();
      expect(mockSendJobSetupSpan).toHaveBeenCalledOnce();
    });

    it("should log setup span sent with traceId and spanId", async () => {
      await run();
      expect(console.log).toHaveBeenCalledWith(`[otlp] setup span sent (traceId=${VALID_TRACE_ID}, spanId=${VALID_SPAN_ID})`);
    });

    it("should log the resolved trace-id", async () => {
      await run();
      expect(console.log).toHaveBeenCalledWith(`[otlp] resolved trace-id=${VALID_TRACE_ID}`);
    });
  });

  describe("INPUT_TRACE_ID handling", () => {
    it("should pass inputTraceId (lowercased) to sendJobSetupSpan when INPUT_TRACE_ID is set", async () => {
      process.env.INPUT_TRACE_ID = "ABCDEF1234567890ABCDEF1234567890";
      await run();
      expect(mockSendJobSetupSpan).toHaveBeenCalledWith(expect.objectContaining({ traceId: "abcdef1234567890abcdef1234567890" }));
    });

    it("should pass traceId: undefined when INPUT_TRACE_ID is not set", async () => {
      await run();
      expect(mockSendJobSetupSpan).toHaveBeenCalledWith(expect.objectContaining({ traceId: undefined }));
    });

    it("should log when INPUT_TRACE_ID is set", async () => {
      process.env.INPUT_TRACE_ID = VALID_TRACE_ID;
      await run();
      expect(console.log).toHaveBeenCalledWith(`[otlp] INPUT_TRACE_ID=${VALID_TRACE_ID} (will reuse activation trace)`);
    });

    it("should log when INPUT_TRACE_ID is not set", async () => {
      await run();
      expect(console.log).toHaveBeenCalledWith("[otlp] INPUT_TRACE_ID not set, a new trace ID will be generated");
    });

    it("should also accept INPUT_TRACE-ID (hyphen form) via getActionInput", async () => {
      process.env["INPUT_TRACE-ID"] = VALID_TRACE_ID;
      await run();
      expect(mockSendJobSetupSpan).toHaveBeenCalledWith(expect.objectContaining({ traceId: VALID_TRACE_ID }));
    });
  });

  describe("SETUP_START_MS handling", () => {
    it("should pass startMs parsed from SETUP_START_MS", async () => {
      process.env.SETUP_START_MS = "1700000000000";
      await run();
      expect(mockSendJobSetupSpan).toHaveBeenCalledWith(expect.objectContaining({ startMs: 1700000000000 }));
    });

    it("should pass startMs: 0 when SETUP_START_MS is not set", async () => {
      await run();
      expect(mockSendJobSetupSpan).toHaveBeenCalledWith(expect.objectContaining({ startMs: 0 }));
    });

    it("should pass startMs: 0 when SETUP_START_MS is empty string", async () => {
      process.env.SETUP_START_MS = "";
      await run();
      expect(mockSendJobSetupSpan).toHaveBeenCalledWith(expect.objectContaining({ startMs: 0 }));
    });
  });

  describe("GITHUB_OUTPUT writing", () => {
    it("should write trace-id to GITHUB_OUTPUT when traceId is valid and GITHUB_OUTPUT is set", async () => {
      process.env.GITHUB_OUTPUT = "/tmp/gh-aw-test-output";
      await run();
      expect(fsMod.appendFileSync).toHaveBeenCalledWith("/tmp/gh-aw-test-output", `trace-id=${VALID_TRACE_ID}\n`);
    });

    it("should log that trace-id was written to GITHUB_OUTPUT", async () => {
      process.env.GITHUB_OUTPUT = "/tmp/gh-aw-test-output";
      await run();
      expect(console.log).toHaveBeenCalledWith(`[otlp] trace-id=${VALID_TRACE_ID} written to GITHUB_OUTPUT`);
    });

    it("should not write to GITHUB_OUTPUT when GITHUB_OUTPUT is not set", async () => {
      await run();
      const calls = /** @type {[string, string][]} */ fsMod.appendFileSync.mock.calls;
      const outputCalls = calls.filter(([file]) => file === "/tmp/gh-aw-test-output");
      expect(outputCalls).toHaveLength(0);
    });

    it("should not write to GITHUB_OUTPUT when traceId is invalid", async () => {
      process.env.GITHUB_OUTPUT = "/tmp/gh-aw-test-output";
      sendOtlpModule.isValidTraceId = () => false;
      await run();
      expect(fsMod.appendFileSync).not.toHaveBeenCalledWith("/tmp/gh-aw-test-output", expect.anything());
    });
  });

  describe("GITHUB_ENV writing", () => {
    beforeEach(() => {
      process.env.GITHUB_ENV = "/tmp/gh-aw-test-env";
    });

    it("should write GITHUB_AW_OTEL_TRACE_ID when traceId is valid", async () => {
      await run();
      expect(fsMod.appendFileSync).toHaveBeenCalledWith("/tmp/gh-aw-test-env", `GITHUB_AW_OTEL_TRACE_ID=${VALID_TRACE_ID}\n`);
    });

    it("should write GITHUB_AW_OTEL_PARENT_SPAN_ID when spanId is valid", async () => {
      await run();
      expect(fsMod.appendFileSync).toHaveBeenCalledWith("/tmp/gh-aw-test-env", `GITHUB_AW_OTEL_PARENT_SPAN_ID=${VALID_SPAN_ID}\n`);
    });

    it("should always write GITHUB_AW_OTEL_JOB_START_MS", async () => {
      await run();
      const calls = /** @type {[string, string][]} */ fsMod.appendFileSync.mock.calls;
      const jobStartCalls = calls.filter(([, content]) => content.includes("GITHUB_AW_OTEL_JOB_START_MS="));
      expect(jobStartCalls).toHaveLength(1);
    });

    it("should not write GITHUB_AW_OTEL_TRACE_ID when traceId is invalid", async () => {
      sendOtlpModule.isValidTraceId = () => false;
      await run();
      const calls = /** @type {[string, string][]} */ fsMod.appendFileSync.mock.calls;
      const traceIdCalls = calls.filter(([, content]) => content.includes("GITHUB_AW_OTEL_TRACE_ID="));
      expect(traceIdCalls).toHaveLength(0);
    });

    it("should not write GITHUB_AW_OTEL_PARENT_SPAN_ID when spanId is invalid", async () => {
      sendOtlpModule.isValidSpanId = () => false;
      await run();
      const calls = /** @type {[string, string][]} */ fsMod.appendFileSync.mock.calls;
      const spanIdCalls = calls.filter(([, content]) => content.includes("GITHUB_AW_OTEL_PARENT_SPAN_ID="));
      expect(spanIdCalls).toHaveLength(0);
    });

    it("should not write to GITHUB_ENV when GITHUB_ENV is not set", async () => {
      delete process.env.GITHUB_ENV;
      await run();
      const calls = /** @type {[string, string][]} */ fsMod.appendFileSync.mock.calls;
      const envCalls = calls.filter(([file]) => file === "/tmp/gh-aw-test-env");
      expect(envCalls).toHaveLength(0);
    });

    it("should write all three env vars when traceId and spanId are valid", async () => {
      await run();
      const calls = /** @type {[string, string][]} */ fsMod.appendFileSync.mock.calls;
      const envCalls = calls.filter(([file]) => file === "/tmp/gh-aw-test-env");
      expect(envCalls).toHaveLength(3);
    });

    it("should log that GITHUB_AW_OTEL_JOB_START_MS was written", async () => {
      await run();
      expect(console.log).toHaveBeenCalledWith("[otlp] GITHUB_AW_OTEL_JOB_START_MS written to GITHUB_ENV");
    });
  });

  describe("error handling", () => {
    it("should propagate errors from sendJobSetupSpan", async () => {
      mockSendJobSetupSpan.mockRejectedValueOnce(new Error("Network error"));
      await expect(run()).rejects.toThrow("Network error");
    });
  });
});
