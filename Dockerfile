FROM resin/rpi-raspbian
RUN apt-get update
RUN apt-get install -y git wget
RUN wget http://node-arm.herokuapp.com/node_latest_armhf.deb
RUN dpkg -i node_latest_armhf.deb
RUN rm node_latest_armhf.deb
RUN apt-get install -y build-essential python
WORKDIR /root
RUN wget https://github.com/Program3r/lightring-meteor/releases/download/0.1.0/lightring-meteor.tar.gz
RUN tar -xvf lightring-meteor.tar.gz
WORKDIR /root/bundle/programs/server
RUN npm install
ENV MONGO_URL mongodb://172.17.42.1:27017/led
ENV ROOT_URL http://localhost
ENV PORT 3000
WORKDIR /root/bundle
ENTRYPOINT ["/usr/local/bin/node", "main.js"]
