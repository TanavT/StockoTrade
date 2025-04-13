import winston from 'winston';

const { combine, colorize } = winston.format;

const colors = {
	error: 'red',
	warn: 'yellow',
	info: 'blue',
	http: 'green',
	debug: 'magenta',
};

winston.addColors(colors);

const logger = winston.createLogger({
	level: 'debug',
	format: winston.format.json(),
	defaultMeta: { service: 'user-service' },
	transports: [
		new winston.transports.Console({
			level: 'debug',
			format: combine(colorize(), winston.format.simple()),
		}),
		//
		// - Write all logs with importance level of `error` or higher to `error.log`
		//   (i.e., error, fatal, but not other levels)
		//
		new winston.transports.File({
			filename: './logs/error.log',
			level: 'error',
		}),
		//
		// - Write all logs with importance level of `info` or higher to `combined.log`
		//   (i.e., fatal, error, warn, and info, but not trace)
		//
		new winston.transports.File({ filename: './logs/combined.log' }),
	],
});

export default logger;
