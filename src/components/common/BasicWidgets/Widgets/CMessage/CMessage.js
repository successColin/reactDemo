/*
 * @Author: Fus
 * @Date:   2019-08-13 11:34:55
 * @Last Modified by: Fus
 * @Last Modified time: 2019-08-21 17:10:22
 * @Desc: 信息弹出框
 */
import { message } from 'antd';

const initConfig = {
  maxCount: 1, // 最大显示树
  // getContainer: () => document.getElementById('main-container'), // 挂载的html节点
};

const CMessage = (content = '', type = 'success') => {
  message.config(initConfig);
  return message[type](content);
};

export default CMessage;
