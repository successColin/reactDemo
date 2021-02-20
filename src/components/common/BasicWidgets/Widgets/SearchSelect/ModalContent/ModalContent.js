/*
 * @Author: Fus
 * @Date:   2019-08-06 10:30:44
 * @Last Modified by: Fus
 * @Last Modified time: 2019-08-28 11:26:35
 * @Desc: 搜索选择框的内容容器
 */
import ContentList from '../ContentList/ContentList';
import ContentTree from '../ContentTree/ContentTree';
import IconLibBlank from '@/components/common/IconLibBlank/IconLibBlank';

const ModalContent = ({
  showType = 'list',
  ...rest
}) => {
  switch (showType) {
    case 'list':
      return <ContentList {...rest} />;
    case 'icon':
      return <IconLibBlank {...rest} />;
    case 'tree':
      return <ContentTree {...rest} />;
    default:
      return null;
  }
};
export default ModalContent;
