FROM alpine AS lwscanner
RUN apk add --no-cache curl 
ARG TARGETARCH
## only linux has an arm and arm64 release available
RUN curl -fSsLo /lw-scanner-darwin https://github.com/lacework/lacework-vulnerability-scanner/releases/download/v0.3.2/lw-scanner-darwin-amd64 && \
    curl -fSsLo /lw-scanner-linux https://github.com/lacework/lacework-vulnerability-scanner/releases/download/v0.3.2/lw-scanner-linux-$TARGETARCH && \
    curl -fSsLo /lw-scanner.exe https://github.com/lacework/lacework-vulnerability-scanner/releases/download/v0.3.2/lw-scanner-windows-amd64.exe && \
    chmod a+x /lw-scanner-*

FROM --platform=$BUILDPLATFORM node:17.7-alpine3.14 AS client-builder
WORKDIR /ui
# cache packages in layer
COPY ui/package.json /ui/package.json
COPY ui/package-lock.json /ui/package-lock.json
# RUN --mount=type=cache,target=/usr/src/app/.npm \
#     npm set cache /usr/src/app/.npm && \
RUN   npm ci
# install
ARG RELEASE
ARG HONEYCOMB_TEAM
ARG HONEYCOMB_DATASET
ENV REACT_APP_RELEASE=${RELEASE}
ENV REACT_APP_HONEYCOMB_TEAM=${HONEYCOMB_TEAM}
ENV REACT_APP_HONEYCOMB_DATASET=${HONEYCOMB_DATASET}
COPY ui /ui
RUN npm run build

FROM alpine
LABEL org.opencontainers.image.title="Lacework Scanner" \
    org.opencontainers.image.description="Lacework Scanner integration for Docker Desktop." \
    org.opencontainers.image.vendor="Lacework Inc." \
    com.docker.desktop.extension.api.version=">= 0.2.3" \
    com.docker.desktop.extension.icon="https://raw.githubusercontent.com/l6khq/lacework-docker-extension/main/lacework_icon.svg" \
    com.docker.extension.screenshots='[{"alt":"Lacework Scanner","url":"https://raw.githubusercontent.com/l6khq/lacework-docker-extension/main/lacework-docker-extension.png"}]' \
    com.docker.extension.detailed-description="Lacework Scanner extension for Docker Desktop allows developers to leverage the vulnerability scanning capabilities of the Lacework platform directly without having to use the commandline.  Lacework Inline Scanner is leverage together with an optimized UI to support the developer experience and workflow and enable a shift-left approach to understand vulnerabilities at the source." \
    com.docker.extension.publisher-url="https://www.lacework.com" \
    com.docker.extension.additional-urls='[{"title":"GitHub Repo","url":"https://github.com/l6khq/lacework-docker-extension"},{"title":"Support","url":"https://github.com/l6khq/lacework-docker-extension/issues"}]' \
    com.docker.extension.changelog="https://github.com/l6khq/lacework-docker-extension/releases"

# COPY --from=builder /backend/bin/service /
# COPY docker-compose.yaml .
COPY metadata.json /metadata.json
COPY lacework_icon.svg .
COPY --from=client-builder /ui/build ui
COPY host /host
COPY --from=lwscanner /lw-scanner-darwin /host/darwin/lw-scanner
COPY --from=lwscanner /lw-scanner-linux /host/linux/lw-scanner
COPY --from=lwscanner /lw-scanner.exe /host/windows/lw-scanner.exe
CMD [ "sleep", "infinity" ]
