import {
    expect,
} from 'chai';
import Animal from '../../../src/index.js'

describe('这是一个示例', () => {
    const dog = new Animal('dog');
    it('dog是Animal的一种实例', () => {
        expect(dog).to.be.an.instanceOf(Animal);
    })
    it('dog会吃东西', done => {
        setTimeout(() => {
            expect(dog).to.have.property('eat').and.is.an('function');
            done();
        }, 2000);
    })
})