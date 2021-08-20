sudo sysctl -w vm.max_map_count=262144
sudo docker-compose -f communication.yml up --build