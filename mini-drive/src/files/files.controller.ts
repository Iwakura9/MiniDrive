import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Post,
  UploadedFiles,
  UseInterceptors,
  UseGuards,
} from '@nestjs/common';
import { FilesInterceptor } from '@nestjs/platform-express';
import {
  FilesService,
  type UploadedFile as UploadedFileData,
} from './files.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CurrentUser } from '../auth/current-user.decorator';
import type { AuthenticatedUser } from '../auth/jwt-auth.guard';
import { RenameFileDto } from './rename-file.dto';

@Controller('files')
@UseGuards(JwtAuthGuard)
export class FilesController {
  constructor(private readonly filesService: FilesService) {}

  @Get()
  listFiles(@CurrentUser() user: AuthenticatedUser) {
    return this.filesService.listFiles(user.id);
  }

  @Post()
  @UseInterceptors(FilesInterceptor('files', 10, { limits: { fileSize: 10 * 1024 * 1024 } }))
  saveFiles(@UploadedFiles() files: UploadedFileData[], @CurrentUser() user: AuthenticatedUser) {
    return this.filesService.saveFiles(files, user.id);
  }

  @Patch(':id')
  renameFile(
    @Param('id') id: string,
    @Body() dto: RenameFileDto,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.filesService.renameFile(id, dto.name, user.id);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  deleteFile(@Param('id') id: string, @CurrentUser() user: AuthenticatedUser) {
    return this.filesService.deleteFile(id, user.id);
  }
}
