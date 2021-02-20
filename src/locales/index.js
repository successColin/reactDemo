/*
 * @Author: Fus
 * @Date:   2019-04-24 14:14:29
 * @Last Modified by: Fus
 * @Last Modified time: 2019-06-17 16:06:52
 * @Desc: 存放全站所有国际化，包括：antd组件、自定义
 */
import zh_CN from 'antd/lib/locale-provider/zh_CN';
import en_GB from 'antd/lib/locale-provider/en_GB';
import local_en from './reactIntlLang/en_US';
import local_zh from './reactIntlLang/zh_CN';
import langLib_zh from './langLib/zh';
import langLib_en from './langLib/en';

// antd的语言包
const antdLocale = {
  zh: zh_CN,
  en: en_GB,
};

// 本地使用react-intl调用的语言包
const localLocale = {
  zh: local_zh,
  en: local_en,
};

// 原生控件placeholder等使用
// 不走react-intl，直接用在组件中
// 主要用在不支持渲染reactNode，只能用基本数据类型时
const langLib = {
  zh: langLib_zh,
  en: langLib_en,
};

export default {
  antdLocale,
  localLocale,
  langLib,
};