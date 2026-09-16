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
  UploadedFile,
  UploadedFiles,
  UseInterceptors,
  UseGuards,
} from '@nestjs/common';
import {
  FileInterceptor,
  FilesInterceptor,
} from '@nestjs/platform-express';
import {
  FilesService,
  type UploadedFile as UploadedFileData,
} from './files.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('files')
@UseGuards(JwtAuthGuard)
export class FilesController {
  constructor(private readonly filesService: FilesService) {}

  @Get()
  listFiles() {
    return this.filesService.listFiles();
  }

  @Post()
  @UseInterceptors(FileInterceptor('file'))
  saveFile(@UploadedFile() file: UploadedFileData) {
    return this.filesService.saveFile(file, 1); // trocar por id
  }

  @Post('multiple')
  @UseInterceptors(FilesInterceptor('files', 10))
  saveFiles(@UploadedFiles() files: UploadedFileData[]) {
    return this.filesService.saveFiles(files, 1); // trocar por id
  }

  @Patch(':currentName')
  renameFile(
    @Param('currentName') currentName: string, // trocar parametro pelo id
    @Body('newName') newName: string,
  ) {
    return this.filesService.renameFile(currentName, newName);
  }

  @Delete(':fileName')
  @HttpCode(HttpStatus.NO_CONTENT)
  deleteFile(@Param('fileName') fileName: string) { // trocar parametro pelo id
    return this.filesService.deleteFile(fileName);
  }
}
