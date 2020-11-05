import { BaseSqlDataService } from '../../common/services/data/base-sql/base.sql.data.service';
import { Query } from '../../common/entities/query/query';
import { StatusType } from '../../common/enums/status.enum';
import { AppController } from '../controllers/app.controller';
import { Order } from '../../common/types/order';

export class Fetcher {
    private sqlService = new BaseSqlDataService({ host: 'localhost', port: 5550, database: 'supply', user: 'postgres', password: '000000' });
    private controller = new AppController();

    async fetch(): Promise<void> {
        const query = `
            select * from finance.order
            where order_status = '${StatusType.STARTED}'
              and (supply_status = '${StatusType.STARTED}' or supply_status is null)
              and delivery_status is null
        `;
        const data = await this.sqlService.query(new Query(query)) as Order[];
        await Promise.all(data.map(order => {
            this.controller.createSupply(order);
        }));
    }
}
