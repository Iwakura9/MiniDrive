import { BadRequestException, ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { randomUUID } from 'node:crypto';
import { mkdir, unlink, writeFile } from 'node:fs/promises';
import { extname, join } from 'node:path';
import { DataSource, Repository } from 'typeorm';
import { StoredFile } from './file.entity';

export type UploadedFile = { originalname: string; buffer: Buffer; size: number; mimetype: string };
const summary = (file: StoredFile) => ({ id: file.id, name: file.name, size: file.size, mimeType: file.mimeType, createdAt: file.createdAt, updatedAt: file.updatedAt });
@Injectable()
export class FilesService {
  private readonly uploadDir: string;
  constructor(@InjectRepository(StoredFile) private readonly files: Repository<StoredFile>, private readonly dataSource: DataSource, config: ConfigService) { this.uploadDir = config.getOrThrow<string>('uploadDir'); }
  async listFiles(ownerId: number) { return (await this.files.find({ where: { ownerId }, order: { createdAt: 'DESC' } })).map(summary); }
  async saveFiles(uploaded: UploadedFile[] | undefined, ownerId: number) {
    if (!uploaded?.length || uploaded.length > 10) throw new BadRequestException('Envie entre 1 e 10 arquivos');
    const names = uploaded.map((f) => this.validName(f.originalname));
    if (new Set(names).size !== names.length || await this.files.count({ where: names.map((name) => ({ ownerId, name })) }) > 0) throw new ConflictException('Já existe arquivo com esse nome');
    await mkdir(this.uploadDir, { recursive: true });
    const records = uploaded.map((f, i) => this.files.create({ id: randomUUID(), ownerId, name: names[i], storedName: `${randomUUID()}${extname(names[i]).toLowerCase()}`, mimeType: f.mimetype, size: f.size }));
    const results = await Promise.allSettled(records.map((r, i) => writeFile(join(this.uploadDir, r.storedName), uploaded[i].buffer)));
    if (results.some((r) => r.status === 'rejected')) { await this.cleanup(records); throw new BadRequestException('Não foi possível salvar o lote'); }
    try { await this.dataSource.transaction((manager) => manager.save(records)); } catch { await this.cleanup(records); throw new ConflictException('Já existe arquivo com esse nome'); }
    return records.map(summary);
  }
  async renameFile(id: string, name: string, ownerId: number) { const file = await this.find(id, ownerId); file.name = this.validName(name); try { return summary(await this.files.save(file)); } catch { throw new ConflictException('Já existe arquivo com esse nome'); } }
  async deleteFile(id: string, ownerId: number) { const file = await this.find(id, ownerId); try { await unlink(join(this.uploadDir, file.storedName)); } catch (error) { if (!(error instanceof Error) || !('code' in error) || error.code !== 'ENOENT') throw error; } await this.files.remove(file); }
  private async find(id: string, ownerId: number) { const file = await this.files.findOneBy({ id, ownerId }); if (!file) throw new NotFoundException('Arquivo não encontrado'); return file; }
  private validName(name: string) { if (!name || name.length > 255 || /[\\/\0]/.test(name)) throw new BadRequestException('Nome de arquivo inválido'); return name; }
  private async cleanup(files: StoredFile[]) { await Promise.all(files.map(async (f) => { try { await unlink(join(this.uploadDir, f.storedName)); } catch {} })); }
}
