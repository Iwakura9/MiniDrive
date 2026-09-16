import { Module } from '@nestjs/common';
import { FilesController } from './files.controller';
import { FilesService } from './files.service';
import { AuthModule } from '../auth/auth.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { StoredFile } from './file.entity';

@Module({
  imports: [AuthModule, TypeOrmModule.forFeature([StoredFile])],
  controllers: [FilesController],
  providers: [FilesService]
})
export class FilesModule {}
