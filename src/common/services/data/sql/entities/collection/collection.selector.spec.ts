import { CollectionSelector } from './collection.selector';
import { SelectorOperatorType } from '../../enums/selector-operator.enum';

describe('CollectionSelector', () => {

    describe('#constructor', () => {

        it ('should init default operator', () => {
            const selector = new CollectionSelector({ field: 'test', value: [] });
            expect(selector.operator).toEqual(SelectorOperatorType.IN);
        });
    });

    describe('#getQueryCondition', () => {

        it ('should create correct string condition', () => {
            const options = { field: 'test', value: ['value'] };
            const selector = new CollectionSelector(options);

            const query = selector.getQueryCondition();

            const { field, value } = options;
            expect(query.template).toEqual(`lower(${field}) ${SelectorOperatorType.IN} (lower($${field}0))`);
            expect(query.values).toEqual({ [`${field}0`]: value[0] });
        });

        it ('should create correct number condition', () => {
            const options = { field: 'test', value: [1] };
            const selector = new CollectionSelector(options);

            const query = selector.getQueryCondition();

            const { field, value } = options;
            expect(query.template).toEqual(`${field} ${SelectorOperatorType.IN} ($${field}0)`);
            expect(query.values).toEqual({ [`${field}0`]: value[0] });
        });
    });
});