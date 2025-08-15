docker compose up --detach
terraform init
until curl http://127.0.0.1:9003
do
  echo "waiting for keycloak to start"
  sleep 3
done
terraform apply -auto-approve