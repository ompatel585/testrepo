import { CacheStore } from '@nestjs/cache-manager';
import {
  CustomCacheEntry,
  CustomCacheManagerOptions,
} from './custom-cache-manager.interface';
import { ONE_MINUTE_IN_MILL_SEC } from '../common/constants';

class Node {
  key: string;
  value: CustomCacheEntry;
  next: Node | null = null;
  prev: Node | null = null;

  constructor(key: string, value: CustomCacheEntry) {
    this.key = key;
    this.value = value;
  }
}

export class CustomCacheStore implements CacheStore {
  private cache: Map<string, Node> = new Map();
  private currentSizeBytes: number = 0;
  private maxSizeBytes: number;
  private ttl: number;
  private head: Node | null = null;
  private tail: Node | null = null;

  constructor(options: CustomCacheManagerOptions) {
    this.maxSizeBytes = (options?.maxSizeInMB || 1) * 1024 * 1024;
    this.ttl = options?.ttl || ONE_MINUTE_IN_MILL_SEC;
  }

  private calculateSize(value: any): number {
    const stringify = (obj: any): string => {
      try {
        return JSON.stringify(obj);
      } catch (e) {
        return String(obj);
      }
    };
    return Buffer.byteLength(stringify(value), 'utf8');
  }

  private cleanExpired(): void {
    const now = Date.now();
    for (const [key, node] of this.cache.entries()) {
      const nodeTtl = node.value.ttl || this.ttl;
      if (nodeTtl && now - node.value.lastAccessed > nodeTtl) {
        this.currentSizeBytes -= node.value.size;
        this.cache.delete(key);
        this.removeNode(node);
      }
    }
  }

  private makeSpace(requiredSize: number): void {
    if (requiredSize > this.maxSizeBytes) {
      throw new Error(
        `Item size (${requiredSize} bytes) exceeds cache limit (${this.maxSizeBytes} bytes).`,
      );
    }

    this.cleanExpired();

    while (this.currentSizeBytes + requiredSize > this.maxSizeBytes && this.tail) {
      const node = this.tail;
      this.currentSizeBytes -= node.value.size;
      this.cache.delete(node.key);
      this.removeNode(node);
    }

    if (this.currentSizeBytes + requiredSize > this.maxSizeBytes) {
      throw new Error('Insufficient space in cache after cleanup.');
    }
  }

  private moveToHead(node: Node): void {
    if (this.head === node) {
      return;
    }
    this.removeNode(node);
    this.addToHead(node);
  }

  private removeNode(node: Node): void {
    if (node.prev) {
      node.prev.next = node.next;
    }
    if (node.next) {
      node.next.prev = node.prev;
    }

    if (this.head === node) {
      this.head = node.next;
    }
    if (this.tail === node) {
      this.tail = node.prev;
    }
  }

  private addToHead(node: Node): void {
    node.next = this.head;
    if (this.head) this.head.prev = node;
    this.head = node;

    if (!this.tail) this.tail = node;
  }

  async has(key: string): Promise<boolean> {
    return this.cache.has(key);
  }

  async get(key: string): Promise<any> {
    const node = this.cache.get(key);

    if (!node) return undefined;

    const now = Date.now();
    const nodeTtl = node.value.ttl || this.ttl;

    if (nodeTtl && now - node.value.lastAccessed > nodeTtl) {
      this.currentSizeBytes -= node.value.size;
      this.cache.delete(key);
      this.removeNode(node);
      return undefined;
    }

    return node.value.value;
  }

  async set(key: string, value: any, ttl?: number): Promise<void> {
    const size = this.calculateSize(value);
    const actualTtl = ttl || this.ttl;

    const node = new Node(key, {
      value,
      size,
      lastAccessed: Date.now(),
      ttl: actualTtl,
    });

    if (this.cache.has(key)) {
      this.currentSizeBytes -= this.cache.get(key)!.value.size;
    }

    this.makeSpace(size);

    this.cache.set(key, node);
    this.currentSizeBytes += size;
    this.addToHead(node);
  }

  async del(key: string): Promise<void> {
    const node = this.cache.get(key);
    if (node) {
      this.currentSizeBytes -= node.value.size;
      this.cache.delete(key);
      this.removeNode(node);
    }
  }

  async reset(): Promise<void> {
    this.cache.clear();
    this.currentSizeBytes = 0;
    this.head = this.tail = null;
  }

  getCacheSize(): number {
    return this.currentSizeBytes;
  }

  getCacheSizeInMB(): number {
    return parseFloat((this.currentSizeBytes / (1024 * 1024)).toFixed(3));
  }

  getCacheSizeInKB(): number {
    return parseFloat((this.currentSizeBytes / 1024).toFixed(3));
  }

  getItemCount(): number {
    return this.cache.size;
  }

  getCacheMemoryUtilizationPercentage(): number {
    if (this.maxSizeBytes === 0) return 0;
    return parseFloat(((this.currentSizeBytes / this.maxSizeBytes) * 100).toFixed(3));
  }

  getOldestItemAndExpiry(): { item: any; expiresInSeconds: number | null } | null {
    if (!this.tail) return null;

    const now = Date.now();
    const oldestItem = this.tail.key;
    const nodeTtl = this.tail.value.ttl || this.ttl;
    const timeElapsed = now - this.tail.value.lastAccessed;
    const expiresInSeconds = nodeTtl
      ? Math.max(Math.ceil((nodeTtl - timeElapsed) / 1000), 0)
      : null;

    return { item: oldestItem, expiresInSeconds };
  }
}
