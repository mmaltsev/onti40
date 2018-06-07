"""Helpers."""
import colorama
from termcolor import colored, cprint
import platform
import re
import subprocess


def log_cmd(log, status):
    colorama.init() # for colorful logs in windows cmd
    cprint(colored('>>>', status), end=' ')
    print(log)


def execute(command):
    process = subprocess.Popen(command, shell = True, stdout=subprocess.PIPE)
    output, error = process.communicate()
    if output:
        output = output.decode('utf-8')
    if error:
        print('Error while executing command `{}`'.format(command))
        print(error)
        exit()
    return output


def is_conda_env(env):
    output = execute('conda info -e')
    splitted_output = output.split('\r\n')
    env_info_list = splitted_output[2:len(splitted_output) - 2]
    env_list = []
    for line in env_info_list:
        arr_line = re.split(' +', line)
        env_list.append(arr_line[0])
    if env in env_list:
        return True
    else:
        return False


def module_import(module_name):
    module = __import__(module_name)
    module_name_parts = module_name.split('.')[1:]
    for inner_module in module_name_parts:
        module = getattr(module, inner_module)
    return module
