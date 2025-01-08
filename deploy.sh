echo "removing unused docker containers"
docker container prune -f

echo "removing unused docker images"
docker image prune -f

echo "enabled minicube docker env"
eval $(minikube docker-env)

echo "building new docker image"
docker build -t appointment-service-api:latest .

echo "appliyng deployment yml"
kubectl apply -f deployment.yaml
