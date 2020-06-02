import { NestFactory } from '@nestjs/core';
import { ExampleSimpleModule } from './simple/example-simple.module';
import { ExampleDetailedModule } from './detailed/example-detailed.module';

async function bootstrap() {
  const app = await NestFactory.create(ExampleDetailedModule); // change here ExampleSimpleModule OR ExampleDetailedModule
  await app.listen(3000);
}
bootstrap();
