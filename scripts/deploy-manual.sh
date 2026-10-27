#!/usr/bin/env bash
# Despliegue manual (sin GitHub Actions): construye, sube a ECR y App Runner despliega solo.
# Uso: GA_ID=G-XXXX SITE_URL=https://isarizasabores.com ./scripts/deploy-manual.sh
set -euo pipefail
REGION="${AWS_REGION:-us-east-1}"
REPO="${ECR_REPOSITORY:-isariza-store}"
ACCOUNT=$(aws sts get-caller-identity --query Account --output text)
REGISTRY="$ACCOUNT.dkr.ecr.$REGION.amazonaws.com"
IMAGE="$REGISTRY/$REPO"
TAG=$(git rev-parse --short HEAD 2>/dev/null || date +%Y%m%d%H%M)

aws ecr get-login-password --region "$REGION" | docker login --username AWS --password-stdin "$REGISTRY"
docker build --platform linux/amd64 \
  --build-arg NEXT_PUBLIC_GA_MEASUREMENT_ID="${GA_ID:-}" \
  --build-arg SITE_URL="${SITE_URL:?Define SITE_URL}" \
  -t "$IMAGE:$TAG" -t "$IMAGE:latest" .
docker push "$IMAGE:$TAG"
docker push "$IMAGE:latest"
echo "✔ Imagen publicada: $IMAGE:$TAG — App Runner iniciará el despliegue automáticamente."
