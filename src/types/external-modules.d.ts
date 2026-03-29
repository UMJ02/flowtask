declare module "@hookform/resolvers/zod" {
  export function zodResolver(...args: any[]): any;
}

declare module "@supabase/ssr" {
  export function createBrowserClient(...args: any[]): any;
  export function createServerClient(...args: any[]): any;
}
