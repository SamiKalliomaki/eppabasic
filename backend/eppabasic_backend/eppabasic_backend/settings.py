import os
import configparser

config = configparser.ConfigParser()
config.read('../../tools/settings.ini')

# Django settings for eppabasic_backend project.

DEBUG = config['eppabasic'].getboolean('debug')
TEMPLATE_DEBUG = DEBUG
PROJECT_DIR = config['eppabasic']['project_dir']
SUB_SITE = PROJECT_DIR + 'eb/'

ADMINS = (
    (config['eppabasic']['admin_name'], config['eppabasic']['admin_email']),
)

MANAGERS = ADMINS

DATABASES = {
    'default': {
        'ENGINE': config['db']['engine'],      # Add 'postgresql_psycopg2', 'mysql', 'sqlite3' or 'oracle'.
        'NAME': config['db']['name'],          # Or path to database file if using sqlite3.
        # The following settings are not used with sqlite3:
        'USER': config['db']['user'],
        'PASSWORD': config['db']['password'],
        'HOST': config['db']['host'],          # Empty for localhost through domain sockets or '127.0.0.1' for localhost through TCP.
        'PORT': config['db']['port'],          # Set to empty string for default.
    }
}

# Backend directory
BASE_DIR = os.getcwd()

# Hosts/domain names that are valid for this site; required if DEBUG is False
# See https://docs.djangoproject.com/en/1.5/ref/settings/#allowed-hosts
ALLOWED_HOSTS = [ config['eppabasic']['domain'] ]

# Local time zone for this installation. Choices can be found here:
# http://en.wikipedia.org/wiki/List_of_tz_zones_by_name
# although not all choices may be available on all operating systems.
# In a Windows environment this must be set to your system time zone.
TIME_ZONE = 'GMT'

# Language code for this installation. All choices can be found here:
# http://www.i18nguy.com/unicode/language-identifiers.html
LANGUAGE_CODE = 'en-us'

SITE_ID = 1

# If you set this to False, Django will make some optimizations so as not
# to load the internationalization machinery.
USE_I18N = True

# If you set this to False, Django will not format dates, numbers and
# calendars according to the current locale.
USE_L10N = True

# If you set this to False, Django will not use timezone-aware datetimes.
USE_TZ = True

# Absolute filesystem path to the directory that will hold user-uploaded files.
# Example: "/var/www/example.com/media/"
MEDIA_ROOT = ''

# URL that handles the media served from MEDIA_ROOT. Make sure to use a
# trailing slash.
# Examples: "http://example.com/media/", "http://media.example.com/"
MEDIA_URL = ''

# Absolute path to the directory static files should be collected to.
# Don't put anything in this directory yourself; store your static files
# in apps' "static/" subdirectories and in STATICFILES_DIRS.
# Example: "/var/www/example.com/static/"
STATIC_ROOT = config['eppabasic']['static_root']

# URL prefix for static files.
# Example: "http://example.com/static/", "http://static.example.com/"
STATIC_URL = '/' + PROJECT_DIR + 'static/'

# Additional locations of static files
STATICFILES_DIRS = (
    # Put strings here, like "/home/html/static" or "C:/www/django/static".
    # Always use forward slashes, even on Windows.
    # Don't forget to use absolute paths, not relative paths.
)

# List of finder classes that know how to find static files in
# various locations.
STATICFILES_FINDERS = (
    'django.contrib.staticfiles.finders.FileSystemFinder',
    'django.contrib.staticfiles.finders.AppDirectoriesFinder',
#    'django.contrib.staticfiles.finders.DefaultStorageFinder',
)

# Make this unique, and don't share it with anybody.
SECRET_KEY = config['eppabasic']['secret_key']

# List of callables that know how to import templates from various sources.
TEMPLATE_LOADERS = (
    'django.template.loaders.filesystem.Loader',
    'django.template.loaders.app_directories.Loader',
#     'django.template.loaders.eggs.Loader',
)

MIDDLEWARE_CLASSES = (
    'django.middleware.common.CommonMiddleware',
    'django.contrib.sessions.middleware.SessionMiddleware',
    'django.middleware.csrf.CsrfViewMiddleware',
    'django.contrib.auth.middleware.AuthenticationMiddleware',
    'django.contrib.messages.middleware.MessageMiddleware',
    # Uncomment the next line for simple clickjacking protection:
    # 'django.middleware.clickjacking.XFrameOptionsMiddleware',
)

ROOT_URLCONF = 'eppabasic_backend.urls'

# Python dotted path to the WSGI application used by Django's runserver.
WSGI_APPLICATION = 'eppabasic_backend.wsgi.application'

TEMPLATE_DIRS = (
    # Put strings here, like "/home/html/django_templates" or "C:/www/django/templates".
    # Always use forward slashes, even on Windows.
    # Don't forget to use absolute paths, not relative paths.
)

INSTALLED_APPS = (
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.sessions',
    'django.contrib.sites',
    'django.contrib.messages',
    'django.contrib.staticfiles',
    # Uncomment the next line to enable the admin:
    'django.contrib.admin',
    # Uncomment the next line to enable admin documentation:
    # 'django.contrib.admindocs',

    # Own apps
    'users',
    'filesystem',
    'pastebin',
    'news',
    'analysis',
)

AUTH_USER_MODEL = 'users.CustomUser'

SESSION_SERIALIZER = 'django.contrib.sessions.serializers.JSONSerializer'

# A sample logging configuration. The only tangible logging
# performed by this configuration is to send an email to
# the site admins on every HTTP 500 error when DEBUG=False.
# See http://docs.djangoproject.com/en/dev/topics/logging for
# more details on how to customize your logging configuration.
LOGGING = {
    'version': 1,
    'disable_existing_loggers': False,
    'filters': {
        'require_debug_false': {
            '()': 'django.utils.log.RequireDebugFalse'
        }
    },
    'handlers': {
        'mail_admins': {
            'level': 'ERROR',
            'filters': ['require_debug_false'],
            'class': 'django.utils.log.AdminEmailHandler'
        }
    },
    'loggers': {
        'django.request': {
            'handlers': ['mail_admins'],
            'level': 'ERROR',
            'propagate': True,
        },
    }
}

TEST_RUNNER = 'django.test.runner.DiscoverRunner'
USE_X_FORWARDED_HOST = True
LOGIN_URL = '/' + PROJECT_DIR

EMAIL_HOST = config['email']['host']
EMAIL_HOST_USER = config['email']['user']
EMAIL_HOST_PASSWORD = config['email']['password']
EMAIL_PORT = config['email']['port']
EMAIL_USE_TLS = config['email'].getboolean('use_tls')

DEFAULT_FROM_EMAIL = config['email']['default_from']

FRONTPAGE_NEWS_COUNT = 3
