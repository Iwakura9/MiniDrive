type UploadedFile = {
    originalname: string;
    buffer: Buffer;
    size: number;
    mimetype: string;
};
export declare class FilesService {
    private readonly uploadDir;
    saveFile(file: UploadedFile, ownerId: number): Promise<{
        filename: string;
        storedName: string;
        path: string;
        size: number;
        mimeType: string;
        ownerId: number;
        lastmodified: Date;
    }>;
    saveFiles(files: UploadedFile[], ownerId: number): Promise<{
        filename: string;
        storedName: string;
        path: string;
        size: number;
        mimeType: string;
        ownerId: number;
        lastmodified: Date;
    }[]>;
    listFiles(): Promise<{
        storedName: string;
        path: string;
        size: number;
        lastModified: Date;
    }[]>;
    renameFile(currentName: string, newName: string): Promise<{
        storedName: string;
        path: string;
    }>;
    deleteFile(fileName: string): Promise<void>;
    private getFilePath;
    private isFileNotFoundError;
}
export {};
