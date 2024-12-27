
all: deploy

build:
  cd astro && npm run build

serve:
  cd astro && npm run dev

deploy: build
  cd infra && npm run deploy

clean:
  rm -rf dist

