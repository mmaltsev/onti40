FROM ubuntu:latest
MAINTAINER Maxim Maltsev ""
RUN apt-get update -y
RUN apt-get install -y python-pip python-dev build-essential
COPY . /app
WORKDIR /app
RUN conda env create -f dev_environment.yml
ENTRYPOINT ["bash"]
CMD ["sys/run.sh"]
