#!/bin/bash

PYTHON_BIN_DEFAULT=`python3 -c "import sys; print(sys.executable)"`

read -p "Site domain: " DOMAIN

read -p "Application server domain: " APP_SERVER_DOMAIN

read -p "CPanel server host: " CPANEL_SERVER_HOST
read -p "CPanel server port: " CPANEL_SERVER_PORT
CPANEL_SERVER_DOMAIN=$CPANEL_SERVER_HOST:$CPANEL_SERVER_PORT

read -p "Screen name prefix []: " SCREEN_NAME

read -p "Project directory []: " PROJECT_DIR

read -p "Python executable to use [ $PYTHON_BIN_DEFAULT ]: " PYTHON_BIN
PYTHON_BIN=${PYTHON_BIN:-"$PYTHON_BIN_DEFAULT"}

read -p "virtualenv to use [ virtualenv ]: " VIRTUALENV_BIN
VIRTUALENV_BIN=${VIRTUALENV_BIN:-"virtualenv"}

SECRET_KEY=`tr -dc A-Za-z0-9 < /dev/urandom | head -c 64 | xargs`

echo "[eppabasic]"										>  settings.ini
echo "screen_name=$SCREEN_NAME"							>> settings.ini
echo "app_server_domain=$APP_SERVER_DOMAIN"				>> settings.ini
echo "cpanel_server_host=$CPANEL_SERVER_HOST"			>> settings.ini
echo "cpanel_server_port=$CPANEL_SERVER_PORT"			>> settings.ini

cd ..
$VIRTUALENV_BIN -p "$PYTHON_BIN" virtenv
cp tools/.htaccess virtenv/

source virtenv/bin/activate

# Setup virtualenv
pip install django

deactivate

mkdir -p static
STATIC_ROOT=`readlink -f static`

rm -f .htaccess
rm -f eppabasic_backend/eppabasic_backend/settings.py
cp .htaccess.template .htaccess
cp eppabasic_backend/eppabasic_backend/settings.py.template eppabasic_backend/eppabasic_backend/settings.py

sed -i 's/INSERT_APP_SERVER_DOMAIN_HERE/'$APP_SERVER_DOMAIN'/' .htaccess
sed -i 's/INSERT_CPANEL_SERVER_DOMAIN_HERE/'$CPANEL_SERVER_DOMAIN'/' .htaccess
sed -i 's/INSERT_DOMAIN_HERE/'$DOMAIN'/' eppabasic_backend/eppabasic_backend/settings.py
sed -i 's/INSERT_SECRET_KEY_HERE/'$SECRET_KEY'/' eppabasic_backend/eppabasic_backend/settings.py
sed -i 's|INSERT_PROJECT_DIR_HERE|'$PROJECT_DIR'|' .htaccess eppabasic_backend/eppabasic_backend/settings.py
sed -i 's|INSERT_STATIC_ROOT_HERE|'$STATIC_ROOT'|' eppabasic_backend/eppabasic_backend/settings.py

npm install requirejs minimist
cp tools/.htaccess node_modules/