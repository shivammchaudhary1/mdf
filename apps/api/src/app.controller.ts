import { Controller, Get } from "@nestjs/common";
import { ApiOperation, ApiTags } from "@nestjs/swagger";

@ApiTags("app")
@Controller()
export class AppController {
  @Get()
  @ApiOperation({ summary: "API root" })
  root() {
    return {
      service: "M. Dadu Films API",
      version: "1.0.0",
      status: "ok",
    };
  }
}
