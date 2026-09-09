import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { INestApplication, Logger, LogLevel } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

const logLevels: LogLevel[] = [
  'fatal',
  'error',
  'warn',
  'log',
  'debug',
  'verbose',
];

function setupCors(app: INestApplication, configService: ConfigService): void {
  if (configService.get<string>('NODE_ENV') === 'development') {
    app.enableCors({
      origin: true,
    });
  } else {
    const origins = configService
      .get<string>('CORS_ORIGIN', '')
      .split(',')
      .map((origin) => origin.trim().replace(/\/$/, ''))
      .filter(Boolean);

    app.enableCors({
      origin: origins,
      credentials: true,
    });
  }
}

function setupLogs(configService: ConfigService): void {
  const logLevel = configService.get<LogLevel>('LOG_LEVEL', 'log');
  const index = logLevels.indexOf(logLevel);
  const enabledLevels = logLevels.slice(0, index + 1);
  Logger.overrideLogger(enabledLevels);
}

function setupSwagger(app: INestApplication): void {
  const config = new DocumentBuilder()
    .setTitle('Lucky Radio API')
    .setDescription('Lucky Radio API documentation')
    .setVersion('1.0')
    .build();

  const document = SwaggerModule.createDocument(app, config);

  SwaggerModule.setup('docs', app, document);
}

async function bootstrap() {
  const configApp = await NestFactory.createApplicationContext(
    ConfigModule.forRoot(),
  );

  const configService = configApp.get(ConfigService);
  await configApp.close();

  const app: INestApplication = await NestFactory.create(
    AppModule.register({
      features: {
        addIRadioPrefix: configService.get('ADD_I_RADIO_PREFIX', false),
      },
    }),
  );

  app.setGlobalPrefix('v1', {
    exclude: ['', 'health'],
  });

  setupCors(app, configService);
  setupLogs(configService);
  setupSwagger(app);
  await app.listen(configService.get<string | number>('PORT', 3000));
}

void bootstrap();
