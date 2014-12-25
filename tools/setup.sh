#!/bin/bash

PYTHON_BIN_DEFAULT=`python3 -c "import sys; print(sys.executable)"`

read -p "Backend binding: " BACKEND_DOMAIN
read -p "Project directory []: " PROJECT_DIR
mkdir -p static
STATIC_ROOT=`readlink -f static`
SECRET_KEY=`tr -dc A-Za-z0-9 < /dev/urandom | head -c 64 | xargs`

read -p "CPanel server host: " CPANEL_HOST
read -p "CPanel server port: " CPANEL_PORT
CPANEL_DOMAIN=$CPANEL_HOST:$CPANEL_PORT

read -p "Python executable to use [ $PYTHON_BIN_DEFAULT ]: " PYTHON_BIN
PYTHON_BIN=${PYTHON_BIN:-"$PYTHON_BIN_DEFAULT"}

read -p "virtualenv to use [ virtualenv ]: " VIRTUALENV_BIN
VIRTUALENV_BIN=${VIRTUALENV_BIN:-"virtualenv"}

echo "[eppabasic]"				>  settings.ini
echo "debug=no"					>> settings.ini
echo "domain="					>> settings.ini
echo "admin_name="				>> settings.ini
echo "admin_email="				>> settings.ini
echo "project_dir=$PROJECT_DIR"	>> settings.ini
echo "static_root=$STATIC_ROOT"	>> settings.ini
echo "secret_key=$SECRET_KEY"	>> settings.ini
echo ""							>> settings.ini

echo "[email]"					>> settings.ini		
echo "host="					>> settings.ini
echo "port="					>> settings.ini
echo "user="					>> settings.ini
echo "password="				>> settings.ini
echo "use_tls=yes"				>> settings.ini
echo ""							>> settings.ini

echo "[backend]"				>> settings.ini
echo "screen_prefix="			>> settings.ini
echo "domain=$BACKEND_DOMAIN"	>> settings.ini
echo ""							>> settings.ini

echo "[cpanel]"					>> settings.ini
echo "host=$CPANEL_HOST"		>> settings.ini
echo "port=$CPANEL_PORT"		>> settings.ini
echo "password="				>> settings.ini

cd ..

# Setup virtualenv
if [ ! -d "virtenv" ]; then
	$VIRTUALENV_BIN -p "$PYTHON_BIN" virtenv
fi
cp tools/.htaccess virtenv/
source virtenv/bin/activate
pip install django
deactivate

rm -f .htaccess
cp .htaccess.template .htaccess

sed -i 's/INSERT_BACKEND_DOMAIN_HERE/'$BACKEND_DOMAIN'/'		.htaccess
sed -i 's/INSERT_CPANEL_SERVER_DOMAIN_HERE/'$CPANEL_DOMAIN'/'	.htaccess
sed -i 's|INSERT_PROJECT_DIR_HERE|'$PROJECT_DIR'|'				.htaccess

npm install requirejs minimist
cp tools/.htaccess node_modules/

vim tools/settings.ini