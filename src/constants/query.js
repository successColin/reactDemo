/*
 * @Author: Fus
 * @Date:   2019-05-21 15:31:48
 * @Last Modified by: mikey.zhaopeng
 * @Last Modified time: 2020-10-30 14:45:10
 * @Desc: 接口名
 */
const prefix = '/eam';
export default {

  /**
   * 会议管理
   */
  GET_VIDEO_LIST: `${prefix}/remoteassistance/glasses/list`, // 会议列表
  GET_EXPORT_LIST: `${prefix}/remoteassistance/expert/page`, // 获取专家列表
  GET_USER_INFO: `${prefix}/remoteassistance/user`, // 获取到用户的信息
  ACCEPT_INVITATION: `${prefix}/remoteassistance/acceptConference`, // 接受邀请
  GET_DEVICE_LIST: `${prefix}/searchassistance/device/page`, // 获取设备列表
  GET_DEVICE_DETAILS: `${prefix}/searchassistance/device/`, // 获取设备详情
  GET_DEVICE_DATAS: `${prefix}/searchassistance/device/file/page`, // 获取设备资料
  GET_WORKDER_LIST_BY_DEVICE: `${prefix}/searchassistance/workorder/page`, // 获取工单列表
  GET_WORKDER_DATAS: `${prefix}/searchassistance/workorder/`, // 获取工单详情
  GET_VIDEO_HISTORY: `${prefix}/remoteassistance/conferenceHistory/page`, // 获取会议历史
  LEAVE_VIDEO_MEETTING: `${prefix}/remoteassistance/finishConference/`, // 获取会议历史
  GET_VOUCHER: `${prefix}/remoteassistance/genUserSig`, // 获取UserSig
  /**
   * 元素管理模块
   */
  GET_ELEMENT_TREE: `${prefix}/elementModel/getJsonTree`, // 元素树
  GET_GROUP_DETAIL: `${prefix}/elementModelGroup/get`, // 根据id获取组详情
  DEL_GROUP: `${prefix}/elementModelGroup/delete`, // 删除组
  ADD_GROUP: `${prefix}/elementModelGroup/insert`, // 新增组
  EDIT_GROUP: `${prefix}/elementModelGroup/update`, // 修改组
  ADD_ELEMENT: `${prefix}/elementModel/relationInsert`, // 新增元素
  DEL_ELEMENT: `${prefix}/elementModel/relationDelete`, // 删除元素
  EDIT_ELEMENT: `${prefix}/elementModel/relationUpdate`, // 修改元素
  GET_ELEMENT_DETAIL: `${prefix}/elementModel/relationGet`, // 获取元素详情
  GET_ELEMENT_TYPElIST: `${prefix}/elementModel/elementModelTypeList`, // 获取所有元素类型
  GET_ELEMENT_LIB: `${prefix}/elementModel/getElementModelTool`, // 获取元素库工具面板

  /** 关联表、字段等 */
  GET_GLOBAL_TABLES: `${prefix}/tables/selectPage`, // 获取所有关联表
  GET_GLOBAL_TABLE_COLS: `${prefix}/columns/listByTables`, // 按表名获取字段
  GET_WATERMARK_LIST: `${prefix}/watermark/list`, // 获取水印模板
  GET_CURRENCY_LIST: `${prefix}/currencyCommon/currencyGetById`, // 获取注册接口的入参和出参
  GET_PARAMS_FROM_TAB: `${prefix}/serviceParam/selectByTabId`, // 根据面板id返回入参列表

  /** 预设界面模块 */
  GET_TAB_TREE: `${prefix}/tab/getJsonTree`, // 获取界面配置树
  GET_TAB_GROUP_DETAIL: `${prefix}/tabGroup/get`, // 查看tab组
  INSERT_TAB_GROUP: `${prefix}/tabGroup/insert`, // 新增tab组
  DELETE_TAB_GROUP: `${prefix}/tabGroup/delete`, // 删除tab组
  UPDATE_TAB_GROUP: `${prefix}/tabGroup/update`, // 修改tab组
  INSERT_TAB: `${prefix}/tab/relationInsert`, // 新增tab
  DELETE_TAB: `${prefix}/tab/relationDelete`, // 删除tab
  UPDATE_TAB: `${prefix}/tab/relationUpdate`, // 修改tab
  GET_TAB_DETAIL: `${prefix}/tab/relationGet`, // 查询tab

  /** 图标管理 */
  GET_ICON_GROUP_TREE: `${prefix}/icon/getJsonTree`, // 获取图标组树
  GET_ICON_LIST: `${prefix}/icon/select`, // 查询图标列表

  /**
   * 菜单库管理
   */
  GET_MENU_LIST: `${prefix}/functionLibrary/selectPage`, // 菜单库列表
  INSERT_MENU: `${prefix}/functionLibrary/insert`, // 单条新增菜单库
  DELETE_MENU_LIST: `${prefix}/functionLibrary/delete`, // 根据id删除菜单库
  UPDATE_RECORD_BYID: `${prefix}/functionLibrary/update`, // 根据id修改菜单库
  FRAME_TYPE_LIST: `${prefix}/frameType/list`, // 获取界面类型
  DELETE_MENU_LISTS: `${prefix}/functionLibrary/batchDelete`, // 根据id删除菜单库

  /**
   * 实体管理
   */
  GET_JAVABEAN_LIST: `${prefix}/tables/list`, // 根据条件获取实体所有tables
  GET_DETIAL_BYID: `${prefix}/basicTable/getTableInfo`, // 获取单条数据详情
  INSERT_JAVABEAN_LIST: `${prefix}/basicTable/createTable`, // 新增实体
  UPDATE_JAVABEAN_LIST: `${prefix}/basicTable/updateTableName`, // 编辑实体
  DELETE_JAVABEAN_LIST: `${prefix}/basicTable/dropTable`, // 刪除实体
  ADD_JAVABEAN_FIELDS: `${prefix}/basicTable/insertColumn`, // 新增表字段
  UPDATE_JAVABEAN_FIELDS: `${prefix}/basicTable/updateColumn`, // 修改表字段
  DELETE_JAVABEAN_FIELDS: `${prefix}/basicTable/deleteColumn`, // 修改表字段
  GET_JAVABEAN_TREE: `${prefix}/tablegroup/getJsonTree`, // 获取实体表树
  GET_JAVABEAN_GROUP: `${prefix}/tablegroup/get/`, // 获取实体表分组
  UPDATE_JAVABEN_GROUP: `${prefix}/tablegroup/update`, // 更新实体表分组
  DELETE_JAVABEN_GROUP: `${prefix}/tablegroup/delete/`, // 删除实体表分组
  INSERT_JAVABEN_GROUP: `${prefix}/tablegroup/insert`, // 新增实体表分组
  GET_JAVABEN_ID: `${prefix}/tables/get/`, // 新增实体表分组
  COLUMNS_UPDATE: `${prefix}/columns/update`, // 是否初始化


  /**
   * 菜单管理
   */
  GET_FILEMANGER_TREE: `${prefix}/function/getJsonTree`, // 获取菜单树
  GET_FILEDETIAL_BYID: `${prefix}/function/relationGet`, // 关联查询菜单
  UPDATE_FILE_DETIAL: `${prefix}/function/relationUpdate`, // 关联修改菜单
  DEL_MENU_TREElIST: `${prefix}/function/delete`, // 根据id删除菜单
  ADD_FILE_TREE: `${prefix}/function/relationInsert`, // 关联新增菜单

  /** 用户设计组 */
  GET_USER_DESIGNER_TREE: `${prefix}/userDesigner/getJsonTree`, // 获取用户设计组树
  GET_USER_DESIGNER_GROUP_DETAIL: `${prefix}/userDesignerGroup/get`, // 获取用户设计组分组详情
  GET_USER_DESIGNER_DETAIL: `${prefix}/userDesigner/get`, // 获取用户设计组详情
  GET_ACTIVE_USER_DESIGNER_TREE: `${prefix}/userDesignerTab/getJsonTree`, // 获取菜单面板树
  DELETE_USER_DESIGNER_GROUP: `${prefix}/userDesignerGroup/delete`, // 删除组节点
  DELETE_USER_DESIGNER: `${prefix}/userDesigner/delete`, // 删除用户设计组
  INSERT_USER_DESIGNER_GROUP: `${prefix}/userDesignerGroup/insert`, // 新增组
  INSERT_USER_DESIGNER: `${prefix}/userDesigner/insert`, // 新增用户设计组
  UPDATE_USER_DESIGNER_GROUP: `${prefix}/userDesignerGroup/update`, // 修改组
  UPDATE_USER_DESIGNER: `${prefix}/userDesigner/update`, // 修改用户设计组

  /** 设计组菜单 */
  UPDATE_FRAME_DETAIL: `${prefix}/frames/relationInsertOrUpdate`, // 更新框架
  UPDATE_FRAME_TAB_DETAIL: `${prefix}/userDesignerTab/relationUpdate`, // 更新面板信息
  UPDATE_TAB_BASIC_DATA: `${prefix}/userDesignerTab/insertOrUpdateTab`, // 更新面板基础信息
  UPDATE_TAB_ELEMENT_DATA: `${prefix}/userDesignerTab/insertOrUpdateElement`, // 更新面板内控件信息
  // DELETE_USER_DESIGNER_TAB: `${prefix}/tab/relationDelete`, // 删除面板
  GET_USER_DESIGNER_TAB_ELEMENT_LIST: `${prefix}/userDesignerTab/selectElementListByTabId`, // 获取面板下的控件列表
  DELETE_USER_DESIGNER_TAB_ELEMENT: `${prefix}/userDesignerTab/relationDeleteElement`, // 删除面板下控件
  GET_USER_DESIGNER_FILTER_COND: `${prefix}/userDesignerTab/selectAdvancedQuery`, // 获取面板筛选条件
  UPDATE_USER_DESIGNER_FILTER_COND: `${prefix}/userDesignerTab/insertOrUpdateAdvancedQuery`, // 更新面板的筛选条件
  ADD_ELEMENT_TO_TAB: `${prefix}/userDesignerTab/relationInsertElement`, // 单条新增控件
  GET_ELEMENT_MULTI_RELATION: `${prefix}/elementMultiRelation/selectByElementId`, // 查询多级实体信息
  INSERT_OR_UPDATE_MULTI_RELATION: `${prefix}/elementMultiRelation/insertOrUpdate`, // 新增修改多级实体信息
  INSERT_OR_UPDATE_FILED_RELATION: `${prefix}/multiChoiceColumnRelation/insertOrUpdate`, // 新增修改字段关联关系
  INSERT_OR_UPDATE_CONFIG: `${prefix}/combinationInfo/insertOrUpdate`, // 新增控件配置
  GET_ELEMENT_FILED_RELATION: `${prefix}/multiChoiceColumnRelation/selectByElementId`, // 查询多级实体信息
  COPY_USER_DESIGNER_TAB: `${prefix}/userDesignerTab/copyTab`, // 复制配置面板
  GET_TAB_SENIOR_FILTER: `${prefix}/seniorFilter/relationGet`, // 获取面板高级筛选数据
  INSERT_OR_UPDATE_TAB_SENIOR_FILTER: `${prefix}/seniorFilter/insertOrUpdate`, // 更新面板高级筛选数据
  GET_JUMP_FILE_LIST: `${prefix}/jumpMenu/selectByElementId`, // 根据控件id查询信息
  INSERT_OR_UPDATE_JUMP_MENU: `${prefix}/jumpMenu/insertOrUpdate`, // 新增修改信息
  INSERT_OR_UPDATE_IN_PARAMS: `${prefix}/serviceParam/insertOrUpdate`, // 新增修改输入参数列表
  GET_COMBINATION_INFO: `${prefix}/combinationInfo/selectByElementId`, // 获取控件属性列表

  /** 菜单模块 */
  GET_FUNCTION_TREE: `${prefix}/function/getJsonTree`, // 获取菜单树
  GET_FRAME_DETAIL: `${prefix}/frames/relationGet`, // 获取菜单的面板信息
  GET_FILE_PARAM_LIST: `${prefix}/inParam/selectByRelationId`, // 获取设计组菜单中菜单的输入参数列表
  UPDATE_FRAME_PARAM_LISY: `${prefix}/inParam/insertOrUpdate`, // 新增/修改信息
  DO_SEARCH: `${prefix}/functionBehavior/selectFunctionByKeyword`, // 菜单查找

  /**
   * 角色管理
   */
  GET_ROLE_TREE: `${prefix}/role/getJsonTree`, // 获取角色树
  EDIT_ROLE_GROUP: `${prefix}/roleGroup/update`, // 根据id修改角色组
  EDIT_ROLE_ROLE: `${prefix}/role/update`, // 根据id修改角色
  GET_ROLEGROUP_TREE: `${prefix}/roleGroup/get`, // 获取角色组详情
  GET_ROLETREE_ROLE: `${prefix}/role/get`, // 获取角色详情
  DEL_ROLEGROUP_TREE: `${prefix}/roleGroup/delete`, // 删除角色组
  DEL_ROLE_TREE: `${prefix}/role/delete`, // 删除角色
  ADD_ROLE_GROUP: `${prefix}/roleGroup/insert`, // 新增角色组
  ADD_ROLE_ROLE: `${prefix}/role/insert`, // 新增角色
  GET_PC_AUTHORITY: `${prefix}/roleFunctionPermission/getJsonTree`, // 根据角色id查看角色菜单权限树
  INSERT_ROLE_FUNCTION: `${prefix}/roleFunctionPermission/batchInsert`, // 批量新增角色菜单权限
  EDIT_PC_FUNCTIONPERMISSION: `${prefix}/roleFunctionPermission/update`, // 根据id修改角色菜单权限
  UPDAT_ROW_FUNCTIONPERMISSION: `${prefix}/roleFunctionPermission/columnCheckAll`, // 角色菜单权限列全选
  GET_APP_AUTHORITY: `${prefix}/roleBundlePermission/getJsonTree`, // 根据角色id查看角色APP权限树
  UPDATE_BUNDLEPERMISSIIN: `${prefix}/roleBundlePermission/update`, // 根据id修改角色组件权限
  UPDATE_COLUMN_CHECKALL: `${prefix}/roleBundlePermission/columnCheckAll`, // 角色组件权限列全选
  UPDATE_ROW_CHECKALL: `${prefix}/roleBundlePermission/rowCheckAll`, // 角色组件权限行全选
  INSERT_ROLE_APPPERMISSION: `${prefix}/roleAppPermission/insert`, // 单条新增角色APP权限
  UPDATE_ROLE_APPPERMISSION: `${prefix}/roleAppPermission/update`, // 单条修改角色APP权限
  GET_ROLE_ORG: `${prefix}/roleRelationOrg/getAllOrg`, // 获取关联的组织数据
  GET_ROLE_DATA_TREE: `${prefix}/org/getJsonTree`, // 获取组织机构
  UPDATE_ROLE_DATA: `${prefix}/roleRelationOrg/batchInsert`, // 修改数据角色关联组织
  DELETE_ROLE_ORGID: `${prefix}/roleRelationOrg/BatchDelte`, // 删除数据角色关联组织
  GET_COMPONENY_TREE: `${prefix}/company/getJsonTree`, // 获取公司树
  /**
   * 用户管理
   */
  GET_POSITION_TREE: `${prefix}/report/getJsonTree`, // 获取位置树
  GET_CHART_DATA: '/report/query', // 获取报表
  GET_USER_TREE: `${prefix}/user/getJsonTree`, // 获取用户树
  INSERT_USER_GROUP: `${prefix}/userGroup/insert`, // 单条新增用户组
  INSERT_USER_USER: `${prefix}/user/insert`, // 单条新增用户
  UPDATE_USER_GROUP: `${prefix}/userGroup/update`, // 根据id修改用户组
  GET_USER_USERGROUP: `${prefix}/userGroup/get`, // 根据id查询用户组
  DELETE_USER_USERGROUP: `${prefix}/userGroup/delete`, // 根据id删除用户组
  DEL_USER_USER: `${prefix}/user/delete`, // 根据id删除用户
  UPDATE_USER_USER: `${prefix}/user/update`, // 根据id修改用户
  UPDATE_USER_LOCKED: `${prefix}/user/updateUnLocked`, // 解锁
  GET_USER_DETIAL: `${prefix}/user/get`, // 根据id查看用户
  GET_USER_FUNCTION_TREE: `${prefix}/userFunctionPermission/getJsonTree`, // 根据用户id查看用户菜单权限树
  GET_USER_APP_TREE: `${prefix}/userBundlePermission/getJsonTree`, // 根据用户id查看用户组件权限
  UPDATE_USER_PERMISSION_UPDATE: `${prefix}/userFunctionPermission/insertOrUpdate`, // 批量新增修改用户菜单权限
  UPDATE_USER_ROW_CHECK: `${prefix}/userFunctionPermission/columnCheckAll`, // 用户菜单权限列全选
  UPDATE_USER_APP: `${prefix}/userBundlePermission/insertOrUpdate`, // 批量新增修改用户组件权限
  UPDATA_USER_ROW_APP: `${prefix}/userBundlePermission/columnCheckAll`, // 用户组件权限列全选
  GET_USEROFROLE_TREE: `${prefix}/roleRelationUser/getJsonTree`, // 根据用户id查询用户角色权限树
  INSERT_RELATION_USER: `${prefix}/roleRelationUser/relationInsert`, // 新增用户角色权限
  INSERT_USER_APPPERMISSION: `${prefix}/userAppPermission/insertOrUpdate`, // 单条新增用户APP权限
  INSERT_USER_APPINSERT: `${prefix}/userAppPermission/inherit`, // 单条新增用户APP权限继承
  GET_USER_GROUP_TREE: `${prefix}/userGroup/getJsonTree`, // 查询用户组树
  GET_USER_ORG_DATA: `${prefix}/userRelationOrg/getAllOrg`, // 查询用户组树
  UPDATE_USER_DATA: `${prefix}/userRelationOrg/batchInsert`, // 修改数据角色关联组织
  REST_USER_PASSWORD: `${prefix}/user/resetPassWord`, // 重置密码
  GET_USER_LIST: `${prefix}/user/selectUserList`, // 用户列表
  COPY_ROLERELATION_USER: `${prefix}/user/copyRoleRelationUser`, // 复制角色
  /**
   * 默认编码规则
   */
  GET_TABLE_LIST: `${prefix}/tables/list`, // 根据条件获取所有tables
  GET_CODEDETIAL_BYID: `${prefix}/coderule/getName`, // 根据表名获取编码规则
  UPDATE_CODERULES: `${prefix}/coderule/update`, // 修改默认编码规则

  /**
   * 设置默认规则
   */
  GET_CODE_TREE: `${prefix}/codegroup/getJsonTree`, // 查询编码分组组合树接口
  INSER_CODE_GROUP: `${prefix}/codegroup/insert`, // 新增编码分组接口
  UPDATE_CODE_GROUP: `${prefix}/codegroup/update`, // 根据id修改编码分组接口
  DELETE_CODE_GROUP: `${prefix}/codegroup/delete`, // 根据id删除编码分组接口
  GET_CODEGROUP: `${prefix}/codegroup/get`, // 根据id获取编码分组
  GET_CODERULE: `${prefix}/coderule/get`, // 根据id获取编码规则
  UPDATE_CODE_RULE: `${prefix}/coderule/update`, // 根据id修改编码规则接口
  INSER_CODE_RULE: `${prefix}/coderule/insert`, // 新增编码规则接口
  DELETE_CODE_RULE: `${prefix}/coderule/delete`, // 根据id删除编码规则

  /** 触发器 */
  INSERT_TRIGGER_EVENT: `${prefix}/triggerEvent/insert`, // 新增触发器事件
  DEL_TRIGGER_EVENT: `${prefix}/triggerEvent/delete`, // 删除触发事件
  GET_TRIGGEREVENT_DATA: `${prefix}/trigger/relationSelect`, // 获取触发器信息
  GET_TAB_ELEMENT_LIST: `${prefix}/trigger/selectElementByTabId`, // 获取面板内控件列表
  UPDATE_TRIGGER_EVENT: `${prefix}/trigger/insertOrUpdate`, // 更新触发器
  DEL_TRIGGER: `${prefix}/trigger/delete`, // 删除触发器信息
  INSERT_OR_UPDATE_HTTP_REQUEST_TRIGGER: `${prefix}/httpRequestInfo/insertOrUpdate`, // 保存http触发器
  GET_HTTP_REQUEST_TRIGGER_DETAIL: `${prefix}/httpRequestInfo/selectByTriggersId`, // 获取http触发器详情
  HTTP_REQUEST: `${prefix}/currencyPc/currencyHttpRequest`, // http触发器跳转第三方

  /** 树形业务框架 */
  GET_PAGE_CONFIG: `${prefix}/currencyPc/currencyGetPcPage`, // 获取页面配置
  GET_PAGE_FULL_TREE: `${prefix}/currencyPc/currencyGetTreeData`, // 左侧树数据(整棵树)
  GET_PAGE_SINGLE_TREE_NODE: `${prefix}/currencyPc/currencyGetSingleNodeTreeData`, // 获取树数据（单点数据）
  GET_PAGE_DATA: `${prefix}/currencyPc/currencyGetPageData`, // 页面数据
  INSERT_OR_UPDATE_PAGE_DATA: `${prefix}/currencyPc/currencyInsertOrUpdateTree`, // 更新页面数据
  BATCH_INSERT_OR_UPDATE_PAGE_DATA: `${prefix}/currencyPc/currencyBatchInsertOrUpdate`, // 批量新增修改
  INSERT_OR_UPDATE_RELATION_PAGE_DATA: `${prefix}/currencyPc/currencyInsertOrUpdate`, // 更新页面数据
  DELETE_PAGE_TREE_NODE: `${prefix}/currencyPc/currencyDeleteTree`, // 删除树节点
  GET_PAGE_SELECT_OPTIONS: `${prefix}/currencyPc/currencyGetDropDown`, // 获取下拉选项
  GET_TRIGGER_RESULT: `${prefix}/currencyPc/currencyStandardSelectionBoxTrigger`, // 通用处理PC标准选择框触发器
  GET_TREE_FRAME_LIST_DATA: `${prefix}/currencyPc/currencyGetListData`, // 通用查询列表数据
  BATCH_DELETE_PAGE_DATA: `${prefix}/currencyPc/currencyBatchDelete`, // 删除数据（非树）
  VALID_KEYCODE: `${prefix}/currencyPc/currencySelectByKeycode`, // 校验keycode唯一性
  SWITCH_NODE: `${prefix}/currencyPc/currencySwitchNode`, // 转移树节点
  INSERT_OR_UPDATE_BY_TRIGGERS: `${prefix}/currencyPc/currencyInsertOrUpdateByTriggers`, // 普通按钮
  GET_NORMAL_SEARCH_SELECT_DETAIL: `${prefix}/currencyPc/currencyGetDataById`, // 标准选择框查询当前数据所有字段信息
  LEFT_FTREE_FRAME_BATCH_UPDATE: `${prefix}/currencyPc/currencyBatchUpdateByIds`, // 批量新增修改
  GET_CHECKBOX_SEARCH_SELECT_DETAIL: `${prefix}/currencyCommon/currencyGetByIds`, // 根据ids获取数据详情

  /** 标准数据选择框 */
  GET_NORMAL_SEARCH_SELECT_SINGLE_TREE_NODE: `${prefix}/currencyPc/currencyStandardSelectionBoxSingleTree`, // 获取单个树节点数据
  GET_NORMAL_SEARCH_SELECT_FULL_TREE_NODE: `${prefix}/currencyPc/currencyStandardSelectionBoxTree`, // 获取整树节点数据
  GET_NORMAL_SEARCH_SELECT_LIST: `${prefix}/currencyPc/currencyStandardSelectionBoxList`, // 获取弹框内列表数据
  GET_NORMAL_SEARCH_SELECT_TREE_ROOT_NODES: `${prefix}/currencyPc/currencyGetRootNodes`, // 查询树节点所有父节点

  /**
   * 模板档案
   */
  GET_IMPORT_TREE: `${prefix}/importmodelgroup/getJsonTree`, // 获取导入模块树接口
  INSERT_IMPORT_GROUP: `${prefix}/importmodelgroup/insert`, // 新增导入模板分组
  GET_IMPORT_GROUP: `${prefix}/importmodelgroup/get`, // 单条获取导入模板分组
  DEL_IMPORT_GROUP: `${prefix}/importmodelgroup/delete`, // 删除导入模板分组
  UPDATE_IMPORT_GROUP: `${prefix}/importmodelgroup/update`, // 修改导入模板分组
  INSERT_CODE_IMPORT: `${prefix}/importmodel/insert`, // 新增导入模板
  GET_IMPORT_DETIAL: `${prefix}/importmodel/get`, // 单条获取导入模板
  DELETE_IMPORT: `${prefix}/importmodel/delete/`, // 删除导入模板以及模板明细
  UPDATE_IMPORT: `${prefix}/importmodel/update`, // 修改导入模板
  GET_IMPORT_ALL: `${prefix}/importmodelline/getLineByModel`, // 根据导入模板id获取所有明细
  DEL_DETIAL_ONE: `${prefix}/importmodelline/delete`, // 删除导入模板明细
  INSERT_DETIAL_ONE: `${prefix}/importmodelline/insert`, // 新增导入模板明细
  UPDATE_DETIAL_ONE: `${prefix}/importmodelline/update`, // 修改导入模板明细
  UPDATE_TEMPLATE_SNO: `${prefix}/importmodelline/batchUpdate`, // 修改顺序

  // 导入
  DOWNLOAD_EXCEL: `${prefix}/excel/downloadExcel`, // 下载excel
  DOCHECK_EXCEL: `${prefix}/excel/doCheckExcel`, // 校验excel数据
  UPLOAD: `${prefix}/file/fileExcelUpload`, // 上传
  GET_PROCESS: `${prefix}/excel/doGetProgress`, // 获取进度条
  DO_EXEL_T0_DB: `${prefix}/excel/doExcelToDB`, // excel导入数据库

  /** 菜单中心 */
  GET_FUNCTION_CENTER: `${prefix}/functionBehavior/selectFunctionCenter`, // 获取菜单列表
  UPDATE_COLLECT_FUNCTION: `${prefix}/functionBehavior/insertOrUpdate`, // 收藏菜单

  /** 移动端预设界面 */
  GET_MOBILE_TAB_TREE: `${prefix}/mobileTab/getJsonTree`, // 查询面板树
  INSERT_MOBILE_TAB_GROUP: `${prefix}/mobileTabGroup/insert`, // 新增面板组
  DELETE_MOBILE_TAB_GROUP: `${prefix}/mobileTabGroup/delete`, // 删除面板组
  UPDATE_MOBILE_TAB_GROUP: `${prefix}/mobileTabGroup/update`, // 修改面板组
  GET_MOBILE_TAB_GROUP_DETAIL: `${prefix}/mobileTabGroup/get`, // 查询面板组详情
  INSERT_MOBILE_TAB: `${prefix}/mobileTab/relationInsert`, // 新增面板
  DELETE_MOBILE_TAB: `${prefix}/mobileTab/relationDelete`, // 删除面板
  UPDATE_MOBILE_TAB: `${prefix}/mobileTab/relationUpdate`, // 修改面板
  GET_MOBILE_TAB_DETAIL: `${prefix}/mobileTab/relationGet`, // 查询面板详情

  /** bundle配置 */
  GET_FRAME_BUNDLE_TYPE_LIST: `${prefix}/mobileFrameType/list`, // 查询bundle框架类型列表
  GET_BUNDLE_LIBRARY_JSON_TREE: `${prefix}/bundleLibrary/getJsonTree`, // 获取bundle树
  DELETE_BUNDLE_GROUP: `${prefix}/bundleLibraryGroup/delete`, // 删除bundle组
  INSERT_OR_UPDATE_BUNDLE_GROUP: `${prefix}/bundleLibraryGroup/insertOrUpdate`, // 修改新增bundle组
  GET_BUNDLE_GROUP_DETAIL: `${prefix}/bundleLibraryGroup/get`, // 获取bundle组
  DELETE_BUNDLE: `${prefix}/bundleLibrary/delete`, // 删除bundle
  INSERT_OR_UPDATE_BUNDLE: `${prefix}/bundleLibrary/insertOrUpdate`, // 新增修改bundle
  GET_BUNDLE_DETAIL: `${prefix}/bundleLibrary/get`, // 获取bundle
  INSERT_OR_UPDATE_MOBILE_FRAMES: `${prefix}/mobileFrames/relationInsertOrUpdate`, // 新增修改框架
  DELETE_MOBILE_FRAMES: `${prefix}/mobileFrames/relationDelete`, // 删除框架
  INSERT_OR_UPDATE_USER_DESIGNER_MOBILE_TAB: `${prefix}/userDesignerMobileTab/insertOrUpdateTab`, // 根据组件id/组件库id关联新增修改用户设计组面板
  DELETE_USER_DESIGNER_MOBILE_TAB: `${prefix}/userDesignerMobileTab/relationDelete`, // 删除面板
  GET_USER_DESIGNER_MOBILE_TAB_ELEMENT_LIST: `${prefix}/userDesignerMobileTab/selectElementListByTabId`, // 根据用户设计组id和组件id/组件库id，面板id获取元素集合
  ADD_ELEMENT_TO_MOBILE_TAB: `${prefix}/userDesignerMobileTab/relationInsertElement`, // 单条新增控件
  INSERT_OR_UPDATE_USER_DESIGNER_MOBILE_TAB_ELEMENT: `${prefix}/userDesignerMobileTab/insertOrUpdateElement`, // 根据用户设计组id,组件id/组件库id关联新增修改用户设计组面板控件信息
  DELETE_USER_DESIGNER_MOBILE_TAB_ELEMENT: `${prefix}/userDesignerMobileTab/relationDeleteElement`, // 关联删除用户设计组控件
  INSERT_OR_UPDATE_USER_DESIGNER_MOBILE_TAB_ADVANCED_QUERY: `${prefix}/userDesignerMobileTab/insertOrUpdateAdvancedQuery`, // 根据条件获取面板筛选条件
  COPY_USER_DESIGNER_MOBILE_TAB: `${prefix}/userDesignerMobileTab/copyTab`, // 复制已有面板
  GET_USER_DESIGNER_MOBILE_TAB_TREE: `${prefix}/userDesignerMobileTab/getBundleTabJsonTree`, // 查询bundle面板树
  GET_MOBILE_FRAME_USER_DESIGNER_LIST: `${prefix}/mobileFrames/relationGetUserDesigner`, // 获取bundle的用户设计组列表
  DELETE_USER_DESIGNER_FUNCTION: `${prefix}/userDesigner/deleteUserDesigner`, // 删除设计组菜单
  GET_THIRD_PARTY_INTERFACE: `${prefix}/currencyCommon/currencyGetService`, // 获取接口服务
  GET_THIRD_PARTY_DATA: `${prefix}/currencyCommon/currencyGetByService`, // 通过接口服务获取数据
  /** APP档案 */
  GET_APP_GROUP_TREE: `${prefix}/appGroup/getJsonTree`, // 查询APP分组树
  INSERT_OR_UPDATE_APP_GROUP: `${prefix}/appGroup/insertOrUpdate`, // 新增修改APP分组
  DELETE_APP_GROUP: `${prefix}/appGroup/delete`, // 根据id删除APP分组
  GET_APP_GROUP_DETAIL: `${prefix}/appGroup/get`, // 根据id查询APP分组
  INSERT_OR_UPDATE_APP: `${prefix}/app/insertOrUpdate`, // 新增修改APP
  DELETE_APP: `${prefix}/app/delete`, // 根据id删除APP
  GET_APP_DETAIL: `${prefix}/app/get`, // 根据id查询APP
  GET_APP_LIST: `${prefix}/app/list`, // 根据APP分组id查询APP列表
  GET_APP_BUNDLE_TREE: `${prefix}/app/getAppBundleTreeTool`, // 获取AppBundle工具树
  GET_BUNDLE_LIBRARY_TREE: `${prefix}/bundleLibrary/getBundleLibraryTreeTool`, // 查询组件库工具树

  /** APP主页配置 */
  INSERT_APP_HOME_PAGE: `${prefix}/appHomePage/relationInsert`, // 关联新增APP首页bundle
  GET_APP_HOME_PAGE: `${prefix}/appHomePage/relationGet`, // 获取APP首页信息
  DELETE_APP_HOME_PAGE_BUNDLE: `${prefix}/bundle/relationDelete`, // 删除首页bundle
  REPLACE_APP_HOME_PAGE_BUNDLE: `${prefix}/bundle/replace`, // 替换组件
  UPDATE_BUNDLE: `${prefix}/bundle/update`, // 根据id修改组件信息
  INSERT_OR_UPDATE_APP_HOME_PAGE_BUNDLE_GROUP: `${prefix}/appHomePageBundleGroup/insertOrUpdate`, // 新增修改分组
  DELETE_APP_HOME_PAGE_BUNDLE_GROUP: `${prefix}/appHomePageBundleGroup/delete`, // 删除首页分组
  UPDATE_APP_HOME_PAGE_BUNDLE_GROUP_SNO: `${prefix}/appHomePageBundleGroup/updateSno`, // 修改主页分组序号
  GET_BUNDLE_SELECT_FIELDS: `${prefix}/bundle/selectFieldByBundleId`, // 获取bundle可应用于日历的字段
  SAVE_APP_BANNER_LIST: `${prefix}/appHomePageCarouselFigure/insertOrUpdate`, // 新增修改banner图
  GET_APP_BANNER_LIST: `${prefix}/appHomePageCarouselFigure/list`, // 获取app的banner列表
  GET_APP_USER_CENTER_STATIC_CONFIG: `${prefix}/pcHomePageConfig/selectAppline`, // 查询app个人中心固定配置
  SAVE__APP_USER_CENTER_STATIC_CONFIG: `${prefix}/pcHomePageConfig/insertOrUpdate`, // 新增/修改app个人中心固定配置
  SWITCH_GROUP: `${prefix}/appHomePage/switchGroup`, // 切换分组

  /**
   * 登录页
   */
  LOGIN: `${prefix}/login`,
  GETCODE: `${prefix}/user/verifyCode`, // 获取验证码
  LOGIN_SELECTLINE: `${prefix}/pcHomePageConfig/selectline`,
  GET_CODEBYMSG: `${prefix}/saas/verifyCode`,//获取短信验证码
  LOGIN_SAAS: `${prefix}/saas/telePhoneLogin`,//saas平台登录
  PREFECT_USERINFO: `${prefix}/saas/userUpdate`,//完善用户信息

  /**
   * 全局中心
   */
  GET_GlobalCenter_TREE: `${prefix}/variablegroup/getJsonTree`, // 获取全局中心树
  INSERT_GLOBAL_CENTER: `${prefix}/variable/insert`, // 新增全局配置中心
  UPDATE_GLOBAL_CENTER: `${prefix}/variable/update`, // 修改全局配置中心
  GET_GLOBAL_DETIAL: `${prefix}/variable/get/`, // 根据id获取全局配置中心
  DELETE_GLOBAL_CENTER: `${prefix}/variable/delete`, // 删除全局配置中心
  INSERT_GLOBAL_CENTER_GROUP: `${prefix}/variablegroup/insert`, // 新增全局配置中心组
  UPDATE_GLOBAL_CENTER_GROUP: `${prefix}/variablegroup/update`, // 修改全局配置中心组
  GET_GLOBAL_DETIAL_GROUP: `${prefix}/variablegroup/get/`, // 根据id获取全局配置中心组
  DELETE_GLOBAL_CENTER_GROUP: `${prefix}/variablegroup/delete`, // 删除全局配置中心组
  GET_VARIABLE_VALUE: `${prefix}/variable/getValue`, // 根据参数名获取参数值

  /**
   *  左侧列表模板
   */
  GET_PC_PAGE: `${prefix}/currencyPcList/currencyGetPcPage`, // 通用查询PC页面元素（左侧列表框架）
  GET_LIST_DATA: `${prefix}/currencyPcList/currencyGetListData`, // 通用查询PC列表页面数据（左侧列表框架）
  GET_DROP_DOWN_LIST: `${prefix}/currencyPcList/currencyGetDropDown`, // 通用获取PC下拉数据（左侧列表框架）
  GET_PC_LIST_DATA: `${prefix}/currencyPcList/currencyGetPageData`, // 通用查询PC页面数据（左侧列表框架）
  PCList_TRIGGER: `${prefix}/currencyPcList/currencyStandardSelectionBoxTrigger`, // 通用处理PC标准选择框触发器（左侧列表框架）
  HANDLE_SAVE: `${prefix}/currencyPcList/currencyInsertOrUpdate`, // 通用新增修改PC数据（左侧列表框架）
  HANDLE_MULTI_INSERT: `${prefix}/currencyPcList/currencyMultiInsert`, // 多选数据
  DELETE_LIST: `${prefix}/currencyPcList/currencyDelete`, // 通用删除PC数据（左侧列表框架）
  INSERT_OR_UPDATE: `${prefix}/currencyPcList/currencyBatchInsertOrUpdate`, // 左侧列表框架批量新增修改
  DELETE_SELECT: `${prefix}/currencyPcList/currencyBatchDelete`, // 左侧列表框架批量删除
  INSERT_OR_UPDATE_BY_TRIGGERS_LIST: `${prefix}/currencyPcList/currencyInsertOrUpdateByTriggers`, // 普通按钮
  UPDATE_LEFT_LIST_BATCH: `${prefix}/currencyPcList/currencyBatchUpdateByIds`, // 通用根据id批量修改
  EDITOR_UPLOAD: `${prefix}/file/textEditorUpload`, // 富文本图片上传


  /**
   *  全列表模板
   */
  FULL_DELETE_SELECT: `${prefix}/currencyFullPcList/currencyBatchDelete`, // 全列表框架批量删除
  FULL_UPDATE_INSERT: `${prefix}/currencyFullPcList/currencyInsertOrUpdate`, // 全列表框架批量新增修改
  GET_FULL_LIST_PAGE_DATA: `${prefix}/currencyFullPcList/currencyGetPageData`, // 获取表单数据
  GET_FULL_LIST_PAGE_CONFIG: `${prefix}/currencyFullPcList/currencyGetPcPage`, // 获取界面配置
  GET_FULL_LIST_PAGE_LIST: `${prefix}/currencyFullPcList/currencyGetListData`, // 通用查询PC列表页面数据
  FULL_UPDATE_BATCH_LIST: `${prefix}/currencyFullPcList/currencyBatchUpdateByIds`, // 通用根据id批量修改
  FULL_TRIGGER_UPDATE_LIST: `${prefix}/currencyFullPcList/currencyInsertOrUpdateByTriggers`, // 通过触发器通用新增或修改
  FULL_EXPORT_ALL_TO_EXCEL: `${prefix}/export/excel`, // 全列表导出全部数据
  GET_ADVANCED_SCREENING_ELE: `${prefix}/seniorFilter/relationGet `, // 获取高级筛选的配置
  DO_BATCH_UPDATE: `${prefix}/currencyFullPcList/currencyBatchByIdsUpdate`, // 多条数据修改
  DO_SEARCH_LAST_PARAMS: `${prefix}/searchRecords/selectLastOne`, // 获取高级筛选中最新的数据
  DO_INSTER_SEARCH_PARAM: `${prefix}/searchRecords/relationInsert`, // 新增查询规则
  DO_GET_PARAMS_LIST: `${prefix}/searchRecords/selectList`, // 查询集合

  /** bundle配置界面弹框 */
  GET_BUNDLE_FRAME_DETAIL: `${prefix}/mobileFrames/relationGet`, // 获取bundle框架和面板信息

  /** 个人中心 */
  LOGOUT: `${prefix}/logout`, // 登出
  UPDATE_PASSWORD: `${prefix}/user/updatePassWord`, // 修改密码
  SWITCH_LANGUAGE: `${prefix}/user/switchLanguage`, // 切换语言

  /** 文件上传 */
  FILE_UPLOAD: `${prefix}/file/fileUpload`, // 上传
  FILE_RELATION_BUSINESS: `${prefix}/filesrelations/batchInsert`, // 业务关联文件
  GET_FILE_RELATION: `${prefix}/filesrelations/getRelationFile`, // 获取业务关联文件
  DELETE_FILE_RELATION: `${prefix}/filesrelations/delete`, // 删除业务关联文件
  DELETE_FILE: `${prefix}/file/fileDelete`, // 删除文件

  /** 知识库 */
  GET_FILES_TREE: `${prefix}/filegroup/getJsonTree`, // 获取文件夹目录
  GET_FILES: `${prefix}/file/getFiles`, // 获取文件夹目录
  DOWNLOAD_FILE: `${prefix}/file/fileDownload`, // 下载文件
  CREATE_FILE_GROUP: `${prefix}/filegroup/insert`, // 新建文件分组
  UPDATE_FILE_GROUP: `${prefix}/filegroup/update`, // 修改文件分组
  DELETE_FILE_GROUP: `${prefix}/filegroup/delete`, // 删除文件分组

  // 报表生成器地址
  // REPORT_DESIGNER: `${prefix}/ureport/designer`,
  // REPORT_PREVIEW: `${prefix}/ureport/preview`,
  REPORT_DESIGNER: '/ureport/designer',
  REPORT_PREVIEW: '/ureport/preview',
  DOWNLOAD_REPORT_EXCEL: '/ureport/excel', // 报表下载
  DOWNLOAD_REPORT_WORD: '/ureport/word', // 报表下载
  DOWNLOAD_REPORT_PDF: '/ureport/pdf', // 报表下载
  REPORT_PRINT: '/ureport/pdf/show', // 报表打印

  // 过滤器
  GET_ELEMENT_FILTER_COND: `${prefix}/elementFilterCondition/selectByParam`, // 获取控件过滤器配置
  INSERT_OR_UPDATE_ELEMENT_FILTER_COND: `${prefix}/elementFilterCondition/insertOrUpdate`, // 修改过滤器配置

  // 状态管理
  GET_STATE_TREE: `${prefix}/state/getJsonTree`,
  INSERT_STATE: `${prefix}/state/insert`,
  UPDATE_STATE: `${prefix}/state/update`,
  DELETE_STATE: `${prefix}/state/delete`,
  GET_STATE: `${prefix}/state/get`,
  SELECT_STATE: `${prefix}/state/select`,
  INSERT_STATE_GROUP: `${prefix}/stateGroup/insert`,
  UPDATE_STATE_GROUP: `${prefix}/stateGroup/update`,
  DELETE_STATE_GROUP: `${prefix}/stateGroup/delete`,
  GET_STATE_GROUP: `${prefix}/stateGroup/get`,
  // 类型管理
  GET_TYPE_TREE: `${prefix}/type/getJsonTree`,
  INSERT_TYPE: `${prefix}/type/insert`,
  UPDATE_TYPE: `${prefix}/type/update`,
  DELETE_TYPE: `${prefix}/type/delete`,
  GET_TYPE: `${prefix}/type/get`,
  SELECT_TYPE: `${prefix}/type/select`,
  INSERT_TYPE_GROUP: `${prefix}/typeGroup/insert`,
  UPDATE_TYPE_GROUP: `${prefix}/typeGroup/update`,
  DELETE_TYPE_GROUP: `${prefix}/typeGroup/delete`,
  GET_TYPE_GROUP: `${prefix}/typeGroup/get`,
  // 优先级管理
  GET_PRIORITY_TREE: `${prefix}/priority/getJsonTree`,
  INSERT_PRIORITY: `${prefix}/priority/insert`,
  UPDATE_PRIORITY: `${prefix}/priority/update`,
  DELETE_PRIORITY: `${prefix}/priority/delete`,
  GET_PRIORITY: `${prefix}/priority/get`,
  SELECT_PRIORITY: `${prefix}/priority/select`,
  INSERT_PRIORITY_GROUP: `${prefix}/priorityGroup/insert`,
  UPDATE_PRIORITY_GROUP: `${prefix}/priorityGroup/update`,
  DELETE_PRIORITY_GROUP: `${prefix}/priorityGroup/delete`,
  GET_PRIORITY_GROUP: `${prefix}/priorityGroup/get`,
  // 排序配置
  GET_TAB_SORT_CONFIG: `${prefix}/tabSort/selectByParam`, // 根据参数获取数据
  INSERT_OR_UPDATE_TAB_SORT: `${prefix}/tabSort/insertOrUpdate`, // 新增或修改排序数据
  // 授权模块

  CREATE_LIC_FILE: `${prefix}/license/lic`,
  UPLOAD_LIC_FILE: `${prefix}/license/login/licenseauth`,
  CHECK_LIC_FILE: `${prefix}/license/authLicense`,
  GET_LIC_FILE_DETAIL: `${prefix}/license/getAllLicLine`,
  GET_COMPANY_LIST: `${prefix}/company/list`,
  DOWNLOAD_LIC_FILE: `${prefix}/license/downloadLic`,

  // 归档按钮
  DO_ARCHIVE_CYCLE: `${prefix}/archive/archiveCycleHandle`, // 归档按钮
  DO_ARCHIVE_NORMAL: `${prefix}/archive/archiveHandle`, // 普通归档按钮
  DO_BATCH_ARCHIVE_CYCLE: `${prefix}/archive/batcharchiveCycleHandle`, // 批量归档按钮
  DO_BATCH_ARCHIVE_NORMAL: `${prefix}/archive/batcharchiveHandle`, // 批量普通归档按钮

  /** 资源管理器框架 */
  GET_EXPLORER_PAGE_CONFIG: `${prefix}/currencyResourceManager/currencyGetResourceManagerPage`, // 获取页面配置
  GET_EXPLORER_FULL_TREE: `${prefix}/currencyResourceManager/currencyGetTreeData`, // 获取整数
  GET_EXPLORER_SINGLE_TREE_NODE: `${prefix}/currencyResourceManager/currencyGetSingleNodeTreeData`, // 获取树数据（单点数据）
  GET_EXPLORER_PAGE_DATA: `${prefix}/currencyResourceManager/currencyGetPageData`, // 获取页面数据
  GET_EXPLORER_LIST_DATA: `${prefix}/currencyResourceManager/currencyGetListData`, // 获取列表页面数据
  GET_EXPLORER_MAIN_LIST_DATA: `${prefix}/currencyResourceManager/currencyGetWaterListData`, // 获取主面板数据

  // 组织档案
  GET_ORG_TREE: `${prefix}/org/getJsonTree`,
  INSERT_ORG: `${prefix}/org/insert`,
  UPDATE_ORG: `${prefix}/org/update`,
  DELETE_ORG: `${prefix}/org/delete`,
  GET_ORG: `${prefix}/org/get`,
  INSERT_ORG_GROUP: `${prefix}/orggroup/insert`,
  UPDATE_ORG_GROUP: `${prefix}/orggroup/update`,
  DELETE_ORG_GROUP: `${prefix}/orggroup/delete`,
  GET_ORG_GROUP: `${prefix}/orggroup/get`,

  // 故障档案
  GET_ERRORCODE_TREE: `${prefix}/errorCodeGroup/getJsonTree`,
  INSERT_ERRORCODE_GROUP: `${prefix}/errorCodeGroup/insert`,
  UPDATE_ERRORCODE_GROUP: `${prefix}/errorCodeGroup/update`,
  DELETE_ERRORCODE_GROUP: `${prefix}/errorCodeGroup/delete`,
  GET_ERRORCODE_GROUP: `${prefix}/errorCodeGroup/get`,
  GET_ERRORCODEI_LIST: `${prefix}/errorCodeI/list`,
  GET_ERRORCODEII_LIST: `${prefix}/errorCodeII/list`,
  GET_ERRORCODEIII_LIST: `${prefix}/errorCodeIII/list`,
  GET_ERRORCODEI: `${prefix}/errorCodeI/get`,
  GET_ERRORCODEII: `${prefix}/errorCodeII/get`,
  GET_ERRORCODEIII: `${prefix}/errorCodeIII/get`,
  INSERT_ERRORCODE_RELATIONS: `${prefix}/errorCodeRelations/insert`,
  UPDATE_ERRORCODE_RELATIONS: `${prefix}/errorCodeRelations/update`,
  DELETE_ERRORCODE_RELATIONS: `${prefix}/errorCodeRelations/deleteRelation`,
  GET_ERRORCODE_RELATIONS: `${prefix}/errorCodeRelations/get`,
  GET_TREEDATA_BY_ASYNC: `${prefix}/errorCodeGroup/getJsonTreeAsync`, // 故障代码异步树

  // 存储过程类型
  GET_PROCEDURES_TYPE: `${prefix}/procedures/selectAllProcedures`, // 获取存储过程类型
  INSERT_OR_UPDATE_PROCEDURE: `${prefix}/procedurePwe/insertOrUpdate`, // 新增修改存储过程
  GET_PROCEDURE_DETAIL: `${prefix}/procedurePwe/selectByTriggersId`, // 获取存储过程详情
  DELETE_PROCEDURE: `${prefix}/procedurePwe/relationDelete`, // 删除存储过程

  // js触发器
  GET_JS_FUNCTION_DETAIL: `${prefix}/jsFunction/selectByTriggersId`, // 查询js触发器事件详情
  INSERT_OR_UPDATE_JS_FUNCTION: `${prefix}/jsFunction/insertOrUpdate`, // 更新js触发器

  COPY_TAB_DATA: `${prefix}/copyData/copyTabData`, // 复制面板
  COPY_USER_DESIGNER_DATA: `${prefix}/copyData/copyDesignerData`, // 复制用户设计组数据
  GET_BUNDLE_TREE: `${prefix}/userDesignerMobileTab/getAppBundleJsonTree`, // 获取bundle树

  // 关联文档
  INSERT_FILESRELATIONS: `${prefix}/filesrelations/add`, // 新增业务关联文档
  RELETE_FILESRELATIONS: `${prefix}/filesrelations/move`, // 删除业务关联文档
  BATCH_INSERT_FILESRELATIONS: `${prefix}/filesrelations/batchAdd`, // 批量新增业务关联文档
  GET_RELATIONFILES: `${prefix}/file/getRelationFiles`, // 获取业务关联文档
  APP_UPLOAD: `${prefix}/file/appUpload`, // APP上传更新
  MESSAGE_INSTANCE_PARAM_RESULT: '/bzzq-msg/message/messageInstanceParamAndResult', // 获取消息实例详情
  RELATION_DOWNLOAD_FILE: `${prefix}/file/download`, // 下载文件

  // 主页配置
  CLEAR_SISYTEM_CACHE: `${prefix}/systems/flushallKeys`, // 清除系统缓存
  GET_HOME_PAGE_CONFIG: `${prefix}/pcHomePageConfig/selectInfo`, // 获取主页配置信息
  UPDATE_HOME_PAGE_CONFIG: `${prefix}/pcHomePageConfig/insertOrUpdate`, // 新增、修改主页配置信息
  SAVE_THIRD_LINK: `${prefix}/pcHomePageThirdPartyLinks/insertOrUpdate`, // 保存三方链接
  GET_THIRD_LINK_LIST: `${prefix}/pcHomePageThirdPartyLinks/selectList`, // 获取三方链接列表数据
  DELETE_THIRD_LINK: `${prefix}/pcHomePageThirdPartyLinks/batchLogicDelete`, // 删除三方链接
  SAVE_THIRD_LINK_SNO: `${prefix}/pcHomePageThirdPartyLinks/switchSno`, // 三方链接切换序号
  GET_HELP_DOC_LIST: `${prefix}/pcHomePageHelpDocument/selectList`, // 获取帮助文档列表
  SAVE_HELP_DOC_SNO: `${prefix}/pcHomePageHelpDocument/switchSno`, // 帮助文档切换序号
  GET_HELP_DOC_TYPEID: `${prefix}/pcHomePageHelpDocument/selectByKeyCode`, // 帮助文档获取类型id
  GET_QB_LIST: `${prefix}/app/getAppList`, // 获取二维码列表

  // 版本管理
  GET_SYSTEM_VERSION_LIST: `${prefix}/systemVersion/selectPage`, // 获取版本列表
  SAVE_SYSTEM_VERSION: `${prefix}/systemVersion/insertOrUpdate`, // 保存版本信息
  GET_SYSTEM_VERSION_DETAIL: `${prefix}/systemVersion/get/`, // 获取版本详情
  DELETE_SYSTEM_VERSION: `${prefix}/systemVersion/batchLogicDelete`, // 删除版本

  // 首页图表配置
  INSERT_CHART_LINE: `${prefix}/chart/insertOrUpdate`, // 新增图表数据
  DELETE_CHART_LINE: `${prefix}/chart/delete`, // 删除图标单条数据
  GET_CHART_FILTER_LIST: `${prefix}/chartFilter/relationGet/`, // 根据控件id查询筛选条件
  UPDATE_CHART_FILTER: `${prefix}/chartFilter/insertOrUpdate`, // 保存图表筛选条件
  DELETE_CHART_FILTER: `${prefix}/chartFilter/delete`, // 删除筛选条件
  GET_HOME_SUMMARY_DATA: `${prefix}/currencyPcList/currencyGetTotalByElementId`, // 汇总控件数据
  GET_HOME_CHART_DATA: `${prefix}/currencyPcList/currencyGetDataByElementId`, // 图表控件数据

  // 多语言语种
  GET_LANGUAGE_LIST: `${prefix}/languagesConfig/selectList`, // 获取语种列表
  D0_LANGUAGE_ACTION: `${prefix}/languagesConfig/insertOrUpdate`, // 新增修改数据
  DO_LANGUAGE_DELETE: `${prefix}/languagesConfig/batchDelete`, // 批量删除
  GET_BATCHLANGUAGE_LIST: `${prefix}/elementModel/selectElementWithoutI18n`, // 批量修改多语言
  DO_BATCHELEMENT_LANGUAGE: `${prefix}/elementModel/batchUpdateLanguageIdByTypes`, // 批量修改

  // 语言批量配置

  // 多语言分类组
  GET_LANGUAGEGROUP_TREE: `${prefix}/languagesTemplateGroup/getJsonTree`, // 查询模板分类树
  GET_LANGUAGEGROUP_DETIAL: `${prefix}/languagesTemplateGroup/get/`, // 根据id查看
  DO_LANGUAGEGROUP_ACTION: `${prefix}/languagesTemplateGroup/insertOrUpdate`, // 新增修改数据
  DO_LANGUAGEGROUP_DELETE: `${prefix}/languagesTemplateGroup/logicDeletes`, // 删除

  GET_LANGUAGETYPE_TREE: `${prefix}/languagesTemplate/getJsonTree`, // 查询语言分类树
  GET_LANGUAGETYPE_DETIAL: `${prefix}/languagesTemplate/relationGet/`, // 根据id查看
  GET_LANGUAGETYPE_UPDATE_INSERT: `${prefix}/languagesTemplate/insertOrUpdate`, // 新增修改数据
  GET_LANGUAGETYPE_DELETE: `${prefix}/languagesTemplate/logicDeletes`, // 删除
  GET_LANGUAGETYPE_SWITCH: `${prefix}/languagesTemplate/switchNode`, // 切换节点
  GET_LANGUAGETEMPLATE_LIKE_NAME: `${prefix}/languagesTemplate/searchByNameLike`, // 在设计组菜单中获取模板
  GET_LANGUAGEGROUP_PATH: `${prefix}/languagesTemplate/getGroupPath/`, // 根据模板ID查询模板分组路径
  SWITCH_LANGAUGE: `${prefix}/user/switchLanguage/PC/`,

  // 大屏看板
  GET_BOARD_PAGE: `${prefix}/currencyBoard/currencyGetBoardPage/`,
  GET_BOARD_LIST_DATA: `${prefix}/currencyBoard/currencyGetListData/`,
  GET_BOARD_ELEMENT: `${prefix}/currencyBoard/currencyGetDataByElementId/`,
  GET_FUNCTION_PERMISSION: `${prefix}/currencyPc/currencyGetFunctionPermission/`, // 根据菜单id获取权限

  // 定时任务
  GET_JOB_PAGE: `${prefix}/job/page`, // 获取定时任务列表分页
  ADD_JOB: `${prefix}/job/add`, // 新增任务
  UPDATE_JOB: `${prefix}/job/update`, // 修改任务
  BATCHDEL_JOB: `${prefix}/job/batchDel`, // 批量删除定时任务
  RUN_JOB_FAST: `${prefix}/job/run`, // 立即执行定时任务
  RESUME_JOB: `${prefix}/job/resume`, // 恢复定时任务
  PAUSE_JOB: `${prefix}/job/pause`, // 暂停定时任务
  GET_JOB_LOG_LIST: `${prefix}/scheduleLog/get`, // 获取日志列表
  UPDATE_INSERT_JOB_DATA: `${prefix}/job/addOrUpdate`, // 新增或修改存储过程任务
  DELETE_JOB_DATA: `${prefix}/job/deleteScheduleJob`, // 删除存储过程任务详情
  GET_JOB_DATA: `${prefix}/job/getScheduleJob/`, // 获取存储过程任务详情

  // 图形导航
  GET_VISUAL_GROUP_LIST: `${prefix}/visualmapgroup/list`, // 获取图层分组列表
  GET_VISUAL_MAP: `${prefix}/visualmap/visuallist`, // 根据分组ID获取图层json
  INSERT_VISUAL_MAP: `${prefix}/visualmap/insert`, // 新增图层信息
  UPDATE_VISUAL_MAP: `${prefix}/visualmap/update`, // 修改图层信息
  DELETE_VISUAL_MAP: `${prefix}/visualmap/delete`, // 删除图层信息
  GET_TABLELINE: `${prefix}/visualmap/talbeline`, // 根据表获取数据
  INSERT_VISUAL_CONFIG: `${prefix}/visualmapconfig/insert`, // 新增区块配置
  UPDATE_VISUAL_CONFIG: `${prefix}/visualmapconfig/update`, // 新增区块配置
  DELETE_VISUAL_CONFIG: `${prefix}/visualmapconfig/delete`, // 新增区块配置
  GET_VISUAL_CONFIG: `${prefix}/visualmapconfig/get`, // 根据id获取配置信息
  GET_FILDGROUP_TREE: `${prefix}/filegroup/getJsonTrees`, // 关联资料获取文件树
  GET_STATE_LIST: `${prefix}/visualmap/getStates`, // 获取工单状态


  // bpm接口 综合处理
  SET_BPM_DATA_BY_BUSINESS: `${prefix}/currencyCommon/currencyGetByBpm`, // bpm综合处理
  GET_CHILD_TREE: `${prefix}/currencyPc/currencyGetChildTreeData`, // bpm综合处理

  // 工单展望
  INSERT_CREATE_OUTLOOK: `${prefix}/workOrderOutlook/createOutLook`, // 生成展望
  GET_SELECT_OUTLOOK: `${prefix}/workOrderOutlook/selectOutLookBy`, // 展望列表
  UPDATE_CHANGE_TIME: `${prefix}/workOrderOutlook/changeTime`, // 修改时间
  UPDATE_WITH_DRAW: `${prefix}/workOrderOutlook/withdraw`, // 撤回

  SSO_BY_ACCOUNT: `${prefix}/sso/ssoByAccount`, // IT资产单点登录
};
