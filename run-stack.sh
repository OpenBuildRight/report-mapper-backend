set -ex
mkdir -p local

cd local-env-setup
source setup.sh
cd ../

mvn spring-boot:run -Dspring-boot.run.profiles=local 2>&1 > local/backend.log &

echo "starting backend";
until curl -s http://localhost:8080/actuator/health > /dev/null; do
    echo "Waiting for backend to start..."
    sleep 1
done
echo "Backend started"

# Run the frontend
cd frontend
npm install
npm start

echo "starting frontend"

until curl -s http://localhost:3000 > /dev/null; do
    echo "Waiting for frontend to start..."
    sleep 1
done
echo "Frontend started"

echo "Stack started"
