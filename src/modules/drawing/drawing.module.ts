import { Module } from '@nestjs/common';
import { DrawingGateway } from '@modules/drawing/drawing.gateway';

@Module({
  providers: [DrawingGateway],
})
export class DrawingModule {}
