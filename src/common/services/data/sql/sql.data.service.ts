import { Query, QueryValues } from '../../../entities/query/query';
import { Selector } from './entities/selector/selector';
import { SupplyChainDbProvider } from '../../app/supply-chain-db-provider/supply-chain-db-provider';
import { SqlRequestProvider } from '../../../types/sql-request-provider';
import { Logger } from '@eigenspace/logger';

interface CommonDataBaseParams {
    table: string;
}

export interface UpdateDatabaseParams extends CommonDataBaseParams {
    uniqueId?: string
}

export interface GetDatabaseParams extends CommonDataBaseParams {
    selector?: Selector;
}

export interface DeleteDatabaseParams extends CommonDataBaseParams {
    selector: Selector;
}

export class SqlDataService {
    private static ID_FIELD = 'id';
    private logger = new Logger({ component: 'SqlDataService' });
    private dbProvider: SqlRequestProvider;
    private readonly schema: string;

    constructor(schema: string, dbProvider?: SqlRequestProvider) {
        this.schema = schema;
        this.dbProvider = dbProvider || SupplyChainDbProvider.getInstance();
    }

    // TODO: make it work
    // This is not working because we run queries in different sessions
    // So we run callback in separate session so committing or rollback changes has no effect
    async transaction(callback: Function, onErrorCallback?: Function): Promise<void> {
        const startTransactionQuery = new Query('begin');
        await this.dbProvider.query(startTransactionQuery);

        try {
            await callback();

            const commitTransactionQuery = new Query('commit');
            await this.dbProvider.query(commitTransactionQuery);
        } catch (err) {
            if (onErrorCallback) {
                await onErrorCallback();
            }

            const rollbackTransactionQuery = new Query('rollback');
            await this.dbProvider.query(rollbackTransactionQuery);
        }
    }

    insertOrUpdate<T>(
        data: QueryValues,
        params: UpdateDatabaseParams
    ): Promise<T[]> {
        const keys = Object.keys(data)
            // Filter out undefined values
            .filter(key => data[key] !== undefined);
        const keyParams = keys.map(key => `"${key}"`).join(', ');
        const processedKeys = keys.map(key => `$${key}`).join(', ');

        const uniqueId = params.uniqueId || SqlDataService.ID_FIELD;
        const onConflictFields = keys.map(key => `"${key}" = excluded."${key}"`).join(', ');

        const { table } = params;
        const template = `
        -- noinspection SqlResolve @ column/"id"
        insert into ${this.schema}.${table} (${keyParams}) 
        values (${processedKeys})
        on conflict (${uniqueId}) do update 
            set ${onConflictFields}
            returning id;
        `;

        const query = new Query(template, data);
        return this.dbProvider.query<T>(query);
    }

    get<T>(params: GetDatabaseParams): Promise<T[]> {
        const { table, selector } = params;

        const templateParts = [
            'select *',
            `from ${this.schema}.${table}`
        ];

        let data = {};
        if (selector) {
            const { template: condition, values } = selector.getQueryCondition();
            templateParts.push(`where ${condition}`);
            data = values;
        }

        const template = templateParts.join('\n');

        const query = new Query(`${template};`, data);
        return this.dbProvider.query<T>(query);
    }

    delete(params: DeleteDatabaseParams): Promise<void[]> {
        const { table, selector } = params;

        const templateParts = [
            'delete',
            `from ${this.schema}.${table}`
        ];

        const { template: condition, values } = selector.getQueryCondition();
        templateParts.push(`where ${condition}`);
        const data = values;

        const template = templateParts.join('\n');

        this.logger.debug('delete', 'template for delete request:', template);

        const query = new Query(`${template};`, data);
        return this.dbProvider.query(query);
    }
}
