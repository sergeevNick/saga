import { SelectorOperatorType } from '../../enums/selector-operator.enum';
import { SimpleSelector } from './simple-selector';

describe('SimpleSelector', () => {

    describe('#constructor', () => {

        it('should init default operator', () => {
            const selector = new SimpleSelector({ field: 'test', value: 1 });
            expect(selector.operator).toEqual(SelectorOperatorType.EQUAL);
        });
    });

    describe('#getCondition', () => {

        it('should create correct condition', () => {
            const options = { field: 'test', value: 1 };
            const selector = new SimpleSelector(options);

            const query = selector.getQueryCondition();

            const { field, value } = options;
            expect(query.template).toEqual(`${field} ${SelectorOperatorType.EQUAL} $${field}`);
            expect(query.values).toEqual({ [field]: value });
        });
    });
});