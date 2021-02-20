/*
 * @Author: Fus
 * @Date:   2019-06-18 17:30:00
 * @Last Modified by: Fus
 * @Last Modified time: 2019-06-18 17:46:59
 * @Desc: 底部按钮栏
 */
import { Component } from 'react';
import { Button } from 'antd';
import styles from './FooterButton.less';
import { FormattedMessage } from 'react-intl';

const btnConfigs = [
  {
    type: 'primary', // 类型（primary/''）,
    text: <FormattedMessage id="global.save" />,
    onClick: () => {},
  },
];

const FooterButton = ({
  btnConfigs = [],
}) => {
  const btns = btnConfigs.map((item, index) => {
    const {
      type = '',
      text = 'global.save',
      onClick = () => {},
      loading = false,
    } = item;
    return (
      <Button
        onClick={onClick}
        type={type}
        key={index}
        loading={loading}
      >
        <FormattedMessage id={text} />
      </Button>
    );
  });
  return (
    <div className={`${styles.wrap} custom-footer-bar`}>
      {btns}
    </div>
  );
};
export default FooterButton;
