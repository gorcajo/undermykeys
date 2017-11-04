#!/bin/bash

installDir="/opt/undermykeys"

function python() {
    /usr/bin/python3 $@
}

export FLASK_APP="$installDir/app.py"

if [ "$1" == "--run" ]; then
    python -m flask run --port 80
elif [ "$1" == "--debug" ]; then
    export FLASK_DEBUG=1
    python -m flask run --port 8080
elif [ "$1" == "--install" ]; then
    echo "Option not available yet"
else
    echo "Usage:"
    echo "  $installDir/manage.sh --run       Serves the web, port 80"
    echo "  $installDir/manage.sh --debug     Serves the web for development, port 8080"
    echo "  $installDir/manage.sh --install   Installs everything, pulling the code from GitHub"
fi
