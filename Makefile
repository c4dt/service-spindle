.DEFAULT_GOAL := all

services/.git/HEAD:
	git clone https://github.com/c4dt/services.git
services/%: services/.git/HEAD
	@: nothing

include services/mk/service.mk

$Dprotobuf/proto.json: $Dprotobuf/spindle.proto
webapp/src/proto.json: $Dprotobuf/proto.json; cp $< $@
$Swebapp-build: webapp/src/proto.json
