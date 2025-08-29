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
cd frontend;

# Source nvm so it's available in the script
export NVM_DIR="$HOME/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"  # This loads nvm
[ -s "$NVM_DIR/bash_completion" ] && \. "$NVM_DIR/bash_completion"  # This loads nvm bash_completion

nvm use;
pnpm install;
pnpm start;

