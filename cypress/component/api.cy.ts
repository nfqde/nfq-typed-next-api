/* eslint-disable @nfq/no-magic-numbers */
import {connectable, TypedRoute} from '../../src/api';
import {HTTP_METHODS} from '../../src/utils/constants';

describe('api.ts', () => {
    context('connectable', () => {
        it('connectable is a function', () => {
            expect(connectable, 'connectable').to.be.a('function');
        });

        it('Connectable returns the same function', () => {
            /**
             * This is a dummy function to test the connectable function.
             *
             * @returns Returns a string.
             */
            const dummy = () => 'demo';

            expect(connectable(dummy)).to.equal(dummy);
        });
    });

    context('TypedRoute', () => {
        it('TypedRoute is a function', () => {
            expect(TypedRoute, 'TypedRoute').to.be.a('function');
        });

        it('Returns the route as connectable function', () => {
            const test = TypedRoute(HTTP_METHODS.GET, async () => Promise.resolve({
                data: 'demo',
                status: 200
            }));

            expect(test).to.have.property('length', 2);
        });
    });
});