"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.FilesService = void 0;
const common_1 = require("@nestjs/common");
const promises_1 = require("node:fs/promises");
const node_path_1 = require("node:path");
const node_crypto_1 = require("node:crypto");
let FilesService = class FilesService {
    uploadDir = (0, node_path_1.join)(process.cwd(), '../arquivos');
    async saveFile(file, ownerId) {
        await (0, promises_1.mkdir)(this.uploadDir, { recursive: true });
        const storedName = `${(0, node_crypto_1.randomUUID)()}${(0, node_path_1.extname)(file.originalname)}`;
        const filePath = (0, node_path_1.join)(this.uploadDir, storedName);
        await (0, promises_1.writeFile)(filePath, file.buffer);
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
    async saveFiles(files, ownerId) {
        return Promise.all(files.map((file) => this.saveFile(file, ownerId)));
    }
    async listFiles() {
        await (0, promises_1.mkdir)(this.uploadDir, { recursive: true });
        const entries = await (0, promises_1.readdir)(this.uploadDir, { withFileTypes: true });
        const files = entries.filter((entry) => entry.isFile());
        return Promise.all(files.map(async (file) => {
            const filePath = (0, node_path_1.join)(this.uploadDir, file.name);
            const fileStats = await (0, promises_1.stat)(filePath);
            return {
                storedName: file.name,
                path: filePath,
                size: fileStats.size,
                lastModified: fileStats.mtime,
            };
        }));
    }
    async renameFile(currentName, newName) {
        const currentPath = this.getFilePath(currentName);
        const newPath = this.getFilePath(newName);
        try {
            await (0, promises_1.access)(newPath);
            throw new common_1.ConflictException('Já existe um arquivo com esse nome');
        }
        catch (error) {
            if (error instanceof common_1.ConflictException) {
                throw error;
            }
            if (!this.isFileNotFoundError(error)) {
                throw error;
            }
        }
        try {
            await (0, promises_1.rename)(currentPath, newPath);
        }
        catch (error) {
            if (this.isFileNotFoundError(error)) {
                throw new common_1.NotFoundException('Arquivo não encontrado');
            }
            throw error;
        }
        return { storedName: newName, path: newPath };
    }
    async deleteFile(fileName) {
        const filePath = this.getFilePath(fileName);
        try {
            await (0, promises_1.unlink)(filePath);
        }
        catch (error) {
            if (this.isFileNotFoundError(error)) {
                throw new common_1.NotFoundException('Arquivo não encontrado');
            }
            throw error;
        }
    }
    getFilePath(fileName) {
        if (!fileName || (0, node_path_1.basename)(fileName) !== fileName) {
            throw new common_1.BadRequestException('Nome de arquivo inválido');
        }
        return (0, node_path_1.join)(this.uploadDir, fileName);
    }
    isFileNotFoundError(error) {
        return error instanceof Error && 'code' in error && error.code === 'ENOENT';
    }
};
exports.FilesService = FilesService;
exports.FilesService = FilesService = __decorate([
    (0, common_1.Injectable)()
], FilesService);
//# sourceMappingURL=files.service.js.map