# import env var into makefile
SCRAPE_ON_STARTUP := "${SCRAPE_ON_STARTUP}"

start:
	@echo "Running migrations..."
	sequelize db:migrate
ifeq ($(SCRAPE_ON_STARTUP),"1")
	@echo "Running scraper before starting web server..."
	node --require ./setup.js scraper/run
endif
	@echo "Starting web server..."
	node --require ./setup.js server


watch:
	nodemon --exec "node --require ./setup.js server" --ext js,html,svg


scrape:
	node --require ./setup.js scraper/run


server:
	node --require ./setup.js server


migrate:
	sequelize db:migrate
