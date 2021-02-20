import path from 'path';

const uglifyjsPlugin = require('uglifyjs-webpack-plugin');

// const URL_PREFIX = '/apiot/';
const URL_PREFIX = '';
const chainWebpack = (config, { webpack }) => {
  if(process.env.NODE_ENV === 'production'){
    // config.merge({
    //   plugin: {
    //     'uglifyjs-webpack-plugin': {
    //       plugin: uglifyjsPlugin,
    //       args: [{
    //         sourceMap: false,
    //         uglifyOptions: {
    //           compress: {
    //             // 删除所有的 `console` 语句
    //             drop_console: true,
    //           },
    //           output: {
    //             // 最紧凑的输出
    //             beautify: false,
    //             // 删除所有的注释
    //             comments: false,
    //           },
    //         },
    //       }],
    //     },
    //     // install: {
    //     //   plugin: require('uglifyjs-webpack-plugin'),
    //     //   args: [{
    //     //     sourceMap: false,
    //     //     uglifyOptions: {
    //     //       compress: {
    //     //         // 删除所有的 `console` 语句
    //     //         drop_console: true,
    //     //       },
    //     //       output: {
    //     //         // 最紧凑的输出
    //     //         beautify: false,
    //     //         // 删除所有的注释
    //     //         comments: false,
    //     //       },
    //     //     }
    //     //   }]
    //     // }
    //   },
    // });
    config.merge({
      optimization: {
        minimize: true,
        splitChunks: {
          chunks: 'async',
          minSize: 30000,
          minChunks: 2,
          automaticNameDelimiter: '.',
          cacheGroups: {
            vendor: {
              name: 'vendors',
              test: /^.*node_modules[\\/](?!ag-grid-|lodash|wangeditor|react-virtualized|rc-select|rc-drawer|rc-time-picker|rc-tree|rc-table|rc-calendar|antd).*$/,
              chunks: "all",
              priority: 10,
            },
            virtualized: {
              name: "virtualized",
              test: /[\\/]node_modules[\\/]react-virtualized/,
              chunks: "all",
              priority: 10
            },
            rcselect: {
              name: "rc-select",
              test: /[\\/]node_modules[\\/]rc-select/,
              chunks: "all",
              priority: 10
            },
            rcdrawer: {
              name: "rcdrawer",
              test: /[\\/]node_modules[\\/]rc-drawer/,
              chunks: "all",
              priority: 10
            },
            rctimepicker: {
              name: "rctimepicker",
              test: /[\\/]node_modules[\\/]rc-time-picker/,
              chunks: "all",
              priority: 10
            },
            ag: {
              name: "ag",
              test: /[\\/]node_modules[\\/]ag-grid-/,
              chunks: "all",
              priority: 10
            },
            antd: {
              name: "antd",
              test: /[\\/]node_modules[\\/]antd[\\/]/,
              chunks: "all",
              priority: 9
            },
            rctree: {
              name: "rctree",
              test: /[\\/]node_modules[\\/]rc-tree/,
              chunks: "all",
              priority: -1
            },
            rccalendar: {
              name: "rccalendar",
              test: /[\\/]node_modules[\\/]rc-calendar[\\/]/,
              chunks: "all",
              priority: -1
            },
            rctable: {
              name: "rctable",
              test: /[\\/]node_modules[\\/]rc-table[\\/]es[\\/]/,
              chunks: "all",
              priority: -1
            },
            wang: {
              name: "wang",
              test: /[\\/]node_modules[\\/]wangeditor[\\/]/,
              chunks: "all",
              priority: -1
            },
            lodash: {
              name: "lodash",
              test: /[\\/]node_modules[\\/]lodash[\\/]/,
              chunks: "all",
              priority: -2
            },
            xlsx: {
              name: "xlsx",
              test: /[\\/]node_modules[\\/]xlsx[\\/]/,
              chunks: "async",
              priority: 10
            }
          }
        }
      }
    });
    //过滤掉momnet的那些不使用的国际化文件
    config.plugin("replace").use(require("webpack").ContextReplacementPlugin).tap(() => {
      return [/moment[/\\]locale$/, /zh-cn/];
    });
  }
};

