/*
 * @Author: Fus
 * @Date:   2019-05-14 16:10:24
 * @Last Modified by: mikey.zhaopeng
 * @Last Modified time: 2020-01-15 13:50:20
 * @Desc: 全站通用的常量
 */
import { getValidateMessage } from '@/utils/common';

// 用于存放底层需要的数据（theme、dispatch、langLib等）
import { createContext } from 'react';

export const BaseContext = createContext();

// 路由前缀
// export const URL_PREFIX = '/apiot';
export const URL_PREFIX = '';

// 数据层语言类型 对应前端语言包类型
export const DB_LANG_TYPE_TO_FRONT = {
  'zh_CN': 'zh',
  'en_US': 'en',
  // 'ja_JP': 'jp',
  // 'ko_KR': 'ko',
};

// 头部搜索分类
export const HEADER_SEARCH_TYPE = {
  'all': 'header.search.type.all',
  'type1': 'header.search.type.type1',
};

// 是、否的对应枚举
export const BOOL_TYPE = ['global.yes', 'global.no'];
// 跳转类型
export const JUMP_TYPE = {
  1: 'framePage.form.relation.tab.config',
  2: 'settingForm.jumpToFunction',
};
export const BOOL_VALUE_MAP = {
  'global.yes': 1,
  'global.no': 0,
};
// 是否允许行编辑
export const BOOL_VALUE_MAP_IN_LIST = {
  1: 'global.yes',
  2: 'global.no',
};

// 数据源类型
export const DATASOURCE_TYPE = {
  1: 'pageConfig.tab.originData',
  2: 'pageConfig.tab.dataSource.from.api',
};

// 多行文本输入框配置
export const TEXTAREA_CONFIG = {
  autosize: { minRows: 2, maxRows: 6 },
};

// 树右键菜单操作列表
export const TREE_RIGHT_MENU = [
  {
    type: 'addGroup',
    id: 'tree.more.addGroup',
  }, {
    type: 'delGroup',
    id: 'tree.more.delGroup',
  }, {
    type: 'addChild',
    id: 'tree.more.addChild',
  }, {
    type: 'delChild',
    id: 'tree.more.delChild',
  }, {
    type: 'moveNode',
    id: 'tree.more.moveNode',
  }, {
    type: 'loadChildren',
    id: 'tree.loadChildNodes',
  },
];

// 默认的校验规则（必填）
export const VALID_REQUIRED_MESSAGE = getValidateMessage('required');

// 表单校验规则
export const FORM_VALID_RULES = {
  telephone: {
    pattern: /^1[3456789]\d{9}$/,
    message: getValidateMessage('telephone'),
  },
  email: {
    pattern: /^[a-zA-Z0-9_-]+@[a-zA-Z0-9_-]+(\.[a-zA-Z0-9_-]+)+$/,
    // pattern: /^\\w+([-+.]\\w+)*@\\w+([-.]\\w+)*\\.\\w+([-.]\\w+)*$/,
    message: getValidateMessage('email'),
  },
  password: {
    pattern: /^[A-Za-z0-9]{100}$/,
    message: getValidateMessage('password'),
  },
  noSpace: {
    pattern: /^[^\s]*$/,
    message: getValidateMessage('whitespace'),
  },
  url: {
    pattern: /(http|https):\/\/([\w.]+\/?)\S*/,
    message: getValidateMessage('url'),
  },
};

// 需要关闭tab时清空model层数据的组件
export const NEED_CLEAR_SATATE_TABS = {
  'FramePageConfig': 'framePage',
  'VisualMapConfig': 'visualState',
};

// 菜单风格
export const MENU_STYLES = {
  1: 'menuStyle.traditional',
  2: 'menuStyle.menuCenter',
  3: 'menuStyle.conciseMenu',
};

// 主题色
export const THEME_COLOR = [{
  id: 1,
  name: 'global.red',
  color: '#C62127',
  type: 'init',
}, {
  id: 2,
  name: 'global.blue',
  color: '#2D83CD',
  type: 'blue',
}, {
  id: 3,
  name: 'global.darkblue',
  color: '#2F5899',
  type: 'darkBlue',
}, {
  id: 4,
  name: 'global.purple',
  color: '#D8006D',
  type: 'purple',
}, {
  id: 5,
  name: 'global.orange',
  color: '#F89C33',
  type: 'orange',
}];

// 顶部样式风格
export const TOP_STYLE = [{
  id: 1,
  name: 'global.darker',
  color: '#1F293D',
  type: 'darker',
}, {
  id: 2,
  name: 'global.light',
  color: '#2D83CD',
  type: 'light',
}];

// 登录页样式
export const LOGIN_STYLE = [{
  id: 1,
  name: 'global.simplicity',
  color: '#1F293D',
  type: 'simplicity',
}, {
  id: 2,
  name: 'global.internet',
  color: '#4689F5',
  type: 'internet',
}];