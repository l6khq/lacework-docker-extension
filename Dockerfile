FROM busybox AS lwscanner
RUN wget -O /lw-scanner-darwin https://github.com/lacework/lacework-vulnerability-scanner/releases/latest/download/lw-scanner-darwin-amd64
RUN wget -O /lw-scanner-linux https://github.com/lacework/lacework-vulnerability-scanner/releases/latest/download/lw-scanner-linux-amd64
RUN wget -O /lw-scanner-windows https://github.com/lacework/lacework-vulnerability-scanner/releases/latest/download/lw-scanner-windows-amd64.exe
RUN chmod a+x /lw-scanner*

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
LABEL org.opencontainers.image.title="lacework-docker-extension" \
    org.opencontainers.image.description="Lacework Scanner" \
    org.opencontainers.image.vendor="Lacework Inc." \
    com.docker.desktop.extension.api.version=">= 0.2.3" \
    com.docker.extension.screenshots="" \
    com.docker.extension.detailed-description="" \
    com.docker.extension.publisher-url="https://www.lacework.com" \
    com.docker.extension.additional-urls="https://github.com/l6khq/lacework-docker-extension" \
    com.docker.extension.changelog=""

# COPY --from=builder /backend/bin/service /
# COPY docker-compose.yaml .
COPY metadata.json /metadata.json
COPY lacework_icon.svg .
COPY --from=client-builder /ui/build ui
COPY host /host
COPY --from=lwscanner /lw-scanner-darwin /host/darwin/lw-scanner
COPY --from=lwscanner /lw-scanner-linux /host/linux/lw-scanner
COPY --from=lwscanner /lw-scanner-windows /host/windows/lw-scanner
CMD [ "sleep", "infinity" ]