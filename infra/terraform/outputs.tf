output "service_url" {
  description = "URL pública de App Runner"
  value       = "https://${aws_apprunner_service.app.service_url}"
}

output "ecr_repository_url" {
  value = aws_ecr_repository.app.repository_url
}

output "orders_table" {
  value = aws_dynamodb_table.orders.name
}

output "wompi_webhook_url" {
  description = "Configúrala en comercios.wompi.co → Desarrolladores → URL de eventos"
  value       = "${var.site_url}/api/webhooks/wompi"
}

output "meta_catalog_feed_url" {
  description = "Feed programado para Meta Commerce Manager (Instagram Shopping)"
  value       = "${var.site_url}/api/feed/meta"
}

output "github_deploy_role_arn" {
  value = try(aws_iam_role.github_deploy[0].arn, null)
}

output "custom_domain_dns_records" {
  description = "Registros DNS a crear en tu proveedor de dominio para validar el dominio propio"
  value       = try(aws_apprunner_custom_domain_association.domain[0].certificate_validation_records, null)
}

output "ssm_secret_names" {
  value = [for p in aws_ssm_parameter.secrets : p.name]
}
