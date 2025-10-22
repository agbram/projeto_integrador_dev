"use client";

import { Button } from "react-bootstrap";
import styles from "./styles.module.css"

type Props = {
    onClick(): void;
    text: string;
}
export default function FAB(props: Props){

    return(
        <Button variant="primary" onClick={props.onClick} className={styles.container}>
                {props.text}
        </Button>
    )
}