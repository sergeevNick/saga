import * as express from 'express';
import { StorageAppService } from '../../common/services/app/storage/storage.app.service';
import { Order } from '../../common/types/order';
import { StatusType } from '../../common/enums/status.enum';
import { BaseSqlDataService } from '../../common/services/data/base-sql/base.sql.data.service';
import { Query } from '../../common/entities/query/query';
import { BaseDataService } from '../../common/services/data/base/base.data.service';
import { EventType } from '../../common/enums/event.enum';

export class AppController {
    private dataService = new BaseDataService();
    private storageAppService = new StorageAppService();
    private sqlService = new BaseSqlDataService({ host: 'localhost', port: 5550, database: 'supply', user: 'postgres', password: '000000' });
    private params = { table: 'order' };

    async list(_: express.Request, res: express.Response): Promise<void> {
        const query = 'select * from finance.order';
        const data = await this.sqlService.query(new Query(query));
        res.send(data);
    }


    async update(req: express.Request, res: express.Response): Promise<void> {
        console.log('got request with body', JSON.stringify(req.body, null, 4));
        const { event, payload } = req.body;

        if (event === EventType.ORDER_STARTED) {
            try {
                await this.createOrder(payload)
                await this.updateOrder(payload.id, StatusType.RESOLVED);
                res.status(200).send({ event: EventType.ORDER_RESOLVED });
            } catch (err) {
                // await this.updateOrder(payload.id, StatusType.UNKNOWN_ERROR);
                res.status(500).send({ event: EventType.ORDER_UNKNOWN_ERROR });
            }
        }

        // if (event === EventType.SUPPLY_UNKNOWN_ERROR) {
        //     await this.updateOrder(payload, StatusType.UNKNOWN_ERROR);
        // }

        if (event === EventType.SUPPLY_RESOLVED) {
            await this.updateOrder(payload, StatusType.RESOLVED);
        }
    }

    private async createOrder(order: Order): Promise<void> {
        order.orderStatus = StatusType.STARTED;
        order.id = await this.storageAppService.update<Order>(order, this.params);

        const event = EventType.ORDER_STARTED;
        const payload = order.id;
        console.log('request to supplier');
        await this.dataService.post('http://localhost:3002', { data: {
                event, payload
            }});
    }

    private async updateOrder(orderId: string, status: StatusType): Promise<void> {
        console.log('orderStatus', status);
        const order = { id: orderId, orderStatus: status } as Order;
        await this.storageAppService.update<Order>(order, this.params);
    }
}
