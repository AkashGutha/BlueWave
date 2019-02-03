import sys
import subprocess

proc = subprocess.Popen(["bluetoothctl"])
print(proc.communicate("power on"))
print(proc.communicate("scan off"))

