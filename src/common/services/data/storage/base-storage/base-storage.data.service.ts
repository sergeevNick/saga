import {
    GetDatabaseParams,
    SqlDataService,
    UpdateDatabaseParams
} from '../../sql/sql.data.service';
import { StringUtils } from '@eigenspace/utils';
import { AnyDictionary } from '@eigenspace/common-types';
import { BaseModel } from '../../../../types/base.model';

export class BaseStorageDataService {
    protected queryProvider: SqlDataService;

    async update<T>(model: BaseModel | T, params: UpdateDatabaseParams): Promise<T[] | void> {
        const convertedModel = this.convertTopLevelFields(model, StringUtils.camelCaseToUnderscore);
        // @ts-ignore
        return this.queryProvider.insertOrUpdate<T>(convertedModel, params);
    }

    async get<T>(params: GetDatabaseParams): Promise<T[]> {
        const result = await this.queryProvider.get<T>(params);
        return result.map(item => this.convertTopLevelFields(item, StringUtils.underscoreToCamelCase));
    }

    private convertTopLevelFields<T>(item: AnyDictionary, replacer: (std: string) => string): T {
        const result: AnyDictionary = {};
        Object.keys(item)
            .forEach(key => {
                result[replacer(key)] = item[key];
            });

        return result as T;
    }
}
