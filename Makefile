IMAGE:=nudj/sds
CWD=$(shell pwd)

.PHONY: build

build:
	@docker build -t $(IMAGE):development .

up:
	@docker-compose -p nudj \
		-f ./docker-compose-sds.yml up \
		-d --force-recreate --no-deps sds

ssh:
	@docker-compose -p nudj \
		-f ./docker-compose-sds.yml exec sds /bin/sh
