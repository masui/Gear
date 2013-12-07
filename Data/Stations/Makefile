all: yaml ltsv
yaml: clean
	ruby stations2yaml > stations.yaml
ltsv: clean
	ruby stations2ltsv stations.csv > stations.ltsv.orig
clean:
	/bin/rm -f stations.yaml stations.ltsv.orig
