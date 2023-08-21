FROM node:16-bookworm as build

RUN apt update
RUN apt install -y make
WORKDIR /frontend
COPY . .
RUN make webapp/src/app/proto/proto.json
RUN cd webapp && npm ci && npm run build

FROM node:16-bookworm
COPY --from=build /frontend/webapp/dist/spindle /frontend
CMD python3 -m http.server 8080 --directory /frontend