import {demoFunction} from '../../src/index';

describe('dummy.cy.tsx', () => {
    it('playground', () => {
        expect(demoFunction()).to.equal('demo');
    });
});