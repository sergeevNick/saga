import * as express from 'express';
import { StorageAppService } from '../../common/services/app/storage/storage.app.service';
import { EventType } from '../../common/enums/event.enum';
import { Order } from '../../common/types/order';
import { StatusType } from '../../common/enums/status.enum';

export class AppController {
    private storageAppService = new StorageAppService();
    private params = { table: 'order' };
    private errorProbability = 0.3;

    async update(req: express.Request, res: express.Response): Promise<void> {
        console.log('got request with body', JSON.stringify(req.body, null, 4));
        const { payload } = req.body;
        const order = { id: payload } as Order;

        try {
            await this.createDelivery(order);
            res.status(200).send({ event: EventType.DELIVERY_RESOLVED });
        } catch (err) {
            res.status(500).send({ event: EventType.DELIVERY_UNKNOWN_ERROR });
        }
    }

    async createDelivery(order: Order): Promise<void> {
        order.deliveryStatus = StatusType.STARTED;
        await this.storageAppService.update<Order>(order, this.params);
        if (this.hasError()) {
            console.log('deliveryStatus', StatusType.UNKNOWN_ERROR);
            order.deliveryStatus = StatusType.UNKNOWN_ERROR;
            await this.storageAppService.update<Order>(order, this.params);

            console.log('Error in delivery');
            throw new Error('Error in delivery');
        }

        console.log('deliveryStatus', StatusType.RESOLVED);
        order.deliveryStatus = StatusType.RESOLVED;
        await this.storageAppService.update<Order>(order, this.params);
    }

    private hasError(): boolean {
        return Math.random() < this.errorProbability;
    }
}
