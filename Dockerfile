FROM ubuntu:22.04
WORKDIR /app
COPY . /
EXPOSE 8211:8211
RUN apt-get -y update && \
    apt-get -y install curl && \
    curl -fsSL https://deb.nodesource.com/setup_20.x -o nodesource_setup.sh && \
    bash nodesource_setup.sh && \
    apt-get install -y nodejs
CMD ["node","sql_connect.js"]
