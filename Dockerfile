# Official Playwright image: Node.js plus Chromium, Firefox and WebKit with all
# their system libraries, pinned to the same version as package.json
FROM mcr.microsoft.com/playwright:v1.63.0-noble

WORKDIR /tests

# Dependencies first, so this layer is cached until package*.json changes
COPY package.json package-lock.json ./
RUN npm ci

COPY . .

ENV CI=true
# Which tests to run, e.g. -e PW_ARGS="--project=chromium --grep @smoke"
ENV PW_ARGS="--project=api"

CMD npx playwright test $PW_ARGS
