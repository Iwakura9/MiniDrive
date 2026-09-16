import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { DriveFile } from '../core/models';
@Injectable({ providedIn: 'root' })
export class FilesService {
  constructor(private readonly http: HttpClient) {}
  list() { return this.http.get<DriveFile[]>('/api/files'); }
  upload(files: File[]) { const body = new FormData(); files.forEach((file) => body.append('files', file)); return this.http.post<DriveFile[]>('/api/files', body); }
  rename(id: string, name: string) { return this.http.patch<DriveFile>(`/api/files/${id}`, { name }); }
  remove(id: string) { return this.http.delete<void>(`/api/files/${id}`); }
}
