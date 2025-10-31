"use client";

import { Button } from "react-bootstrap";
import styles from "./styles.module.css"
import { ReactNode } from "react";

type Props = {
    onClick(): void;
    text?: ReactNode;
}



export default function FAB(props: Props){

    return(
        <Button variant="dark" onClick={props.onClick} className={styles.container}>
                {props.text}
        
        </Button>
    )
}