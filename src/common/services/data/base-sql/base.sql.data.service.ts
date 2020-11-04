import { Pool } from 'pg';
import { Query } from '../../../entities/query/query';
// @ts-ignore
import * as patcher from 'node-postgres-named';
// @ts-ignore
import { PatchedClient } from 'node-postgres-named';
import { SqlRequestProvider } from '../../../types/sql-request-provider';

export interface PoolOptions {
    host: string;
    port: number;
    user: string;
    password: string;
    database: string;
}

export class BaseSqlDataService implements SqlRequestProvider {
    private pool: PatchedClient;

    constructor(options: PoolOptions) {
        this.pool = patcher.patch(new Pool(options));
    }

    query<T>(query: Query): Promise<T[]> {
        // @ts-ignore
        return this.pool.query<T>(query.template, query.values).then(result => result.rows);
    }
}
