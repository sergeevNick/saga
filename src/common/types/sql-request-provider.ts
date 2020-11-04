import { Query } from '../entities/query/query';

export interface SqlRequestProvider {
    query<T>(query: Query): Promise<T[]>;
}