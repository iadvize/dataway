import { Functor2 } from 'fp-ts/lib/Functor';
import { Apply2 } from 'fp-ts/lib/Apply';
import { Applicative2 } from 'fp-ts/lib/Applicative';

declare module 'fp-ts/lib/HKT' {
  interface URI2HKT2<L, A> {
    Dataway: Dataway<L, A>;
  }
}

export const URI = 'Dataway';

export type URI = typeof URI;

export type Dataway<L, A> =
  | NotAsked<L, A>
  | Loading<L, A>
  | Failure<L, A>
  | Success<L, A>;

export class NotAsked<L, A> {
  readonly _tag = 'NotAsked';
  constructor() {}
  isNotAsked() {
    return true;
  }
  isLoading() {
    return false;
  }
  isFailure() {
    return false;
  }
  isSuccess() {
    return false;
  }

  map<B>(f: (a: A) => B): Dataway<L, B> {
    return this as any;
  }
  ap<B>(fab: Dataway<L, (a: A) => B>): Dataway<L, B> {
    if (fab.isFailure()) {
      return fab as any;
    }
    return (fab.isNotAsked() ? fab : this) as any;
  }
}

export class Loading<L, A> {
  readonly _tag = 'Loading';
  constructor() {}

  isNotAsked() {
    return false;
  }
  isLoading() {
    return true;
  }
  isFailure() {
    return false;
  }
  isSuccess() {
    return false;
  }

  map<B>(f: (a: A) => B): Dataway<L, B> {
    return this as any;
  }
  ap<B>(fab: Dataway<L, (a: A) => B>): Dataway<L, B> {
    if (fab.isNotAsked()) {
      return notAsked();
    }
    if (fab.isFailure()) {
      return fab as any;
    }
    return (fab.isLoading() ? fab : this) as any;
  }
}

export class Failure<L, A> {
  readonly _tag = 'Failure';
  constructor(readonly value: L) {}

  isNotAsked() {
    return false;
  }
  isLoading() {
    return false;
  }
  isFailure() {
    return true;
  }
  isSuccess() {
    return false;
  }

  map<B>(f: (a: A) => B): Dataway<L, B> {
    return this as any;
  }
  ap<B>(fab: Dataway<L, (a: A) => B>): Dataway<L, B> {
    return (fab.isFailure() ? fab : this) as any;
  }
}

export class Success<L, A> {
  readonly _tag = 'Success';
  constructor(readonly value: A) {}

  isNotAsked() {
    return false;
  }
  isLoading() {
    return false;
  }
  isFailure() {
    return false;
  }
  isSuccess() {
    return true;
  }

  map<B>(f: (a: A) => B): Dataway<L, B> {
    return new Success(f(this.value));
  }
  ap<B>(fab: Dataway<L, (a: A) => B>): Dataway<L, B> {
    if (fab.isSuccess()) {
      const _fab = fab as Success<L, (a: A) => B>;
      return this.map(_fab.value);
    }
    return fab as any;
  }
}

export const notAsked = <L, A>(): Dataway<L, A> => {
  return new NotAsked();
};
export const loading = <L, A>(): Dataway<L, A> => {
  return new Loading();
};
export const failure = <L, A>(l: L): Dataway<L, A> => {
  return new Failure(l);
};
export const success = <L, A>(a: A): Dataway<L, A> => {
  return new Success(a);
};

const of = success;

const ap = <L, A, B>(
  fab: Dataway<L, (a: A) => B>,
  fa: Dataway<L, A>,
): Dataway<L, B> => fa.ap(fab);

const map = <L, A, B>(fa: Dataway<L, A>, f: (a: A) => B): Dataway<L, B> =>
  fa.map(f);

export const map2 = <L, A, B, C>(
  f: (a: A) => (b: B) => C,
  fa: Dataway<L, A>,
  fb: Dataway<L, B>,
): Dataway<L, C> => ap(fa.map(f), fb);

export const map3 = <L, A, B, C, D>(
  f: (a: A) => (b: B) => (c: C) => D,
  fa: Dataway<L, A>,
  fb: Dataway<L, B>,
  fc: Dataway<L, C>,
): Dataway<L, D> => ap(ap(fa.map(f), fb), fc);

export const append = <L, A, B>(
  fa: Dataway<L, A>,
  fb: Dataway<L, B>,
): Dataway<L, [A, B]> => {
  return ap(fa.map((a: A) => (b: B): [A, B] => [a, b]), fb);
};

export const dataway: Functor2<URI> & Apply2<URI> & Applicative2<URI> = {
  URI,
  of,
  ap,
  map,
};
