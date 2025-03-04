import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { HttpModule } from '@nestjs/axios';
import { DrawingModule } from '@modules/drawing/drawing.module';

@Module({
  imports: [HttpModule, DrawingModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
