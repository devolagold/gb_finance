import http.server, socketserver, sys
class H(http.server.SimpleHTTPRequestHandler):
    def log_message(self, *a): pass
class S(socketserver.ThreadingTCPServer):
    allow_reuse_address = True
    daemon_threads = True
with S(("127.0.0.1", 8765), H) as httpd:
    httpd.serve_forever()
