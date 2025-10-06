// global.d.ts
declare global {
  interface PageProps {
    // Make params a plain object, not a Promise
    params: { [key: string]: string | string[] };
    searchParams?: Record<string, string | string[] | undefined>;
  }
}
