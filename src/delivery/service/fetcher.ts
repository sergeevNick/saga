import { BaseSqlDataService } from '../../common/services/data/base-sql/base.sql.data.service';
import { Query } from '../../common/entities/query/query';
import { StatusType } from '../../common/enums/status.enum';
import { AppController } from '../controllers/app.controller';
import { Order } from '../../common/types/order';
import { EventType } from '../../common/enums/event.enum';
import { BaseDataService } from '../../common/services/data/base/base.data.service';

export class Fetcher {
    private dataService = new BaseDataService();
    private sqlService = new BaseSqlDataService({ host: 'localhost', port: 5550, database: 'supply', user: 'postgres', password: '000000' });
    private controller = new AppController();

    async fetch(): Promise<void> {
        const query = `
            select * from finance.order
            where order_status = '${StatusType.STARTED}'
              and supply_status = '${StatusType.STARTED}'
              and (delivery_status = '${StatusType.STARTED}' or delivery_status is null)
        `;

        const data = await this.sqlService.query(new Query(query)) as Order[];
        await Promise.all(data.map(async order => {
            try {
                await this.controller.createDelivery(order);
                return this.request(EventType.DELIVERY_RESOLVED, order.id!);
            } catch (e) {
            }
        }));
    }

    private async request(event: EventType, id: string): Promise<any> {
        return this.dataService.post('http://localhost:3002', {
            data: {
                event: event, payload: id
            }
        });
    }
}
