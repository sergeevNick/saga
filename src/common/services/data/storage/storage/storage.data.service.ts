import { SqlDataService } from '../../sql/sql.data.service';
import { DatabaseSchemaType } from '../../../../enums/database-schema.enum';
import { SupplyChainDbProvider } from '../../../app/supply-chain-db-provider/supply-chain-db-provider';
import { BaseStorageDataService } from '../base-storage/base-storage.data.service';

export class StorageDataService extends BaseStorageDataService {

    constructor(queryProvider?: SqlDataService) {
        super();

        this.queryProvider = queryProvider || new SqlDataService(
            DatabaseSchemaType.FINANCE,
            SupplyChainDbProvider.getInstance()
        );
    }
}
