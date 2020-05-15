declare module "fnv-plus" {
    export type Keyspace = 32 | 52 | 64 | 128 | 256 | 512 | 1024;

    export type Version = "1a" | "1";

    export function hash(message: any, keyspace: Keyspace): number;
    export function setKeyspace(keyspace: Keyspace): void;
    export function version(version: Version): void;
    export function useUTF8(utf8: boolean): void;
    export function seed(seed: number): void;
    export function fast1a32(str: string): number;
    export function fast1a32hex(str: string): number;
    export function fast1a52(str: string): number;
    export function fast1a52hex(str: string): number;
    export function fast1a64(str: string): number;
    export function fast1a32utf(str: string): number;
    export function fast1a32hexutf(str: string): number;
    export function fast1a52utf(str: string): number;
    export function fast1a52hexutf(str: string): number;
    export function fast1a64utf(str: string): number;
}
