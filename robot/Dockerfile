FROM python:3
WORKDIR /home/node/app
RUN /bin/sh -c 'mkdir map'

# Install netpbm image processing library
RUN /bin/sh -c 'apt-get update'
RUN apt-get install -y libnetpbm10-dev netpbm

# Install Tkinter library for interactive simulator
# RUN /bin/sh -c 'apt-get update && apt-get install python3-tk'

# Install requirements
COPY requirements.txt ./
RUN pip install --no-cache-dir -r requirements.txt 

# Copy source code
COPY docker-entrypoint.sh ./docker-entrypoint.sh
COPY src/ src/
CMD [ "/bin/sh", "docker-entrypoint.sh" ]
