terraform {
  required_version = ">= 1.6"
  required_providers {
    aws = { source = "hashicorp/aws", version = "~> 5.60" }
  }
  # Recomendado: estado remoto en S3 (crea el bucket primero y descomenta)
  # backend "s3" {
  #   bucket       = "isariza-terraform-state"
  #   key          = "store/terraform.tfstate"
  #   region       = "us-east-1"
  #   use_lockfile = true
  # }
}

provider "aws" {
  region = var.region
  default_tags {
    tags = { Project = "isariza-sabores", ManagedBy = "terraform", Environment = var.environment }
  }
}
