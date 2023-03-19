/* eslint-disable @nfq/no-magic-numbers */
import {TypedRoute} from '../../src/api';
import {api} from '../../src/frontend';
import {HTTP_METHODS} from '../../src/utils/constants';

describe('frontend.ts', () => {
    context('api', () => {
        it('api is a function', () => {
            expect(api, 'api').to.be.a('function');
        });

        it('Api calls endpoint and returns data.', async () => {
            cy.intercept('GET', '/test', {
                body: {name: 'Peter Pan'},
                statusCode: 200
            });

            const getName = TypedRoute(
                HTTP_METHODS.GET,
                async () => Promise.resolve({
                    data: {name: 'Peter Pan'},
                    status: 200
                })
            );

            const test = await api<typeof getName>('http://localhost/test');

            expect(test).to.be.deep.equal({name: 'Peter Pan'});
        });
    });
});