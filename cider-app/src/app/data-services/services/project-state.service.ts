import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, Subject } from 'rxjs';
import { AppDB } from '../indexed-db/db';
import { ElectronService } from '../electron/electron.service';
import { PersistentPath } from '../types/persistent-path.type';

export interface DirtyEntity {
    type: 'deck' | 'card' | 'template' | 'asset' | 'document' | 'attribute';
    id: number | string;
    name?: string;
}

@Injectable({
    providedIn: 'root'
})
export class ProjectStateService {
    private static readonly CRASH_RECOVERY_KEY = 'cider_crash_recovery';
    private dirtyEntities: BehaviorSubject<DirtyEntity[]> = new BehaviorSubject<DirtyEntity[]>([]);
    private isDirtyMap: Map<string, boolean> = new Map();
    private suspendTracking: boolean = false;

    private currentHomeUrl: PersistentPath | undefined;

    constructor(
        private db: AppDB,
        private electronService: ElectronService
    ) {
        this.initialiseListeners();
        this.electronService.getProjectHomeUrl().subscribe(url => this.currentHomeUrl = url);
    }

    private initialiseListeners() {
        this.db.onChange().subscribe((change: any) => {
            if (!change || !change.tableName || !change.key) return;

            const typeMap: { [key: string]: string } = {
                'decks': 'deck',
                'cards': 'card',
                'assets': 'asset',
                'cardTemplates': 'template',
                'cardAttributes': 'attribute',
                'documents': 'document'
            };

            const entityType = typeMap[change.tableName];
            if (entityType) {
                this.setDirty({
                    type: entityType as any,
                    id: change.key
                });
            }
        });

        this.electronService.getIsProjectOpen().subscribe(isOpen => {
            if (!isOpen) {
                this.clearDirtyState();
                this.updateCrashRecoveryState(false);
            }
        });
    }
    public setDirty(entity: DirtyEntity) {
        if (this.suspendTracking) return;
        const key = `${entity.type}-${entity.id}`;
        if (!this.isDirtyMap.has(key)) {
            this.isDirtyMap.set(key, true);
            const currentList = this.dirtyEntities.getValue();
            this.dirtyEntities.next([...currentList, entity]);
            this.electronService.setProjectUnsaved(true);
            this.updateCrashRecoveryState(true);
        }
    }

    public clearDirty(entity: DirtyEntity) {
        const key = `${entity.type}-${entity.id}`;
        if (this.isDirtyMap.has(key)) {
            this.isDirtyMap.delete(key);
            const currentList = this.dirtyEntities.getValue();
            this.dirtyEntities.next(currentList.filter(e => `${e.type}-${e.id}` !== key));

            if (this.isDirtyMap.size === 0) {
                this.electronService.setProjectUnsaved(false);
                this.updateCrashRecoveryState(false);
            }
        }
    }

    public clearDirtyState() {
        this.isDirtyMap.clear();
        this.dirtyEntities.next([]);
        this.electronService.setProjectUnsaved(false);
        this.updateCrashRecoveryState(false);
    }

    public getDirtyEntities(): Observable<DirtyEntity[]> {
        return this.dirtyEntities.asObservable();
    }

    public isEntityDirty(type: string, id: number | string): boolean {
        return this.isDirtyMap.has(`${type}-${id}`);
    }

    private updateCrashRecoveryState(isDirty: boolean) {
        if (isDirty) {
            const homeUrl = this.currentHomeUrl;
            if (homeUrl && homeUrl.path) {
                localStorage.setItem(ProjectStateService.CRASH_RECOVERY_KEY, homeUrl.path);
            }
        } else {
            localStorage.removeItem(ProjectStateService.CRASH_RECOVERY_KEY);
        }
    }

    public getCrashRecoveryPath(): string | null {
        return localStorage.getItem(ProjectStateService.CRASH_RECOVERY_KEY);
    }

    public async markAllDirty() {
        // Mark all entities as dirty to ensure a full save
        const tables = [AppDB.DECKS_TABLE, AppDB.CARDS_TABLE, AppDB.ASSETS_TABLE,
        AppDB.DOCUMENTS_TABLE, AppDB.CARD_TEMPLATES_TABLE, AppDB.CARD_ATTRIBUTES_TABLE];

        const typeMap: { [key: string]: string } = {
            'decks': 'deck',
            'cards': 'card',
            'assets': 'asset',
            'cardTemplates': 'template',
            'cardAttributes': 'attribute',
            'documents': 'document'
        };

        for (const tableName of tables) {
            const keys = await this.db.table(tableName).toCollection().primaryKeys();
            const type = typeMap[tableName];
            if (type) {
                keys.forEach(key => this.setDirty({ type: type as any, id: key as any }));
            }
        }
    }

    public setTrackingEnabled(enabled: boolean) {
        this.suspendTracking = !enabled;
    }
}