export default {
  treeShaking: true,
  targets: {
    ie: 11,
  },
  history: 'hash',
  publicPath: URL_PREFIX,
  alias: {
    '@': path.resolve(__dirname, 'src'),
  },
  proxy: {
    '/eam/*': {
      // 'target': 'http://47.98.224.225:7300/mock/26', // mock地址
      // 'target':'https://test.softcloud.vip/',
      // 'target':'http://47.96.119.120:8080', // bpm
      // 'target':'http://192.168.0.138:8080',
      // 'target': 'http://47.114.85.229/#/', // orar 环境
      //'target':'http://47.97.125.191/',
      //  'target': 'http://47.110.154.164/', //cms
      //  'target': 'https://v9.mingcloud.top', // 开发环境
      // 'target': 'http://192.168.0.100:8080', // 赵元本地
      //  'target': 'http://47.110.141.124', // 标准产品
      //  'target': 'http://117.131.114.232:8089', // lng
      //  'target': 'http://geam.test.geely.com', // 吉利开发环境
      // 'target': 'http://192.168.0.173:8080',//lf本地
      // 'target': 'http://218.13.52.35/', // 华润化学
      //  'target': 'http://192.168.0.100:8080', // cl本地
      //'target': 'http://47.111.241.161', //
      //   'target': 'http://192.168.0.104:8080', // 法标本地
      // 'target': 'http://47.110.231.17', // fast环境
      //  'target': 'http://47.111.24.52', // 演示测试环境
      // 'target': 'http://47.97.125.191/',
      // 'target': 'http://121.40.224.207', // 优得环境
      // 'target': 'http://47.110.249.85', // 销售环境
      // 'target': 'http://54.223.126.213:8081', // oa
      // 'target': 'http://47.97.155.39', // jl
      // 'target': 'http://47.111.31.46:8081', // asdk
      // 'target': 'http://47.110.240.78', // lng
      'target': 'http://121.196.145.182', // 
      'changeOrigin': true,
      // 'pathRewrite': { '^/api' : ' }
    },
    // '/bzzq-api/*': {
    //   // 'target': 'http://47.98.224.225:7300/mock/26', // mock地址
    //   // 'target': 'http://v9.mingcloud.top', // 开发环境
    //   //  'target': 'http://192.168.0.100:8080', // cl本地
    //   //  'target': 'http://218.13.52.35', //
    //     'target': 'http://47.111.241.161', // bzzq
    //   //   'target': 'http://192.168.0.119:8080', // 法标本地
    //   //  'target': 'http://testeam.mingcloud.top', // 测试环境
    //   //   'target': 'http://47.110.231.17', // fast环境
    //   //    'target': 'http://47.111.24.52', // 演示测试环境
    //   //'target': 'http://47.97.125.191/#/',
    //   // 'target': 'http://121.40.224.207', // 优得环境
    //   // 'target': 'http://47.110.249.85', // 销售环境
    //   // 'target': 'http://54.223.126.213:8081', // oa
    //   // 'target': 'http://47.97.155.39', // jl
    //   // 'target': 'http://52.81.58.147:8081', // asdk
    //   // 'target': 'http://47.110.240.78', //
    //   // 'target': 'http://121.40.224.207', // 优得
    //   // 'target': 'http://47.97.155.39', // 吉利
    //   // 'target': 'http://47.110.249.85', // 汉德
    //   //'target':'http://121.41.65.51/', // lng
    //   // 'target': 'http://54.222.166.237:8081', // OA
    //   'changeOrigin': true,
    //   // 'pathRewrite': { '^/api' : ' }
    // },
    // '/bzzq-msg/*': {
    //   'target': 'http://47.111.241.161', //
    //   'changeOrigin': true,
    //   // 'pathRewrite': { '^/api' : ' }
    // },
  },
  chainWebpack,
  plugins: [
    // ref: https://umijs.org/plugin/umi-plugin-react.html
    ['umi-plugin-react', {
      antd: true,
      dva: true,
      dynamicImport: false,
      title: '',
      dll: false,

      routes: {
        exclude: [
          /models\//,
          /services\//,
          /model\.(t|j)sx?$/,
          /service\.(t|j)sx?$/,
          /components\//,
        ],
      },
    }],
  ],
  /**
   * 路由相关配置
   */
  routes: [{
    //   path: `${URL_PREFIX}`,
    //   component: '../pages/IndexPage',
    // }, {
    path: '/',
    component: '../pages/IndexPage',
  }, {
    path: '/login',
    component: '../components/login/login',
  },
    {
      path: '/BoardFrameRoute',
      component: '../components/Frames/BoardFrame/BoardFrameRoute',
    },
  ],
};
