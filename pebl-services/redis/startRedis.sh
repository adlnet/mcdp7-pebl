#!/bin/sh

sed -ie "s/__REDIS_AUTH__/$REDIS_AUTH/g" /etc/redis/redis.conf

redis-server /etc/redis/redis.conf
