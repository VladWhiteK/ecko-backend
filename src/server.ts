import express from 'express';
import compression from 'compression';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import logger from './helpers/winston.helper';
import userRouter from './routes/users.route';
import authRouter from './routes/auth.route';
import interestRouter from './routes/interests.route';
import config from './helpers/config.helper';
import helperFunctions from './helpers/functions.helper';
import helperGithub from './helpers/github.helper';
import { helperDatabase } from './helpers/database.helper';
import serverStatus from './middlewares/server.middleware';
import checkDatabaseConnection from './middlewares/database.middleware';
import { helperReplication } from './helpers/replication.helper';
import helperSetup from './helpers/setup.helper';
import requestLoggerMiddleware from './middlewares/request.middleware';
import limiter from './middlewares/rate.middleware';
import helperEcko from './helpers/ecko.helper';

const server = express();
const eckoServer = helperEcko.initializeEckoServer();

// Define local variables
let serverEnabled = false;

// Define config variables
const PORT = config.port;
const DNS = config.dns;

// Loads middleware functions
server.use(express.json());
server.use(express.urlencoded({ extended: false }));
server.use(helmet());
server.use(compression());
server.use(cookieParser());
server.use(limiter);
server.use(serverStatus);
server.use(checkDatabaseConnection);
server.use(requestLoggerMiddleware);

// Enables the use for F-Forwarded-For header
server.enable('trust proxy');

// Define api routes
server.use('/auth', authRouter);
server.use('/users', userRouter);
server.use('/interests', interestRouter);

// Start the express ecko server
try {
    eckoServer.listen(PORT, async () => {
        logger.info('███████╗ ██████╗██╗  ██╗ ██████╗ ');
        logger.info('██╔════╝██╔════╝██║ ██╔╝██╔═══██╗');
        logger.info('█████╗  ██║     █████╔╝ ██║   ██║');
        logger.info('██╔══╝  ██║     ██╔═██╗ ██║   ██║');
        logger.info('███████╗╚██████╗██║  ██╗╚██████╔╝');
        logger.info('╚══════╝ ╚═════╝╚═╝  ╚═╝ ╚═════╝ ');

        // Displays git info
        helperGithub.displayGit();

        // Starts the first time setup of the server
        await helperSetup.initializeServerSetup();

        // Checking the privileges of the process
        helperFunctions.rootPrivileges();

        // Checks the API auth method
        helperEcko.validateApiAuthMethod();

        // Connecting to the database
        await helperDatabase.initializeDatabaseConnection();

        // Connecting to the database
        await helperDatabase.initializeMasterSync();

        // Checks if the database is up-to-date
        await helperReplication.performReplication();

        // Loads that stats
        helperFunctions.loadStats();

        serverEnabled = true;
        logger.info(
            `Server is running in ${config.protocol.toUpperCase()} mode on ${
                config.protocol
            }://${DNS}:${PORT}`
        );
    });
} catch (err) {
    logger.error(
        'Error during initializing the server. Shutting down the server...'
    );
    logger.error(`${err as string}`);
    process.exit(1);
}

export { server, eckoServer, serverEnabled };
