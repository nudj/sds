# sds
A simple web scraper for gleaning and enriching company information as part of our sales efforts.

## Usage
### Local
1. Run `make up` on `nudj/server`
2. `docker-compose -p nudj -f ./docker-compose-sds.yml up -d --force-recreate --no-deps sds` to run sds in local environment
3. `docker-compose -p nudj -f ./docker-compose-sds.yml exec sds /bin/sh` to get shell session inside sds

### Staging
1. Build the image: `docker build -t nudj/sds .`
2. Push any changes you want on staging to dockerhub: `docker push nudj/sds`
3. `scp` the `docker-compose-sds.yml` file on to the staging box if it doesn't already exist, or is out of date.
4. ssh into staging box
4. Run `docker pull nudj/sds` if you pushed in step 2
4. Run `cd staging`
5. `docker-compose -p staging -f ../sds/docker-compose-sds.yml up -d --force-recreate --no-deps sds` to run sds in local environment
6. `docker-compose -p staging -f ../sds/docker-compose-sds.yml exec sds /bin/sh` to get shell session inside sds
