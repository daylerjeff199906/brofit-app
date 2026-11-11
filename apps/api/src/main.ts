import "reflect-metadata";
import { Controller, Get, Module } from "@nestjs/common";
import { NestFactory } from "@nestjs/core";
@Controller()
class HealthController {
  @Get("health") health() {
    return {
      status: "ok",
      service: "brofit-api",
      stage: "foundation",
      commerceEnabled: false,
    };
  }
}
@Module({ controllers: [HealthController] })
class AppModule {}
async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.enableCors({
    origin: process.env.WEB_BASE_URL || "http://localhost:3000",
  });
  app.enableShutdownHooks();
  await app.listen(Number(process.env.PORT || 4000), "127.0.0.1");
}
bootstrap().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
