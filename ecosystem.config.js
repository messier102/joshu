module.exports = {
    apps: [
        {
            name: "Joshu",
            script: "build/src/index.js",
        },
    ],

    deploy: {
        production: {
            user: process.env.PROD_USER,
            host: process.env.PROD_HOST,
            key: "./production.key",
            ref: "origin/master",
            repo: "git@github.com:messier102/joshu.git",
            path: "~/joshu",
            "pre-deploy": "node -v && npm -v",
            "post-deploy":
                "mkdir -p ./data && \
                cp ~/joshu/shared/config.ts ./data/config.ts && \
                npm run build-production && \
                pm2 reload ecosystem.config.js --env production",
        },
    },
};
