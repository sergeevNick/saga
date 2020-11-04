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
        console.log('got request wit body', JSON.stringify(req.body, null, 4));
        const { event, payload } = req.body;
        const order = { id: payload } as Order;

        if (event !== EventType.SUPPLY_STARTED) {
            res.status(500).send(order);
            return
        }

        order.deliveryStatus = StatusType.STARTED;
        await this.storageAppService.update<Order>(order, this.params);
        if (this.hasError()) {
            console.error('Error in delivery');
            console.log('deliveryStatus', StatusType.REJECTED);
            order.deliveryStatus = StatusType.REJECTED;
            await this.storageAppService.update<Order>(order, this.params);
            res.status(500).send(order);
            return;
        }

        console.log('deliveryStatus', StatusType.RESOLVED);
        order.deliveryStatus = StatusType.RESOLVED;
        await this.storageAppService.update<Order>(order, this.params);
        res.status(200).send(order);
        return;
    }

    private hasError(): boolean {
        return Math.random() < this.errorProbability;
    }
}
