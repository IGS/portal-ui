# Script to work around the inconsistencies of Docker's networking. This
# guarantees to pull the IP of the GQL container and set it as the API endpoint.
import os, socket

ip = socket.gethostbyname(os.environ["GQL_HOST"])
mod_ip = ip[:-1]
mod_ip = "%s1" % mod_ip

url = "%s:%s" % (mod_ip,os.environ["GQL_PORT"])

os.chdir("/home/gdc/dp")
os.system("GDC_API='%s' GDC_FAKE_AUTH=true npm start" % url)
