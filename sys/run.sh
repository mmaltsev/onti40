if [ $1 -eq "setup" ]
then
  # installing conda environment from `dev_environment.yml`
  conda env create --force -f dev_environment.yml
fi

# running the server
source activate onti40
python -c "from server import server; server.main()"
