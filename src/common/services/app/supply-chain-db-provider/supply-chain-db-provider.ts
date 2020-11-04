import { SqlRequestProvider } from '../../../types/sql-request-provider';
import { BaseSqlDataService } from '../../data/base-sql/base.sql.data.service';

export class SupplyChainDbProvider {
    private static instance: SqlRequestProvider;

    static getInstance(): SqlRequestProvider {
        if (SupplyChainDbProvider.instance) {
            return SupplyChainDbProvider.instance;
        }

        const creds = { host: 'localhost', port: 5550, database: 'supply', user: 'postgres', password: '000000' }

        SupplyChainDbProvider.instance = new BaseSqlDataService(creds);

        return SupplyChainDbProvider.instance;
    }
}
