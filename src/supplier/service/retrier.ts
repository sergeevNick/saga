import { BaseSqlDataService } from '../../common/services/data/base-sql/base.sql.data.service';
import { Query } from '../../common/entities/query/query';
import { StatusType } from '../../common/enums/status.enum';
import { AppController } from '../controllers/app.controller';
import { Order } from '../../common/types/order';
import { EventType } from '../../common/enums/event.enum';
import { BaseDataService } from '../../common/services/data/base/base.data.service';

export class Retrier {
    private dataService = new BaseDataService();
    private sqlService = new BaseSqlDataService({ host: 'localhost', port: 5550, database: 'supply', user: 'postgres', password: '000000' });
    private controller = new AppController();

    start(): void {
        setInterval(() => this.retry(), 10000);
    }

    async retry(): Promise<void> {
        const query = `
            select * from finance.order
            where supply_status = '${StatusType.UNKNOWN_ERROR}'
        `;
        const data = await this.sqlService.query(new Query(query)) as Order[];
        if (!data.length) {
            return;
        }

        console.log('going to retry request with data:', JSON.stringify(data));

        await Promise.all(data.map(async order => {
            try {
                await this.controller.createSupply(order);
                return this.request(EventType.SUPPLY_RESOLVED, order.id!);
            } catch (e) {
            }
        }));
    }

    private async request(event: EventType, id: string): Promise<any> {
        return this.dataService.post('http://localhost:3001', {
            data: {
                event: event, payload: id
            }
        });
    }
}
