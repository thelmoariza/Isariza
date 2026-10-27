# Isariza Sabores · Tienda en línea

E-commerce de **Isariza Sabores** («Sabor natural y artesanal»): chimichurri, ají picante, pepinos encurtidos, cebolla y ají encurtidos en 250 gr y 110 gr, y la **Caja Especial** de 4 sabores.

| Pieza | Tecnología |
|---|---|
| Frontend + backend | Next.js 14 (App Router) + TypeScript + Tailwind |
| Pagos | **Wompi** (Bancolombia): PSE, tarjetas, Nequi, botón Bancolombia |
| Carrito | Cliente (localStorage), precios **recalculados en servidor** |
| Pedidos | Archivo JSON (local) o **DynamoDB** (AWS) |
| Analítica | **GA4** con embudo de ecommerce completo → [docs/GA4.md](docs/GA4.md) |
| Omnicanalidad | Instagram @isariza.sabores, WhatsApp, feed de catálogo Meta → [docs/OMNICANALIDAD.md](docs/OMNICANALIDAD.md) |
| Infraestructura | Docker · AWS App Runner + ECR + DynamoDB + SSM (Terraform) · GitHub Actions |

---

## 1. Correr en tu equipo (5 minutos)

Requisitos: **Node 20 LTS o superior** (<https://nodejs.org>).

**En Windows:** doble clic en **`iniciar.bat`**. Instala dependencias la primera vez, crea `.env.local` y abre el navegador.

O desde una terminal:

```bash
npm install
cp .env.example .env.local      # ya funciona sin editar nada
npm run dev                      # http://localhost:3000
```

Sin llaves de Wompi, el botón **Pagar** te lleva a un **simulador de pagos** local (aprobado / rechazado / pendiente) para probar el flujo completo. Los pedidos quedan en `data/orders.json` y se ven en **http://localhost:3000/admin/pedidos** (usuario/clave de `.env.local`).

### Probar con Wompi sandbox (pagos reales de prueba)
1. Crea tu cuenta en <https://comercios.wompi.co> → **Desarrolladores** → copia las llaves de **Sandbox**:
   `WOMPI_PUBLIC_KEY` (pub_test_…), `WOMPI_INTEGRITY_SECRET` (test_integrity_…), `WOMPI_EVENTS_SECRET` (test_events_…).
2. Pégalas en `.env.local` y reinicia `npm run dev`. Ahora el pago redirige a `checkout.wompi.co`.
3. Datos de prueba sandbox: tarjeta aprobada `4242 4242 4242 4242` (cualquier CVC/fecha futura), declinada `4111 1111 1111 1111`; Nequi aprobado `3991111111`, declinado `3992222222`. PSE: elige el banco de prueba y el resultado.
4. Al volver, `/pedido/resultado` consulta la transacción en la API de Wompi y actualiza el pedido.
5. *(Opcional)* Para recibir el **webhook** en local, expón tu puerto con `ngrok http 3000` y registra `https://<tu-ngrok>/api/webhooks/wompi` como URL de eventos en Wompi.

### Probar como en producción (Docker + DynamoDB Local)
```bash
docker compose up --build        # http://localhost:3000 — pedidos en DynamoDB Local
```

### Pruebas
```bash
npm test                 # firmas de Wompi (integridad y webhook), incl. vector oficial de la doc
npm run typecheck && npm run lint
# E2E del flujo de compra (con el servidor corriendo):
npm i -D playwright && npx playwright install chromium
BASE_URL=http://localhost:3000 node tests/e2e.mjs
```

---

## 2. Catálogo: agregar un nuevo SKU

Todo el catálogo está en **`src/data/catalog.ts`** (precios en COP, IVA incluido).

- **Nueva presentación** de un sabor existente → agrega un objeto en `variants` (ej. `ISZ-CHI-500`, `500 gr`).
- **Nuevo sabor** → copia un producto completo, cambia `slug`, textos, `heat` (0–3) y `variants`.
- **Nuevo combo** → `kind: "bundle"` y `components` con los SKUs incluidos.
- Fotos en `public/img/products/` (cuadradas, ≥ 800 px).
- `handmade: true` es obligatorio: **todo producto muestra el sello y el mensaje artesanal** de `src/data/brand.ts`. Si cambias ese mensaje, se actualiza en tienda, fichas, checkout y feed de Instagram.
- `stock: null` = producción bajo pedido; un número activa el control (0 = “Agotado · nuevo lote pronto”).

El nuevo SKU aparece automáticamente en tienda, sitemap, datos estructurados (Google) y en el **feed de catálogo de Instagram**.

> **Pendiente de confirmar:** precio del frasco individual de 110 gr (hoy $8.000). Confirmados: 250 gr $15.000 · Caja 4×110 gr $30.000.
> Envío: tarifa nacional $12.000, ciudad de origen $7.000, gratis desde $60.000 (`shipping` en el mismo archivo; ajusta `originCity`).

---

## 3. Desplegar en AWS

Arquitectura:

```
Instagram / Google / WhatsApp ──► App Runner (contenedor Next.js, HTTPS, autoescala 1–3)
                                      │  ├─ DynamoDB  (pedidos, PITR, cifrado)
                                      │  └─ SSM Parameter Store (secretos Wompi, clave admin)
GitHub Actions ──OIDC──► ECR (imagen :latest) ──auto-deploy──┘
Wompi ──webhook──► /api/webhooks/wompi
```

Costo estimado con tráfico bajo: App Runner 0.25 vCPU/0.5 GB ≈ USD 5–15/mes activo; DynamoDB y SSM ≈ centavos.

### Primera vez
Requisitos: AWS CLI configurado, Terraform ≥ 1.6, Docker.

```bash
cd infra/terraform
cp terraform.tfvars.example terraform.tfvars   # edita site_url, wompi_public_key, github_repo
terraform init

# a) Crear primero el repositorio de imágenes
terraform apply -target=aws_ecr_repository.app

# b) Subir la primera imagen (en Windows: usar Git Bash o WSL)
cd ../.. && SITE_URL=https://isarizasabores.com GA_ID=G-XXXXXXX ./scripts/deploy-manual.sh

# c) Crear el resto (App Runner, DynamoDB, IAM, SSM)
cd infra/terraform && terraform apply

# d) Cargar los secretos reales (una sola vez; Terraform no los sobrescribe)
aws ssm put-parameter --overwrite --type SecureString --name /isariza-store/prod/WOMPI_INTEGRITY_SECRET --value '...'
aws ssm put-parameter --overwrite --type SecureString --name /isariza-store/prod/WOMPI_EVENTS_SECRET    --value '...'
aws ssm put-parameter --overwrite --type SecureString --name /isariza-store/prod/ADMIN_PASSWORD         --value '...'
aws apprunner start-deployment --service-arn $(aws apprunner list-services --query "ServiceSummaryList[?ServiceName=='isariza-store-prod'].ServiceArn" --output text)
```

Luego:
- En **Wompi** → URL de eventos: valor del output `wompi_webhook_url`.
- **Dominio propio**: pon `custom_domain` en tfvars, `terraform apply` y crea en tu DNS los registros del output `custom_domain_dns_records`. Actualiza `site_url`.
- **Salir a producción**: `wompi_env = "production"`, llave pública `pub_prod_…` y secretos `prod_…` en SSM.

### Despliegue continuo (GitHub Actions)
1. Pon `github_repo = "usuario/repo"` en tfvars y `terraform apply`.
2. En GitHub → Settings → Secrets: `AWS_DEPLOY_ROLE_ARN` (output `github_deploy_role_arn`). Variables: `GA_MEASUREMENT_ID`, `SITE_URL`.
3. Cada push a `main` corre pruebas, construye, sube a ECR y App Runner despliega solo.

> `NEXT_PUBLIC_GA_MEASUREMENT_ID` y `SITE_URL` se embeben en el build (son públicas). Los secretos de Wompi solo existen en el servidor.

---

## 4. Seguridad incluida
- Precios y envío **siempre recalculados en servidor**; el navegador solo envía SKU y cantidad.
- Firma de integridad SHA-256 para Wompi; el monto y la moneda de la transacción se validan contra el pedido.
- Webhook verificado con checksum (`WOMPI_EVENTS_SECRET`) y comparación en tiempo constante.
- `/admin` con autenticación básica; secretos en SSM SecureString; IAM de mínimo privilegio.
- El simulador de pagos solo existe en desarrollo o con `PAYMENT_SIMULATOR=true` (nunca en AWS).
- Política de datos (Ley 1581/2012) y aceptación obligatoria en el checkout. **Haz revisar `/politicas` por un asesor legal.**

## 5. Estructura
```
src/data/brand.ts        Marca, mensajes y canales (fuente única para tienda + Instagram + WhatsApp)
src/data/catalog.ts      Productos, SKUs, precios, envío
src/lib/wompi.ts         Firma, URL de checkout, consulta de transacción, verificación de webhook
src/lib/orders.ts        Repositorio de pedidos (archivo | DynamoDB)
src/lib/analytics.ts     Eventos GA4
src/app/api/feed/meta    Feed de catálogo para Instagram Shopping
infra/terraform          AWS (App Runner, ECR, DynamoDB, SSM, IAM, OIDC)
```
