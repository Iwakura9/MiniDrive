import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import {
  access,
  mkdir,
  readdir,
  rename,
  stat,
  unlink,
  writeFile,
} from 'node:fs/promises';
import { basename, extname, join } from 'node:path';
import { randomUUID } from 'node:crypto';

type UploadedFile = {
  originalname: string;
  buffer: Buffer;
  size: number;
  mimetype: string;
};

@Injectable()
export class FilesService {
  private readonly uploadDir: string = join(process.cwd(), '../arquivos');

  async saveFile(file: UploadedFile, ownerId: number) {
    // cria o diretorio, caso não exista
    await mkdir(this.uploadDir, { recursive: true });

    // nome do arquivo no servidor, para evitar duplicidade
    const storedName: string = `${randomUUID()}${extname(file.originalname)}`;
    const filePath: string = join(this.uploadDir, storedName);

    await writeFile(filePath, file.buffer);

    return {
      filename: file.originalname,
      storedName,
      path: filePath,
      size: file.size,
      mimeType: file.mimetype,
      ownerId,
      lastmodified: new Date(),
    };
  }

  async saveFiles(files: UploadedFile[], ownerId: number) {
    return Promise.all(files.map((file) => this.saveFile(file, ownerId)));
  }

  async listFiles() {
    await mkdir(this.uploadDir, { recursive: true });

    const entries = await readdir(this.uploadDir, { withFileTypes: true });
    const files = entries.filter((entry) => entry.isFile());

    return Promise.all(
      files.map(async (file) => {
        const filePath = join(this.uploadDir, file.name);
        const fileStats = await stat(filePath);

        return {
          storedName: file.name,
          path: filePath,
          size: fileStats.size,
          lastModified: fileStats.mtime,
        };
      }),
    );
  }

  async renameFile(currentName: string, newName: string) {
    const currentPath = this.getFilePath(currentName);
    const newPath = this.getFilePath(newName);

    try {
      await access(newPath);
      throw new ConflictException('Já existe um arquivo com esse nome');
    } catch (error) {
      if (error instanceof ConflictException) {
        throw error;
      }

      if (!this.isFileNotFoundError(error)) {
        throw error;
      }
    }

    try {
      await rename(currentPath, newPath);
    } catch (error) {
      if (this.isFileNotFoundError(error)) {
        throw new NotFoundException('Arquivo não encontrado');
      }

      throw error;
    }

    return { storedName: newName, path: newPath };
  }

  async deleteFile(fileName: string) {
    const filePath = this.getFilePath(fileName);

    try {
      await unlink(filePath);
    } catch (error) {
      if (this.isFileNotFoundError(error)) {
        throw new NotFoundException('Arquivo não encontrado');
      }

      throw error;
    }
  }
}
