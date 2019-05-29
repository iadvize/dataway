import { remoteData, notAsked, loading, failure, success } from '../src/main';

describe('RemoteData', () => {
  it('map', () => {
    const f = (s: string): number => s.length;
    expect(notAsked<string, string>().map(f)).toEqual(notAsked());
    expect(loading<string, string>().map(f)).toEqual(loading());
    expect(failure<string, string>('xyz').map(f)).toEqual(failure('xyz'));
    expect(success('abc').map(f)).toEqual(success(3));

    expect(remoteData.map(notAsked<string, string>(), f)).toEqual(notAsked());
    expect(remoteData.map(loading<string, string>(), f)).toEqual(loading());
    expect(remoteData.map(failure<string, string>('xyz'), f)).toEqual(
      failure('xyz'),
    );
    expect(remoteData.map(success('abc'), f)).toEqual(success(3));
  });
});
