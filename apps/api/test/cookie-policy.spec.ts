import { jest } from "@jest/globals";
import { ConfigService } from "@nestjs/config";
import type { Request, Response } from "express";

import { AuthController } from "../src/modules/auth/auth.controller";
import type { AuthService } from "../src/modules/auth/auth.service";

describe("session cookie policy", () => {
  test.each([true, false])("production cookies are signed, secure and httpOnly (remember=%s)", async (remember) => {
    const session = { token: "test-token", remember, duration: 86400000, account: { id: "test-member" } };
    const auth = { login: jest.fn(async () => session) } as unknown as AuthService;
    const controller = new AuthController(auth, new ConfigService({ NODE_ENV: "production" }));
    const cookie = jest.fn();
    const response = { cookie } as unknown as Response;
    const request = { ip: "127.0.0.1", get: () => "test-agent" } as unknown as Request;
    const result = await controller.login(request, { email: "test@example.test", password: "test-password", remember }, response);
    expect(cookie).toHaveBeenCalledWith("mdadu_session", session.token, {
      httpOnly: true,
      secure: true,
      sameSite: "lax",
      path: "/api/v1",
      signed: true,
      ...(remember ? { maxAge: session.duration } : {}),
    });
    expect(cookie).toHaveBeenCalledWith("mdadu_csrf", expect.any(String), { httpOnly: true, secure: true, sameSite: "lax", path: "/" });
    expect(result).not.toHaveProperty("token");
  });

  test("logout clears the same scoped cookies", async () => {
    const auth = { logout: jest.fn(async () => ({ message: "Logged out." })) } as unknown as AuthService;
    const controller = new AuthController(auth, new ConfigService({ NODE_ENV: "production", COOKIE_DOMAIN: "example.test" }));
    const clearCookie = jest.fn();
    await controller.logout({ signedCookies: {} } as Request, { clearCookie } as unknown as Response);
    expect(clearCookie).toHaveBeenCalledWith("mdadu_session", {
      httpOnly: true,
      secure: true,
      sameSite: "lax",
      path: "/api/v1",
      signed: true,
      domain: "example.test",
    });
    expect(clearCookie).toHaveBeenCalledWith("mdadu_csrf", {
      httpOnly: true,
      secure: true,
      sameSite: "lax",
      path: "/",
      domain: "example.test",
    });
  });
});
