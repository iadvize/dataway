import { reduce, success, foldMap, failure, loading, notAsked, reduceRight } from '../src/main';
import { monoidString } from 'fp-ts/lib/Monoid';
import { identity } from 'fp-ts/lib/function';

describe('Dataway', () => {
    it('reduce', () => {
        expect(reduce<string, string[]>([], (b, a) => [...b, a] )(success('test'))).toEqual(['test'])
        expect(reduce<string, string[]>([], (b, a) => [...b, a] )(failure('message'))).toEqual([])
        expect(reduce<string, string[]>([], (b, a) => [...b, a] )(loading)).toEqual([])
        expect(reduce<string, string[]>([], (b, a) => [...b, a] )(notAsked)).toEqual([])
    });
    it('reduceRight', () => {
        expect(reduceRight<string, string[]>([], (a, b) => [...b, a] )(success('test'))).toEqual(['test'])
        expect(reduceRight<string, string[]>([], (a, b) => [...b, a] )(failure('message'))).toEqual([])
        expect(reduceRight<string, string[]>([], (a, b) => [...b, a] )(loading)).toEqual([])
        expect(reduceRight<string, string[]>([], (a, b) => [...b, a] )(notAsked)).toEqual([])
    });
    it('foldMap', () => {
        expect(foldMap<string>(monoidString)<string>(identity)(success('test'))).toEqual('test');
        expect(foldMap<string>(monoidString)<string>(identity)(failure('message'))).toEqual('');
        expect(foldMap<string>(monoidString)<string>(identity)(loading)).toEqual('');
        expect(foldMap<string>(monoidString)<string>(identity)(notAsked)).toEqual('');
    });
})