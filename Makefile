CONTAINER_NAME ?= karmada-website
IMAGE_NAME ?= karmada-website
IMAGE_VERSION ?= v0.1.0

serve:
	if ! docker inspect $(IMAGE_NAME):$(IMAGE_VERSION) >/dev/null 2>&1; then \
		echo "Docker image $(IMAGE_NAME):$(IMAGE_VERSION) does not exist"; \
		echo "Building Docker image..."; \
		make image; \
	fi
	echo "Docker image $(IMAGE_NAME):$(IMAGE_VERSION) exists"

	docker run --rm -it --name $(CONTAINER_NAME) \
		-v $(PWD):/app/docs \
		--workdir=/app/docs \
		-p 3000:3000 \
		$(IMAGE_NAME):$(IMAGE_VERSION)

image:
	docker build -t $(IMAGE_NAME):$(IMAGE_VERSION) .

.PHONY: serve image
