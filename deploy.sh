echo "enabled minicube docker env"
eval $(minikube docker-env)

echo "removing unused docker containers"
docker container prune -f

echo "removing unused docker images"
docker image prune -f

echo "building new docker image"
docker build -t appointment-service-api .

echo "appliyng deployment yml"
kubectl apply -f deployment.yaml

echo "forwarding port"
nohup kubectl port-forward svc/appointment-api-service 3002:3002 > port-forward.log 2>&1 &