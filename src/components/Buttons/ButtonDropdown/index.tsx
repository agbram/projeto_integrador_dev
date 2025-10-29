import { ReactNode } from 'react';
import Dropdown from 'react-bootstrap/Dropdown';
import styles from "./styles.module.css"

type Props = {
  onClick?: () => void;
}
export default function ButtonDropDown(props: Props) {

  return (
    <Dropdown>
      <Dropdown.Toggle  className={styles.dropdown} onClick={props.onClick}/>
      <Dropdown.Menu>
        <Dropdown.Item href="#/action-1">Action</Dropdown.Item>
        <Dropdown.Item href="#/action-2">Another action</Dropdown.Item>
        <Dropdown.Item href="#/action-3">Something else</Dropdown.Item>
      </Dropdown.Menu>
    </Dropdown>
  );
}
