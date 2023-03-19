/* eslint-disable @typescript-eslint/no-unsafe-call */
import coverage from '@cypress/code-coverage/task';
import {defineConfig} from 'cypress';

import type {Configuration} from 'webpack';

export default defineConfig({
    component: {
        devServer: {
            bundler: 'webpack',
            framework: 'react',
            /**
             * The webpack configuration to use when bundling your components.
             *
             * @returns Webpack configuration.
             */
            webpackConfig() {
                const config: Configuration = {
                    module: {
                        rules: [
                            {
                                test: /\.(js|jsx|ts|tsx)$/u,
                                use: {loader: 'babel-loader'}
                            },
                            {
                                test: /\.(png|jpg|woff|woff2|eot|ttf|svg)$/u,
                                type: 'asset/resource'
                            }
                        ]
                    },
                    resolve: {
                        extensions: [
                            '.js',
                            '.jsx',
                            '.ts',
                            '.tsx',
                            '.css',
                            '.png',
                            '.jpeg',
                            '.jpg',
                            '.json',
                            '.svg'
                        ]
                    },
                    target: 'web'
                };

                return config;
            }
        },
        env: {
            codeCoverage: {exclude: ['cypress/**/*.*']},
            NODE_ENV: 'test'
        },
        reporter: 'mochawesome',
        reporterOptions: {
            html: false,
            json: true,
            overwrite: false,
            reportDir: 'cypress/reports'
        },
        videoUploadOnPasses: false,
        /**
         * Sets up plugins and so on.
         *
         * @param on     Cypress event handler.
         * @param config Cypress configuration.
         * @returns Cypress configuration.
         */
        setupNodeEvents(on, config) {
            coverage(on, config);

            return config;
        }
    },
    videoUploadOnPasses: false
});