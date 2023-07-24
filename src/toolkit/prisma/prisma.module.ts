import {Global, Module} from '@nestjs/common';
import {CustomLoggerModule} from '../logger/logger.module';
import {PrismaService} from './prisma.service';

@Global()
@Module({
  imports: [CustomLoggerModule],
  providers: [PrismaService],
  exports: [PrismaService],
})
export class PrismaModule {}
