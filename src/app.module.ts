import { Module } from '@nestjs/common';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MailerModule } from '@nestjs-modules/mailer';
import { AuthModule } from './auth/auth.module';
import { ProjectsModule } from './projects/projects.module';
import { ServicesModule } from './services/services.module';
import { SkillsModule } from './skills/skills.module';
import { TestimonialsModule } from './testimonials/testimonials.module';
import { BlogModule } from './blog/blog.module';
import { ContactModule } from './contact/contact.module';
import { FallbackController } from './fallback.controller';
import { User } from './users/user.entity';
import { Project } from './projects/project.entity';
import { Service } from './services/service.entity';
import { Skill } from './skills/skill.entity';
import { Testimonial } from './testimonials/testimonial.entity';
import { Blog } from './blog/blog.entity';
import { Contact } from './contact/contact.entity';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        type: 'mysql',
        host:     config.get('DB_HOST'),
        port:     config.get<number>('DB_PORT'),
        username: config.get('DB_USER'),
        password: config.get('DB_PASSWORD'),
        database: config.get('DB_NAME'),
        entities: [User, Project, Service, Skill, Testimonial, Blog, Contact],
        synchronize: true,
      }),
    }),
    ServeStaticModule.forRoot({
      rootPath: join(__dirname, '..', 'client/build'),
      exclude: ['/api/(.*)'],
    }),
    MailerModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        transport: {
          host: config.get('MAIL_HOST'),
          port: config.get<number>('MAIL_PORT'),
          secure: false,
          auth: {
            user: config.get('MAIL_USER'),
            pass: config.get('MAIL_PASS'),
          },
        },
        defaults: {
          from: `"Codvex" <${config.get('MAIL_FROM')}>`,
        },
      }),
    }),
    AuthModule,
    ProjectsModule,
    ServicesModule,
    SkillsModule,
    TestimonialsModule,
    BlogModule,
    ContactModule,
  ],
  controllers: [FallbackController],
})
export class AppModule {}