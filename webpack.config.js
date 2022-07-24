const path = require('path')
const HtmlWebpackPlugin = require('html-webpack-plugin')

module.exports = {
  context: process.cwd(),
  mode: 'development',
  entry: './src/index.js',
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: 'monitor.js',
  },
  devServer: {
    // dist 默认可访问，这里是开启一个新的静态文件根目录
    static: {
      directory: path.resolve(__dirname, 'public'),
    },
    onBeforeSetupMiddleware: function (devServer) {
      if (!devServer) {
        throw new Error('webpack-dev-server is not defined')
      }

      devServer.app.get('/success', function (req, res) {
        res.json([{ "name": "vancats", "age": 19 }])
      })
      devServer.app.post('/error', (req, res) => {
        res.sendStatus(500)
      })
    },
  },
  plugins: [
    new HtmlWebpackPlugin({
      template: './src/index.html',
      inject: 'head',
    })
  ]
}
