import homepage from '@/assets/homepage.png';
import homepagefst from '@/assets/homepagefst.png';
import styles from './Empty.less';

const Empty = () => {
  return (
    <div className={styles.wrap}>
      <img src={homepage}/>
      {/*<img src={homepagefst} />  fst*/}
    </div>
  );
};
export default Empty;
