locals {
  name = "${var.app_name}-${var.environment}"
}

data "aws_caller_identity" "current" {}

# ---------------------------------------------------------------- ECR
resource "aws_ecr_repository" "app" {
  name                 = var.app_name
  image_tag_mutability = "MUTABLE"
  image_scanning_configuration { scan_on_push = true }
  force_delete = false
}

resource "aws_ecr_lifecycle_policy" "app" {
  repository = aws_ecr_repository.app.name
  policy = jsonencode({
    rules = [{
      rulePriority = 1
      description  = "Conservar las últimas 15 imágenes"
      selection    = { tagStatus = "any", countType = "imageCountMoreThan", countNumber = 15 }
      action       = { type = "expire" }
    }]
  })
}

# ---------------------------------------------------------------- DynamoDB (pedidos)
resource "aws_dynamodb_table" "orders" {
  name         = "${local.name}-orders"
  billing_mode = "PAY_PER_REQUEST"
  hash_key     = "reference"

  attribute {
    name = "reference"
    type = "S"
  }
  attribute {
    name = "pk"
    type = "S"
  }
  attribute {
    name = "createdAt"
    type = "S"
  }

  global_secondary_index {
    name            = "byCreatedAt"
    hash_key        = "pk"
    range_key       = "createdAt"
    projection_type = "ALL"
  }

  point_in_time_recovery { enabled = true }
  server_side_encryption { enabled = true }
  deletion_protection_enabled = true
}

# ---------------------------------------------------------------- Secretos (SSM Parameter Store)
# Terraform crea los parámetros con un valor provisional; los valores reales se
# cargan UNA vez por consola o CLI y Terraform no los vuelve a tocar:
#   aws ssm put-parameter --overwrite --type SecureString \
#     --name /isariza-store/prod/WOMPI_INTEGRITY_SECRET --value 'prod_integrity_...'
locals {
  secret_names = ["WOMPI_INTEGRITY_SECRET", "WOMPI_EVENTS_SECRET", "ADMIN_PASSWORD"]
}

resource "aws_ssm_parameter" "secrets" {
  for_each = toset(local.secret_names)
  name     = "/${var.app_name}/${var.environment}/${each.key}"
  type     = "SecureString"
  value    = "CHANGE_ME"
  lifecycle { ignore_changes = [value] }
}

# ---------------------------------------------------------------- IAM
resource "aws_iam_role" "apprunner_ecr" {
  name = "${local.name}-apprunner-ecr"
  assume_role_policy = jsonencode({
    Version   = "2012-10-17"
    Statement = [{ Effect = "Allow", Principal = { Service = "build.apprunner.amazonaws.com" }, Action = "sts:AssumeRole" }]
  })
}

resource "aws_iam_role_policy_attachment" "apprunner_ecr" {
  role       = aws_iam_role.apprunner_ecr.name
  policy_arn = "arn:aws:iam::aws:policy/service-role/AWSAppRunnerServicePolicyForECRAccess"
}

resource "aws_iam_role" "instance" {
  name = "${local.name}-instance"
  assume_role_policy = jsonencode({
    Version   = "2012-10-17"
    Statement = [{ Effect = "Allow", Principal = { Service = "tasks.apprunner.amazonaws.com" }, Action = "sts:AssumeRole" }]
  })
}

resource "aws_iam_role_policy" "instance" {
  role = aws_iam_role.instance.id
  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Effect   = "Allow"
        Action   = ["dynamodb:GetItem", "dynamodb:PutItem", "dynamodb:UpdateItem", "dynamodb:Query"]
        Resource = [aws_dynamodb_table.orders.arn, "${aws_dynamodb_table.orders.arn}/index/*"]
      },
      {
        Effect   = "Allow"
        Action   = ["ssm:GetParameters"]
        Resource = [for p in aws_ssm_parameter.secrets : p.arn]
      }
    ]
  })
}

# ---------------------------------------------------------------- App Runner
resource "aws_apprunner_auto_scaling_configuration_version" "app" {
  auto_scaling_configuration_name = "${var.app_name}-scaling"
  min_size                        = 1
  max_size                        = 3
  max_concurrency                 = 80
}

resource "aws_apprunner_service" "app" {
  service_name                   = local.name
  auto_scaling_configuration_arn = aws_apprunner_auto_scaling_configuration_version.app.arn

  source_configuration {
    auto_deployments_enabled = true # cada push de la imagen :latest a ECR despliega
    authentication_configuration { access_role_arn = aws_iam_role.apprunner_ecr.arn }

    image_repository {
      image_identifier      = "${aws_ecr_repository.app.repository_url}:${var.image_tag}"
      image_repository_type = "ECR"
      image_configuration {
        port = "3000"
        runtime_environment_variables = {
          SITE_URL         = var.site_url
          WOMPI_ENV        = var.wompi_env
          WOMPI_PUBLIC_KEY = var.wompi_public_key
          ORDERS_STORE     = "dynamodb"
          DYNAMODB_TABLE   = aws_dynamodb_table.orders.name
          AWS_REGION       = var.region
          ADMIN_USER       = "admin"
        }
        runtime_environment_secrets = { for k, p in aws_ssm_parameter.secrets : k => p.arn }
      }
    }
  }

  instance_configuration {
    cpu               = var.cpu
    memory            = var.memory
    instance_role_arn = aws_iam_role.instance.arn
  }

  health_check_configuration {
    protocol            = "HTTP"
    path                = "/api/health"
    interval            = 10
    healthy_threshold   = 1
    unhealthy_threshold = 5
  }

  depends_on = [aws_iam_role_policy_attachment.apprunner_ecr]
}

resource "aws_apprunner_custom_domain_association" "domain" {
  count                = var.custom_domain == "" ? 0 : 1
  domain_name          = var.custom_domain
  service_arn          = aws_apprunner_service.app.arn
  enable_www_subdomain = true
}

# ---------------------------------------------------------------- GitHub Actions (OIDC, opcional)
resource "aws_iam_openid_connect_provider" "github" {
  count           = var.github_repo == "" ? 0 : 1
  url             = "https://token.actions.githubusercontent.com"
  client_id_list  = ["sts.amazonaws.com"]
  thumbprint_list = ["6938fd4d98bab03faadb97b34396831e3780aea1"]
}

resource "aws_iam_role" "github_deploy" {
  count = var.github_repo == "" ? 0 : 1
  name  = "${local.name}-github-deploy"
  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [{
      Effect    = "Allow"
      Principal = { Federated = aws_iam_openid_connect_provider.github[0].arn }
      Action    = "sts:AssumeRoleWithWebIdentity"
      Condition = {
        StringEquals = { "token.actions.githubusercontent.com:aud" = "sts.amazonaws.com" }
        StringLike   = { "token.actions.githubusercontent.com:sub" = "repo:${var.github_repo}:ref:refs/heads/main" }
      }
    }]
  })
}

resource "aws_iam_role_policy" "github_deploy" {
  count = var.github_repo == "" ? 0 : 1
  role  = aws_iam_role.github_deploy[0].id
  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      { Effect = "Allow", Action = ["ecr:GetAuthorizationToken"], Resource = "*" },
      {
        Effect = "Allow"
        Action = ["ecr:BatchCheckLayerAvailability", "ecr:CompleteLayerUpload", "ecr:InitiateLayerUpload", "ecr:PutImage", "ecr:UploadLayerPart", "ecr:BatchGetImage", "ecr:GetDownloadUrlForLayer"]
        Resource = aws_ecr_repository.app.arn
      }
    ]
  })
}
