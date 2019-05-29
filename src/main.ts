import { Functor2 } from 'fp-ts/lib/Functor';

declare module 'fp-ts/lib/HKT' {
  interface URI2HKT2<L, A> {
    RemoteData: RemoteData<L, A>;
  }
}

export const URI = 'RemoteData';

export type URI = typeof URI;

export type RemoteData<L, A> =
  | NotAsked<L, A>
  | Loading<L, A>
  | Failure<L, A>
  | Success<L, A>;

export class NotAsked<L, A> {
  readonly _tag = 'NotAsked';
  constructor() {}
  map<B>(f: (value: A) => B): RemoteData<L, B> {
    return this as any;
  }
}

export class Loading<L, A> {
  readonly _tag = 'Loading';
  constructor() {}
  map<B>(f: (value: A) => B): RemoteData<L, B> {
    return this as any;
  }
}

export class Failure<L, A> {
  readonly _tag = 'Failure';
  constructor(readonly value: L) {}
  map<B>(f: (a: A) => B): RemoteData<L, B> {
    return new Failure(this.value);
  }
}

export class Success<L, A> {
  readonly _tag = 'Success';
  constructor(readonly value: A) {}
  map<B>(f: (a: A) => B): RemoteData<L, B> {
    return new Success(f(this.value));
  }
}

export const notAsked = <L, A>(): RemoteData<L, A> => {
  return new NotAsked();
};
export const loading = <L, A>(): RemoteData<L, A> => {
  return new Loading();
};
export const failure = <L, A>(l: L): RemoteData<L, A> => {
  return new Failure(l);
};
export const success = <L, A>(a: A): RemoteData<L, A> => {
  return new Success(a);
};

const map = <L, A, B>(fa: RemoteData<L, A>, f: (a: A) => B): RemoteData<L, B> =>
  fa.map(f);

export const remoteData: Functor2<URI> = {
  URI,
  map,
};
