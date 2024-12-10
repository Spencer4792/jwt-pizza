declare module '*/config.js' {
    interface Config {
      jwtSecret: string;
      db: {
        connection: {
          host: string;
          user: string;
          password: string;
          database: string;
          connectTimeout: number;
        };
        listPerPage: number;
      };
      factory: {
        url: string;
        apiKey: string;
      };
    }
  
    const config: Config;
    export = config;
  }