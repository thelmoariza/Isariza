variable "region" {
  description = "Región AWS. us-east-1 tiene App Runner; la más cercana a Colombia con App Runner es us-east-1."
  type        = string
  default     = "us-east-1"
}

variable "environment" {
  type    = string
  default = "prod"
}

variable "app_name" {
  type    = string
  default = "isariza-store"
}

variable "site_url" {
  description = "URL pública final (ej. https://isarizasabores.com). Si aún no hay dominio, usa la URL de App Runner tras el primer apply."
  type        = string
}

variable "custom_domain" {
  description = "Dominio propio para asociar a App Runner (opcional, ej. isarizasabores.com). Vacío = solo URL de App Runner."
  type        = string
  default     = ""
}

variable "image_tag" {
  type    = string
  default = "latest"
}

variable "wompi_env" {
  description = "sandbox | production"
  type        = string
  default     = "sandbox"
}

variable "wompi_public_key" {
  description = "Llave pública de Wompi (no es secreta)."
  type        = string
}

variable "github_repo" {
  description = "Repositorio 'owner/nombre' para permitir despliegues desde GitHub Actions vía OIDC. Vacío = no crear rol."
  type        = string
  default     = ""
}

variable "cpu" {
  type    = string
  default = "0.25 vCPU"
}

variable "memory" {
  type    = string
  default = "0.5 GB"
}
