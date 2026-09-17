import { jest } from "@jest/globals";
import { ArgumentsHost, BadRequestException, Logger } from "@nestjs/common";
import type { Connection } from "mongoose";
import { validateEnvironment } from "../src/config/environment";
import { HttpExceptionFilter } from "../src/common/filters/http-exception.filter";
import { HealthService } from "../src/modules/health/health.service";

const environment = { MONGODB_URI: "mongodb://localhost:27017/test" };
describe("environment validation", () => {
  it("provides the expected local defaults", () => {
    expect(validateEnvironment(environment)).toMatchObject({
      PORT: 8888,
      FRONTEND_URL: "http://localhost:3333",
    });
  });
  it.each(["abc", 0, 65536, 2.5])("rejects invalid port %s", (PORT) => {
    expect(() => validateEnvironment({ ...environment, PORT })).toThrow("PORT");
  });
  it("requires MongoDB and rejects origins containing paths", () => {
    expect(() => validateEnvironment({})).toThrow("MONGODB_URI");
    expect(() =>
      validateEnvironment({
        ...environment,
        FRONTEND_URL: "https://example.com/path",
      }),
    ).toThrow();
  });
});
describe("health", () => {
  it.each([
    [1, "ok", "connected"],
    [0, "degraded", "disconnected"],
    [2, "degraded", "connecting"],
  ])("reports connection state %s", (readyState, status, database) => {
    const service = new HealthService({ readyState } as Connection);
    expect(service.getHealth()).toMatchObject({ status, database });
  });
});
describe("exception filter", () => {
  const json = jest.fn();
  const response = { status: jest.fn().mockReturnValue({ json }) };
  const host = {
    switchToHttp: () => ({
      getResponse: () => response,
      getRequest: () => ({ method: "POST", path: "/api/v1/example" }),
    }),
  } as ArgumentsHost;
  it("preserves inline validation messages", () => {
    new HttpExceptionFilter().catch(
      new BadRequestException(["Email is invalid"]),
      host,
    );
    expect(response.status).toHaveBeenCalledWith(400);
    expect(json).toHaveBeenCalledWith(
      expect.objectContaining({ message: ["Email is invalid"] }),
    );
  });
  it("does not expose internal errors", () => {
    jest.spyOn(Logger.prototype, "error").mockImplementation(() => undefined);
    new HttpExceptionFilter().catch(
      new Error("secret database password"),
      host,
    );
    expect(response.status).toHaveBeenCalledWith(500);
    expect(JSON.stringify(json.mock.calls)).not.toContain(
      "secret database password",
    );
  });
});
