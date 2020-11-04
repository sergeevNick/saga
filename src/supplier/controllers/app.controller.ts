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
    private errorProbability = 0.5;
    private interval: NodeJS.Timer;

    async update(req: express.Request, res: express.Response): Promise<void> {
        console.log('got request wit body', JSON.stringify(req.body, null, 4));
        const { event, payload } = req.body;
        const order = { id: payload } as Order;

        if (event !== EventType.ORDER_STARTED) {
            res.status(500).send(order);
            return
        }

        order.supplyStatus = StatusType.STARTED;
        await this.storageAppService.update<Order>(order, this.params);
        if (this.hasError()) {
            console.error('Error in supply');
            order.supplyStatus = StatusType.REJECTED;
            await this.storageAppService.update<Order>(order, this.params);
            res.status(500).send(order);
            return;
        }

        await this.storageAppService.update<Order>(order, this.params);

        res.status(200).send();
        this.interval = setInterval( async() => {
            await this.proceedSupply(order).catch(() => console.log('Delivery service is down'));
        }, 1000);
    }

    private async proceedSupply(order: Order): Promise<void> {
        const response = await this.dataService.post('http://localhost:3003', { data: {
                event: EventType.SUPPLY_STARTED, payload: order.id
            }});
        if (!response.ok) {
            console.log('supplyStatus', StatusType.REJECTED);
            order.supplyStatus = StatusType.REJECTED;
        } else {
            console.log('supplyStatus', StatusType.RESOLVED);
            order.supplyStatus = StatusType.RESOLVED;
        }

        await this.storageAppService.update<Order>(order, this.params);
        clearInterval(this.interval);
    }

    private hasError(): boolean {
        return Math.random() < this.errorProbability;
    }
}
