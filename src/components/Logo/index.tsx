import Col from 'react-bootstrap/Col';
import Container from 'react-bootstrap/Container';
import Image from 'react-bootstrap/Image';
import Row from 'react-bootstrap/Row';
import styles from "./styles.module.css"


export default function Logo() {
  return (
    <img src="/imgs/logo.png" alt="logo da empresa x" className={styles.Logo}/>
  );
}