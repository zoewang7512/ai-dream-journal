import type { NextFunction, Request, Response } from "express";
import { describe, expect, it, vi } from "vitest";
import { createRateLimiter } from "./rate-limiter";

function fakeReqRes(ip: string) {
  const req = { ip } as Request;
  const json = vi.fn();
  const status = vi.fn(() => ({ json }));
  const res = { status } as unknown as Response;
  const next = vi.fn() as NextFunction;
  return { req, res, next, status, json };
}

describe("createRateLimiter", () => {
  it("allows requests under the limit and calls next()", () => {
    const limiter = createRateLimiter({ windowMs: 60_000, max: 2 });
    const { req, res, next } = fakeReqRes("1.2.3.4");

    limiter(req, res, next);

    expect(next).toHaveBeenCalledTimes(1);
  });

  it("blocks with 429 once the per-IP limit is exceeded within the window", () => {
    const limiter = createRateLimiter({ windowMs: 60_000, max: 2 });
    const first = fakeReqRes("1.2.3.4");
    const second = fakeReqRes("1.2.3.4");
    const third = fakeReqRes("1.2.3.4");

    limiter(first.req, first.res, first.next);
    limiter(second.req, second.res, second.next);
    limiter(third.req, third.res, third.next);

    expect(first.next).toHaveBeenCalledTimes(1);
    expect(second.next).toHaveBeenCalledTimes(1);
    expect(third.next).not.toHaveBeenCalled();
    expect(third.status).toHaveBeenCalledWith(429);
    expect(third.json).toHaveBeenCalledWith({
      errorType: "rate_limited",
      message: expect.any(String),
    });
  });

  it("tracks separate IPs independently", () => {
    const limiter = createRateLimiter({ windowMs: 60_000, max: 1 });
    const a1 = fakeReqRes("1.1.1.1");
    const a2 = fakeReqRes("1.1.1.1");
    const b1 = fakeReqRes("2.2.2.2");

    limiter(a1.req, a1.res, a1.next);
    limiter(a2.req, a2.res, a2.next);
    limiter(b1.req, b1.res, b1.next);

    expect(a1.next).toHaveBeenCalledTimes(1);
    expect(a2.next).not.toHaveBeenCalled();
    expect(b1.next).toHaveBeenCalledTimes(1);
  });

  it("resets the count once the window has elapsed", () => {
    vi.useFakeTimers();
    try {
      const limiter = createRateLimiter({ windowMs: 1_000, max: 1 });
      const first = fakeReqRes("1.2.3.4");
      const second = fakeReqRes("1.2.3.4");
      const third = fakeReqRes("1.2.3.4");

      limiter(first.req, first.res, first.next);
      limiter(second.req, second.res, second.next);
      vi.advanceTimersByTime(1_001);
      limiter(third.req, third.res, third.next);

      expect(first.next).toHaveBeenCalledTimes(1);
      expect(second.next).not.toHaveBeenCalled();
      expect(third.next).toHaveBeenCalledTimes(1);
    } finally {
      vi.useRealTimers();
    }
  });
});
