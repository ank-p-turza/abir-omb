 


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

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  
  // Trust proxy is required for secure cookies on Railway/Render/Heroku
  app.set('trust proxy', 1);

  // CORS for frontend on port 1900
  app.enableCors({
    origin: true, // Reflects the request origin
    credentials: true, // Required for cookies
  });

  // Session middleware
  app.use(
    session({
      secret: 'my-secret',
      resave: false,
      saveUninitialized: false,
      cookie: {
        secure: true, // Must be true for HTTPS
        sameSite: 'none', // Required for cross-site cookies
        maxAge: 24 * 60 * 60 * 1000,
        httpOnly: true,
      }
    }),
  );

  app.useGlobalPipes(new ValidationPipe());
  
  await app.listen(process.env.PORT || 80);
  console.log(`Backend running on port ${process.env.PORT || 80}`);
}
bootstrap();