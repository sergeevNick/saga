import { EventType } from '../enums/event.enum';

export interface Event {
    type: EventType;
    payload: { id: string };
}
