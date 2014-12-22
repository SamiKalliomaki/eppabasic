import json
from http.server import HTTPServer, BaseHTTPRequestHandler
from threading import Thread, RLock, Condition
from time import sleep
import subprocess
import configparser

config = configparser.ConfigParser()
config.read('settings.ini')

class Log:
	def __init__(self):
		self.lock = RLock()
		self.log = []

	def add(self, line):
		with self.lock:
			self.log.append(line)

			if len(self.log) >= 50:
				self.log.pop(0)

	def get(self):
		with self.lock:
			return self.log

class Action():
	def __init__(self, pretty_name, action):
		self.pretty_name = pretty_name
		self.action = action


def get_screen_name():
	return config['eppabasic']['screen_name'] + 'eppabasic'

def is_backend_running():
	return subprocess.Popen(['/bin/bash', '-c', 'screen -list | grep -w "' + get_screen_name() + '"'], stdout=subprocess.PIPE).stdout.read() != b''

def do_run(log, cmd):
	proc = subprocess.Popen(['/bin/bash', '-c', cmd], stdout=subprocess.PIPE, stderr=subprocess.PIPE)

	for line in proc.stdout:
		log.add(line.rstrip().decode())

	for line in proc.stderr:
		log.add(line.rstrip().decode())

def start_backend(log):
	if is_backend_running():
		log.add('Backend is already running')
		return

	do_run(log, 'cd ../eppabasic_backend/; source ../virtenv/bin/activate; screen -dmS ' + get_screen_name())
	do_run(log, 'screen -S ' + get_screen_name() + ' -X stuff "python manage.py runserver --noreload ' + config['eppabasic']['app_server_domain'] + '\n"')

def stop_backend(log):
	do_run(log, 'screen -S ' + get_screen_name() + ' -X stuff "^C\nexit\n"')
	sleep(0.1)

def git_pull(log):
	do_run(log, 'cd ..; git stash; git pull; git stash apply')

def build_js(log):
	do_run(log, 'cd ..; rm -rf build; node ./tools/build.js --optimize=uglify2')

def run_migrate(log):
	do_run(log, 'cd ../eppabasic_backend/; source ../virtenv/bin/activate; python manage.py migrate')

def run_collectstatic(log):
	do_run(log, 'cd ../eppabasic_backend/; source ../virtenv/bin/activate; python manage.py collectstatic --noinput')

actions = {}
actions['start-backend'] = Action('Start backend', start_backend)
actions['stop-backend'] = Action('Stop backend', stop_backend)
actions['git-pull'] = Action('Git pull', git_pull)
actions['build-js'] = Action('Rebuild JavaScript', build_js)
actions['migrate'] = Action('Run migrations', run_migrate)
actions['collectstatic'] = Action('Collect static files', run_collectstatic)

class WorkerThread(Thread):
	def __init__(self):
		self.work = []
		self.work_lock = RLock()
		self.log = Log()
		self.cond = Condition()
		self.status = 'idle'

		super().__init__()

	def run(self):
		while True:
			stuff = None

			with self.work_lock:
				if len(self.work) != 0:
					stuff = self.work[0]

			if stuff:
				self.status = 'working'
				self.log.add('Executing "' + stuff.pretty_name + '"')
				stuff.action(self.log)

				with self.work_lock:
					self.work.pop(0)
			else:
				self.status = 'idle'
				with self.cond:
					self.cond.wait()

	def get_queue(self):
		with self.work_lock:
			return [stuff.pretty_name for stuff in self.work]

	def add_work(self, stuff):
		with self.work_lock:
			self.work.append(stuff)

		with self.cond:
			self.cond.notify()

worker = WorkerThread()
worker.start()

class MyRequestHandler(BaseHTTPRequestHandler):
	def collect_report(self):
		report = {}

		report['backend'] = 'online' if is_backend_running() else 'offline'
		report['status'] = worker.status
		report['queue'] = worker.get_queue()
		report['log'] = '\n'.join(worker.log.get())

		return report

	def do_POST(self):
		data_length = int(self.headers['Content-Length'] or 0)
		data_str = self.rfile.read(data_length).decode()
		data = {}
		try:
			data = json.loads(data_str)
		except ValueError:
			print(data_str)

		for action in data.get('actions', '').split(','):
			if action in actions:
				worker.add_work(actions[action])

		self.send_response(200)
		self.send_header("Content-type", "application/json")
		self.end_headers()

		report = self.collect_report()
		self.wfile.write(json.dumps(report).encode())

def run(server_class=HTTPServer, handler_class=BaseHTTPRequestHandler):
    server_address = (config['eppabasic']['cpanel_server_host'], int(config['eppabasic']['cpanel_server_port']))
    httpd = server_class(server_address, handler_class)
    httpd.serve_forever()

worker.log.add('CPanel started')
run(HTTPServer, MyRequestHandler)