import { Dictionary } from '@eigenspace/common-types';

export type ValueType = string | string[] | number | boolean | null | undefined;
export type QueryValues = Dictionary<ValueType>;

export class Query {
    template: string;
    values: QueryValues;

    constructor(template: string, values: QueryValues = {}) {
        this.template = template;
        this.values = values;
    }
}
