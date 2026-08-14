import type { NextFunction, Request, Response } from "express";
import { describe, expect, it, vi } from "vitest";
import { createOriginGuard } from "./origin-guard";

function fakeReqRes(headers: { referer?: string; host?: string }) {
  const req = { headers } as Request;
  const json = vi.fn();
  const status = vi.fn(() => ({ json }));
  const res = { status } as unknown as Response;
  const next = vi.fn() as NextFunction;
  return { req, res, next, status, json };
}

describe("createOriginGuard", () => {
  it("allows the request when the Referer host matches the request host", () => {
    const guard = createOriginGuard();
    const { req, res, next } = fakeReqRes({
      referer: "https://my-app.example/journal",
      host: "my-app.example",
    });

    guard(req, res, next);

    expect(next).toHaveBeenCalledTimes(1);
  });

  it("allows a same-host Referer regardless of scheme (host comparison ignores http vs https)", () => {
    const guard = createOriginGuard();
    const { req, res, next } = fakeReqRes({
      referer: "http://localhost:3001/journal",
      host: "localhost:3001",
    });

    guard(req, res, next);

    expect(next).toHaveBeenCalledTimes(1);
  });

  it("blocks with 403 when the Referer header is missing", () => {
    const guard = createOriginGuard();
    const { req, res, next, status, json } = fakeReqRes({ host: "my-app.example" });

    guard(req, res, next);

    expect(next).not.toHaveBeenCalled();
    expect(status).toHaveBeenCalledWith(403);
    expect(json).toHaveBeenCalledWith({ message: expect.any(String) });
  });

  it("blocks with 403 when the Referer host is a different (third-party) origin", () => {
    const guard = createOriginGuard();
    const { req, res, next, status } = fakeReqRes({
      referer: "https://attacker.example/embed-page",
      host: "my-app.example",
    });

    guard(req, res, next);

    expect(next).not.toHaveBeenCalled();
    expect(status).toHaveBeenCalledWith(403);
  });

  it("blocks with 403 when the Referer header is not a valid URL", () => {
    const guard = createOriginGuard();
    const { req, res, next, status } = fakeReqRes({
      referer: "not-a-url",
      host: "my-app.example",
    });

    guard(req, res, next);

    expect(next).not.toHaveBeenCalled();
    expect(status).toHaveBeenCalledWith(403);
  });
});
