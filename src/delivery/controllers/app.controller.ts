import * as express from 'express';
import { StorageAppService } from '../../common/services/app/storage/storage.app.service';
import { EventType } from '../../common/enums/event.enum';
import { Order } from '../../common/types/order';
import { StatusType } from '../../common/enums/status.enum';
import { BaseDataService } from '../../common/services/data/base/base.data.service';

export class AppController {
    private dataService = new BaseDataService();
    private storageAppService = new StorageAppService();
    private params = { table: 'order' };
    private errorProbability = 0.3;

    async update(req: express.Request, res: express.Response): Promise<void> {
        console.log('got request wit body', JSON.stringify(req.body, null, 4));
        const { payload } = req.body;
        const order = { id: payload } as Order;

        res.status(200).send({ event: EventType.DELIVERY_STARTED });

        order.deliveryStatus = StatusType.STARTED;
        await this.storageAppService.update<Order>(order, this.params);
        if (this.hasError()) {
            console.error('Error in delivery');
            console.log('deliveryStatus', StatusType.REJECTED);
            order.deliveryStatus = StatusType.REJECTED;
            await this.storageAppService.update<Order>(order, this.params);

            await this.request(EventType.DELIVERY_REJECTED, order.id!);
            return;
        }

        console.log('deliveryStatus', StatusType.RESOLVED);
        order.deliveryStatus = StatusType.RESOLVED;
        await this.storageAppService.update<Order>(order, this.params);
        await this.request(EventType.DELIVERY_RESOLVED, order.id!);
    }

    private async request(event: EventType, id: string): Promise<any> {
        return this.dataService.post('http://localhost:3002', {
            data: {
                event: event, payload: id
            }
        });
    }

    private hasError(): boolean {
        return Math.random() < this.errorProbability;
    }
}
