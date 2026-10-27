// Crea la tabla de pedidos en DynamoDB Local (misma estructura que en AWS/Terraform).
import { DynamoDBClient, CreateTableCommand, DescribeTableCommand } from "@aws-sdk/client-dynamodb";

const TableName = process.env.DYNAMODB_TABLE ?? "isariza-orders";
const client = new DynamoDBClient({
  region: process.env.AWS_REGION ?? "us-east-1",
  endpoint: process.env.DYNAMODB_ENDPOINT ?? "http://localhost:8000",
  credentials: { accessKeyId: "local", secretAccessKey: "local" },
});

for (let i = 0; i < 20; i++) {
  try {
    await client.send(new DescribeTableCommand({ TableName }));
    console.log(`Tabla ${TableName} ya existe`);
    process.exit(0);
  } catch (e) {
    if (e.name === "ResourceNotFoundException") break;
    await new Promise((r) => setTimeout(r, 1000)); // DynamoDB Local aún iniciando
  }
}

await client.send(
  new CreateTableCommand({
    TableName,
    BillingMode: "PAY_PER_REQUEST",
    AttributeDefinitions: [
      { AttributeName: "reference", AttributeType: "S" },
      { AttributeName: "pk", AttributeType: "S" },
      { AttributeName: "createdAt", AttributeType: "S" },
    ],
    KeySchema: [{ AttributeName: "reference", KeyType: "HASH" }],
    GlobalSecondaryIndexes: [
      {
        IndexName: "byCreatedAt",
        KeySchema: [
          { AttributeName: "pk", KeyType: "HASH" },
          { AttributeName: "createdAt", KeyType: "RANGE" },
        ],
        Projection: { ProjectionType: "ALL" },
      },
    ],
  }),
);
console.log(`Tabla ${TableName} creada`);
