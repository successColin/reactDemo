/*
 * @Author: Fus
 * @Date:   2020-02-04 10:38:11
 * @Desc: 底部按钮栏
 */
import { FormattedMessage } from 'react-intl';
import classNames from 'classnames';
import { CButton } from '@/components/common/BasicWidgets';
import styles from './FooterButton.less';

const FooterButton = ({
                        handleSubmit = null, // 提交事件
                        doClear = null, // 清除缓存
                        loading = {},
                        className = null,
                        canmodify = null,
                        userInfo = {},
                      }) => {
  const wrapCls = classNames({
    [styles.wrap]: true,
    [className]: !!className,
  });
  const { account } = userInfo;
  return (
    <div className={wrapCls}>
      {account === 'admin' ? <CButton
        type="primary"
        loading={loading.clear}
        onClick={() => doClear && doClear()}
      >
        <FormattedMessage id="global.clear.system"/>
      </CButton> : null}
      {canmodify ? <CButton
        type="primary"
        loading={loading.save}
        onClick={() => handleSubmit && handleSubmit()}
      >
        <FormattedMessage id="global.save"/>
      </CButton> : null}
    </div>
  );
};

export default FooterButton;
