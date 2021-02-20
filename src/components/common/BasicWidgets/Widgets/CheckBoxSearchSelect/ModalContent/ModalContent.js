/*
 * @Author: Fus
 * @Date:   2019-08-06 10:30:44
 * @Last Modified by: Fus
 * @Last Modified time: 2019-09-04 15:42:45
 * @Desc: 搜索选择框的内容容器
 */
import { Fragment } from 'react';
import ContentList from '../../NormalSearchSelect/ContentList/ContentList';
import ContentTree from '../../NormalSearchSelect/ContentTree/ContentTree';
import TagSet from './TagSet/TagSet';
import HeaderFilter from './HeaderFilter/HeaderFilter';
import styles from './ModalContent.less';

const ModalContent = ({
                        showType,
                        sourceSelectedRows,
                        ...rest
                      }) => {
  const renderContent = () => {
    switch (showType) {
      case 'list':
        return <ContentList {...rest} />;
      case 'tree':
        return <ContentTree {...rest} />;
      default:
        return null;
    }
  };
  const renderTags = () => {
    const { selectedRows } = rest;
    return selectedRows.length ? <TagSet {...rest}/> : null;
  };
  const { eleObj, multiple = false, selectedRows } = rest;
  const contentStyles = multiple && selectedRows.length ? styles.contentWrapMultiple : styles.contentWrap;
  return (
    <Fragment>
      <HeaderFilter sourceSelectedRows={sourceSelectedRows} showType={showType} eleObj={eleObj} setWrapState={rest.setWrapState}/>
      {renderTags()}
      <div className={contentStyles}>
        {renderContent()}
      </div>
    </Fragment>
  );
};
export default ModalContent;
