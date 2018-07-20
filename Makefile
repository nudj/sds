IMAGE:=nudj/sds
CWD=$(shell pwd)

.PHONY: build

build:
	@docker build -t $(IMAGE):development .

ssh:
	@docker run -it --rm \
		-v $(CWD)/lib:/usr/src/lib \
		-v $(CWD)/input.json:/usr/src/input.json \
		$(IMAGE):development \
		/bin/sh
