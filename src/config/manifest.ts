import * as Sequelize from 'sequelize'
import * as path from 'path'
import * as fs from 'fs'
import config from './config'

let modelsPath = path.join(path.dirname(fs.realpathSync(__filename)), '../modules');
const database = config.database

const redis = config.redis

export default {
    server: {
        debug: {
            request: [
                'error',
                'received'
            ]
        },
        cache: {
            engine: 'catbox-redis',
            host: redis.host,
            port: redis.port
        }
    },
    connections: [
        {
            host: '0.0.0.0',
            port: 8061,
            labels: [
                'api'
            ],
            state: {
                strictHeader: false
            }
        }
    ],
    registrations: [
        {
            plugin: {
                register: 'inert',
                options: {}
            }
        },
        {
            plugin: {
                register: 'blipp',
                options: {}
            }
        },
        {
            plugin: {
                register: 'good',
                options: {
                    ops: {
                        interval: 1000
                    },
                    reporters: {
                        consoleReporter: [
                            {
                                module: 'good-console',
                                args: [{ log: '*' }]
                            }
                        ]
                    }
                }
            }
        },
        {
            plugin: {
                register: 'hapi-sequelize',
                options: [
                    {
                        name: database.dbname, // identifier
                        models: [`${modelsPath}/**/models/*.js`],  // paths/globs to model files
                        sequelize: new Sequelize(database.dbname, database.username, database.password, {
                            host: database.host,
                            port: database.port,
                            dialect: 'postgres'
                        }), // sequelize instance
                        sync: true, // sync models - default false
                        forceSync: false, // force sync (drops tables) - default false
                    }
                ]
            }
        },
        {
            plugin: {
                register: 'hapi-server-session',
                options: {
                    cookie: {
                        isSecure: false,
                        path: '/',
                        isSameSite: false
                    },
                    expiresIn: 24 * 60 * 60 * 1000,
                    key: 'A*$S&D#$HS!@#1(8DC6XFD(*#CF23^S)',
                    name: 'session'
                }
            }
        },
        {
            plugin: {
                register: 'hapi-redis',
                options: {
                    connection: {
                        "host": redis.host,
                        "port": redis.port,
                    }
                }
            }
        },
        {
            plugin: "./modules/wx",
            options: {
                "select": "api"
            }
        },
        {
            plugin: "./modules/ucenterauth",
            options: {
                "select": "api"
            }
        },
        {
            plugin: "./modules/credits",
            options: {
                "select": "api"
            }
        },
    ]
}
