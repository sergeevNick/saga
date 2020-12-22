import { StatusType } from '../enums/status.enum';
import { BaseModel } from './base.model';

export interface Order extends BaseModel {
    name: string;
    quantity?: number;
    orderStatus?: StatusType;
    supplyStatus?: StatusType;
    deliveryStatus?: StatusType;
}
