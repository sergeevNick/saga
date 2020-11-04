import { StorageDataService } from '../../data/storage/storage/storage.data.service';
import {
    GetDatabaseParams,
    SqlDataService,
    UpdateDatabaseParams
} from '../../data/sql/sql.data.service';
import { Logger } from '@eigenspace/logger';
import { BaseModel } from '../../../types/base.model';


export class StorageAppService {
    private storageDataService: StorageDataService;
    // @ts-ignore
    private logger = new Logger({ component: 'StorageAppService' });

    constructor(queryProvider?: SqlDataService) {
        this.storageDataService = new StorageDataService(queryProvider);
    }

    async update<T extends BaseModel>(model: T, params: UpdateDatabaseParams): Promise<string> {
        try {
            const [{ id }] = await this.storageDataService.update<T>(model, params) as T[];
            return id as string;
        } catch (err) {
            throw err;
        }
    }

    async get<T>(params: GetDatabaseParams): Promise<T[]> {
        return this.storageDataService.get<T>(params);
    }
}
