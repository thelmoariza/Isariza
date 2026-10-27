import "server-only";
import crypto from "node:crypto";
import { promises as fs } from "node:fs";
import path from "node:path";
import type { PricedLine } from "./pricing";

export type OrderStatus = "PENDING" | "APPROVED" | "DECLINED" | "VOIDED" | "ERROR";

export interface Order {
  reference: string;
  createdAt: string;
  updatedAt: string;
  status: OrderStatus;
  customer: {
    fullName: string;
    email: string;
    phone: string;
    legalIdType: string;
    legalId: string;
  };
  shippingAddress: { address: string; city: string; department: string; notes?: string };
  lines: PricedLine[];
  subtotal: number;
  shipping: number;
  total: number;
  currency: "COP";
  attribution?: { source?: string; medium?: string; campaign?: string; content?: string };
  gaClientId?: string;
  payment?: { provider: "wompi"; transactionId?: string; method?: string; statusMessage?: string | null };
  purchaseTracked?: boolean;
}

export function newReference() {
  const d = new Date();
  const ymd = `${d.getFullYear()}${String(d.getMonth() + 1).padStart(2, "0")}${String(d.getDate()).padStart(2, "0")}`;
  return `ISZ-${ymd}-${crypto.randomBytes(3).toString("hex").toUpperCase()}`;
}

interface OrderStore {
  create(o: Order): Promise<void>;
  get(reference: string): Promise<Order | null>;
  update(reference: string, patch: Partial<Order>): Promise<Order | null>;
  list(limit?: number): Promise<Order[]>;
}

// ---------------- Archivo JSON (desarrollo local) ----------------
class FileStore implements OrderStore {
  // En Vercel solo /tmp es escribible (temporal: sirve para pruebas, no para producción)
  private file = process.env.ORDERS_FILE || (process.env.VERCEL ? "/tmp/orders.json" : path.join(process.cwd(), "data", "orders.json"));
  private async readAll(): Promise<Record<string, Order>> {
    try {
      return JSON.parse(await fs.readFile(this.file, "utf8"));
    } catch {
      return {};
    }
  }
  private async writeAll(all: Record<string, Order>) {
    await fs.mkdir(path.dirname(this.file), { recursive: true });
    await fs.writeFile(this.file, JSON.stringify(all, null, 2));
  }
  async create(o: Order) {
    const all = await this.readAll();
    all[o.reference] = o;
    await this.writeAll(all);
  }
  async get(ref: string) {
    return (await this.readAll())[ref] ?? null;
  }
  async update(ref: string, patch: Partial<Order>) {
    const all = await this.readAll();
    if (!all[ref]) return null;
    all[ref] = { ...all[ref], ...patch, updatedAt: new Date().toISOString() };
    await this.writeAll(all);
    return all[ref];
  }
  async list(limit = 200) {
    return Object.values(await this.readAll())
      .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
      .slice(0, limit);
  }
}

// ---------------- DynamoDB (AWS / DynamoDB Local) ----------------
class DynamoStore implements OrderStore {
  private table = process.env.DYNAMODB_TABLE ?? "isariza-orders";
  private docPromise = (async () => {
    const { DynamoDBClient } = await import("@aws-sdk/client-dynamodb");
    const { DynamoDBDocumentClient } = await import("@aws-sdk/lib-dynamodb");
    const endpoint = process.env.DYNAMODB_ENDPOINT || undefined;
    const client = new DynamoDBClient({
      region: process.env.AWS_REGION ?? "us-east-1",
      ...(endpoint ? { endpoint, credentials: { accessKeyId: "local", secretAccessKey: "local" } } : {}),
    });
    return DynamoDBDocumentClient.from(client, { marshallOptions: { removeUndefinedValues: true } });
  })();

  async create(o: Order) {
    const { PutCommand } = await import("@aws-sdk/lib-dynamodb");
    await (await this.docPromise).send(
      new PutCommand({ TableName: this.table, Item: { ...o, pk: "ORDER" }, ConditionExpression: "attribute_not_exists(reference)" }),
    );
  }
  async get(reference: string) {
    const { GetCommand } = await import("@aws-sdk/lib-dynamodb");
    const r = await (await this.docPromise).send(new GetCommand({ TableName: this.table, Key: { reference } }));
    return (r.Item as Order) ?? null;
  }
  async update(reference: string, patch: Partial<Order>) {
    const current = await this.get(reference);
    if (!current) return null;
    const next = { ...current, ...patch, updatedAt: new Date().toISOString() };
    const { PutCommand } = await import("@aws-sdk/lib-dynamodb");
    await (await this.docPromise).send(new PutCommand({ TableName: this.table, Item: { ...next, pk: "ORDER" } }));
    return next;
  }
  async list(limit = 200) {
    const { QueryCommand } = await import("@aws-sdk/lib-dynamodb");
    const r = await (await this.docPromise).send(
      new QueryCommand({
        TableName: this.table,
        IndexName: "byCreatedAt",
        KeyConditionExpression: "pk = :pk",
        ExpressionAttributeValues: { ":pk": "ORDER" },
        ScanIndexForward: false,
        Limit: limit,
      }),
    );
    return (r.Items as Order[]) ?? [];
  }
}

let store: OrderStore | null = null;
export function orders(): OrderStore {
  if (!store) store = process.env.ORDERS_STORE === "dynamodb" ? new DynamoStore() : new FileStore();
  return store;
}
