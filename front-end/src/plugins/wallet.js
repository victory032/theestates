export default {
  install: async (app, connection) => {
    app.provide('wallet', connection)
  }
}