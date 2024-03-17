const initData = typeof window !== "undefined" && window.__INIT__;

__webpack_public_path__ =
  initData && initData.config && initData.config.publicPath;
