 


// import { NestFactory } from '@nestjs/core';
// import { AppModule } from './app.module';
// import { ValidationPipe } from '@nestjs/common';
// import * as session from 'express-session';
// import * as passport from 'passport';

 

// async function bootstrap() {
//   const app = await NestFactory.create(AppModule);
//   app.use(
//     session({
//       secret: 'my-secret',
//       resave: false,
//       saveUninitialized:false,
//       cookie: {
//         secure: false, 
//         maxAge: 24 * 60 * 60 * 1000
//       }
//     }),
//   );
//   app.enableCors();
  
  
//   await app.listen(9001);
// }
// bootstrap();



 import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import * as session from 'express-session';
import { NestExpressApplication } from '@nestjs/platform-express';
import * as connectPgSimple from 'connect-pg-simple';
import { Pool } from 'pg';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  
  // Trust proxy is required for secure cookies on Railway/Render/Heroku
  app.set('trust proxy', 1);

  // CORS for frontend on port 1900
  app.enableCors({
    origin: true, // Reflects the request origin
    credentials: true, // Required for cookies
  });

  // PostgreSQL session store setup
  const PgSession = connectPgSimple(session);
  const pgPool = new Pool({
    connectionString: 'postgresql://postgres:tlNLkSrzCNlkaPHxngisMmoYIDfaJjqW@maglev.proxy.rlwy.net:33322/railway',
    ssl: false, // Railway doesn't require SSL for internal connections
  });

  // Session middleware with PostgreSQL store
  app.use(
    session({
      store: new PgSession({
        pool: pgPool,
        tableName: 'session', // Table will be created automatically
        createTableIfMissing: true,
      }),
      secret: process.env.SESSION_SECRET || 'my-secret',
      resave: false,
      saveUninitialized: false,
      cookie: {
        secure: true, // Must be true for HTTPS
        sameSite: 'none', // Required for cross-site cookies
        maxAge: 24 * 60 * 60 * 1000, // 24 hours
        httpOnly: true,
      }
    }),
  );

  app.useGlobalPipes(new ValidationPipe());
  
  await app.listen(process.env.PORT || 80);
  console.log(`Backend running on port ${process.env.PORT || 80}`);
}
bootstrap();