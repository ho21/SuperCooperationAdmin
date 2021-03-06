module.exports = {
  title: '全民帮帮管理后台',

  appId: 'app551ac64a61ebaadbf645274d334f9153',
  appSecret: 'a025ea3ff65610c8a95b6e7cfde500da',

  IM_APPID: '1400293884',

  // 任务类型
  TASK_TYPE_GENERAL: 0, // 悬赏任务
  TASK_TYPE_COMPETITION: 1, // 竞价任务

  /**
   * 上传图片处理地址
   */
  uploadImgApiPath: process.env.VUE_APP_BASE_API + '/upload/image',

  /**
   * 图片域名
   */
  uploadImgDomain: process.env.VUE_APP_BASE_API,

  webDomain: 'http://sc.250.cn',

  /**
   * @type {boolean} true | false
   * @description Whether show the settings right-panel
   */
  showSettings: false,

  /**
   * @type {boolean} true | false
   * @description Whether need tagsView
   */
  tagsView: true,

  /**
   * @type {boolean} true | false
   * @description Whether fix the header
   */
  fixedHeader: true,

  /**
   * @type {boolean} true | false
   * @description Whether show the logo in sidebar
   */
  sidebarLogo: true,

  /**
   * @type {string | array} 'production' | ['production', 'development']
   * @description Need show err logs component.
   * The default is only used in the production env
   * If you want to also use it in dev, you can pass ['production', 'development']
   */
  errorLog: 'production'
}
