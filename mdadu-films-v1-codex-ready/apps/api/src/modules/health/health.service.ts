import { Injectable } from "@nestjs/common";
import { InjectConnection } from "@nestjs/mongoose";
import { Connection } from "mongoose";

@Injectable()
export class HealthService {
  constructor(@InjectConnection() private readonly connection: Connection) {}

  getHealth() {
    const databaseStates: Record<number, string> = {
      0: "disconnected",
      1: "connected",
      2: "connecting",
      3: "disconnecting",
    };

    return {
      status: this.connection.readyState === 1 ? "ok" : "degraded",
      service: "mdadu-films-api",
      version: "1.0.0",
      database: databaseStates[this.connection.readyState] ?? "unknown",
      uptimeSeconds: Math.floor(process.uptime()),
      timestamp: new Date().toISOString(),
    };
  }
}
