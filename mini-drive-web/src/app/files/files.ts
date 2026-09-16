import { DatePipe, DecimalPipe } from '@angular/common';
import { Component, OnInit, signal } from '@angular/core';
import { Router } from '@angular/router';
import { finalize } from 'rxjs';
import { AuthService } from '../core/auth.service';
import { DriveFile } from '../core/models';
import { FilesService } from './files.service';

@Component({ selector: 'app-files', imports: [DatePipe, DecimalPipe], templateUrl: './files.html', styleUrl: './files.css' })
export class Files implements OnInit {
  readonly files = signal<DriveFile[]>([]); readonly selected = signal<File[]>([]); readonly loading = signal(true); readonly busy = signal(false); readonly message = signal(''); readonly error = signal('');
  constructor(readonly auth: AuthService, private readonly api: FilesService, private readonly router: Router) {}
  ngOnInit() { this.reload(); }
  choose(event: Event) { this.selected.set(Array.from((event.target as HTMLInputElement).files ?? []).slice(0, 10)); this.message.set(''); this.error.set(''); }
  upload() { if (!this.selected().length || this.busy()) return; this.busy.set(true); this.api.upload(this.selected()).pipe(finalize(() => this.busy.set(false))).subscribe({ next: (items) => { this.selected.set([]); this.message.set(`${items.length} arquivo(s) enviado(s).`); this.reload(); }, error: (error) => this.error.set(error.error?.message ?? 'Não foi possível enviar os arquivos.') }); }
  rename(file: DriveFile) { const name = prompt('Novo nome do arquivo:', file.name)?.trim(); if (!name || name === file.name) return; this.api.rename(file.id, name).subscribe({ next: () => { this.message.set('Arquivo renomeado.'); this.reload(); }, error: (error) => this.error.set(error.error?.message ?? 'Não foi possível renomear.') }); }
  remove(file: DriveFile) { if (!confirm(`Excluir “${file.name}”?`)) return; this.api.remove(file.id).subscribe({ next: () => { this.message.set('Arquivo excluído.'); this.reload(); }, error: () => this.error.set('Não foi possível excluir.') }); }
  logout() { this.auth.logout(); void this.router.navigateByUrl('/login'); }
  private reload() { this.loading.set(true); this.error.set(''); this.api.list().pipe(finalize(() => this.loading.set(false))).subscribe({ next: (files) => this.files.set(files), error: () => this.error.set('Não foi possível carregar os arquivos.') }); }
}
