#!/bin/bash
kubectl -n gridvo get svc | grep -q data-collect
if [ "$?" == "1" ];then
	kubectl create -f data_collect-service.yaml --record
	kubectl -n gridvo get svc | grep -q data-collect
	if [ "$?" == "0" ];then
		echo "data_collect-service install success!"
	else
		echo "data_collect-service install fail!"
	fi
else
	echo "data_collect-service is exist!"
fi
kubectl -n gridvo get pods | grep -q data-collect
if [ "$?" == "1" ];then
	kubectl create -f data_collect-deployment.yaml --record
	kubectl -n gridvo get pods | grep -q data-collect
	if [ "$?" == "0" ];then
		echo "data_collect-deployment install success!"
	else
		echo "data_collect-deployment install fail!"
	fi
else
	kubectl delete -f data_collect-deployment.yaml
	kubectl -n gridvo get pods | grep -q data-collect
	while [ "$?" == "0" ]
	do
	kubectl -n gridvo get pods | grep -q data-collect
	done
	kubectl create -f data_collect-deployment.yaml --record
	kubectl -n gridvo get pods | grep -q data-collect
	if [ "$?" == "0" ];then
		echo "data_collect-deployment update success!"
	else
		echo "data_collect-deployment update fail!"
	fi
fi
