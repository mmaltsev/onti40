"""Initialize module utils."""
from server import server
from server.helper import env_exists


if __name__ == '__main__':
    env_exists('onti40')
    server.main()
