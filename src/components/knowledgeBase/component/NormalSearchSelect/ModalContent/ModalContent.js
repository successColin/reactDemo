/*
 * @Author: Fus
 * @Date:   2019-08-06 10:30:44
 * @Last Modified by: Fus
 * @Last Modified time: 2019-09-04 15:42:45
 * @Desc: 搜索选择框的内容容器
 */
import { Fragment } from 'react';
import ContentList from '../ContentList/ContentList';
import ContentTree from '../ContentTree/ContentTree';
import HeaderFilter from './HeaderFilter/HeaderFilter';
import styles from './ModalContent.less';

const ModalContent = ({
  showType,
  ...rest
}) => {
  const renderContent = () => {
    switch (showType) {
      case 'list': return <ContentList {...rest} />;
      case 'tree': return <ContentTree {...rest} />;
      default: return <ContentTree {...rest} />;
    }
  };
  return (
    <Fragment>
      {/*<HeaderFilter showType={showType} setWrapState={rest.setWrapState} />*/}
      <div className={styles.contentWrap}>
        {renderContent()}
      </div>
    </Fragment>
  );
};
export default ModalContent;
