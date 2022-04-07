FROM redis:6.0.6

COPY config/redis.conf /etc/redis/redis.conf
COPY startRedis.sh /srv/startRedis.sh

RUN chmod 755 /srv/startRedis.sh

CMD ["/srv/startRedis.sh"]
